from fastapi import APIRouter, status
from pydantic import BaseModel, Field

from app.core.deps import CurrentUser, SessionDep
from app.core.pagination import Page, PageDep
from app.modules.orders import service
from app.modules.orders.models import OrderStatus
from app.modules.orders.schemas import (
    OrderDetail,
    OrderFilter,
    OrderSummary,
    PlaceOrderIn,
)

router = APIRouter(prefix="/orders", tags=["orders"])


class CancelIn(BaseModel):
    reason: str | None = Field(default=None, max_length=1000)


@router.post("", response_model=OrderDetail, status_code=status.HTTP_201_CREATED)
async def place_order(body: PlaceOrderIn, user: CurrentUser, session: SessionDep):
    return await service.place_order(session, user, body)


@router.get("", response_model=Page[OrderSummary])
async def list_my_orders(user: CurrentUser, session: SessionDep, params: PageDep):
    return await service.list_orders(session, OrderFilter(user_id=user.id), params)


@router.get("/{order_id}", response_model=OrderDetail)
async def get_order(order_id: int, user: CurrentUser, session: SessionDep):
    return await service.get_order(session, order_id, user)


@router.post("/{order_id}/cancel", response_model=OrderDetail)
async def cancel_order(
    order_id: int, user: CurrentUser, session: SessionDep, body: CancelIn | None = None
):
    reason = body.reason if body else None
    return await service.transition(session, order_id, OrderStatus.cancelled, user, reason)
