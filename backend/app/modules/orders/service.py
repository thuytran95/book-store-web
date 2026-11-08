import re
import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import (
    BookUnavailable,
    CartEmpty,
    Forbidden,
    InvalidTransition,
    NotFound,
)
from app.core.pagination import Page, PageParams
from app.modules.cart import service as cart_service
from app.modules.cart.models import CartItem
from app.modules.catalog.models import Book
from app.modules.inventory import Inventory, OrderOwner, StockLine
from app.modules.orders import state_machine
from app.modules.orders.models import (
    Order,
    OrderItem,
    OrderStatus,
    OrderStatusHistory,
)
from app.modules.orders.schemas import (
    AdminOrderSummary,
    OrderDetail,
    OrderFilter,
    OrderSort,
    OrderStatusCounts,
    PlaceOrderIn,
)
from app.modules.users.models import User, UserRole

_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
# A pending order older than this is "stale" (header badge "Chờ hơn 1 ngày").
STALE_PENDING_HOURS = 24


def generate_code() -> str:
    """Human readable and effectively unique, e.g. BS261104-7K3QX2 (DB unique as backstop)."""
    suffix = "".join(secrets.choice(_CODE_ALPHABET) for _ in range(6))
    return f"BS{datetime.now(UTC):%y%m%d}-{suffix}"


async def place_order(session: AsyncSession, user: User, data: PlaceOrderIn) -> OrderDetail:
    """Cart -> order, atomically (the caller's transaction)."""
    cart = await cart_service.get_or_create_cart(session, user)
    cart_items = list(await session.scalars(select(CartItem).where(CartItem.cart_id == cart.id)))

    wanted: dict[int, int] = {i.book_id: i.quantity for i in cart_items}
    if not wanted:
        raise CartEmpty("Cart is empty")

    books = {
        b.id: b for b in await session.scalars(select(Book).where(Book.id.in_(list(wanted))))
    }
    for book_id in wanted:
        book = books.get(book_id)
        if book is None or not book.is_visible:
            raise BookUnavailable(f"Book {book_id} is not available", details={"book_id": book_id})

    order = Order(
        code=generate_code(),
        user_id=user.id,
        status=OrderStatus.pending,
        payment_method=data.payment_method,
        ship_recipient=data.ship_recipient,
        ship_phone=data.ship_phone,
        ship_address=data.ship_address,
        subtotal=0,
        shipping_fee=0,
        total=0,
        note=data.note,
    )
    session.add(order)
    await session.flush()  # need the id as the allocation owner

    inventory = Inventory(session)
    await inventory.allocate(
        [StockLine(book_id, qty) for book_id, qty in wanted.items()],
        OrderOwner(order.id),
    )

    subtotal = 0
    for book_id in sorted(wanted):
        book, qty = books[book_id], wanted[book_id]
        session.add(OrderItem(
            order_id=order.id, book_id=book_id, price=book.price, quantity=qty,
        ))
        subtotal += book.price * qty
    order.subtotal = subtotal
    order.total = subtotal + order.shipping_fee
    session.add(OrderStatusHistory(
        order_id=order.id, from_status=None, to_status=OrderStatus.pending, actor_id=user.id
    ))
    await cart_service.clear(session, user)
    await session.flush()
    return await get_order(session, order.id, user)


async def transition(
    session: AsyncSession, order_id: int, to: OrderStatus, actor: User,
    reason: str | None = None,
) -> OrderDetail:
    """Only place that changes `order.status`."""
    order = await session.scalar(
        select(Order).where(Order.id == order_id).with_for_update()
        .execution_options(populate_existing=True)
    )
    if order is None or (actor.role != UserRole.admin and order.user_id != actor.id):
        raise NotFound("Order not found")
    src = order.status
    if not state_machine.is_legal(src, to):
        raise InvalidTransition(
            f"Cannot move order from {src.value} to {to.value}",
            details={"from": src.value, "to": to.value},
        )
    if not state_machine.may_transition(actor.role, src, to):
        raise Forbidden("You may not perform this transition")

    inventory = Inventory(session)
    owner = OrderOwner(order.id)
    # Inventory looks at the current (pre-change) status, so call it first.
    if to == OrderStatus.confirmed:
        await inventory.commit(owner)
    elif to == OrderStatus.cancelled:
        await inventory.release(owner)
        order.cancelled_reason = reason

    order.status = to
    session.add(OrderStatusHistory(
        order_id=order.id, from_status=src, to_status=to, actor_id=actor.id
    ))
    await session.flush()
    return await get_order(session, order.id, actor)


