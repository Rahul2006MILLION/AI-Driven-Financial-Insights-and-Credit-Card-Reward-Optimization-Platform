"""add_no_card_mode_incomes_and_pathway

Revision ID: c1f3a2b4e5d6
Revises: 70d32b55c78e
Create Date: 2026-11-02 15:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1f3a2b4e5d6'
down_revision: Union[str, Sequence[str], None] = '70d32b55c78e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to support No-Credit-Card Mode and Incomes."""
    conn = op.get_bind()
    insp = sa.inspect(conn)
    tables = insp.get_table_names()

    # 1. Add financial_pathway to profiles if missing
    if 'profiles' in tables:
        profile_cols = [c['name'] for c in insp.get_columns('profiles')]
        if 'financial_pathway' not in profile_cols:
            op.add_column(
                'profiles',
                sa.Column('financial_pathway', sa.String(length=32), server_default='CREDIT_CARD', nullable=False)
            )
        else:
            op.execute("UPDATE profiles SET financial_pathway = 'CREDIT_CARD' WHERE financial_pathway IS NULL")
            op.alter_column('profiles', 'financial_pathway', nullable=False, server_default='CREDIT_CARD')

    # 2. Add payment_method to transactions if missing
    if 'transactions' in tables:
        txn_cols = [c['name'] for c in insp.get_columns('transactions')]
        if 'payment_method' not in txn_cols:
            op.add_column(
                'transactions',
                sa.Column('payment_method', sa.String(length=32), server_default='CREDIT_CARD', nullable=False)
            )
        else:
            op.execute("UPDATE transactions SET payment_method = 'CREDIT_CARD' WHERE payment_method IS NULL")
            op.alter_column('transactions', 'payment_method', nullable=False, server_default='CREDIT_CARD')

    # 3. Create incomes table if missing
    if 'incomes' not in tables:
        op.create_table(
            'incomes',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=False),
            sa.Column('source_name', sa.String(length=128), nullable=False),
            sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
            sa.Column('currency', sa.String(length=10), server_default='INR', nullable=False),
            sa.Column('frequency', sa.String(length=32), server_default='MONTHLY', nullable=False),
            sa.Column('is_irregular', sa.Boolean(), server_default=sa.text('false'), nullable=False),
            sa.Column('received_date', sa.DateTime(), nullable=False),
            sa.Column('expected_date', sa.DateTime(), nullable=True),
            sa.Column('notes', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['user_id'], ['profiles.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_incomes_user_id', 'incomes', ['user_id'])
        op.create_index('ix_incomes_received_date', 'incomes', ['received_date'])


def downgrade() -> None:
    """Downgrade schema."""
    conn = op.get_bind()
    insp = sa.inspect(conn)
    tables = insp.get_table_names()

    if 'incomes' in tables:
        indexes = [idx['name'] for idx in insp.get_indexes('incomes')]
        if 'ix_incomes_received_date' in indexes:
            op.drop_index('ix_incomes_received_date', table_name='incomes')
        if 'ix_incomes_user_id' in indexes:
            op.drop_index('ix_incomes_user_id', table_name='incomes')
        op.drop_table('incomes')

    if 'transactions' in tables:
        txn_cols = [c['name'] for c in insp.get_columns('transactions')]
        if 'payment_method' in txn_cols:
            op.drop_column('transactions', 'payment_method')

    if 'profiles' in tables:
        profile_cols = [c['name'] for c in insp.get_columns('profiles')]
        if 'financial_pathway' in profile_cols:
            op.drop_column('profiles', 'financial_pathway')
