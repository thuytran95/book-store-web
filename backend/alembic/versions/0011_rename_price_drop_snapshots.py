"""books: drop search_vector, sale_price -> price; order_items: drop title_snapshot,
unit_price -> price

Revision ID: 0011
Revises: 0010
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0011"
down_revision = "0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_index("ix_books_search_vector", table_name="books")
    op.drop_column("books", "search_vector")
    op.alter_column("books", "sale_price", new_column_name="price")
    op.drop_constraint("ck_books_sale_price", "books", type_="check")
    op.create_check_constraint("ck_books_price", "books", "price >= 0")

    # Item title now comes from books (books with orders cannot be deleted).
    op.drop_column("order_items", "title_snapshot")
    op.alter_column("order_items", "unit_price", new_column_name="price")


def downgrade() -> None:
    op.alter_column("order_items", "price", new_column_name="unit_price")
    op.add_column("order_items", sa.Column("title_snapshot", sa.String(255)))
    op.execute(
        "UPDATE order_items oi SET title_snapshot = b.title FROM books b WHERE b.id = oi.book_id"
    )
    op.alter_column("order_items", "title_snapshot", nullable=False)

    op.drop_constraint("ck_books_price", "books", type_="check")
    op.alter_column("books", "price", new_column_name="sale_price")
    op.create_check_constraint("ck_books_sale_price", "books", "sale_price >= 0")
    op.add_column(
        "books",
        sa.Column(
            "search_vector",
            postgresql.TSVECTOR,
            sa.Computed(
                "to_tsvector('simple', immutable_unaccent(title || ' ' || coalesce(author, '')))",
                persisted=True,
            ),
            nullable=False,
        ),
    )
    op.create_index("ix_books_search_vector", "books", ["search_vector"],
                    postgresql_using="gin")
