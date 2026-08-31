"""add users table and trips user_id foreign key

Revision ID: ef22178d09c9
Revises: 
Create Date: 2026-08-31 10:42:40.144385

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ef22178d09c9'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('password', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('username')
    )

    # trips.user_id is being introduced as NOT NULL with no way to backfill
    # an owner for pre-existing rows, so existing trips are cleared out.
    op.execute('DELETE FROM trips')

    op.add_column('trips', sa.Column('user_id', sa.Integer(), nullable=False))
    op.create_foreign_key('fk_trips_user_id_users', 'trips', 'users', ['user_id'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_trips_user_id_users', 'trips', type_='foreignkey')
    op.drop_column('trips', 'user_id')
    op.drop_table('users')
