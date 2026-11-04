"""Read-only aggregates. Revenue counts `completed` orders only, dated by completion time."""

from datetime import date, datetime, time, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.catalog.models import Book
from app.modules.orders.models import Order, OrderItem, OrderStatus, OrderStatusHistory
from app.modules.reports.schemas import (
    BestSeller,
    Granularity,
    LowStockBook,
    OrderSummaryReport,
    RevenuePoint,
    StatusCount,
)


def _completed_at():
    """Subquery: when each order reached `completed`."""
    return (
        select(
            OrderStatusHistory.order_id.label("order_id"),
            func.max(OrderStatusHistory.at).label("at"),
        )
        .where(OrderStatusHistory.to_status == OrderStatus.completed)
        .group_by(OrderStatusHistory.order_id)
        .subquery()
    )


async def revenue(
    session: AsyncSession, granularity: Granularity, date_from: date | None, date_to: date | None
) -> list[RevenuePoint]:
    done = _completed_at()
    period = func.date_trunc(granularity.value, done.c.at).label("period")
    stmt = (
        select(period, func.sum(Order.total), func.count(Order.id))
        .join(done, done.c.order_id == Order.id)
        .where(Order.status == OrderStatus.completed)
        .group_by(period)
        .order_by(period)
    )
    if date_from:
        stmt = stmt.where(done.c.at >= datetime.combine(date_from, time.min))
    if date_to:
        stmt = stmt.where(done.c.at < datetime.combine(date_to + timedelta(days=1), time.min))
    rows = await session.execute(stmt)
    return [
        RevenuePoint(period=p.date(), revenue=int(total or 0), orders=count)
        for p, total, count in rows
    ]


async def summary(session: AsyncSession) -> OrderSummaryReport:
    rows = await session.execute(select(Order.status, func.count()).group_by(Order.status))
    by_status = {s: c for s, c in rows}
    counts = [StatusCount(status=s.value, count=by_status.get(s, 0)) for s in OrderStatus]
    revenue_total = await session.scalar(
        select(func.coalesce(func.sum(Order.total), 0)).where(
            Order.status == OrderStatus.completed
        )
    )
    return OrderSummaryReport(
        counts=counts, total_orders=sum(by_status.values()),
        completed_revenue=int(revenue_total or 0),
    )


async def best_sellers(session: AsyncSession, limit: int) -> list[BestSeller]:
    qty = func.sum(OrderItem.quantity)
    rows = await session.execute(
        select(
            OrderItem.book_id,
            func.max(OrderItem.title_snapshot),
            qty,
            func.sum(OrderItem.quantity * OrderItem.unit_price),
        )
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.status == OrderStatus.completed)
        .group_by(OrderItem.book_id)
        .order_by(qty.desc(), OrderItem.book_id)
        .limit(limit)
    )
    return [BestSeller(book_id=b, title=t, quantity_sold=int(q), revenue=int(r))
            for b, t, q, r in rows]


async def low_stock(session: AsyncSession, threshold: int) -> list[LowStockBook]:
    rows = await session.scalars(
        select(Book).where(Book.quantity <= threshold).order_by(Book.quantity, Book.id)
    )
    return [
        LowStockBook(book_id=b.id, title=b.title, slug=b.slug, quantity=b.quantity,
                     is_visible=b.is_visible)
        for b in rows
    ]
