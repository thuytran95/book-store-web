"""Inventory: the only module allowed to reason about / change `books.quantity`.

Design: an "allocation" is not a table. It is derived from rows the callers insert in the
same transaction (pending order items, active reservations). `allocate` takes row locks on
the books in ascending id order, re-computes availability, and fails with OutOfStock if the
request does not fit. Because the locks are held until the caller's transaction ends, two
concurrent checkouts of the last copy cannot both pass.

All methods run inside the caller's transaction and never commit.
"""

from collections.abc import Iterable
from dataclasses import dataclass, field
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFound, OutOfStock
from app.modules.catalog.models import Book
from app.modules.orders.models import Order, OrderItem, OrderStatus
from app.modules.reservations.models import Reservation, ReservationStatus


@dataclass(frozen=True)
class StockLine:
    book_id: int
    quantity: int


@dataclass(frozen=True)
class OrderOwner:
    id: int
    # Reservations this order is converting; they must not block their own order.
    reservation_ids: tuple[int, ...] = field(default=())


@dataclass(frozen=True)
class ReservationOwner:
    id: int


Owner = OrderOwner | ReservationOwner


class Inventory:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # ---- reads ----

    async def available(
        self, book_ids: Iterable[int], owner: Owner | None = None
    ) -> dict[int, int]:
        """quantity - pending order items - active unexpired reservations (not the owner's)."""
        ids = sorted(set(book_ids))
        if not ids:
            return {}
        return await self._available(ids, owner)

    async def _available(self, ids: list[int], owner: Owner | None) -> dict[int, int]:
        qty_rows = await self.session.execute(
            select(Book.id, Book.quantity).where(Book.id.in_(ids))
        )
        result = {book_id: qty for book_id, qty in qty_rows}

        pending = (
            select(OrderItem.book_id, func.sum(OrderItem.quantity))
            .join(Order, Order.id == OrderItem.order_id)
            .where(OrderItem.book_id.in_(ids), Order.status == OrderStatus.pending)
            .group_by(OrderItem.book_id)
        )
        if isinstance(owner, OrderOwner):
            pending = pending.where(Order.id != owner.id)
        for book_id, qty in await self.session.execute(pending):
            result[book_id] -= int(qty)

        held = (
            select(Reservation.book_id, func.sum(Reservation.quantity))
            .where(
                Reservation.book_id.in_(ids),
                Reservation.status == ReservationStatus.active,
                Reservation.expires_at > datetime.now(UTC),  # lazy expiry
            )
            .group_by(Reservation.book_id)
        )
        if isinstance(owner, ReservationOwner):
            held = held.where(Reservation.id != owner.id)
        elif isinstance(owner, OrderOwner) and owner.reservation_ids:
            held = held.where(Reservation.id.not_in(owner.reservation_ids))
        for book_id, qty in await self.session.execute(held):
            result[book_id] -= int(qty)

        return {book_id: max(0, qty) for book_id, qty in result.items()}

    # ---- writes ----

    async def _lock_books(self, ids: Iterable[int]) -> dict[int, Book]:
        ordered = sorted(set(ids))  # ascending id order prevents deadlocks
        rows = await self.session.scalars(
            select(Book)
            .where(Book.id.in_(ordered))
            .order_by(Book.id)
            .with_for_update()
            .execution_options(populate_existing=True)
        )
        return {b.id: b for b in rows}

    async def allocate(self, lines: list[StockLine], owner: Owner) -> None:
        """All-or-nothing. Raises OutOfStock(book_id, requested, available)."""
        requested: dict[int, int] = {}
        for line in lines:
            requested[line.book_id] = requested.get(line.book_id, 0) + line.quantity
        books = await self._lock_books(requested)
        available = await self._available(sorted(requested), owner)
        for book_id in sorted(requested):
            if book_id not in books:
                raise NotFound(f"Book {book_id} not found")
            if requested[book_id] > available.get(book_id, 0):
                raise OutOfStock(book_id, requested[book_id], available.get(book_id, 0))

    async def commit(self, owner: Owner) -> None:
        """Turns an order's allocation into a real deduction. Call while status is `pending`."""
        if not isinstance(owner, OrderOwner):
            return  # reservations are never deducted; they convert into orders
        items = await self._order_items(owner.id)
        books = await self._lock_books(i.book_id for i in items)
        for item in items:
            book = books[item.book_id]
            if book.quantity < item.quantity:
                raise OutOfStock(book.id, item.quantity, book.quantity)
            book.quantity -= item.quantity

    async def release(self, owner: Owner) -> None:
        """Frees an allocation, or restores quantity if the order was already committed.

        Call before changing the order status: `pending` just stops counting once the
        order is cancelled, while `confirmed`/`shipping` orders were deducted at commit.
        """
        if not isinstance(owner, OrderOwner):
            return  # a reservation stops counting once its status leaves `active`
        order = await self.session.get(Order, owner.id)
        if order is None or order.status not in (OrderStatus.confirmed, OrderStatus.shipping):
            return
        items = await self._order_items(owner.id)
        books = await self._lock_books(i.book_id for i in items)
        for item in items:
            books[item.book_id].quantity += item.quantity

    async def set_quantity(self, book_id: int, quantity: int) -> None:
        """Admin edit / mark sold (quantity 0)."""
        if quantity < 0:
            raise ValueError("quantity must be >= 0")
        books = await self._lock_books([book_id])
        if book_id not in books:
            raise NotFound("Book not found")
        books[book_id].quantity = quantity

    async def _order_items(self, order_id: int) -> list[OrderItem]:
        rows = await self.session.scalars(
            select(OrderItem).where(OrderItem.order_id == order_id).order_by(OrderItem.book_id)
        )
        return list(rows)
