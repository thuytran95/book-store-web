from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.core.deps import SessionDep
from app.core.pagination import Page
from app.modules.catalog import service
from app.modules.catalog.schemas import (
    BookCard,
    BookDetail,
    BookQuery,
    BookSort,
    CategoryRead,
)

router = APIRouter(tags=["catalog"])


def book_query(
    text: str | None = None,
    category: str | None = None,
    price_min: Annotated[int | None, Query(ge=0)] = None,
    price_max: Annotated[int | None, Query(ge=0)] = None,
    condition_min: Annotated[int | None, Query(ge=10, le=100)] = None,
    in_stock: bool = False,
    visible: bool | None = None,
    sort: BookSort = BookSort.newest,
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> BookQuery:
    return BookQuery(
        text=text, category_slug=category, price_min=price_min, price_max=price_max,
        condition_min=condition_min, in_stock_only=in_stock, visible=visible,
        sort=sort, page=page, size=size,
    )


BookQueryDep = Annotated[BookQuery, Depends(book_query)]


@router.get("/categories", response_model=list[CategoryRead])
async def list_categories(session: SessionDep):
    return await service.list_categories(session)


@router.get("/books", response_model=Page[BookCard])
async def list_books(session: SessionDep, q: BookQueryDep):
    return await service.search_books(session, q)


@router.get("/books/{slug}", response_model=BookDetail)
async def get_book(slug: str, session: SessionDep):
    return await service.get_book(session, slug)
