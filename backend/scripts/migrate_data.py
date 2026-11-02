"""
CLIQ Database Migration Script: SQLite -> Supabase PostgreSQL
Migrates all tables and rows preserving referential integrity, types, and constraints.
"""
import asyncio
import os
import sqlite3
import ssl
from datetime import datetime
from decimal import Decimal
from pathlib import Path
from typing import Dict, List, Any

from sqlalchemy import select, text
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.models.entities import Base

SQLITE_PATH = Path("backend/data/cliq.db")

TABLE_ORDER = [
    # Level 0 (no FKs)
    "spending_categories",
    "offer_sources",
    "profiles",
    # Level 1
    "user_preferences",
    "credit_cards",
    "uploaded_documents",
    "reward_analysis",
    "audit_logs",
    "user_ai_consents",
    "ai_request_audit_logs",
    "admin_offer_documents",
    "source_failure_logs",
    # Level 2
    "card_benefits",
    "card_reward_rules",
    "card_offers",
    "extracted_card_data",
    "transactions",
    # Level 3
    "offer_audit_logs",
]

def parse_dt(v):
    if v is None:
        return None
    if isinstance(v, datetime):
        return v
    if isinstance(v, str):
        v = v.strip()
        if not v:
            return None
        try:
            return datetime.fromisoformat(v)
        except Exception:
            for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M:%S.%f", "%Y-%m-%d"):
                try:
                    return datetime.strptime(v, fmt)
                except Exception:
                    pass
    return None

def parse_bool(v):
    if v is None:
        return None
    if isinstance(v, bool):
        return v
    if isinstance(v, (int, float)):
        return bool(v)
    if isinstance(v, str):
        return v.lower() in ("true", "1", "t", "yes")
    return bool(v)

def parse_numeric(v):
    if v is None:
        return None
    if isinstance(v, (int, float, Decimal)):
        return v
    try:
        return Decimal(str(v))
    except Exception:
        return None

def convert_row(row_dict: Dict[str, Any], table) -> Dict[str, Any]:
    cleaned = {}
    for col in table.columns:
        col_name = col.name
        if col_name not in row_dict:
            continue
        val = row_dict[col_name]
        col_type = str(col.type).upper()

        if val is None:
            cleaned[col_name] = None
        elif "DATETIME" in col_type or "TIMESTAMP" in col_type:
            cleaned[col_name] = parse_dt(val)
        elif "BOOLEAN" in col_type or "BOOL" in col_type:
            cleaned[col_name] = parse_bool(val)
        elif "NUMERIC" in col_type or "DECIMAL" in col_type:
            cleaned[col_name] = parse_numeric(val)
        elif "INT" in col_type:
            try:
                cleaned[col_name] = int(val) if val is not None else None
            except Exception:
                cleaned[col_name] = None
        else:
            cleaned[col_name] = val
    return cleaned

async def run_migration():
    print(f"Opening SQLite database: {SQLITE_PATH}")
    sqlite_conn = sqlite3.connect(SQLITE_PATH)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cur = sqlite_conn.cursor()

    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)

    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE

    print("Connecting to Supabase PostgreSQL...")
    engine = create_async_engine(
        db_url,
        connect_args={"ssl": ssl_ctx},
        pool_pre_ping=True
    )

    migration_results = {}

    async with engine.begin() as pg_conn:
        for tname in TABLE_ORDER:
            if tname not in Base.metadata.tables:
                print(f"Skipping {tname} (not in Base.metadata)")
                continue

            table = Base.metadata.tables[tname]
            sqlite_cur.execute(f'SELECT * FROM "{tname}"')
            sqlite_rows = sqlite_cur.fetchall()
            src_count = len(sqlite_rows)

            if src_count == 0:
                print(f"[{tname}] 0 rows in SQLite, skipping insert.")
                migration_results[tname] = {"src": 0, "dst": 0}
                continue

            cleaned_rows = [convert_row(dict(r), table) for r in sqlite_rows]

            # Batch insert in chunks of 200
            chunk_size = 200
            for i in range(0, len(cleaned_rows), chunk_size):
                chunk = cleaned_rows[i:i + chunk_size]
                stmt = insert(table).values(chunk)
                # Primary key on conflict do nothing
                pk_cols = [c.name for c in table.primary_key.columns]
                if pk_cols:
                    stmt = stmt.on_conflict_do_nothing(index_elements=pk_cols)
                await pg_conn.execute(stmt)

            # Verify destination count
            dst_res = await pg_conn.execute(text(f'SELECT COUNT(*) FROM "{tname}"'))
            dst_count = dst_res.fetchone()[0]

            print(f"[{tname}] Migrated: SQLite={src_count} -> Supabase={dst_count}")
            migration_results[tname] = {"src": src_count, "dst": dst_count}

    await engine.dispose()
    sqlite_conn.close()

    print("\n" + "=" * 60)
    print("MIGRATION SUMMARY")
    print("=" * 60)
    all_matched = True
    for tname, counts in migration_results.items():
        src = counts["src"]
        dst = counts["dst"]
        status = "MATCH" if (src <= dst and dst > 0) or (src == 0 and dst == 0) else "MISMATCH"
        if status == "MISMATCH":
            all_matched = False
        print(f"  {tname:<25}: SQLite={src:<5} | Supabase={dst:<5} [{status}]")
    print("=" * 60)
    print(f"Overall status: {'SUCCESS' if all_matched else 'WARNING - Review mismatches'}")

if __name__ == "__main__":
    asyncio.run(run_migration())

