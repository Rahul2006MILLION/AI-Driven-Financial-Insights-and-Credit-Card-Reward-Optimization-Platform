import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.entities import Profile, UserAiConsent, AiRequestAuditLog
from app.schemas.privacy import (
    AiConsentResponse,
    AiConsentUpdateRequest,
    AiAuditLogResponse,
    DataMinimizationAuditItem
)
from app.security.dependencies import get_current_user
from app.services.privacy.privacy_gateway import ConsentService, DataClassification

router = APIRouter(prefix="/privacy", tags=["Privacy Gateway & AI Governance"])

PRIVACY_DISCLOSURE_TEXT = (
    "CLIQ implements a Privacy-First AI Architecture. By default, all financial intelligence "
    "and multilingual assistance are processed locally using deterministic rules without sending your "
    "financial data to third-party AI models. If you opt in to External AI Processing (Google Gemini), "
    "CLIQ's Privacy Gateway strictly redacts all highly sensitive data (Full 16-digit card numbers, "
    "CVVs, PINs, OTPs, Aadhaar, PAN Card, passwords, and bank account numbers) before transmission. "
    "You retain granular control to allow or disallow card and spending context, and you may revoke consent at any time."
)

@router.get("/consent", response_model=AiConsentResponse)
async def get_user_ai_consent(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve authenticated user's AI consent preferences and provider disclosures.
    """
    consent = await ConsentService.get_or_create_consent(db, current_user.id)
    return AiConsentResponse(
        user_id=consent.user_id,
        external_ai_enabled=consent.external_ai_enabled,
        allow_card_context=consent.allow_card_context,
        allow_spending_context=consent.allow_spending_context,
        provider_preference=consent.provider_preference,
        consent_version=consent.consent_version,
        consent_timestamp=consent.consent_timestamp,
        revoked_at=consent.revoked_at,
        purpose_description=consent.purpose_description,
        privacy_disclosure=PRIVACY_DISCLOSURE_TEXT
    )

@router.put("/consent", response_model=AiConsentResponse)
async def update_user_ai_consent(
    req: AiConsentUpdateRequest,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update granular user consent preferences for external AI processing.
    """
    consent = await ConsentService.update_consent(
        db=db,
        user_id=current_user.id,
        external_ai_enabled=req.external_ai_enabled,
        allow_card_context=req.allow_card_context,
        allow_spending_context=req.allow_spending_context,
        provider_preference=req.provider_preference or "gemini"
    )
    return AiConsentResponse(
        user_id=consent.user_id,
        external_ai_enabled=consent.external_ai_enabled,
        allow_card_context=consent.allow_card_context,
        allow_spending_context=consent.allow_spending_context,
        provider_preference=consent.provider_preference,
        consent_version=consent.consent_version,
        consent_timestamp=consent.consent_timestamp,
        revoked_at=consent.revoked_at,
        purpose_description=consent.purpose_description,
        privacy_disclosure=PRIVACY_DISCLOSURE_TEXT
    )

@router.get("/audit-logs", response_model=List[AiAuditLogResponse])
async def get_user_ai_audit_logs(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns user's recent privacy-safe AI request audit logs.
    Never exposes raw prompts or model text containing financial info.
    """
    stmt = (
        select(AiRequestAuditLog)
        .where(AiRequestAuditLog.user_id == current_user.id)
        .order_by(AiRequestAuditLog.timestamp.desc())
        .limit(50)
    )
    logs = (await db.execute(stmt)).scalars().all()

    results = []
    for log in logs:
        try:
            types = json.loads(log.redacted_types_json or "[]")
        except Exception:
            types = []
        results.append(
            AiAuditLogResponse(
                id=log.id,
                request_id=log.request_id,
                task_type=log.task_type,
                data_classification=log.data_classification,
                provider=log.provider,
                model_name=log.model_name,
                consent_status=log.consent_status,
                redaction_count=log.redaction_count,
                redacted_types=types,
                status=log.status,
                rejection_reason=log.rejection_reason,
                latency_ms=log.latency_ms,
                timestamp=log.timestamp
            )
        )
    return results

@router.get("/data-minimization-rules", response_model=List[DataMinimizationAuditItem])
async def get_data_minimization_rules():
    """
    Returns the CLIQ privacy minimization and boundary mapping.
    """
    return [
        DataMinimizationAuditItem(
            field_name="Full Card Number (PAN)",
            classification="HIGHLY_SENSITIVE",
            action_taken="REDACTED",
            rationale="15-16 digit card numbers are replaced with [REDACTED_CARD_PAN] and never enter external LLMs."
        ),
        DataMinimizationAuditItem(
            field_name="CVV / CVC",
            classification="HIGHLY_SENSITIVE",
            action_taken="BLOCKED / REDACTED",
            rationale="Card verification codes are stripped to prevent credential exposure."
        ),
        DataMinimizationAuditItem(
            field_name="PIN / OTP / Passwords",
            classification="HIGHLY_SENSITIVE",
            action_taken="BLOCKED / REDACTED",
            rationale="One-time codes, PINs, and authentication secrets are completely blocked."
        ),
        DataMinimizationAuditItem(
            field_name="Indian Aadhaar & Income Tax PAN",
            classification="HIGHLY_SENSITIVE",
            action_taken="REDACTED",
            rationale="National identification and tax numbers are masked to comply with Indian data protection norms."
        ),
        DataMinimizationAuditItem(
            field_name="Bank Account Numbers",
            classification="HIGHLY_SENSITIVE",
            action_taken="REDACTED",
            rationale="Account identifiers are stripped to prevent account enumeration."
        ),
        DataMinimizationAuditItem(
            field_name="Individual Transaction Logs",
            classification="SENSITIVE",
            action_taken="AGGREGATED",
            rationale="Transactions are aggregated into top spend categories. Raw timestamps and merchant strings are excluded."
        ),
        DataMinimizationAuditItem(
            field_name="Registered Card Names & Rates",
            classification="SENSITIVE",
            action_taken="MINIMIZED",
            rationale="Shared only with explicit user consent. Internal card IDs, limits, and statements are excluded."
        ),
        DataMinimizationAuditItem(
            field_name="Financial Concepts (APR, Billing Cycle)",
            classification="PUBLIC",
            action_taken="RETAINED",
            rationale="General educational queries are processed without personal financial context."
        ),
    ]
