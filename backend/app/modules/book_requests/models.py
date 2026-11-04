import enum

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base, TimestampMixin


class BookRequestStatus(str, enum.Enum):
    pending = "pending"
    available = "available"
    rejected = "rejected"


class BookRequest(Base, TimestampMixin):
    __tablename__ = "book_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    author: Mapped[str | None] = mapped_column(String(255))
    note: Mapped[str | None] = mapped_column(Text)
    status: Mapped[BookRequestStatus] = mapped_column(
        Enum(BookRequestStatus, name="book_request_status"),
        default=BookRequestStatus.pending,
        nullable=False,
    )
    admin_note: Mapped[str | None] = mapped_column(Text)
