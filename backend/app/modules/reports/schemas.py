from datetime import date
from enum import Enum

from pydantic import BaseModel


class Granularity(str, Enum):
    day = "day"
    month = "month"


class RevenuePoint(BaseModel):
    period: date
    revenue: int
    orders: int


class StatusCount(BaseModel):
    status: str
    count: int


class OrderSummaryReport(BaseModel):
    counts: list[StatusCount]
    total_orders: int
    completed_revenue: int


class BestSeller(BaseModel):
    book_id: int
    title: str
    quantity_sold: int
    revenue: int


class LowStockBook(BaseModel):
    book_id: int
    title: str
    slug: str
    quantity: int
    is_visible: bool


class InventoryOverview(BaseModel):
    """Aggregates for the admin inventory home KPI cards."""

    total_copies: int
    total_titles: int
    category_count: int
    categorized_pct: float
    estimated_stock_value: int
    good_condition_copies: int
    good_condition_pct: float
    intake_this_week: int


__all__ = [
    "BestSeller",
    "Granularity",
    "InventoryOverview",
    "LowStockBook",
    "OrderSummaryReport",
    "RevenuePoint",
    "StatusCount",
]
