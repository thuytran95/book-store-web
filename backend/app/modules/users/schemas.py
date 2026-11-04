from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.core.types import Phone
from app.modules.users.models import UserRole


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    phone: str | None
    role: UserRole
    is_locked: bool
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=120)
    phone: Phone | None = None


class AddressBase(BaseModel):
    recipient: str = Field(min_length=1, max_length=120)
    phone: Phone
    line: str = Field(min_length=1, max_length=255)
    ward: str = Field(min_length=1, max_length=100)
    district: str = Field(min_length=1, max_length=100)
    province: str = Field(min_length=1, max_length=100)
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    recipient: str | None = Field(default=None, min_length=1, max_length=120)
    phone: Phone | None = None
    line: str | None = Field(default=None, min_length=1, max_length=255)
    ward: str | None = Field(default=None, min_length=1, max_length=100)
    district: str | None = Field(default=None, min_length=1, max_length=100)
    province: str | None = Field(default=None, min_length=1, max_length=100)
    is_default: bool | None = None


class AddressRead(AddressBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
