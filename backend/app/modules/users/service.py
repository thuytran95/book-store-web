from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import Conflict, NotFound
from app.core.pagination import Page, PageParams
from app.modules.users.models import User
from app.modules.users.schemas import UserRead, UserUpdate


async def update_profile(session: AsyncSession, user: User, data: UserUpdate) -> User:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    await session.flush()
    return user


# ---- admin ----

async def list_users(
    session: AsyncSession, params: PageParams, search: str | None
) -> Page[UserRead]:
    stmt = select(User)
    if search:
        like = f"%{search.strip()}%"
        stmt = stmt.where(or_(User.email.ilike(like), User.full_name.ilike(like)))
    total = await session.scalar(select(func.count()).select_from(stmt.subquery()))
    rows = await session.scalars(
        stmt.order_by(User.id.desc()).offset(params.offset).limit(params.size)
    )
    return Page.of([UserRead.model_validate(u) for u in rows], total or 0, params)


async def set_locked(session: AsyncSession, admin: User, user_id: int, locked: bool) -> User:
    user = await session.get(User, user_id)
    if user is None:
        raise NotFound("User not found")
    if locked and user.id == admin.id:
        raise Conflict("You cannot lock yourself", code="CANNOT_LOCK_SELF")
    user.is_locked = locked
    await session.flush()
    return user
