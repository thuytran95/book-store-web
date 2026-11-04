from fastapi import APIRouter, Depends, status

from app.core.deps import SessionDep, require_admin
from app.core.pagination import Page
from app.modules.catalog import service
from app.modules.catalog.router import BookQueryDep
from app.modules.catalog.schemas import (
    BookAdminRead,
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


@router.get("/books/{book_id}", response_model=BookAdminRead)
async def get_book(book_id: int, session: SessionDep):
    return await service.admin_get_book(session, book_id)


@router.patch("/books/{book_id}", response_model=BookAdminRead)
async def update_book(book_id: int, body: BookUpdate, session: SessionDep):
    return await service.update_book(session, book_id, body)


@router.delete("/books/{book_id}", response_model=BookDeleteResult)
async def delete_book(book_id: int, session: SessionDep):
    return await service.delete_book(session, book_id)


@router.post("/books/{book_id}/mark-sold", response_model=BookAdminRead)
async def mark_sold(book_id: int, session: SessionDep):
    return await service.mark_sold(session, book_id)


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
