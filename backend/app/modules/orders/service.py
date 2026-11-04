import secrets
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import (
    BookUnavailable,
    CartEmpty,
    Conflict,
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
    OrderDetail,
    OrderFilter,
    OrderSummary,
    PlaceOrderIn,
)
from app.modules.reservations.models import Reservation, ReservationStatus
from app.modules.users.models import Address, User, UserRole

_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def generate_code() -> str:
    """Human readable and effectively unique, e.g. BS261104-7K3QX2 (DB unique as backstop)."""
    suffix = "".join(secrets.choice(_CODE_ALPHABET) for _ in range(6))
    return f"BS{datetime.now(UTC):%y%m%d}-{suffix}"


async def _load_reservations(
    session: AsyncSession, user: User, ids: list[int]
) -> list[Reservation]:
    if not ids:
        return []
    rows = list(
        await session.scalars(
            select(Reservation).where(Reservation.id.in_(ids)).with_for_update()
        )
    )
    now = datetime.now(UTC)
    if len(rows) != len(set(ids)):
        raise NotFound("Reservation not found")
    for r in rows:
        if r.user_id != user.id:
            raise NotFound("Reservation not found")
        if r.status != ReservationStatus.active or r.expires_at <= now:
            raise Conflict("Reservation is no longer active", code="RESERVATION_INVALID")
    return rows


async def place_order(session: AsyncSession, user: User, data: PlaceOrderIn) -> OrderDetail:
    """Cart + reservations -> order, atomically (the caller's transaction)."""
    address = await session.get(Address, data.address_id)
    if address is None or address.user_id != user.id:
        raise NotFound("Address not found")

    reservations = await _load_reservations(session, user, data.reservation_ids)

    cart = await cart_service.get_or_create_cart(session, user)
    cart_items = list(await session.scalars(select(CartItem).where(CartItem.cart_id == cart.id)))

    wanted: dict[int, int] = {i.book_id: i.quantity for i in cart_items}
    for r in reservations:  # a hold takes precedence over a cart line for the same book
        wanted[r.book_id] = r.quantity
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
        ship_recipient=address.recipient,
        ship_phone=address.phone,
        ship_address=", ".join(
            [address.line, address.ward, address.district, address.province]
        ),
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
        OrderOwner(order.id, tuple(r.id for r in reservations)),
    )

    subtotal = 0
    for book_id in sorted(wanted):
        book, qty = books[book_id], wanted[book_id]
        session.add(OrderItem(
            order_id=order.id, book_id=book_id, title_snapshot=book.title,
            unit_price=book.sale_price, quantity=qty,
        ))
        subtotal += book.sale_price * qty
    order.subtotal = subtotal
    order.total = subtotal + order.shipping_fee
    session.add(OrderStatusHistory(
        order_id=order.id, from_status=None, to_status=OrderStatus.pending, actor_id=user.id
    ))
    for r in reservations:
        r.status = ReservationStatus.converted
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
    return _detail(order, viewer)


async def list_orders(
    session: AsyncSession, flt: OrderFilter, params: PageParams
) -> Page[OrderSummary]:
    stmt = select(Order)
    if flt.status:
        stmt = stmt.where(Order.status == flt.status)
    if flt.user_id:
        stmt = stmt.where(Order.user_id == flt.user_id)
    if flt.code:
        stmt = stmt.where(Order.code.ilike(f"%{flt.code.strip()}%"))
    total = await session.scalar(select(func.count()).select_from(stmt.subquery()))
    rows = await session.scalars(
        stmt.order_by(Order.id.desc()).offset(params.offset).limit(params.size)
    )
    items = [OrderSummary.model_validate(o) for o in rows]
    return Page.of(items, total or 0, params)
