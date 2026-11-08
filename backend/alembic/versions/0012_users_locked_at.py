"""users: add locked_at

Revision ID: 0012
Revises: 0011
"""
import sqlalchemy as sa
from alembic import op

revision = "0012"
down_revision = "0011"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("locked_at", sa.DateTime(timezone=True)))
    # Best guess for accounts locked before this column existed.
    op.execute("UPDATE users SET locked_at = updated_at WHERE is_locked")


def downgrade() -> None:
    op.drop_column("users", "locked_at")
