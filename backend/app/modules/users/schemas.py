import enum
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


class UserStatusFilter(str, enum.Enum):
    active = "active"
    locked = "locked"


class AdminUserRead(UserRead):
    """Admin list row: adds lock date and order counts."""

    locked_at: datetime | None = None
    order_count: int = 0
    active_order_count: int = 0  # pending, confirmed, shipping


class UserCounts(BaseModel):
    all: int = 0
    active: int = 0
    locked: int = 0
    new_this_week: int = 0


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=120)
    phone: Phone | None = None

