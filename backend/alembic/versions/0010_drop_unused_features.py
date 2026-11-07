"""drop book_requests, reservations, password_reset_tokens, addresses, books.cost_price

Revision ID: 0010
Revises: 0009
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0010"
down_revision = "0009"
branch_labels = None
depends_on = None

TS = dict(server_default=sa.func.now(), nullable=False)


def upgrade() -> None:
    op.drop_table("book_requests")
    op.execute("DROP TYPE IF EXISTS book_request_status")
    op.drop_table("reservations")
    op.execute("DROP TYPE IF EXISTS reservation_status")
    op.drop_table("password_reset_tokens")
    op.drop_table("addresses")
    op.drop_constraint("ck_books_cost_price", "books", type_="check")
    op.drop_column("books", "cost_price")


def downgrade() -> None:
    # Structure only: dropped rows and cost prices are not restored.
    op.add_column(
        "books", sa.Column("cost_price", sa.BigInteger, nullable=False, server_default="0")
    )
    op.create_check_constraint("ck_books_cost_price", "books", "cost_price >= 0")

    op.create_table(
        "addresses",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"),
                  nullable=False),
        sa.Column("recipient", sa.String(120), nullable=False),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("line", sa.String(255), nullable=False),
        sa.Column("ward", sa.String(100), nullable=False),
        sa.Column("district", sa.String(100), nullable=False),
        sa.Column("province", sa.String(100), nullable=False),
        sa.Column("is_default", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), **TS),
        sa.Column("updated_at", sa.DateTime(timezone=True), **TS),
    )
    op.create_index("ix_addresses_user_id", "addresses", ["user_id"])
    op.create_index(
        "uq_addresses_one_default_per_user", "addresses", ["user_id"], unique=True,
        postgresql_where=sa.text("is_default"),
    )

    op.create_table(
        "password_reset_tokens",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"),
                  nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), **TS),
        sa.Column("updated_at", sa.DateTime(timezone=True), **TS),
    )
    op.create_index("ix_password_reset_tokens_user_id", "password_reset_tokens", ["user_id"])

    reservation_status = postgresql.ENUM(
        "active", "converted", "cancelled", "expired", name="reservation_status",
        create_type=False,
    )
    reservation_status.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "reservations",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("book_id", sa.Integer, sa.ForeignKey("books.id"), nullable=False),
        sa.Column("quantity", sa.Integer, nullable=False, server_default="1"),
        sa.Column("status", reservation_status, nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), **TS),
        sa.Column("updated_at", sa.DateTime(timezone=True), **TS),
        sa.CheckConstraint("quantity >= 1", name="ck_reservations_quantity"),
    )
    op.create_index("ix_reservations_user_id", "reservations", ["user_id"])
    op.create_index("ix_reservations_book_id", "reservations", ["book_id"])
    op.create_index("ix_reservations_status_expires_at", "reservations",
                    ["status", "expires_at"])

    book_request_status = postgresql.ENUM(
        "pending", "available", "rejected", name="book_request_status", create_type=False
    )
    book_request_status.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "book_requests",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("author", sa.String(255)),
        sa.Column("note", sa.Text),
        sa.Column("status", book_request_status, nullable=False),
        sa.Column("admin_note", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), **TS),
        sa.Column("updated_at", sa.DateTime(timezone=True), **TS),
    )
    op.create_index("ix_book_requests_user_id", "book_requests", ["user_id"])
