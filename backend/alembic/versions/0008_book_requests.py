"""book_requests

Revision ID: 0008
Revises: 0007
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    status = postgresql.ENUM(
        "pending", "available", "rejected", name="book_request_status", create_type=False
    )
    status.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "book_requests",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("author", sa.String(255)),
        sa.Column("note", sa.Text),
        sa.Column("status", status, nullable=False),
        sa.Column("admin_note", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False),
    )
    op.create_index("ix_book_requests_user_id", "book_requests", ["user_id"])


def downgrade() -> None:
    op.drop_table("book_requests")
    op.execute("DROP TYPE IF EXISTS book_request_status")
