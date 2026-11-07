from fastapi import APIRouter, Depends

from app.core.deps import AdminUser, CurrentUser, SessionDep, require_admin
from app.core.pagination import Page, PageDep
from app.modules.users import service
from app.modules.users.schemas import UserRead, UserUpdate

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


@admin_router.get("", response_model=Page[UserRead])
async def list_users(session: SessionDep, params: PageDep, search: str | None = None):
    return await service.list_users(session, params, search)


@admin_router.post("/{user_id}/lock", response_model=UserRead)
async def lock_user(user_id: int, admin: AdminUser, session: SessionDep):
    return await service.set_locked(session, admin, user_id, True)


@admin_router.post("/{user_id}/unlock", response_model=UserRead)
async def unlock_user(user_id: int, admin: AdminUser, session: SessionDep):
    return await service.set_locked(session, admin, user_id, False)
