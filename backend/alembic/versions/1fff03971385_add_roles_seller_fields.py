"""add_roles_seller_fields

Revision ID: 1fff03971385
Revises: 15364b7dcd24
Create Date: 2026-05-21 15:11:36.106449
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


revision: str = '1fff03971385'
down_revision: Union[str, Sequence[str], None] = '15364b7dcd24'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    userrole = sa.Enum('BUYER', 'SELLER', 'ADMIN', name='userrole')
    userrole.create(op.get_bind())

    op.add_column('users', sa.Column('role', userrole, nullable=True))
    op.execute("UPDATE users SET role = 'ADMIN' WHERE is_superuser = TRUE")
    op.execute("UPDATE users SET role = 'BUYER' WHERE role IS NULL")
    op.execute("ALTER TABLE users ALTER COLUMN role SET NOT NULL")
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'BUYER'")

    op.add_column('users', sa.Column('shop_name', sa.String(length=200), nullable=True))
    op.add_column('users', sa.Column('shop_description', sa.String(length=1000), nullable=True))
    op.add_column('users', sa.Column('shop_logo', sa.String(length=500), nullable=True))
    op.add_column('users', sa.Column('phone', sa.String(length=20), nullable=True))
    op.add_column('users', sa.Column('is_verified_seller', sa.Boolean(), nullable=True, server_default=text('false')))
    op.execute("UPDATE users SET is_verified_seller = false WHERE is_verified_seller IS NULL")

    op.add_column('products', sa.Column('seller_id', sa.Integer(), nullable=True))
    op.execute("UPDATE products SET seller_id = (SELECT id FROM users WHERE role = 'ADMIN' ORDER BY id LIMIT 1) WHERE seller_id IS NULL")
    op.execute("UPDATE products SET seller_id = (SELECT id FROM users ORDER BY id LIMIT 1) WHERE seller_id IS NULL")
    op.execute("ALTER TABLE products ALTER COLUMN seller_id SET NOT NULL")
    op.create_index(op.f('ix_products_seller_id'), 'products', ['seller_id'], unique=False)
    op.create_foreign_key('fk_products_seller_id', 'products', 'users', ['seller_id'], ['id'])


def downgrade() -> None:
    op.drop_column('users', 'is_verified_seller')
    op.drop_column('users', 'phone')
    op.drop_column('users', 'shop_logo')
    op.drop_column('users', 'shop_description')
    op.drop_column('users', 'shop_name')
    op.drop_column('users', 'role')
    op.drop_constraint('fk_products_seller_id', 'products', type_='foreignkey')
    op.drop_index(op.f('ix_products_seller_id'), table_name='products')
    op.drop_column('products', 'seller_id')

    userrole = sa.Enum(name='userrole')
    userrole.drop(op.get_bind())
