from fastapi import APIRouter, Depends, status

from app.core.deps import SessionDep, require_admin
from app.core.pagination import Page, PageDep
from app.modules.catalog import service
from app.modules.catalog.router import BookQueryDep
from app.modules.catalog.schemas import (
    AuthorCreate,
    AuthorRead,
    AuthorUpdate,
    BookAdminRead,
    BookBulkRequest,
    BookBulkResult,
    BookCreate,
    BookDeleteResult,
    BookUpdate,
    CategoryCreate,
    CategoryRead,
    CategoryUpdate,
)

router = APIRouter(prefix="/admin", tags=["admin-catalog"], dependencies=[Depends(require_admin)])


@router.get("/books", response_model=Page[BookAdminRead])
async def list_books(session: SessionDep, q: BookQueryDep):
    return await service.admin_list_books(session, q)


@router.post("/books", response_model=BookAdminRead, status_code=status.HTTP_201_CREATED)
async def create_book(body: BookCreate, session: SessionDep):
    return await service.create_book(session, body)


@router.post("/books/bulk", response_model=BookBulkResult)
async def bulk_books(body: BookBulkRequest, session: SessionDep):
    return await service.bulk_books(session, body.ids, body.action)


@router.get("/books/{book_id}", response_model=BookAdminRead)
async def get_book(book_id: int, session: SessionDep):
    return await service.admin_get_book(session, book_id)


@router.patch("/books/{book_id}", response_model=BookAdminRead)
async def update_book(book_id: int, body: BookUpdate, session: SessionDep):
    return await service.update_book(session, book_id, body)


@router.delete("/books/{book_id}", response_model=BookDeleteResult)
async def delete_book(book_id: int, session: SessionDep):
    return await service.delete_book(session, book_id)


@router.get("/authors", response_model=Page[AuthorRead])
async def list_authors(session: SessionDep, params: PageDep, q: str | None = None):
    return await service.list_authors(session, q, params)


@router.get("/authors/{author_id}", response_model=AuthorRead)
async def get_author(author_id: int, session: SessionDep):
    return await service.get_author(session, author_id)


@router.post("/authors", response_model=AuthorRead, status_code=status.HTTP_201_CREATED)
async def create_author(body: AuthorCreate, session: SessionDep):
    return await service.create_author(session, body)


@router.patch("/authors/{author_id}", response_model=AuthorRead)
async def update_author(author_id: int, body: AuthorUpdate, session: SessionDep):
    return await service.update_author(session, author_id, body)


@router.delete("/authors/{author_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_author(author_id: int, session: SessionDep, merge_into: int | None = None):
    await service.delete_author(session, author_id, merge_into)


@router.get("/categories", response_model=list[CategoryRead])
async def list_categories(session: SessionDep):
    return await service.list_categories(session)


@router.post("/categories", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(body: CategoryCreate, session: SessionDep):
    return await service.create_category(session, body)


@router.patch("/categories/{category_id}", response_model=CategoryRead)
async def update_category(category_id: int, body: CategoryUpdate, session: SessionDep):
    return await service.update_category(session, category_id, body)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: int, session: SessionDep, move_to: int | None = None):
    await service.delete_category(session, category_id, move_to)
