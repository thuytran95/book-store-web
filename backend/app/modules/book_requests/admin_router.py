from fastapi import APIRouter, Depends

from app.core.deps import SessionDep, require_admin
from app.core.pagination import Page, PageDep
from app.modules.book_requests import service
from app.modules.book_requests.models import BookRequestStatus
from app.modules.book_requests.schemas import BookRequestRead, ResolveIn

router = APIRouter(
    prefix="/admin/book-requests", tags=["admin-book-requests"],
    dependencies=[Depends(require_admin)],
)


@router.get("", response_model=Page[BookRequestRead])
async def list_requests(
    session: SessionDep, params: PageDep, status: BookRequestStatus | None = None
):
    return await service.admin_list(session, params, status)


@router.post("/{request_id}/resolve", response_model=BookRequestRead)
async def resolve(request_id: int, body: ResolveIn, session: SessionDep):
    return await service.resolve(session, request_id, body)
