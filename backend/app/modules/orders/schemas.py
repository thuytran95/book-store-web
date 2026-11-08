import enum
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.types import Phone
from app.modules.orders.models import OrderStatus, PaymentMethod


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    book_id: int
    title: str
    author: str
    condition_pct: int
    price: int
    quantity: int
    short: bool = False


class StatusHistoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    from_status: OrderStatus | None
    to_status: OrderStatus
    actor_id: int | None
    at: datetime


class OrderSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    status: OrderStatus
    payment_method: PaymentMethod
    total: int
    created_at: datetime


class AdminOrderSummary(OrderSummary):
    ship_recipient: str
    ship_phone: str
    copies: int = 0
    has_shortage: bool = False


class OrderDetail(OrderSummary):
    user_id: int
    user_email: str | None = None
    ship_recipient: str
    ship_phone: str
    ship_address: str
    subtotal: int
    shipping_fee: int
    note: str | None
    cancelled_reason: str | None
    items: list[OrderItemRead]
    history: list[StatusHistoryRead]
    allowed_transitions: list[OrderStatus] = []


class PlaceOrderIn(BaseModel):
    ship_recipient: str = Field(min_length=1, max_length=120)
    ship_phone: Phone
    ship_address: str = Field(min_length=1, max_length=500)
    payment_method: PaymentMethod
    note: str | None = Field(default=None, max_length=1000)


class TransitionIn(BaseModel):
    to: OrderStatus
    reason: str | None = Field(default=None, max_length=1000)


class OrderSort(str, enum.Enum):
    newest = "newest"
    oldest = "oldest"
    total_desc = "total_desc"


class OrderFilter(BaseModel):
    status: OrderStatus | None = None
    user_id: int | None = None
    q: str | None = Field(default=None, max_length=100)
    code: str | None = None  # alias of `q`, kept for older callers
    sort: OrderSort = OrderSort.newest

    @property
    def search(self) -> str | None:
        term = (self.q or self.code or "").strip()
        return term or None


class OrderStatusCounts(BaseModel):
    all: int = 0
    pending: int = 0
    confirmed: int = 0
    shipping: int = 0
    completed: int = 0
    cancelled: int = 0
    stale_pending: int = 0
