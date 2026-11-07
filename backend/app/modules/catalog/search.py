"""Catalog search: unaccent (Vietnamese) word matching + pg_trgm typo tolerance.

Callers only see `BookQuery -> (books, total)`.
"""

import re

from sqlalchemy import Integer, Select, and_, cast, func, literal, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.catalog.models import Book, BookAuthor, Category
from app.modules.catalog.schemas import BookQuery, BookSort, StockStatus

TRIGRAM_THRESHOLD = 0.3
STOCK_CODE_RE = re.compile(r"^\s*(?:ms-?)?0*(\d{1,9})\s*$", re.IGNORECASE)


def _unaccent(col):
    return func.immutable_unaccent(col)


def _tokens(text: str) -> list[str]:
    return re.findall(r"[^\W_]+", text.lower())  # letters/digits only: no LIKE wildcards


def apply_text(stmt: Select, text: str):
    """Returns (stmt, rank_expression).

    Matches when every word appears (accent-insensitive) in title/author, or when the whole
    text is close enough to the title/author (typo tolerance).
    """
    plain = _unaccent(literal(text.lower().strip()))
    title = _unaccent(func.lower(Book.title))
    author = _unaccent(func.lower(func.coalesce(Book.author, "")))
    fuzzy = func.greatest(func.similarity(title, plain), func.similarity(author, plain))
    conditions = [fuzzy > TRIGRAM_THRESHOLD]
    rank = fuzzy
    tokens = _tokens(text)
    if tokens:
        haystack = func.concat(title, " ", author)
        all_words = and_(*(
            haystack.like(func.concat("%", _unaccent(literal(t)), "%")) for t in tokens
        ))
        conditions.append(all_words)
        rank = fuzzy + cast(all_words, Integer)
    return stmt.where(or_(*conditions)), rank


def build_filters(q: BookQuery, *, public: bool = True) -> list:
    filters = []
    if public:
        filters.append(Book.is_visible.is_(True))
    else:
        if q.visible is not None:
            filters.append(Book.is_visible.is_(q.visible))
        if q.stock == StockStatus.in_stock:
            filters += [Book.is_visible.is_(True), Book.quantity > 0]
        elif q.stock == StockStatus.out_of_stock:
            filters += [Book.is_visible.is_(True), Book.quantity == 0]
        elif q.stock == StockStatus.hidden:
            filters.append(Book.is_visible.is_(False))
    if q.category_slug:
        filters.append(Book.category_id.in_(
            select(Category.id).where(Category.slug == q.category_slug)
        ))
    if q.author_id is not None:
        filters.append(Book.id.in_(
            select(BookAuthor.book_id).where(BookAuthor.author_id == q.author_id)
        ))
    if q.price_min is not None:
        filters.append(Book.price >= q.price_min)
    if q.price_max is not None:
        filters.append(Book.price <= q.price_max)
    if q.condition_min is not None:
        filters.append(Book.condition_pct >= q.condition_min)
    if q.condition_max is not None:
        filters.append(Book.condition_pct <= q.condition_max)
    if q.in_stock_only:
        filters.append(Book.quantity > 0)
    return filters


async def search_books(
    session: AsyncSession, q: BookQuery, *, public: bool = True
) -> tuple[list[Book], int]:
    stmt = select(Book).where(and_(*build_filters(q, public=public)))
    rank = None
    if q.text and q.text.strip():
        code = None if public else STOCK_CODE_RE.match(q.text)
        if code:
            # Admin: "MS-00012" / "12" finds book #12 (stock code), plus any text matches.
            text_stmt, rank = apply_text(select(Book.id), q.text)
            stmt = stmt.where(or_(Book.id == int(code.group(1)), Book.id.in_(text_stmt)))
        else:
            stmt, rank = apply_text(stmt, q.text)

    total = await session.scalar(select(func.count()).select_from(stmt.subquery()))

    if q.sort == BookSort.price_asc:
        order = [Book.price.asc(), Book.id.asc()]
    elif q.sort == BookSort.price_desc:
        order = [Book.price.desc(), Book.id.desc()]
    elif q.sort == BookSort.title_asc:
        order = [_unaccent(Book.title).asc(), Book.id.asc()]
    elif q.sort == BookSort.condition_desc:
        order = [Book.condition_pct.desc(), Book.id.desc()]
    elif q.sort == BookSort.relevance and rank is not None:
        order = [rank.desc(), Book.id.desc()]
    else:
        order = [Book.created_at.desc(), Book.id.desc()]

    rows = await session.scalars(
        stmt.options(selectinload(Book.images))
        .order_by(*order)
        .offset((q.page - 1) * q.size)
        .limit(q.size)
    )
    return list(rows), total or 0
