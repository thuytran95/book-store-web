from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.core.deps import AdminUser, SessionDep, require_admin
from app.core.pagination import Page, PageDep
from app.modules.orders import service
from app.modules.orders.models import OrderStatus
from app.modules.orders.schemas import (
    AdminOrderSummary,
    OrderDetail,
    OrderFilter,
    OrderSort,
    OrderStatusCounts,
    TransitionIn,
)

router = APIRouter(
    prefix="/admin/orders", tags=["admin-orders"], dependencies=[Depends(require_admin)]
)


@router.get("", response_model=Page[AdminOrderSummary])
async def list_orders(
    session: SessionDep,
    params: PageDep,
    status: OrderStatus | None = None,
    q: Annotated[str | None, Query(max_length=100)] = None,
    code: Annotated[str | None, Query(max_length=100, description="Alias of `q`")] = None,
    sort: OrderSort = OrderSort.newest,
    user_id: Annotated[int | None, Query(ge=1)] = None,
):
    flt = OrderFilter(status=status, user_id=user_id, q=q, code=code, sort=sort)
    return await service.list_orders(session, flt, params)


@router.get("/counts", response_model=OrderStatusCounts)
async def status_counts(session: SessionDep):
    return await service.status_counts(session)


@router.get("/{order_id}", response_model=OrderDetail)
async def get_order(order_id: int, admin: AdminUser, session: SessionDep):
    return await service.get_order(session, order_id, admin)


@router.post("/{order_id}/transition", response_model=OrderDetail)
async def transition(order_id: int, body: TransitionIn, admin: AdminUser, session: SessionDep):
    return await service.transition(session, order_id, body.to, admin, body.reason)
