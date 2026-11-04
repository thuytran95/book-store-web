import re
import unicodedata

from sqlalchemy import exists, func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import Conflict, NotFound
from app.core.pagination import Page, PageParams
from app.modules.catalog import search
from app.modules.catalog.models import Book, Category
from app.modules.catalog.schemas import (
    BookAdminRead,
    BookCard,
    BookCreate,
    BookDeleteResult,
    BookDetail,
    BookQuery,
    BookUpdate,
    CategoryCreate,
    CategoryRead,
    CategoryUpdate,
)
from app.modules.inventory import Inventory
from app.modules.orders.models import OrderItem
from app.modules.reservations.models import Reservation


def slugify(text: str) -> str:
    text = text.replace("đ", "d").replace("Đ", "D")
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or "item"


async def _unique_slug(session: AsyncSession, model, base: str, exclude_id: int | None = None):
    slug, n = base, 1
    while True:
        stmt = select(model.id).where(model.slug == slug)
        if exclude_id is not None:
            stmt = stmt.where(model.id != exclude_id)
        if await session.scalar(stmt) is None:
            return slug
        n += 1
        slug = f"{base}-{n}"


# ---- mapping ----

def _card_fields(book: Book, available: int) -> dict:
    return {
        "id": book.id,
        "slug": book.slug,
        "title": book.title,
        "author": book.author,
        "sale_price": book.sale_price,
        "condition_pct": book.condition_pct,
        "cover_url": book.images[0].url if book.images else None,
        "available": available,
        "category": CategoryRead.model_validate(book.category),
    }


def to_card(book: Book, available: int) -> BookCard:
    return BookCard(**_card_fields(book, available))


def _detail_fields(book: Book, available: int) -> dict:
    return {
        **_card_fields(book, available),
        "publisher": book.publisher,
        "published_year": book.published_year,
        "description": book.description,
        "images": book.images,
        "is_visible": book.is_visible,
        "created_at": book.created_at,
    }


def to_detail(book: Book, available: int) -> BookDetail:
    return BookDetail.model_validate(_detail_fields(book, available))


def to_admin(book: Book, available: int) -> BookAdminRead:
    return BookAdminRead.model_validate(
        {**_detail_fields(book, available), "cost_price": book.cost_price,
         "quantity": book.quantity}
    )


async def _with_images(session: AsyncSession, book_id: int) -> Book:
    book = await session.scalar(
        select(Book).where(Book.id == book_id).options(selectinload(Book.images))
        .execution_options(populate_existing=True)
    )
    if book is None:
        raise NotFound("Book not found")
    return book


async def _available_one(session: AsyncSession, book_id: int) -> int:
    return (await Inventory(session).available([book_id])).get(book_id, 0)


# ---- public ----

async def list_categories(session: AsyncSession) -> list[Category]:
    return list(await session.scalars(select(Category).order_by(Category.name)))


async def search_books(session: AsyncSession, q: BookQuery) -> Page[BookCard]:
    books, total = await search.search_books(session, q, public=True)
    avail = await Inventory(session).available(b.id for b in books)
    items = [to_card(b, avail.get(b.id, 0)) for b in books]
    return Page.of(items, total, PageParams(page=q.page, size=q.size))


async def get_book(session: AsyncSession, slug: str) -> BookDetail:
    book = await session.scalar(
        select(Book).where(Book.slug == slug, Book.is_visible.is_(True))
        .options(selectinload(Book.images))
    )
    if book is None:
        raise NotFound("Book not found")
    return to_detail(book, await _available_one(session, book.id))


# ---- admin: books ----

async def admin_list_books(session: AsyncSession, q: BookQuery) -> Page[BookAdminRead]:
    books, total = await search.search_books(session, q, public=False)
    avail = await Inventory(session).available(b.id for b in books)
    return Page.of([to_admin(b, avail.get(b.id, 0)) for b in books], total,
                   PageParams(page=q.page, size=q.size))


async def admin_get_book(session: AsyncSession, book_id: int) -> BookAdminRead:
    book = await _with_images(session, book_id)
    return to_admin(book, await _available_one(session, book_id))


async def _require_category(session: AsyncSession, category_id: int) -> None:
    if await session.get(Category, category_id) is None:
        raise NotFound("Category not found")


async def create_book(session: AsyncSession, data: BookCreate) -> BookAdminRead:
    await _require_category(session, data.category_id)
    slug = await _unique_slug(session, Book, slugify(data.title))
    book = Book(**data.model_dump(), slug=slug)
    session.add(book)
    await session.flush()
    return await admin_get_book(session, book.id)


async def update_book(session: AsyncSession, book_id: int, data: BookUpdate) -> BookAdminRead:
    book = await _with_images(session, book_id)
    changes = data.model_dump(exclude_unset=True)
    if "category_id" in changes and changes["category_id"] is not None:
        await _require_category(session, changes["category_id"])
    for key, value in changes.items():
        if value is None and key in ("title", "category_id", "sale_price", "cost_price",
                                     "condition_pct", "is_visible"):
            continue  # non-nullable columns
        setattr(book, key, value)
    if changes.get("title"):
        book.slug = await _unique_slug(session, Book, slugify(book.title), exclude_id=book.id)
    await session.flush()
    return await admin_get_book(session, book_id)


async def delete_book(session: AsyncSession, book_id: int) -> BookDeleteResult:
    book = await session.get(Book, book_id)
    if book is None:
        raise NotFound("Book not found")
    has_history = await session.scalar(
        select(
            exists().where(OrderItem.book_id == book_id)
            | exists().where(Reservation.book_id == book_id)
        )
    )
    if has_history:
        book.is_visible = False
        await session.flush()
        return BookDeleteResult(deleted=False, hidden=True)
    await session.delete(book)
    await session.flush()
    return BookDeleteResult(deleted=True, hidden=False)


async def mark_sold(session: AsyncSession, book_id: int) -> BookAdminRead:
    await Inventory(session).set_quantity(book_id, 0)
    return await admin_get_book(session, book_id)


# ---- admin: categories ----

async def create_category(session: AsyncSession, data: CategoryCreate) -> Category:
    category = Category(
        name=data.name.strip(), slug=await _unique_slug(session, Category, slugify(data.name))
    )
    session.add(category)
    try:
        await session.flush()
    except IntegrityError:
        raise Conflict("Category name already exists", code="CATEGORY_EXISTS") from None
    return category


async def update_category(
    session: AsyncSession, category_id: int, data: CategoryUpdate
) -> Category:
    category = await session.get(Category, category_id)
    if category is None:
        raise NotFound("Category not found")
    category.name = data.name.strip()
    category.slug = await _unique_slug(
        session, Category, slugify(data.name), exclude_id=category_id
    )
    try:
        await session.flush()
    except IntegrityError:
        raise Conflict("Category name already exists", code="CATEGORY_EXISTS") from None
    return category


async def delete_category(
    session: AsyncSession, category_id: int, move_to: int | None
) -> None:
    category = await session.get(Category, category_id)
    if category is None:
        raise NotFound("Category not found")
    book_count = await session.scalar(
        select(func.count()).select_from(Book).where(Book.category_id == category_id)
    )
    if book_count:
        if move_to is None:
            raise Conflict(
                "Category still has books", code="CATEGORY_NOT_EMPTY",
                details={"book_count": book_count},
            )
        if move_to == category_id:
            raise Conflict("Cannot move books to the same category", code="INVALID_MOVE_TARGET")
        await _require_category(session, move_to)
        await session.execute(
            update(Book).where(Book.category_id == category_id).values(category_id=move_to)
        )
    await session.delete(category)
    await session.flush()