def _detail(order: Order, viewer: User) -> OrderDetail:
    detail = OrderDetail.model_validate(order)
    detail.allowed_transitions = state_machine.allowed_targets(viewer.role, order.status)
    return detail


async def get_order(session: AsyncSession, order_id: int, viewer: User) -> OrderDetail:
    order = await session.scalar(
        select(Order).where(Order.id == order_id)
        .options(selectinload(Order.items), selectinload(Order.history))
        .execution_options(populate_existing=True)
    )
    if order is None or (viewer.role != UserRole.admin and order.user_id != viewer.id):
        raise NotFound("Order not found")
    detail = _detail(order, viewer)
    if viewer.role == UserRole.admin:
        detail.user_email = await session.scalar(select(User.email).where(User.id == order.user_id))
        if order.status == OrderStatus.pending:
            short = (await Inventory(session).shortages_for([order.id])).get(order.id, set())
            for item in detail.items:
                item.short = item.book_id in short
    return detail


_SORTS = {
    OrderSort.newest: (Order.created_at.desc(), Order.id.desc()),
    OrderSort.oldest: (Order.created_at.asc(), Order.id.asc()),
    OrderSort.total_desc: (Order.total.desc(), Order.id.desc()),
}


def _search_clause(term: str):
    """Code, recipient (accent-insensitive) or, with >= 3 digits, phone."""
    unaccent = func.immutable_unaccent
    clauses = [
        Order.code.icontains(term, autoescape=True),
        unaccent(Order.ship_recipient).ilike(unaccent(f"%{_escape_like(term)}%"), escape="/"),
    ]
    digits = re.sub(r"\D", "", term)
    if len(digits) >= 3:
        clauses.append(
            func.regexp_replace(Order.ship_phone, r"\D", "", "g").contains(digits)
        )
    return or_(*clauses)


def _escape_like(term: str) -> str:
    return term.replace("/", "//").replace("%", "/%").replace("_", "/_")


async def list_orders(
    session: AsyncSession, flt: OrderFilter, params: PageParams
) -> Page[AdminOrderSummary]:
    stmt = select(Order)
    if flt.status:
        stmt = stmt.where(Order.status == flt.status)
    if flt.user_id:
        stmt = stmt.where(Order.user_id == flt.user_id)
    if term := flt.search:
        stmt = stmt.where(_search_clause(term))
    total = await session.scalar(select(func.count()).select_from(stmt.subquery()))
    rows = list(await session.scalars(
        stmt.options(selectinload(Order.items))
        .order_by(*_SORTS[flt.sort]).offset(params.offset).limit(params.size)
    ))
    pending_ids = [o.id for o in rows if o.status == OrderStatus.pending]
    shortages = await Inventory(session).shortages_for(pending_ids)
    items = [
        AdminOrderSummary(
            id=o.id, code=o.code, status=o.status, payment_method=o.payment_method,
            total=o.total, created_at=o.created_at,
            ship_recipient=o.ship_recipient, ship_phone=o.ship_phone,
            copies=sum(i.quantity for i in o.items),
            has_shortage=o.id in shortages,
        )
        for o in rows
    ]
    return Page.of(items, total or 0, params)


async def status_counts(session: AsyncSession) -> OrderStatusCounts:
    """Global counts per status (ignores list filters) + stale pending orders."""
    counts = OrderStatusCounts()
    for status, n in await session.execute(
        select(Order.status, func.count()).group_by(Order.status)
    ):
        setattr(counts, status.value, int(n))
        counts.all += int(n)
    cutoff = func.now() - timedelta(hours=STALE_PENDING_HOURS)
    counts.stale_pending = int(
        await session.scalar(
            select(func.count()).select_from(Order)
            .where(Order.status == OrderStatus.pending, Order.created_at < cutoff)
        )
        or 0
    )
    return counts
