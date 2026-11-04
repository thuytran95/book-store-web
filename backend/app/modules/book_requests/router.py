from fastapi import APIRouter, status

from app.core.deps import CurrentUser, SessionDep
from app.modules.book_requests import service
from app.modules.book_requests.schemas import BookRequestCreate, BookRequestRead

router = APIRouter(prefix="/book-requests", tags=["book-requests"])


@router.post("", response_model=BookRequestRead, status_code=status.HTTP_201_CREATED)
async def create(body: BookRequestCreate, user: CurrentUser, session: SessionDep):
    return await service.create(session, user, body)


@router.get("", response_model=list[BookRequestRead])
async def list_mine(user: CurrentUser, session: SessionDep):
    return await service.list_mine(session, user)
