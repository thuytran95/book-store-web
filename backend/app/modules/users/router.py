from fastapi import APIRouter, Depends, status

from app.core.deps import AdminUser, CurrentUser, SessionDep, require_admin
from app.core.pagination import Page, PageDep
from app.modules.users import service
from app.modules.users.schemas import (
    AddressCreate,
    AddressRead,
    AddressUpdate,
    UserRead,
    UserUpdate,
)

router = APIRouter(prefix="/me", tags=["me"])
admin_router = APIRouter(
    prefix="/admin/users", tags=["admin-users"], dependencies=[Depends(require_admin)]
)


@router.get("", response_model=UserRead)
async def get_me(user: CurrentUser):
    return user


@router.patch("", response_model=UserRead)
async def update_me(body: UserUpdate, user: CurrentUser, session: SessionDep):
    return await service.update_profile(session, user, body)


@router.get("/addresses", response_model=list[AddressRead])
async def list_addresses(user: CurrentUser, session: SessionDep):
    return await service.list_addresses(session, user)


@router.post("/addresses", response_model=AddressRead, status_code=status.HTTP_201_CREATED)
async def create_address(body: AddressCreate, user: CurrentUser, session: SessionDep):
    return await service.create_address(session, user, body)


@router.patch("/addresses/{address_id}", response_model=AddressRead)
async def update_address(
    address_id: int, body: AddressUpdate, user: CurrentUser, session: SessionDep
):
    return await service.update_address(session, user, address_id, body)


@router.delete("/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(address_id: int, user: CurrentUser, session: SessionDep):
    await service.delete_address(session, user, address_id)


@admin_router.get("", response_model=Page[UserRead])
async def list_users(session: SessionDep, params: PageDep, search: str | None = None):
    return await service.list_users(session, params, search)


@admin_router.post("/{user_id}/lock", response_model=UserRead)
async def lock_user(user_id: int, admin: AdminUser, session: SessionDep):
    return await service.set_locked(session, admin, user_id, True)


@admin_router.post("/{user_id}/unlock", response_model=UserRead)
async def unlock_user(user_id: int, admin: AdminUser, session: SessionDep):
    return await service.set_locked(session, admin, user_id, False)
