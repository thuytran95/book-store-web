"""Operational commands.

    python -m app.cli seed-admin --email admin@example.com --password secret --name "Admin"
    python -m app.cli seed-demo
"""

from __future__ import annotations

import argparse
import asyncio
from collections.abc import Awaitable, Callable

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import SessionLocal
from app.core.security import hash_password
from app.modules.catalog.models import Book, Category
from app.modules.catalog.service import slugify
from app.modules.users.models import User, UserRole

Handler = Callable[[AsyncSession], Awaitable[None]]


async def _run(fn: Handler) -> None:
    async with SessionLocal() as session:
        try:
            await fn(session)
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def seed_admin(email: str, password: str, name: str) -> None:
    async def inner(session: AsyncSession) -> None:
        user = await session.scalar(select(User).where(User.email == email))
        if user is None:
            session.add(
                User(
                    email=email,
                    password_hash=hash_password(password),
                    full_name=name,
                    role=UserRole.admin,
                )
            )
            print(f"Created admin {email}")
            return
        user.role = UserRole.admin
        user.password_hash = hash_password(password)
        user.full_name = name
        print(f"Updated {email} to admin")

    await _run(inner)


async def seed_demo() -> None:
    async def inner(session: AsyncSession) -> None:
        if await session.scalar(select(Category.id).limit(1)):
            print("Demo data already present, skipping")
            return
        cats = [
            Category(name="Văn học", slug="van-hoc"),
            Category(name="Kỹ năng", slug="ky-nang"),
            Category(name="Thiếu nhi", slug="thieu-nhi"),
        ]
        session.add_all(cats)
        await session.flush()
        books = [
            ("Dế Mèn phiêu lưu ký", "Tô Hoài", cats[0], 35000, 55000, 80, 1),
            ("Nhà giả kim", "Paulo Coelho", cats[0], 40000, 65000, 85, 1),
            ("Đắc nhân tâm", "Dale Carnegie", cats[1], 45000, 70000, 75, 2),
            ("Hoàng tử bé", "Antoine de Saint-Exupéry", cats[2], 30000, 50000, 90, 1),
        ]
        for title, author, cat, cost, sale, cond, qty in books:
            session.add(
                Book(
                    category_id=cat.id,
                    title=title,
                    slug=slugify(title),
                    author=author,
                    cost_price=cost,
                    sale_price=sale,
                    condition_pct=cond,
                    quantity=qty,
                    is_visible=True,
                    description=f"Sách cũ: {title}.",
                )
            )
        print(f"Seeded {len(cats)} categories and {len(books)} books")

    await _run(inner)


def main() -> None:
    parser = argparse.ArgumentParser(prog="app.cli")
    sub = parser.add_subparsers(dest="cmd", required=True)

    admin = sub.add_parser("seed-admin", help="Create or promote the first admin user")
    admin.add_argument("--email", required=True)
    admin.add_argument("--password", required=True)
    admin.add_argument("--name", default="Admin")

    sub.add_parser("seed-demo", help="Insert sample categories and books if the catalog is empty")

    args = parser.parse_args()
    if args.cmd == "seed-admin":
        asyncio.run(seed_admin(args.email, args.password, args.name))
    elif args.cmd == "seed-demo":
        asyncio.run(seed_demo())


if __name__ == "__main__":
    main()
