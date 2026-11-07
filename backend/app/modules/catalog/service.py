import re
import unicodedata

from sqlalchemy import delete, exists, func, insert, literal, select, update
from sqlalchemy.dialects.postgresql import aggregate_order_by
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, selectinload

from app.core.errors import Conflict, DomainError, NotFound
from app.core.pagination import Page, PageParams
from app.modules.catalog import search
from app.modules.catalog.models import Author, Book, BookAuthor, Category
from app.modules.catalog.schemas import (
    AuthorCreate,
    AuthorRead,
    AuthorUpdate,
    BookAdminRead,
    BookBulkAction,
    BookBulkResult,
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
        "price": book.price,
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
        "authors": book.authors,
        "images": book.images,
        "is_visible": book.is_visible,
        "created_at": book.created_at,
    }


def to_detail(book: Book, available: int) -> BookDetail:
    return BookDetail.model_validate(_detail_fields(book, available))


def to_admin(book: Book, available: int) -> BookAdminRead:
    return BookAdminRead.model_validate(
        {**_detail_fields(book, available), "quantity": book.quantity}
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

async def list_categories(session: AsyncSession) -> list[CategoryRead]:
    rows = await session.execute(
        select(Category, func.count(Book.id))
        .outerjoin(Book, Book.category_id == Category.id)
        .group_by(Category.id)
        .order_by(Category.name)
    )
    return [
        CategoryRead(id=c.id, name=c.name, slug=c.slug, book_count=n or 0) for c, n in rows
    ]


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
    book = Book(**data.model_dump(exclude={"author_ids"}), slug=slug)
    session.add(book)
    await session.flush()
    await _set_book_authors(session, book.id, data.author_ids)
    return await admin_get_book(session, book.id)


async def update_book(session: AsyncSession, book_id: int, data: BookUpdate) -> BookAdminRead:
    book = await _with_images(session, book_id)
    changes = data.model_dump(exclude_unset=True)
    author_ids = changes.pop("author_ids", None)
    quantity = changes.pop("quantity", None)
    if "category_id" in changes and changes["category_id"] is not None:
        await _require_category(session, changes["category_id"])
    for key, value in changes.items():
        if value is None and key in ("title", "category_id", "price", "condition_pct",
                                     "is_visible"):
            continue  # non-nullable columns
        setattr(book, key, value)
    if changes.get("title"):
        book.slug = await _unique_slug(session, Book, slugify(book.title), exclude_id=book.id)
    await session.flush()
    if quantity is not None:
        await Inventory(session).set_quantity(book_id, quantity)
    if author_ids is not None:
        await _set_book_authors(session, book_id, author_ids)
    return await admin_get_book(session, book_id)


async def delete_book(session: AsyncSession, book_id: int) -> BookDeleteResult:
    book = await session.get(Book, book_id)
    if book is None:
        raise NotFound("Book not found")
    has_history = await session.scalar(select(exists().where(OrderItem.book_id == book_id)))
    if has_history:
        book.is_visible = False
        await session.flush()
        return BookDeleteResult(deleted=False, hidden=True)
    await session.delete(book)
    await session.flush()
    return BookDeleteResult(deleted=True, hidden=False)


async def bulk_books(
    session: AsyncSession, ids: list[int], action: BookBulkAction
) -> BookBulkResult:
    """Hide / show / delete many books. Unknown ids are skipped."""
    ids = sorted(set(ids))
    if action in (BookBulkAction.hide, BookBulkAction.show):
        res = await session.execute(
            update(Book)
            .where(Book.id.in_(ids))
            .values(is_visible=action == BookBulkAction.show)
            .execution_options(synchronize_session="fetch")
        )
        return BookBulkResult(updated=res.rowcount or 0)
    result = BookBulkResult()
    existing = list(await session.scalars(select(Book.id).where(Book.id.in_(ids))))
    for book_id in existing:
        r = await delete_book(session, book_id)
        result.deleted += int(r.deleted)
        result.hidden += int(r.hidden)
    return result


# ---- admin: book <-> authors ----

async def _refresh_author_text(session: AsyncSession, book_ids: list[int]) -> None:
    """Rebuild the `books.author` display cache from `book_authors` (NULL when no author)."""
    if not book_ids:
        return
    names = (
        select(
            func.left(
                func.string_agg(
                    Author.name, aggregate_order_by(literal(", "), BookAuthor.position)
                ),
                255,
            )
        )
        .select_from(BookAuthor)
        .join(Author, Author.id == BookAuthor.author_id)
        .where(BookAuthor.book_id == Book.id)
        .scalar_subquery()
    )
    await session.execute(
        update(Book).where(Book.id.in_(book_ids)).values(author=names)
        .execution_options(synchronize_session=False)
    )


async def _set_book_authors(session: AsyncSession, book_id: int, author_ids: list[int]) -> None:
    ids = list(dict.fromkeys(author_ids))  # drop duplicates, keep order
    if ids:
        found = set(await session.scalars(select(Author.id).where(Author.id.in_(ids))))
        missing = [i for i in ids if i not in found]
        if missing:
            raise DomainError(
                "Unknown author ids", code="AUTHOR_NOT_FOUND", details={"ids": missing}
            )
    await session.execute(delete(BookAuthor).where(BookAuthor.book_id == book_id))
    if ids:
        await session.execute(
            insert(BookAuthor),
            [{"book_id": book_id, "author_id": a, "position": i} for i, a in enumerate(ids)],
        )
    await _refresh_author_text(session, [book_id])


# ---- admin: authors ----

def _author_read(author: Author, book_count: int | None) -> AuthorRead:
    return AuthorRead(
        id=author.id, name=author.name, bio=author.bio, book_count=book_count or 0,
        created_at=author.created_at,
    )


def _book_count_expr():
    return (
        select(func.count()).select_from(BookAuthor)
        .where(BookAuthor.author_id == Author.id)
        .scalar_subquery()
    )


def _norm(expr):
    return func.lower(func.immutable_unaccent(expr))


async def list_authors(
    session: AsyncSession, q: str | None, params: PageParams
) -> Page[AuthorRead]:
    stmt = select(Author, _book_count_expr())
    if q and q.strip():
        term = q.strip().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        stmt = stmt.where(_norm(Author.name).like(func.concat("%", _norm(literal(term)), "%")))
    total = await session.scalar(select(func.count()).select_from(stmt.subquery()))
    rows = await session.execute(
        stmt.order_by(_norm(Author.name), Author.id).offset(params.offset).limit(params.size)
    )
    return Page.of([_author_read(a, n) for a, n in rows], total or 0, params)


async def get_author(session: AsyncSession, author_id: int) -> AuthorRead:
    row = (
        await session.execute(
            select(Author, _book_count_expr()).where(Author.id == author_id)
            .execution_options(populate_existing=True)
        )
    ).first()
    if row is None:
        raise NotFound("Author not found")
    return _author_read(*row)


async def _ensure_author_name_free(
    session: AsyncSession, name: str, exclude_id: int | None = None
) -> None:
    stmt = select(Author.id).where(_norm(Author.name) == _norm(literal(name)))
    if exclude_id is not None:
        stmt = stmt.where(Author.id != exclude_id)
    existing = await session.scalar(stmt)
    if existing is not None:
        raise Conflict("Author already exists", code="AUTHOR_EXISTS", details={"id": existing})


async def _flush_author(session: AsyncSession) -> None:
    try:
        await session.flush()
    except IntegrityError:  # concurrent insert of the same name
        raise Conflict("Author already exists", code="AUTHOR_EXISTS") from None


def _clean_bio(bio: str | None) -> str | None:
    return (bio or "").strip() or None


async def create_author(session: AsyncSession, data: AuthorCreate) -> AuthorRead:
    await _ensure_author_name_free(session, data.name)
    author = Author(name=data.name, bio=_clean_bio(data.bio))
    session.add(author)
    await _flush_author(session)
    return await get_author(session, author.id)


async def update_author(session: AsyncSession, author_id: int, data: AuthorUpdate) -> AuthorRead:
    author = await session.get(Author, author_id)
    if author is None:
        raise NotFound("Author not found")
    changes = data.model_dump(exclude_unset=True)
    new_name = changes.get("name")
    renamed = bool(new_name) and new_name != author.name
    if renamed:
        await _ensure_author_name_free(session, new_name, exclude_id=author_id)
        author.name = new_name
    if "bio" in changes:
        author.bio = _clean_bio(changes["bio"])
    await _flush_author(session)
    if renamed:
        book_ids = list(await session.scalars(
            select(BookAuthor.book_id).where(BookAuthor.author_id == author_id)
        ))
        await _refresh_author_text(session, book_ids)
    return await get_author(session, author_id)


async def delete_author(
    session: AsyncSession, author_id: int, merge_into: int | None
) -> None:
    author = await session.get(Author, author_id)
    if author is None:
        raise NotFound("Author not found")
    book_ids = list(await session.scalars(
        select(BookAuthor.book_id).where(BookAuthor.author_id == author_id)
    ))
    if book_ids:
        if merge_into is None:
            raise Conflict(
                "Author still has books", code="AUTHOR_IN_USE",
                details={"book_count": len(book_ids)},
            )
        if merge_into == author_id:
            raise Conflict("Cannot merge into the same author", code="INVALID_MERGE_TARGET")
        if await session.get(Author, merge_into) is None:
            raise NotFound("Merge target not found")
        # Books that already list the target just lose the old link.
        target = aliased(BookAuthor)
        await session.execute(
            delete(BookAuthor).where(
                BookAuthor.author_id == author_id,
                BookAuthor.book_id.in_(
                    select(target.book_id).where(target.author_id == merge_into)
                ),
            )
        )
        await session.execute(
            update(BookAuthor).where(BookAuthor.author_id == author_id)
            .values(author_id=merge_into)
            .execution_options(synchronize_session=False)
        )
    await session.delete(author)
    await session.flush()
    await _refresh_author_text(session, book_ids)


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
