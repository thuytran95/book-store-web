from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Computed,
    ForeignKey,
    Index,
    SmallInteger,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, TimestampMixin


class Category(Base, TimestampMixin):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(140), unique=True, nullable=False)


class Author(Base, TimestampMixin):
    __tablename__ = "authors"
    __table_args__ = (
        Index(
            "uq_authors_name_norm",
            text("lower(immutable_unaccent(name))"),
            unique=True,
        ),
        Index(
            "ix_authors_name_trgm",
            text("immutable_unaccent(name) gin_trgm_ops"),
            postgresql_using="gin",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    bio: Mapped[str | None] = mapped_column(Text)


class BookAuthor(Base):
    """Ordered book <-> author link. Written only by `catalog.service`."""

    __tablename__ = "book_authors"

    book_id: Mapped[int] = mapped_column(
        ForeignKey("books.id", ondelete="CASCADE"), primary_key=True
    )
    author_id: Mapped[int] = mapped_column(
        ForeignKey("authors.id", ondelete="RESTRICT"), primary_key=True, index=True
    )
    position: Mapped[int] = mapped_column(
        SmallInteger, default=0, server_default=text("0"), nullable=False
    )


class Book(Base, TimestampMixin):
    __tablename__ = "books"
    __table_args__ = (
        CheckConstraint("sale_price >= 0", name="ck_books_sale_price"),
        CheckConstraint("quantity >= 0", name="ck_books_quantity"),
        CheckConstraint("condition_pct BETWEEN 10 AND 100", name="ck_books_condition"),
        Index("ix_books_search_vector", "search_vector", postgresql_using="gin"),
        Index(
            "ix_books_title_trgm",
            text("immutable_unaccent(title) gin_trgm_ops"),
            postgresql_using="gin",
        ),
        Index(
            "ix_books_author_trgm",
            text("immutable_unaccent(coalesce(author, '')) gin_trgm_ops"),
            postgresql_using="gin",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(280), unique=True, nullable=False)
    # Display cache: author names joined by ", " (see `catalog.service._refresh_author_text`).
    author: Mapped[str | None] = mapped_column(String(255))
    publisher: Mapped[str | None] = mapped_column(String(255))
    published_year: Mapped[int | None] = mapped_column(SmallInteger)
    sale_price: Mapped[int] = mapped_column(BigInteger, nullable=False)
    condition_pct: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    # Only the `inventory` module may change quantity after creation.
    quantity: Mapped[int] = mapped_column(default=1, nullable=False)
    is_visible: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default=text("true"), nullable=False
    )
    search_vector: Mapped[str] = mapped_column(
        TSVECTOR,
        Computed(
            "to_tsvector('simple', immutable_unaccent(title || ' ' || coalesce(author, '')))",
            persisted=True,
        ),
        nullable=False,
    )

    category: Mapped[Category] = relationship(lazy="joined")
    images: Mapped[list["BookImage"]] = relationship(
        back_populates="book", order_by="BookImage.position", cascade="all, delete-orphan"
    )
    authors: Mapped[list[Author]] = relationship(
        secondary="book_authors", order_by="BookAuthor.position", lazy="selectin", viewonly=True
    )


class BookImage(Base):
    __tablename__ = "book_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    book_id: Mapped[int] = mapped_column(
        ForeignKey("books.id", ondelete="CASCADE"), index=True, nullable=False
    )
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    position: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)

    book: Mapped[Book] = relationship(back_populates="images")
