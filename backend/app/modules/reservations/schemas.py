from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.reservations.models import ReservationStatus


class ReserveIn(BaseModel):
    book_id: int
    quantity: int = Field(default=1, ge=1)


class ReservationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    book_id: int
    quantity: int
    status: ReservationStatus
    expires_at: datetime
    created_at: datetime
