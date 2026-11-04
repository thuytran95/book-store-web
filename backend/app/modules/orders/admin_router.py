from fastapi import APIRouter, Depends

from app.core.deps import AdminUser, SessionDep, require_admin
from app.core.pagination import Page, PageDep
from app.modules.orders import service
from app.modules.orders.models import OrderStatus
from app.modules.orders.schemas import OrderDetail, OrderFilter, OrderSummary, TransitionIn

router = APIRouter(
    prefix="/admin/orders", tags=["admin-orders"], dependencies=[Depends(require_admin)]
)


@router.get("", response_model=Page[OrderSummary])
async def list_orders(
    session: SessionDep, params: PageDep,
    status: OrderStatus | None = None, code: str | None = None,
):
    return await service.list_orders(session, OrderFilter(status=status, code=code), params)


@router.get("/{order_id}", response_model=OrderDetail)
async def get_order(order_id: int, admin: AdminUser, session: SessionDep):
    return await service.get_order(session, order_id, admin)


@router.post("/{order_id}/transition", response_model=OrderDetail)
async def transition(order_id: int, body: TransitionIn, admin: AdminUser, session: SessionDep):
    return await service.transition(session, order_id, body.to, admin, body.reason)
