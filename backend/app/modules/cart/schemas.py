from pydantic import BaseModel, Field


class CartItemSet(BaseModel):
    """Quantity 0 removes the line."""

    quantity: int = Field(ge=0)


class CartBookSnapshot(BaseModel):
    id: int
    slug: str
    title: str
    cover_url: str | None
    price: int
    is_visible: bool


class CartItemRead(BaseModel):
    book: CartBookSnapshot
    quantity: int
    available: int  # from inventory.available, display only
    line_total: int


class CartRead(BaseModel):
    items: list[CartItemRead]
    total: int
