"""add_financial_inclusion_models

Revision ID: 70d32b55c78e
Revises: 1bcc80487546
Create Date: 2026-11-02 11:33:16.779533

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '70d32b55c78e'
down_revision: Union[str, Sequence[str], None] = '1bcc80487546'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    conn = op.get_bind()
    insp = sa.inspect(conn)
    tables = insp.get_table_names()

    if 'user_budgets' not in tables:
        op.create_table(
            'user_budgets',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=False),
            sa.Column('monthly_income', sa.Numeric(precision=12, scale=2), nullable=True),
            sa.Column('total_budget', sa.Numeric(precision=12, scale=2), nullable=False),
            sa.Column('category_budgets_json', sa.Text(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['user_id'], ['profiles.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('user_id')
        )
        op.create_index('ix_user_budgets_user_id', 'user_budgets', ['user_id'])

    if 'user_learning_progress' not in tables:
        op.create_table(
            'user_learning_progress',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=False),
            sa.Column('topic_id', sa.String(length=64), nullable=False),
            sa.Column('category_id', sa.String(length=64), nullable=False),
            sa.Column('is_completed', sa.Boolean(), nullable=False),
            sa.Column('quiz_score', sa.Integer(), nullable=True),
            sa.Column('notes', sa.Text(), nullable=True),
            sa.Column('completed_at', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['user_id'], ['profiles.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_user_learning_progress_user_id', 'user_learning_progress', ['user_id'])
        op.create_index('ix_user_learning_progress_topic_id', 'user_learning_progress', ['topic_id'])

    cols = [c['name'] for c in insp.get_columns('user_preferences')]
    if 'financial_path' not in cols:
        op.add_column('user_preferences', sa.Column('financial_path', sa.String(length=64), server_default='NEW_TO_FINANCE', nullable=False))
    if 'budget_alert_threshold' not in cols:
        op.add_column('user_preferences', sa.Column('budget_alert_threshold', sa.Numeric(precision=5, scale=2), server_default='80.00', nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    conn = op.get_bind()
    insp = sa.inspect(conn)
    cols = [c['name'] for c in insp.get_columns('user_preferences')]
    if 'budget_alert_threshold' in cols:
        op.drop_column('user_preferences', 'budget_alert_threshold')
    if 'financial_path' in cols:
        op.drop_column('user_preferences', 'financial_path')
    tables = insp.get_table_names()
    if 'user_learning_progress' in tables:
        op.drop_table('user_learning_progress')
    if 'user_budgets' in tables:
        op.drop_table('user_budgets')

