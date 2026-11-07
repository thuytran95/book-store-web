from pydantic import BaseModel


class InventoryOverview(BaseModel):
    """Aggregates for the admin inventory home KPI cards."""

    total_copies: int
    total_titles: int
    category_count: int
    categorized_pct: float
    estimated_stock_value: int  # sum(price * quantity)
    good_condition_copies: int
    good_condition_pct: float
    intake_this_week: int
    in_stock_titles: int  # visible and quantity > 0
    out_of_stock_titles: int  # visible and quantity = 0
    hidden_titles: int  # not visible
    pending_orders: int  # orders with status pending


__all__ = ["InventoryOverview"]
