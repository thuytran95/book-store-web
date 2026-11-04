from sqlalchemy import func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import Conflict, NotFound
from app.core.pagination import Page, PageParams
from app.modules.users.models import Address, User
from app.modules.users.schemas import AddressCreate, AddressUpdate, UserRead, UserUpdate


async def update_profile(session: AsyncSession, user: User, data: UserUpdate) -> User:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    await session.flush()
    return user


# ---- addresses (always exactly one default once the user has any) ----

async def list_addresses(session: AsyncSession, user: User) -> list[Address]:
    rows = await session.scalars(
        select(Address).where(Address.user_id == user.id)
        .order_by(Address.is_default.desc(), Address.id)
    )
    return list(rows)


async def _get_own(session: AsyncSession, user: User, address_id: int) -> Address:
    address = await session.get(Address, address_id)
    if address is None or address.user_id != user.id:  # ownership check
        raise NotFound("Address not found")
    return address


async def _clear_default(session: AsyncSession, user_id: int) -> None:
    await session.execute(
        update(Address).where(Address.user_id == user_id, Address.is_default).values(
            is_default=False
        )
    )


async def create_address(session: AsyncSession, user: User, data: AddressCreate) -> Address:
    existing = await session.scalar(
        select(func.count()).select_from(Address).where(Address.user_id == user.id)
    )
    make_default = data.is_default or not existing  # first address becomes default
    if make_default:
        await _clear_default(session, user.id)
    address = Address(**{**data.model_dump(), "is_default": bool(make_default)}, user_id=user.id)
    session.add(address)
    await session.flush()
    return address


async def update_address(
    session: AsyncSession, user: User, address_id: int, data: AddressUpdate
) -> Address:
    address = await _get_own(session, user, address_id)
    changes = data.model_dump(exclude_unset=True)
    make_default = changes.pop("is_default", None)
    if make_default is False and address.is_default:
        raise Conflict("Pick another default address instead", code="DEFAULT_REQUIRED")
    if make_default:
        await _clear_default(session, user.id)
        address.is_default = True
    for key, value in changes.items():
        setattr(address, key, value)
    await session.flush()
    return address


async def delete_address(session: AsyncSession, user: User, address_id: int) -> None:
    address = await _get_own(session, user, address_id)
    was_default = address.is_default
    await session.delete(address)
    await session.flush()
    if was_default:
        next_default = await session.scalar(
            select(Address).where(Address.user_id == user.id).order_by(Address.id).limit(1)
        )
        if next_default:
            next_default.is_default = True


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
