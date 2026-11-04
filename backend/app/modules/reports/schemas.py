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


__all__ = [
    "BestSeller", "Granularity", "LowStockBook", "OrderSummaryReport",
    "RevenuePoint", "StatusCount"
]
