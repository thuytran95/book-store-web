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

