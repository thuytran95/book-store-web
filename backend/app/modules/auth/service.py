from fastapi import Response
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.deps import ACCESS_COOKIE, REFRESH_COOKIE
from app.core.errors import Conflict, Forbidden, Unauthenticated
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.modules.auth.schemas import RegisterIn
from app.modules.users.models import User


async def register(session: AsyncSession, data: RegisterIn) -> User:
    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        phone=data.phone,
    )
    session.add(user)
    try:
        await session.flush()
    except IntegrityError:
        raise Conflict("Email already registered", code="EMAIL_TAKEN") from None
    return user


async def login(session: AsyncSession, email: str, password: str) -> User:
    user = await session.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(password, user.password_hash):
        raise Unauthenticated("Invalid email or password", code="INVALID_CREDENTIALS")
    if user.is_locked:
        raise Forbidden("Account is locked", code="ACCOUNT_LOCKED")
    return user


async def refresh(session: AsyncSession, refresh_token: str | None) -> User:
    payload = decode_token(refresh_token, "refresh") if refresh_token else None
    user = await session.get(User, int(payload["sub"])) if payload else None
    if user is None:
        raise Unauthenticated("Invalid refresh token", code="INVALID_REFRESH")
    if user.is_locked:
        raise Forbidden("Account is locked", code="ACCOUNT_LOCKED")
    return user


def set_auth_cookies(response: Response, user: User) -> None:
    s = get_settings()
    common = {"httponly": True, "samesite": "lax", "secure": s.cookie_secure, "path": "/"}
    response.set_cookie(ACCESS_COOKIE, create_access_token(user.id, user.role.value),
                        max_age=s.access_token_ttl_min * 60, **common)
    response.set_cookie(REFRESH_COOKIE, create_refresh_token(user.id),
                        max_age=s.refresh_token_ttl_days * 86400, **common)


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(ACCESS_COOKIE, path="/")
    response.delete_cookie(REFRESH_COOKIE, path="/")

