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
    AuditLog
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

DEFAULT_CATEGORIES = [
    {"id": "dining", "en": "Dining & Food Delivery", "hi": "डाइनिंग और भोजन", "kn": "ಊಟ ಮತ್ತು ಆಹಾರ ವಿತರಣೆ", "icon": "Utensils"},
    {"id": "grocery", "en": "Groceries & Supermarkets", "hi": "किराना और सुपरमार्केट", "kn": "ದಿನಸಿ ಮತ್ತು ಸೂಪರ್‌ಮಾರ್ಕೆಟ್", "icon": "ShoppingBag"},
    {"id": "shopping", "en": "Online & Retail Shopping", "hi": "ऑनलाइन शॉपिंग", "kn": "ಆನ್‌ಲೈನ್ ಶಾಪಿಂಗ್", "icon": "ShoppingCart"},
    {"id": "travel", "en": "Flights, Hotels & Travel", "hi": "यात्रा और होटल", "kn": "ವಿಮಾನ, ಹೋಟೆಲ್ ಮತ್ತು ಪ್ರಯಾಣ", "icon": "Plane"},
    {"id": "utility", "en": "Utilities & Bill Payments", "hi": "बिल भुगतान और यूटिलिटी", "kn": "ಬಿಲ್ ಪಾವತಿಗಳು", "icon": "Zap"},
    {"id": "fuel", "en": "Fuel & Petrol Pumps", "hi": "ईंधन और पेट्रोल", "kn": "ಇಂಧನ ಮತ್ತು ಪೆಟ್ರೋಲ್", "icon": "Fuel"},
    {"id": "entertainment", "en": "Movies & Entertainment", "hi": "मनोरंजन और सिनेमा", "kn": "ಮನರಂಜನೆ ಮತ್ತು ಸಿನೆಮಾ", "icon": "Film"},
    {"id": "health", "en": "Healthcare & Pharmacies", "hi": "स्वास्थ्य और फार्मेसी", "kn": "ಆರೋಗ್ಯ ಮತ್ತು ಫಾರ್ಮಸಿ", "icon": "HeartPulse"},
    {"id": "other", "en": "General Spends", "hi": "अन्य सामान्य खर्च", "kn": "ಇತರ ಖರ್ಚುಗಳು", "icon": "CreditCard"}
]

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
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
