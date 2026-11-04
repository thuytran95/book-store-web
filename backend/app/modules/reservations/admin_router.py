from fastapi import APIRouter, Depends

from app.core.deps import AdminUser, SessionDep, require_admin
from app.core.pagination import Page, PageDep
from app.modules.reservations import service
from app.modules.reservations.models import ReservationStatus
from app.modules.reservations.schemas import ReservationRead

router = APIRouter(
    prefix="/admin/reservations", tags=["admin-reservations"],
    dependencies=[Depends(require_admin)],
)


@router.get("", response_model=Page[ReservationRead])
async def list_reservations(
    session: SessionDep, params: PageDep, status: ReservationStatus | None = None
):
    return await service.admin_list(session, params, status)


@router.post("/{reservation_id}/cancel", response_model=ReservationRead)
async def cancel(reservation_id: int, admin: AdminUser, session: SessionDep):
    return await service.cancel(session, reservation_id, admin)
