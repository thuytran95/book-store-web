from typing import Annotated

from fastapi import Cookie, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session
from app.core.errors import Forbidden, Unauthenticated
from app.core.security import decode_token
from app.modules.users.models import User, UserRole

ACCESS_COOKIE = "access_token"
REFRESH_COOKIE = "refresh_token"

# Services receive this session and never commit; get_session commits once per request.
SessionDep = Annotated[AsyncSession, Depends(get_session)]


async def current_user(
    session: SessionDep,
    access_token: Annotated[str | None, Cookie()] = None,
) -> User:
    payload = decode_token(access_token, "access") if access_token else None
    if payload is None:
        raise Unauthenticated("Not authenticated")
    user = await session.get(User, int(payload["sub"]))
    if user is None:
        raise Unauthenticated("Not authenticated")
    if user.is_locked:
        raise Forbidden("Account is locked", code="ACCOUNT_LOCKED")
    return user


async def require_admin(user: Annotated[User, Depends(current_user)]) -> User:
    if user.role != UserRole.admin:
        raise Forbidden("Admin only")
    return user


CurrentUser = Annotated[User, Depends(current_user)]
AdminUser = Annotated[User, Depends(require_admin)]
