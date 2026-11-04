"""books, book_images, search indexes

Revision ID: 0004
Revises: 0003
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # unaccent() is only STABLE; generated columns and indexes need an IMMUTABLE wrapper.
    op.execute(
        """
        CREATE OR REPLACE FUNCTION immutable_unaccent(text) RETURNS text
        LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
        AS $$ SELECT public.unaccent('public.unaccent', $1) $$
        """
    )
    op.create_table(
        "books",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("category_id", sa.Integer, sa.ForeignKey("categories.id", ondelete="RESTRICT"),
                  nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(280), nullable=False, unique=True),
        sa.Column("author", sa.String(255)),
        sa.Column("publisher", sa.String(255)),
        sa.Column("published_year", sa.SmallInteger),
        sa.Column("cost_price", sa.BigInteger, nullable=False, server_default="0"),
        sa.Column("sale_price", sa.BigInteger, nullable=False),
        sa.Column("condition_pct", sa.SmallInteger, nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("quantity", sa.Integer, nullable=False, server_default="1"),
        sa.Column("is_visible", sa.Boolean, nullable=False, server_default=sa.text("true")),
        sa.Column(
            "search_vector",
            postgresql.TSVECTOR,
            sa.Computed(
                "to_tsvector('simple', immutable_unaccent(title || ' ' || coalesce(author, '')))",
                persisted=True,
            ),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False),
        sa.CheckConstraint("cost_price >= 0", name="ck_books_cost_price"),
        sa.CheckConstraint("sale_price >= 0", name="ck_books_sale_price"),
        sa.CheckConstraint("quantity >= 0", name="ck_books_quantity"),
        sa.CheckConstraint("condition_pct BETWEEN 10 AND 100", name="ck_books_condition"),
    )
    op.create_index("ix_books_category_id", "books", ["category_id"])
    op.create_index("ix_books_search_vector", "books", ["search_vector"],
                    postgresql_using="gin")
    op.execute(
        "CREATE INDEX ix_books_title_trgm ON books "
        "USING gin (immutable_unaccent(title) gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX ix_books_author_trgm ON books "
        "USING gin (immutable_unaccent(coalesce(author, '')) gin_trgm_ops)"
    )
    op.create_table(
        "book_images",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("book_id", sa.Integer, sa.ForeignKey("books.id", ondelete="CASCADE"),
                  nullable=False),
        sa.Column("url", sa.String(500), nullable=False),
        sa.Column("position", sa.SmallInteger, nullable=False, server_default="0"),
    )
    op.create_index("ix_book_images_book_id", "book_images", ["book_id"])


def downgrade() -> None:
    op.drop_table("book_images")
    op.drop_table("books")
    op.execute("DROP FUNCTION IF EXISTS immutable_unaccent(text)")
