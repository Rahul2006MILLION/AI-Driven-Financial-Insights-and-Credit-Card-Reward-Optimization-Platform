from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import select
from datetime import datetime

from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.models.entities import (
    Profile,
    CreditCard,
    CardRewardRule,
    CardBenefit,
    SpendingCategory,
    Transaction,
    UploadedDocument,
    ExtractedCardData,
    RewardAnalysis,
    UserPreference,
    AuditLog,
    CardOffer,
    OfferAuditLog,
    OfferSource,
    SourceFailureLog,
    AdminOfferDocument
)
from app.security.middleware import SecurityHeadersMiddleware, RateLimitMiddleware

# Routers
from app.api.v1.auth import router as auth_router
from app.api.v1.cards import router as cards_router
from app.api.v1.transactions import router as transactions_router
from app.api.v1.optimization import router as optimization_router
from app.api.v1.documents import router as documents_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.assistant import router as assistant_router
from app.api.v1.offers import router as offers_router, admin_router as offers_admin_router
from app.services.offers.offer_service import OfferService
from app.services.offers.source_registry import SourceRegistryService
from app.security.password import get_password_hash
from sqlalchemy import text

DEFAULT_CATEGORIES = [
    {"id": "dining", "en": "Dining & Restaurants", "hi": "डाइनिंग और रेस्टोरेंट", "kn": "ಊಟ ಮತ್ತು ರೆಸ್ಟೋರೆಂಟ್‌ಗಳು", "icon": "Utensils"},
    {"id": "food_delivery", "en": "Food Delivery", "hi": "फूड डिलीवरी", "kn": "ಆಹಾರ ವಿತರಣೆ", "icon": "Bike"},
    {"id": "grocery", "en": "Groceries & Supermarkets", "hi": "किराना और सुपरमार्केट", "kn": "ದಿನಸಿ ಮತ್ತು ಸೂಪರ್‌ಮಾರ್ಕೆಟ್", "icon": "ShoppingBag"},
    {"id": "shopping", "en": "Online & Retail Shopping", "hi": "ऑनलाइन शॉपिंग", "kn": "ಆನ್‌ಲೈನ್ ಶಾಪಿಂಗ್", "icon": "ShoppingCart"},
    {"id": "travel", "en": "Flights, Hotels & Travel", "hi": "यात्रा और होटल", "kn": "ವಿಮಾನ, ಹೋಟೆಲ್ ಮತ್ತು ಪ್ರಯಾಣ", "icon": "Plane"},
    {"id": "utility", "en": "Utilities & Bill Payments", "hi": "बिल भुगतान और यूटिलिटी", "kn": "ಬಿಲ್ ಪಾವತಿಗಳು", "icon": "Zap"},
    {"id": "fuel", "en": "Fuel & Petrol Pumps", "hi": "ईंधन और पेट्रोल", "kn": "ಇಂಧನ ಮತ್ತು ಪೆಟ್ರೋಲ್", "icon": "Fuel"},
    {"id": "entertainment", "en": "Movies & Entertainment", "hi": "मनोरंजन और सिनेमा", "kn": "ಮನರಂಜನೆ ಮತ್ತು ಸಿನೆಮಾ", "icon": "Film"},
    {"id": "health", "en": "Healthcare & Pharmacies", "hi": "स्वास्थ्य और फार्मेसी", "kn": "ಆರೋಗ್ಯ ಮತ್ತು ಫಾರ್ಮಸಿ", "icon": "HeartPulse"},
    {"id": "international", "en": "International Spends", "hi": "अंतर्राष्ट्रीय खर्च", "kn": "ಅಂತರರಾಷ್ಟ್ರೀಯ ಖರ್ಚು", "icon": "Globe"},
    {"id": "other", "en": "General Spends", "hi": "अन्य सामान्य खर्च", "kn": "ಇತರ ಖರ್ಚುಗಳು", "icon": "CreditCard"}
]

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # SQLite lightweight schema migrations for existing local db
        try:
            res = await conn.execute(text("PRAGMA table_info(credit_cards)"))
            existing_cols = [row[1] for row in res.fetchall()]
            if "card_variant" not in existing_cols:
                await conn.execute(text("ALTER TABLE credit_cards ADD COLUMN card_variant VARCHAR(64)"))
            if "joining_fee" not in existing_cols:
                await conn.execute(text("ALTER TABLE credit_cards ADD COLUMN joining_fee NUMERIC(10, 2) DEFAULT 0.00"))
            if "renewal_date" not in existing_cols:
                await conn.execute(text("ALTER TABLE credit_cards ADD COLUMN renewal_date DATETIME"))
            if "fee_waiver_condition_details" not in existing_cols:
                await conn.execute(text("ALTER TABLE credit_cards ADD COLUMN fee_waiver_condition_details VARCHAR(255)"))
            if "terms_source_url" not in existing_cols:
                await conn.execute(text("ALTER TABLE credit_cards ADD COLUMN terms_source_url VARCHAR(512)"))

            res_b = await conn.execute(text("PRAGMA table_info(card_benefits)"))
            ben_cols = [row[1] for row in res_b.fetchall()]
            if "applicable_category" not in ben_cols:
                await conn.execute(text("ALTER TABLE card_benefits ADD COLUMN applicable_category VARCHAR(64) DEFAULT 'all'"))
            if "reward_percentage_or_points" not in ben_cols:
                await conn.execute(text("ALTER TABLE card_benefits ADD COLUMN reward_percentage_or_points NUMERIC(6, 2)"))
            if "reward_basis" not in ben_cols:
                await conn.execute(text("ALTER TABLE card_benefits ADD COLUMN reward_basis VARCHAR(32) DEFAULT 'COMPLIMENTARY'"))
            if "max_reward" not in ben_cols:
                await conn.execute(text("ALTER TABLE card_benefits ADD COLUMN max_reward NUMERIC(10, 2)"))
            if "min_transaction_amount" not in ben_cols:
                await conn.execute(text("ALTER TABLE card_benefits ADD COLUMN min_transaction_amount NUMERIC(10, 2) DEFAULT 0.00"))
            if "cap_amount" not in ben_cols:
                await conn.execute(text("ALTER TABLE card_benefits ADD COLUMN cap_amount NUMERIC(10, 2)"))
            if "cap_period" not in ben_cols:
                await conn.execute(text("ALTER TABLE card_benefits ADD COLUMN cap_period VARCHAR(32) DEFAULT 'NONE'"))
            if "eligibility_restrictions" not in ben_cols:
                await conn.execute(text("ALTER TABLE card_benefits ADD COLUMN eligibility_restrictions VARCHAR(255)"))
            if "valid_from" not in ben_cols:
                await conn.execute(text("ALTER TABLE card_benefits ADD COLUMN valid_from DATETIME"))
            if "valid_to" not in ben_cols:
                await conn.execute(text("ALTER TABLE card_benefits ADD COLUMN valid_to DATETIME"))
            if "terms_and_conditions" not in ben_cols:
                await conn.execute(text("ALTER TABLE card_benefits ADD COLUMN terms_and_conditions TEXT"))
            if "source_reference" not in ben_cols:
                await conn.execute(text("ALTER TABLE card_benefits ADD COLUMN source_reference VARCHAR(512)"))
            if "last_verified_date" not in ben_cols:
                await conn.execute(text("ALTER TABLE card_benefits ADD COLUMN last_verified_date DATETIME"))

            # Profiles migrations
            res_p = await conn.execute(text("PRAGMA table_info(profiles)"))
            prof_cols = [row[1] for row in res_p.fetchall()]
            if "role" not in prof_cols:
                await conn.execute(text("ALTER TABLE profiles ADD COLUMN role VARCHAR(32) DEFAULT 'USER'"))
            if "is_admin" not in prof_cols:
                await conn.execute(text("ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT 0"))

            # CardOffers migrations
            res_o = await conn.execute(text("PRAGMA table_info(card_offers)"))
            off_cols = [row[1] for row in res_o.fetchall()]
            if "source_name" not in off_cols:
                await conn.execute(text("ALTER TABLE card_offers ADD COLUMN source_name VARCHAR(128)"))
            if "source_evidence" not in off_cols:
                await conn.execute(text("ALTER TABLE card_offers ADD COLUMN source_evidence TEXT"))
            if "extraction_confidence" not in off_cols:
                await conn.execute(text("ALTER TABLE card_offers ADD COLUMN extraction_confidence NUMERIC(4, 2) DEFAULT 0.85"))
            if "content_hash" not in off_cols:
                await conn.execute(text("ALTER TABLE card_offers ADD COLUMN content_hash VARCHAR(64)"))
            if "version" not in off_cols:
                await conn.execute(text("ALTER TABLE card_offers ADD COLUMN version INTEGER DEFAULT 1"))
            if "previous_version_json" not in off_cols:
                await conn.execute(text("ALTER TABLE card_offers ADD COLUMN previous_version_json TEXT"))
            if "rejection_reason" not in off_cols:
                await conn.execute(text("ALTER TABLE card_offers ADD COLUMN rejection_reason VARCHAR(255)"))
            if "reviewed_by_id" not in off_cols:
                await conn.execute(text("ALTER TABLE card_offers ADD COLUMN reviewed_by_id VARCHAR(36)"))
            if "reviewed_by_name" not in off_cols:
                await conn.execute(text("ALTER TABLE card_offers ADD COLUMN reviewed_by_name VARCHAR(128)"))
            if "reviewed_at" not in off_cols:
                await conn.execute(text("ALTER TABLE card_offers ADD COLUMN reviewed_at DATETIME"))
            if "change_history_json" not in off_cols:
                await conn.execute(text("ALTER TABLE card_offers ADD COLUMN change_history_json TEXT DEFAULT '[]'"))
            if "updated_at" not in off_cols:
                await conn.execute(text("ALTER TABLE card_offers ADD COLUMN updated_at DATETIME"))
            if "source_id" not in off_cols:
                await conn.execute(text("ALTER TABLE card_offers ADD COLUMN source_id VARCHAR(36)"))
            if "ingestion_channel" not in off_cols:
                await conn.execute(text("ALTER TABLE card_offers ADD COLUMN ingestion_channel VARCHAR(32) DEFAULT 'MANUAL_ENTRY'"))
            if "source_document_id" not in off_cols:
                await conn.execute(text("ALTER TABLE card_offers ADD COLUMN source_document_id VARCHAR(36)"))
            if "freshness_state" not in off_cols:
                await conn.execute(text("ALTER TABLE card_offers ADD COLUMN freshness_state VARCHAR(32) DEFAULT 'FRESH'"))
        except Exception:
            pass

    async with AsyncSessionLocal() as session:
        # Seed default admin if not existing
        admin_email = "admin@cliq.ai"
        admin_stmt = select(Profile).where(Profile.email == admin_email)
        admin_user = (await session.execute(admin_stmt)).scalar_one_or_none()
        if not admin_user:
            admin_user = Profile(
                email=admin_email,
                hashed_password=get_password_hash("AdminPass@123"),
                full_name="CLIQ Chief Admin",
                preferred_language="en",
                currency="INR",
                role="ADMIN",
                is_admin=True,
                is_active=True
            )
            session.add(admin_user)
            await session.commit()

        for cat in DEFAULT_CATEGORIES:
            existing = await session.get(SpendingCategory, cat["id"])
            if not existing:
                category = SpendingCategory(
                    id=cat["id"],
                    display_name_en=cat["en"],
                    display_name_hi=cat["hi"],
                    display_name_kn=cat["kn"],
                    icon_name=cat["icon"]
                )
                session.add(category)
        await session.commit()

        # Seed initial card offers
        await OfferService.seed_initial_offers_if_empty(session)
        # Seed centralized source registry
        await SourceRegistryService.seed_default_sources(session)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema & categories
    await init_db()
    yield
    # Teardown
    await engine.dispose()

app = FastAPI(
    title="CLIQ API",
    description="AI-Powered Financial Intelligence & Credit Card Reward Optimization Platform. Money Made Simple. In Your Language.",
    version="1.0.0",
    lifespan=lifespan
)

# Custom Security Middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.RATE_LIMIT_PER_MINUTE)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Health Check
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "HEALTHY",
        "service": "CLIQ Intelligence Platform",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "database": "CONNECTED",
        "timestamp": datetime.utcnow().isoformat()
    }

# Categories Endpoint
@app.get("/api/v1/categories", tags=["System"])
async def list_categories():
    async with AsyncSessionLocal() as session:
        stmt = select(SpendingCategory)
        categories = (await session.execute(stmt)).scalars().all()
        return categories

# Mount API v1 Routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(cards_router, prefix="/api/v1")
app.include_router(transactions_router, prefix="/api/v1")
app.include_router(optimization_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(assistant_router, prefix="/api/v1")
app.include_router(offers_router, prefix="/api/v1")
app.include_router(offers_admin_router, prefix="/api/v1")
