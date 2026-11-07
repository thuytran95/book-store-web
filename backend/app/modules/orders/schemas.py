from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.types import Phone
from app.modules.orders.models import OrderStatus, PaymentMethod


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    book_id: int
    title: str
    price: int
    quantity: int


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


class OrderDetail(OrderSummary):
    user_id: int
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


class OrderFilter(BaseModel):
    status: OrderStatus | None = None
    user_id: int | None = None
    code: str | None = None
