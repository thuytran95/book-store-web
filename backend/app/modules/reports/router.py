from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.core.deps import SessionDep, require_admin
from app.modules.reports import service
from app.modules.reports.schemas import (
    BestSeller,
    Granularity,
    LowStockBook,
    OrderSummaryReport,
    RevenuePoint,
)

router = APIRouter(
    prefix="/admin/reports", tags=["admin-reports"], dependencies=[Depends(require_admin)]
)


@router.get("/revenue", response_model=list[RevenuePoint])
async def revenue(
    session: SessionDep,
    granularity: Granularity = Granularity.day,
    date_from: Annotated[date | None, Query(alias="from")] = None,
    date_to: Annotated[date | None, Query(alias="to")] = None,
):
    return await service.revenue(session, granularity, date_from, date_to)


@router.get("/summary", response_model=OrderSummaryReport)
async def summary(session: SessionDep):
    return await service.summary(session)


@router.get("/best-sellers", response_model=list[BestSeller])
async def best_sellers(session: SessionDep, limit: Annotated[int, Query(ge=1, le=50)] = 10):
    return await service.best_sellers(session, limit)


@router.get("/low-stock", response_model=list[LowStockBook])
async def low_stock(session: SessionDep, threshold: Annotated[int, Query(ge=0)] = 1):
    return await service.low_stock(session, threshold)
