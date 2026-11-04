from fastapi import APIRouter, status

from app.core.deps import CurrentUser, SessionDep
from app.modules.reservations import service
from app.modules.reservations.schemas import ReservationRead, ReserveIn

router = APIRouter(prefix="/reservations", tags=["reservations"])


@router.post("", response_model=ReservationRead, status_code=status.HTTP_201_CREATED)
async def reserve(body: ReserveIn, user: CurrentUser, session: SessionDep):
    return await service.reserve(session, user, body.book_id, body.quantity)


@router.get("", response_model=list[ReservationRead])
async def list_mine(user: CurrentUser, session: SessionDep):
    return await service.list_mine(session, user)


@router.post("/{reservation_id}/cancel", response_model=ReservationRead)
async def cancel(reservation_id: int, user: CurrentUser, session: SessionDep):
    return await service.cancel(session, reservation_id, user)
