from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import BookUnavailable, OutOfStock
from app.modules.cart.models import Cart, CartItem
from app.modules.cart.schemas import CartBookSnapshot, CartItemRead, CartRead
from app.modules.catalog.models import Book
from app.modules.inventory import Inventory
from app.modules.users.models import User


async def get_or_create_cart(session: AsyncSession, user: User) -> Cart:
    """The cart is created lazily on first use."""
    cart = await session.scalar(select(Cart).where(Cart.user_id == user.id))
    if cart is None:
        cart = Cart(user_id=user.id)
        session.add(cart)
        await session.flush()
    return cart


async def get_cart(session: AsyncSession, user: User) -> CartRead:
    cart = await get_or_create_cart(session, user)
    rows = await session.execute(
        select(CartItem, Book)
        .join(Book, Book.id == CartItem.book_id)
        .where(CartItem.cart_id == cart.id)
        .options(selectinload(Book.images))
        .order_by(CartItem.book_id)
    )
    pairs = list(rows)
    # Display only: the cart never allocates stock.
    available = await Inventory(session).available(b.id for _, b in pairs)
    items = [
        CartItemRead(
            book=CartBookSnapshot(
                id=b.id, slug=b.slug, title=b.title,
                cover_url=b.images[0].url if b.images else None,
                price=b.price, is_visible=b.is_visible,
            ),
            quantity=item.quantity,
            available=available.get(b.id, 0),
            line_total=b.price * item.quantity,
        )
        for item, b in pairs
    ]
    return CartRead(items=items, total=sum(i.line_total for i in items))


async def set_item(session: AsyncSession, user: User, book_id: int, quantity: int) -> CartRead:
    cart = await get_or_create_cart(session, user)
    if quantity == 0:
        await remove_item(session, user, book_id)
        return await get_cart(session, user)
    book = await session.get(Book, book_id)
    if book is None or not book.is_visible:
        raise BookUnavailable("Book is not available")
    available = (await Inventory(session).available([book_id])).get(book_id, 0)
    if quantity > available:
        raise OutOfStock(book_id, quantity, available)
    item = await session.get(CartItem, (cart.id, book_id))
    if item is None:
        session.add(CartItem(cart_id=cart.id, book_id=book_id, quantity=quantity))
    else:
        item.quantity = quantity
    await session.flush()
    return await get_cart(session, user)


async def remove_item(session: AsyncSession, user: User, book_id: int) -> None:
    cart = await get_or_create_cart(session, user)
    await session.execute(
        delete(CartItem).where(CartItem.cart_id == cart.id, CartItem.book_id == book_id)
    )


async def clear(session: AsyncSession, user: User) -> None:
    cart = await get_or_create_cart(session, user)
    await session.execute(delete(CartItem).where(CartItem.cart_id == cart.id))
