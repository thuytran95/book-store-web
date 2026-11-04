"""orders, order_items, order_status_history

Revision ID: 0006
Revises: 0005
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None

STATUS = ("pending", "confirmed", "shipping", "completed", "cancelled")


def upgrade() -> None:
    status = postgresql.ENUM(*STATUS, name="order_status", create_type=False)
    payment = postgresql.ENUM("cod", "bank_transfer", name="payment_method", create_type=False)
    status.create(op.get_bind(), checkfirst=True)
    payment.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "orders",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("code", sa.String(20), nullable=False, unique=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("status", status, nullable=False),
        sa.Column("payment_method", payment, nullable=False),
        sa.Column("ship_recipient", sa.String(120), nullable=False),
        sa.Column("ship_phone", sa.String(20), nullable=False),
        sa.Column("ship_address", sa.Text, nullable=False),
        sa.Column("subtotal", sa.BigInteger, nullable=False),
        sa.Column("shipping_fee", sa.BigInteger, nullable=False, server_default="0"),
        sa.Column("total", sa.BigInteger, nullable=False),
        sa.Column("note", sa.Text),
        sa.Column("cancelled_reason", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False),
    )
    op.create_index("ix_orders_user_id", "orders", ["user_id"])
    op.create_index("ix_orders_status", "orders", ["status"])
    op.create_table(
        "order_items",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("order_id", sa.Integer, sa.ForeignKey("orders.id", ondelete="CASCADE"),
                  nullable=False),
        sa.Column("book_id", sa.Integer, sa.ForeignKey("books.id"), nullable=False),
        sa.Column("title_snapshot", sa.String(255), nullable=False),
        sa.Column("unit_price", sa.BigInteger, nullable=False),
        sa.Column("quantity", sa.Integer, nullable=False),
    )
    op.create_index("ix_order_items_order_id", "order_items", ["order_id"])
    op.create_index("ix_order_items_book_id", "order_items", ["book_id"])
    op.create_table(
        "order_status_history",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("order_id", sa.Integer, sa.ForeignKey("orders.id", ondelete="CASCADE"),
                  nullable=False),
        sa.Column("from_status", status),
        sa.Column("to_status", status, nullable=False),
        sa.Column("actor_id", sa.Integer, sa.ForeignKey("users.id")),
        sa.Column("at", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False),
    )
    op.create_index("ix_order_status_history_order_id", "order_status_history", ["order_id"])


def downgrade() -> None:
    op.drop_table("order_status_history")
    op.drop_table("order_items")
    op.drop_table("orders")
    op.execute("DROP TYPE IF EXISTS payment_method")
    op.execute("DROP TYPE IF EXISTS order_status")
