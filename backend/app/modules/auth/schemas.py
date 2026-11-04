from pydantic import BaseModel, EmailStr, Field

from app.core.types import Password, Phone


class RegisterIn(BaseModel):
    email: EmailStr
    password: Password
    full_name: str = Field(min_length=1, max_length=120)
    phone: Phone | None = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    token: str = Field(min_length=1)
    new_password: Password
