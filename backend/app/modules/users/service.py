import re
from datetime import UTC, datetime, timedelta

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import Conflict, NotFound
from app.core.pagination import Page, PageParams
from app.modules.orders.models import Order, OrderStatus
from app.modules.users.models import User, UserRole
from app.modules.users.schemas import (
    AdminUserRead,
    UserCounts,
    UserStatusFilter,
    UserUpdate,
)

NEW_USER_DAYS = 7
ACTIVE_ORDER_STATUSES = (OrderStatus.pending, OrderStatus.confirmed, OrderStatus.shipping)
MIN_PHONE_DIGITS = 3


async def update_profile(session: AsyncSession, user: User, data: UserUpdate) -> User:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    await session.flush()
    return user


# ---- admin ----

def _order_counts():
    """Per-user order totals, one grouped subquery (no N+1)."""
    return (
        select(
            Order.user_id.label("user_id"),
            func.count().label("order_count"),
            func.count()
            .filter(Order.status.in_(ACTIVE_ORDER_STATUSES))
            .label("active_order_count"),
        )
        .group_by(Order.user_id)
        .subquery()
    )


def _admin_rows() -> Select:
    counts = _order_counts()
    return select(
        User,
        func.coalesce(counts.c.order_count, 0),
        func.coalesce(counts.c.active_order_count, 0),
    ).outerjoin(counts, counts.c.user_id == User.id)


def _to_admin_read(user: User, order_count: int, active_count: int) -> AdminUserRead:
    row = AdminUserRead.model_validate(user)
    row.order_count = order_count
    row.active_order_count = active_count
    return row


def _search_clause(term: str):
    like = f"%{term}%"
    clauses = [
        func.immutable_unaccent(User.full_name).ilike(func.immutable_unaccent(like)),
        User.email.ilike(like),
    ]
    digits = re.sub(r"\D", "", term)
    if len(digits) >= MIN_PHONE_DIGITS:
        clauses.append(func.regexp_replace(User.phone, r"\D", "", "g").like(f"%{digits}%"))
    return or_(*clauses)


async def list_users(
    session: AsyncSession,
    params: PageParams,
    search: str | None,
    status: UserStatusFilter | None = None,
) -> Page[AdminUserRead]:
    conditions = []
    term = (search or "").strip()
    if term:
        conditions.append(_search_clause(term))
    if status is UserStatusFilter.active:
        conditions.append(User.is_locked.is_(False))
    elif status is UserStatusFilter.locked:
        conditions.append(User.is_locked.is_(True))

    total = await session.scalar(select(func.count(User.id)).where(*conditions))
    rows = await session.execute(
        _admin_rows()
        .where(*conditions)
        .order_by(User.id.desc())
        .offset(params.offset)
        .limit(params.size)
    )
    items = [_to_admin_read(u, oc, ac) for u, oc, ac in rows.all()]
    return Page.of(items, total or 0, params)


async def user_counts(session: AsyncSession) -> UserCounts:
    since = datetime.now(UTC) - timedelta(days=NEW_USER_DAYS)
    row = (
        await session.execute(
            select(
                func.count(),
                func.count().filter(User.is_locked.is_(False)),
                func.count().filter(User.is_locked.is_(True)),
                func.count().filter(User.created_at >= since),
            ).select_from(User)
        )
    ).one()
    return UserCounts(all=row[0], active=row[1], locked=row[2], new_this_week=row[3])


async def _admin_read(session: AsyncSession, user_id: int) -> AdminUserRead:
    row = (await session.execute(_admin_rows().where(User.id == user_id))).one()
    return _to_admin_read(*row)


async def set_locked(
    session: AsyncSession, admin: User, user_id: int, locked: bool
) -> AdminUserRead:
    user = await session.get(User, user_id)
    if user is None:
        raise NotFound("User not found")
    if locked and user.id == admin.id:
        raise Conflict("You cannot lock yourself", code="CANNOT_LOCK_SELF")
    if locked and user.role == UserRole.admin:
        raise Conflict("Admin accounts cannot be locked", code="CANNOT_LOCK_ADMIN")
    if locked and not user.is_locked:
        user.locked_at = datetime.now(UTC)
    elif not locked:
        user.locked_at = None
    user.is_locked = locked
    await session.flush()
    return await _admin_read(session, user.id)
