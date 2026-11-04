from typing import Annotated

from fastapi import APIRouter, Cookie, Request, Response, status

from app.core.deps import CurrentUser, SessionDep
from app.core.ratelimit import limiter
from app.modules.auth import service
from app.modules.auth.schemas import ForgotPasswordIn, LoginIn, RegisterIn, ResetPasswordIn
from app.modules.mail import get_mailer
from app.modules.users.schemas import UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def register(request: Request, body: RegisterIn, session: SessionDep):
    return await service.register(session, body)


@router.post("/login", response_model=UserRead)
@limiter.limit("10/minute")
async def login(request: Request, body: LoginIn, response: Response, session: SessionDep):
    user = await service.login(session, body.email, body.password)
    service.set_auth_cookies(response, user)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response, _: CurrentUser):
    service.clear_auth_cookies(response)


@router.post("/refresh", response_model=UserRead)
async def refresh(
    response: Response,
    session: SessionDep,
    refresh_token: Annotated[str | None, Cookie()] = None,
):
    user = await service.refresh(session, refresh_token)
    service.set_auth_cookies(response, user)
    return user


@router.post("/password/forgot", status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("5/minute")
async def forgot_password(request: Request, body: ForgotPasswordIn, session: SessionDep):
    await service.request_password_reset(session, body.email, get_mailer())
    return {"status": "accepted"}


@router.post("/password/reset", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
async def reset_password(request: Request, body: ResetPasswordIn, session: SessionDep):
    await service.reset_password(session, body.token, body.new_password)
