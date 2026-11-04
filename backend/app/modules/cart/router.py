from fastapi import APIRouter, status

from app.core.deps import CurrentUser, SessionDep
from app.modules.cart import service
from app.modules.cart.schemas import CartItemSet, CartRead

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("", response_model=CartRead)
async def get_cart(user: CurrentUser, session: SessionDep):
    return await service.get_cart(session, user)


@router.put("/items/{book_id}", response_model=CartRead)
async def set_item(book_id: int, body: CartItemSet, user: CurrentUser, session: SessionDep):
    return await service.set_item(session, user, book_id, body.quantity)


@router.delete("/items/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_item(book_id: int, user: CurrentUser, session: SessionDep):
    await service.remove_item(session, user, book_id)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(user: CurrentUser, session: SessionDep):
    await service.clear(session, user)
