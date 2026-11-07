"""Read-only aggregates for the admin inventory home."""

from datetime import datetime, time, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.catalog.models import Book, Category
from app.modules.reports.schemas import InventoryOverview


def _week_start_utc() -> datetime:
    """Monday 00:00 UTC for intake_this_week."""
    today = datetime.now(timezone.utc).date()
    start = today - timedelta(days=today.weekday())
    return datetime.combine(start, time.min, tzinfo=timezone.utc)


async def inventory_overview(session: AsyncSession) -> InventoryOverview:
    total_copies = int(
        await session.scalar(select(func.coalesce(func.sum(Book.quantity), 0))) or 0
    )
    total_titles = int(await session.scalar(select(func.count(Book.id))) or 0)
    category_count = int(await session.scalar(select(func.count(Category.id))) or 0)
    categorized = int(
        await session.scalar(
            select(func.count(Book.id)).where(Book.category_id.is_not(None))
        )
        or 0
    )
    categorized_pct = (categorized / total_titles * 100.0) if total_titles else 100.0
    stock_value = int(
        await session.scalar(
            select(func.coalesce(func.sum(Book.price * Book.quantity), 0))
        )
        or 0
    )
    good_copies = int(
        await session.scalar(
            select(func.coalesce(func.sum(Book.quantity), 0)).where(
                Book.condition_pct >= 80, Book.quantity > 0
            )
        )
        or 0
    )
    good_pct = (good_copies / total_copies * 100.0) if total_copies else 0.0
    week_start = _week_start_utc()
    intake = int(
        await session.scalar(
            select(func.count(Book.id)).where(Book.created_at >= week_start)
        )
        or 0
    )
    return InventoryOverview(
        total_copies=total_copies,
        total_titles=total_titles,
        category_count=category_count,
        categorized_pct=round(categorized_pct, 1),
        estimated_stock_value=stock_value,
        good_condition_copies=good_copies,
        good_condition_pct=round(good_pct, 1),
        intake_this_week=intake,
    )

