from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.errors import BookUnavailable, Conflict, NotFound
from app.core.pagination import Page, PageParams
from app.modules.catalog.models import Book
from app.modules.inventory import Inventory, ReservationOwner, StockLine
from app.modules.reservations.models import Reservation, ReservationStatus
from app.modules.reservations.schemas import ReservationRead
from app.modules.users.models import User, UserRole


async def _reads(session: AsyncSession, rows: list[Reservation]) -> list[ReservationRead]:
    ids = {r.book_id for r in rows}
    books: dict[int, Book] = {}
    if ids:
        found = await session.scalars(
            select(Book).where(Book.id.in_(ids)).options(selectinload(Book.images))
        )
        books = {b.id: b for b in found}
    out: list[ReservationRead] = []
    for r in rows:
        book = books.get(r.book_id)
        out.append(
            ReservationRead(
                id=r.id,
                user_id=r.user_id,
                book_id=r.book_id,
                quantity=r.quantity,
                status=r.status,
                expires_at=r.expires_at,
                created_at=r.created_at,
                book_title=book.title if book else "",
                book_slug=book.slug if book else "",
                cover_url=book.images[0].url if book and book.images else None,
            )
        )
    return out


async def reserve(
    session: AsyncSession, user: User, book_id: int, quantity: int = 1
) -> ReservationRead:
    """Hold a book for RESERVATION_HOLD_DAYS. Counts against the buyer's active limit."""
    settings = get_settings()
    book = await session.get(Book, book_id)
    if book is None or not book.is_visible:
        raise BookUnavailable("Book is not available")

    now = datetime.now(UTC)
    active = await session.scalar(
        select(func.count()).select_from(Reservation).where(
            Reservation.user_id == user.id,
            Reservation.status == ReservationStatus.active,
            Reservation.expires_at > now,
        )
    )
    if (active or 0) >= settings.max_active_reservations:
        raise Conflict(
            "Too many active reservations", code="RESERVATION_LIMIT",
            details={"limit": settings.max_active_reservations},
        )

    reservation = Reservation(
        user_id=user.id, book_id=book_id, quantity=quantity,
        status=ReservationStatus.active,
        expires_at=now + timedelta(days=settings.reservation_hold_days),
    )
    session.add(reservation)
    await session.flush()
    # Raises OutOfStock (and the request transaction rolls back) if it does not fit.
    await Inventory(session).allocate(
        [StockLine(book_id, quantity)], ReservationOwner(reservation.id)
    )
    return (await _reads(session, [reservation]))[0]


async def cancel(session: AsyncSession, reservation_id: int, actor: User) -> ReservationRead:
    reservation = await session.get(Reservation, reservation_id, with_for_update=True)
    if reservation is None or (
        actor.role != UserRole.admin and reservation.user_id != actor.id
    ):
        raise NotFound("Reservation not found")
    if reservation.status != ReservationStatus.active:
        raise Conflict("Reservation is not active", code="RESERVATION_NOT_ACTIVE")
    await Inventory(session).release(ReservationOwner(reservation.id))
    reservation.status = ReservationStatus.cancelled
    await session.flush()
    return (await _reads(session, [reservation]))[0]


async def expire_due(session: AsyncSession, now: datetime) -> int:
    """Marks overdue holds `expired`. Idempotent. Availability never depends on this."""
    result = await session.execute(
        update(Reservation)
        .where(Reservation.status == ReservationStatus.active, Reservation.expires_at <= now)
        .values(status=ReservationStatus.expired)
    )
    return result.rowcount or 0


async def list_mine(session: AsyncSession, user: User) -> list[ReservationRead]:
    rows = list(await session.scalars(
        select(Reservation).where(Reservation.user_id == user.id).order_by(Reservation.id.desc())
    ))
    return await _reads(session, rows)


async def admin_list(
    session: AsyncSession, params: PageParams, status: ReservationStatus | None
) -> Page[ReservationRead]:
    stmt = select(Reservation)
    if status:
        stmt = stmt.where(Reservation.status == status)
    total = await session.scalar(select(func.count()).select_from(stmt.subquery()))
    rows = list(await session.scalars(
        stmt.order_by(Reservation.id.desc()).offset(params.offset).limit(params.size)
    ))
    return Page.of(await _reads(session, rows), total or 0, params)
