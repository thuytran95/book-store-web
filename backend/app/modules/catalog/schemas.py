from datetime import datetime
from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.core.types import ConditionPct, Money

AuthorName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=160)]


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class CategoryUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    book_count: int = 0


class AuthorCreate(BaseModel):
    name: AuthorName
    bio: str | None = None


class AuthorUpdate(BaseModel):
    name: AuthorName | None = None
    bio: str | None = None


class AuthorRef(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class AuthorRead(AuthorRef):
    bio: str | None
    book_count: int = 0
    created_at: datetime


class BookImageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    position: int


class ImageOrder(BaseModel):
    """Permutation of a book's image ids; index is the new position."""

    ids: list[int] = Field(min_length=1)


class BookCard(BaseModel):
    """List/grid item."""

    id: int
    slug: str
    title: str
    author: str | None
    price: int
    condition_pct: int
    cover_url: str | None
    available: int
    category: CategoryRead


class BookDetail(BookCard):
    publisher: str | None
    published_year: int | None
    description: str | None
    authors: list[AuthorRef]
    images: list[BookImageRead]
    is_visible: bool
    created_at: datetime


class BookAdminRead(BookDetail):
    quantity: int


class BookCreate(BaseModel):
    category_id: int
    title: str = Field(min_length=1, max_length=255)
    author_ids: list[int] = Field(default_factory=list, max_length=10)
    publisher: str | None = Field(default=None, max_length=255)
    published_year: int | None = Field(default=None, ge=1000, le=2100)
    price: Money
    condition_pct: ConditionPct
    description: str | None = None
    quantity: int = Field(default=1, ge=0)
    is_visible: bool = True


class BookUpdate(BaseModel):
    """`quantity` is applied through `inventory`, never set on the model directly."""

    category_id: int | None = None
    title: str | None = Field(default=None, min_length=1, max_length=255)
    author_ids: list[int] | None = Field(default=None, max_length=10)  # None = unchanged
    publisher: str | None = Field(default=None, max_length=255)
    published_year: int | None = Field(default=None, ge=1000, le=2100)
    price: Money | None = None
    condition_pct: ConditionPct | None = None
    description: str | None = None
    quantity: int | None = Field(default=None, ge=0)
    is_visible: bool | None = None


class BookDeleteResult(BaseModel):
    deleted: bool
    hidden: bool  # true when the book has history and was hidden instead


class BookSort(str, Enum):
    newest = "newest"
    price_asc = "price_asc"
    price_desc = "price_desc"
    relevance = "relevance"
    title_asc = "title_asc"
    condition_desc = "condition_desc"


class BookQuery(BaseModel):
    text: str | None = None
    category_slug: str | None = None
    author_id: int | None = None
    price_min: int | None = Field(default=None, ge=0)
    price_max: int | None = Field(default=None, ge=0)
    condition_min: int | None = Field(default=None, ge=10, le=100)
    in_stock_only: bool = False
    visible: bool | None = None  # admin list only; ignored on public search
    sort: BookSort = BookSort.newest
    page: int = Field(default=1, ge=1)
    size: int = Field(default=20, ge=1, le=100)
