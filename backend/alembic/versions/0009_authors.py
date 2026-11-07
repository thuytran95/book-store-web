"""authors, book_authors (+ backfill from books.author)

Revision ID: 0009
Revises: 0008
"""
import sqlalchemy as sa
from alembic import op

revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "authors",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("bio", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False),
    )
    op.execute(
        "CREATE UNIQUE INDEX uq_authors_name_norm ON authors (lower(immutable_unaccent(name)))"
    )
    op.execute(
        "CREATE INDEX ix_authors_name_trgm ON authors "
        "USING gin (immutable_unaccent(name) gin_trgm_ops)"
    )
    op.create_table(
        "book_authors",
        sa.Column("book_id", sa.Integer, sa.ForeignKey("books.id", ondelete="CASCADE"),
                  primary_key=True),
        sa.Column("author_id", sa.Integer, sa.ForeignKey("authors.id", ondelete="RESTRICT"),
                  primary_key=True),
        sa.Column("position", sa.SmallInteger, nullable=False, server_default="0"),
    )
    op.create_index("ix_book_authors_author_id", "book_authors", ["author_id"])

    # Backfill: one author per distinct normalized name, keeping the first spelling seen.
    op.execute(
        """
        INSERT INTO authors (name)
        SELECT DISTINCT ON (lower(immutable_unaccent(left(trim(author), 160))))
               left(trim(author), 160)
        FROM books
        WHERE author IS NOT NULL AND trim(author) <> ''
        ORDER BY lower(immutable_unaccent(left(trim(author), 160))), id
        """
    )
    op.execute(
        """
        INSERT INTO book_authors (book_id, author_id, position)
        SELECT b.id, a.id, 0
        FROM books b
        JOIN authors a
          ON lower(immutable_unaccent(a.name))
           = lower(immutable_unaccent(left(trim(b.author), 160)))
        WHERE b.author IS NOT NULL AND trim(b.author) <> ''
        """
    )


def downgrade() -> None:
    op.drop_table("book_authors")
    op.drop_table("authors")
