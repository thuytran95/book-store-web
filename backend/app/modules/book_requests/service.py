from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import Conflict, NotFound
from app.core.pagination import Page, PageParams
from app.modules.book_requests.models import BookRequest, BookRequestStatus
from app.modules.book_requests.schemas import BookRequestCreate, BookRequestRead, ResolveIn
from app.modules.users.models import User


async def create(session: AsyncSession, user: User, data: BookRequestCreate) -> BookRequest:
    request = BookRequest(user_id=user.id, **data.model_dump())
    session.add(request)
    await session.flush()
    return request


async def list_mine(session: AsyncSession, user: User) -> list[BookRequest]:
    rows = await session.scalars(
        select(BookRequest).where(BookRequest.user_id == user.id).order_by(BookRequest.id.desc())
    )
    return list(rows)


async def admin_list(
    session: AsyncSession, params: PageParams, status: BookRequestStatus | None
) -> Page[BookRequestRead]:
    stmt = select(BookRequest)
    if status:
        stmt = stmt.where(BookRequest.status == status)
    total = await session.scalar(select(func.count()).select_from(stmt.subquery()))
    rows = await session.scalars(
        stmt.order_by(BookRequest.id.desc()).offset(params.offset).limit(params.size)
    )
    return Page.of([BookRequestRead.model_validate(r) for r in rows], total or 0, params)


async def resolve(session: AsyncSession, request_id: int, data: ResolveIn) -> BookRequest:
    if data.status == BookRequestStatus.pending:
        raise Conflict("Resolve as available or rejected", code="INVALID_STATUS")
    request = await session.get(BookRequest, request_id, with_for_update=True)
    if request is None:
        raise NotFound("Book request not found")
    if request.status != BookRequestStatus.pending:
        raise Conflict("Request already resolved", code="ALREADY_RESOLVED")
    request.status = data.status
    request.admin_note = data.admin_note
    await session.flush()
    return request
