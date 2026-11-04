from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.book_requests.models import BookRequestStatus


class BookRequestCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    author: str | None = Field(default=None, max_length=255)
    note: str | None = Field(default=None, max_length=2000)


class BookRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    author: str | None
    note: str | None
    status: BookRequestStatus
    admin_note: str | None
    created_at: datetime


class ResolveIn(BaseModel):
    status: BookRequestStatus
    admin_note: str | None = Field(default=None, max_length=2000)
