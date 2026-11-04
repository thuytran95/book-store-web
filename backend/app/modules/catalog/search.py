"""Catalog search: full-text + unaccent (Vietnamese) + pg_trgm typo tolerance.

Callers only see `BookQuery -> (books, total)`.
"""

import re

from sqlalchemy import Select, and_, func, literal, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.catalog.models import Book, Category
from app.modules.catalog.schemas import BookQuery, BookSort

TRIGRAM_THRESHOLD = 0.3


def _unaccent(col):
    return func.immutable_unaccent(col)


def _tsquery_text(text: str) -> str | None:
    tokens = re.findall(r"\w+", text, flags=re.UNICODE)
    return " & ".join(f"{t}:*" for t in tokens) or None  # \w only: safe for to_tsquery


def apply_text(stmt: Select, text: str):
    """Returns (stmt, rank_expression)."""
    ts = _tsquery_text(text)
    plain = func.immutable_unaccent(literal(text.lower().strip()))
    title_sim = func.similarity(_unaccent(func.lower(Book.title)), plain)
    author_sim = func.similarity(_unaccent(func.lower(func.coalesce(Book.author, ""))), plain)
    fuzzy = func.greatest(title_sim, author_sim)
    conditions = [fuzzy > TRIGRAM_THRESHOLD]
    rank = fuzzy
    if ts:
        query = func.to_tsquery("simple", func.immutable_unaccent(literal(ts)))
        conditions.append(Book.search_vector.op("@@")(query))
        rank = fuzzy + func.ts_rank(Book.search_vector, query)
    return stmt.where(or_(*conditions)), rank


def build_filters(q: BookQuery, *, public: bool = True) -> list:
    filters = []
    if public:
        filters.append(Book.is_visible.is_(True))
    elif q.visible is not None:
        filters.append(Book.is_visible.is_(q.visible))
    if q.category_slug:
        filters.append(Book.category_id.in_(
            select(Category.id).where(Category.slug == q.category_slug)
        ))
    if q.price_min is not None:
        filters.append(Book.sale_price >= q.price_min)
    if q.price_max is not None:
        filters.append(Book.sale_price <= q.price_max)
    if q.condition_min is not None:
        filters.append(Book.condition_pct >= q.condition_min)
    if q.in_stock_only:
        filters.append(Book.quantity > 0)
    return filters


async def search_books(
    session: AsyncSession, q: BookQuery, *, public: bool = True
) -> tuple[list[Book], int]:
    stmt = select(Book).where(and_(*build_filters(q, public=public)))
    rank = None
    if q.text and q.text.strip():
        stmt, rank = apply_text(stmt, q.text)

    total = await session.scalar(select(func.count()).select_from(stmt.subquery()))

    if q.sort == BookSort.price_asc:
        order = [Book.sale_price.asc(), Book.id.desc()]
    elif q.sort == BookSort.price_desc:
        order = [Book.sale_price.desc(), Book.id.desc()]
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
