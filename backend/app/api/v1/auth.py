from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict
import hashlib
import json
import logging
import os
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings
from app.core.database import get_db
from app.models.entities import (
    Profile, UserPreference, AuditLog, CreditCard, Transaction,
    Income, UserBudget, UploadedDocument, UserAiConsent,
    PasswordResetToken
)
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    ProfileResponse,
    ProfileUpdate,
    PreferencesResponse,
    PreferencesUpdate,
    AccountDeleteRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
)
from app.security.password import verify_password, get_password_hash
from app.security.jwt import create_access_token
from app.security.dependencies import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="", tags=["Authentication & Profile"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _try_send_email(to_email: str, subject: str, body_html: str, body_text: str) -> bool:
    """Attempt SMTP send. Returns True on success. Logs a notice (NOT the token) on failure."""
    if not settings.SMTP_HOST or not settings.SMTP_USERNAME:
        logger.warning(
            "[DEV] No SMTP configured — password reset email not sent to %s. "
            "Configure SMTP_HOST/SMTP_USERNAME in .env to enable email delivery.",
            to_email
        )
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg["To"] = to_email
        msg.attach(MIMEText(body_text, "plain"))
        msg.attach(MIMEText(body_html, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            if settings.SMTP_TLS:
                server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD or "")
            server.sendmail(settings.SMTP_FROM_EMAIL, to_email, msg.as_string())
        return True
    except Exception as exc:
        logger.error("SMTP send failed: %s", exc)
        return False


# ---------------------------------------------------------------------------
# Auth: Register / Login
# ---------------------------------------------------------------------------

@router.post("/auth/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(Profile).where(Profile.email == req.email.lower().strip())
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    hashed = get_password_hash(req.password)
    user = Profile(
        email=req.email.lower().strip(),
        hashed_password=hashed,
        full_name=req.full_name,
        preferred_language=req.preferred_language,
        currency=req.currency,
        financial_pathway=req.financial_pathway or "CREDIT_CARD"
    )
    db.add(user)
    await db.flush()

    pref = UserPreference(
        user_id=user.id,
        prioritize_cashback=True,
        prioritize_miles=False,
        include_annual_fee_in_net=False,
        financial_path="NEW_TO_FINANCE" if (req.financial_pathway == "NO_CREDIT_CARD") else "OPTIMIZE_EXISTING"
    )
    db.add(pref)

    audit = AuditLog(
        user_id=user.id,
        action="USER_REGISTERED",
        status="SUCCESS",
        details_json=f'{{"email": "{user.email}"}}'
    )
    db.add(audit)

    await db.commit()
    await db.refresh(user)

    token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role, "is_admin": user.is_admin})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        preferred_language=user.preferred_language,
        role=user.role,
        is_admin=user.is_admin,
        financial_pathway=getattr(user, "financial_pathway", "CREDIT_CARD")
    )


@router.post("/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(Profile).where(Profile.email == req.email.lower().strip(), Profile.is_active == True)
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user or not verify_password(req.password, user.hashed_password):
        audit = AuditLog(
            user_id=user.id if user else None,
            action="LOGIN_FAILED",
            status="FAILURE",
            details_json=f'{{"attempted_email": "{req.email}"}}'
        )
        db.add(audit)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    audit = AuditLog(
        user_id=user.id,
        action="LOGIN_SUCCESS",
        status="SUCCESS"
    )
    db.add(audit)
    await db.commit()

    token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role, "is_admin": user.is_admin})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        preferred_language=user.preferred_language,
        role=user.role,
        is_admin=user.is_admin,
        financial_pathway=getattr(user, "financial_pathway", "CREDIT_CARD")
    )


# ---------------------------------------------------------------------------
# Profile: Get / Update
# ---------------------------------------------------------------------------

@router.get("/auth/me", response_model=ProfileResponse)
@router.get("/profile", response_model=ProfileResponse)
async def get_profile(current_user: Profile = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    req: ProfileUpdate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if req.full_name is not None:
        current_user.full_name = req.full_name
    if req.preferred_language is not None:
        current_user.preferred_language = req.preferred_language
    if req.currency is not None:
        current_user.currency = req.currency
    if req.financial_pathway is not None:
        current_user.financial_pathway = req.financial_pathway

    current_user.updated_at = datetime.utcnow()
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user


# ---------------------------------------------------------------------------
# Preferences: Get / Update
# ---------------------------------------------------------------------------

@router.get("/profile/preferences", response_model=PreferencesResponse)
async def get_preferences(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserPreference).where(UserPreference.user_id == current_user.id)
    pref = (await db.execute(stmt)).scalar_one_or_none()
    if not pref:
        # Create default preferences if missing
        pref = UserPreference(
            user_id=current_user.id,
            prioritize_cashback=True,
            prioritize_miles=False,
            include_annual_fee_in_net=False,
            financial_path="OPTIMIZE_EXISTING"
        )
        db.add(pref)
        await db.commit()
        await db.refresh(pref)
    return pref


@router.put("/profile/preferences", response_model=PreferencesResponse)
async def update_preferences(
    req: PreferencesUpdate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserPreference).where(UserPreference.user_id == current_user.id)
    pref = (await db.execute(stmt)).scalar_one_or_none()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)

    if req.prioritize_cashback is not None:
        pref.prioritize_cashback = req.prioritize_cashback
    if req.prioritize_miles is not None:
        pref.prioritize_miles = req.prioritize_miles
    if req.include_annual_fee_in_net is not None:
        pref.include_annual_fee_in_net = req.include_annual_fee_in_net
    if req.monthly_spend_target is not None:
        pref.monthly_spend_target = Decimal(str(req.monthly_spend_target))
    if req.budget_alert_threshold is not None:
        pref.budget_alert_threshold = Decimal(str(req.budget_alert_threshold))

    pref.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(pref)
    return pref


# ---------------------------------------------------------------------------
# Data Export
# ---------------------------------------------------------------------------

@router.get("/auth/export")
async def export_user_data(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Export all user-owned data as downloadable JSON. Never exports credentials or tokens."""
    uid = current_user.id

    # Fetch all user-owned records
    cards_res = await db.execute(select(CreditCard).where(CreditCard.user_id == uid))
    txns_res = await db.execute(select(Transaction).where(Transaction.user_id == uid))
    incomes_res = await db.execute(select(Income).where(Income.user_id == uid))
    budget_res = await db.execute(select(UserBudget).where(UserBudget.user_id == uid))
    pref_res = await db.execute(select(UserPreference).where(UserPreference.user_id == uid))

    cards = cards_res.scalars().all()
    txns = txns_res.scalars().all()
    incomes = incomes_res.scalars().all()
    budget = budget_res.scalar_one_or_none()
    pref = pref_res.scalar_one_or_none()

    def _d(v: Any) -> Any:
        if isinstance(v, Decimal):
            return str(v)
        if isinstance(v, datetime):
            return v.isoformat()
        return v

    export_data: Dict[str, Any] = {
        "export_metadata": {
            "exported_at": datetime.utcnow().isoformat(),
            "user_id": uid,
            "format_version": "1.0"
        },
        "profile": {
            "email": current_user.email,
            "full_name": current_user.full_name,
            "preferred_language": current_user.preferred_language,
            "currency": current_user.currency,
            "financial_pathway": current_user.financial_pathway,
            "created_at": current_user.created_at.isoformat()
        },
        "preferences": {
            "prioritize_cashback": pref.prioritize_cashback if pref else True,
            "prioritize_miles": pref.prioritize_miles if pref else False,
            "include_annual_fee_in_net": pref.include_annual_fee_in_net if pref else False,
            "monthly_spend_target": _d(pref.monthly_spend_target) if pref else None,
            "budget_alert_threshold": _d(pref.budget_alert_threshold) if pref else "80.00",
        },
        "credit_cards": [
            {
                "card_name": c.card_name,
                "bank_name": c.bank_name,
                "network": c.network,
                "card_type": c.card_type,
                "card_variant": c.card_variant,
                "nickname": c.nickname,
                "last_four_digits": c.last_four_digits,
                "joining_fee": _d(c.joining_fee),
                "annual_fee": _d(c.annual_fee),
                "is_active": c.is_active,
                "created_at": c.created_at.isoformat()
            }
            for c in cards
        ],
        "transactions": [
            {
                "merchant_name": t.merchant_name,
                "amount": _d(t.amount),
                "currency": t.currency,
                "category_id": t.category_id,
                "payment_method": t.payment_method,
                "transaction_date": t.transaction_date.isoformat(),
                "reward_earned_monetary": _d(t.reward_earned_monetary),
                "notes": t.notes
            }
            for t in txns
        ],
        "income_sources": [
            {
                "source_name": i.source_name,
                "amount": _d(i.amount),
                "currency": i.currency,
                "frequency": i.frequency,
                "is_irregular": i.is_irregular,
                "received_date": i.received_date.isoformat(),
                "notes": i.notes
            }
            for i in incomes
        ],
        "budget": {
            "total_budget": _d(budget.total_budget) if budget else None,
            "monthly_income": _d(budget.monthly_income) if budget else None,
            "category_budgets": json.loads(budget.category_budgets_json) if budget else {}
        }
    }

    # Log the export
    db.add(AuditLog(
        user_id=uid,
        action="DATA_EXPORTED",
        status="SUCCESS",
        details_json=json.dumps({
            "cards": len(cards),
            "transactions": len(txns),
            "incomes": len(incomes)
        })
    ))
    await db.commit()

    from fastapi.responses import Response
    import json as json_lib
    content = json_lib.dumps(export_data, indent=2, ensure_ascii=False)
    filename = f"cliq_export_{uid[:8]}_{datetime.utcnow().strftime('%Y%m%d')}.json"
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


# ---------------------------------------------------------------------------
# Account Deletion
# ---------------------------------------------------------------------------

@router.delete("/auth/account", status_code=204)
async def delete_account(
    req: AccountDeleteRequest,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Permanently delete account. Requires password confirmation and the phrase 'DELETE MY ACCOUNT'."""
    if req.confirmation != "DELETE MY ACCOUNT":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation phrase must be exactly: DELETE MY ACCOUNT"
        )

    if not verify_password(req.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password is incorrect."
        )

    uid = current_user.id
    email_hash = hashlib.sha256(current_user.email.lower().encode()).hexdigest()

    # Fetch physical file paths before deletion
    docs_res = await db.execute(select(UploadedDocument).where(UploadedDocument.user_id == uid))
    documents = docs_res.scalars().all()
    file_paths = [d.file_path for d in documents if d.file_path]

    # Anonymize audit logs for compliance retention (SET user_id = NULL)
    await db.execute(
        text("UPDATE audit_logs SET user_id = NULL WHERE user_id = :uid"),
        {"uid": uid}
    )
    await db.execute(
        text("UPDATE ai_request_audit_logs SET user_id = NULL WHERE user_id = :uid"),
        {"uid": uid}
    )
    await db.commit()

    # Delete all user-owned records in dependency order.
    # Explicit deletes ensure correctness on SQLite (which requires PRAGMA foreign_keys=ON
    # for DB-level CASCADE, which is not guaranteed by the current engine configuration).
    # On PostgreSQL these deletes are also safe — FK ON DELETE CASCADE would handle it,
    # but explicit is safer and works on both engines.
    user_tables_ordered = [
        "extracted_card_data",      # depends on uploaded_documents
        "uploaded_documents",
        "reward_analysis",
        "user_learning_progress",
        "user_budgets",
        "user_preferences",
        "user_ai_consents",
        "password_reset_tokens",
        "transactions",             # depends on credit_cards
        "card_reward_rules",        # depends on credit_cards
        "card_benefits",            # depends on credit_cards
        "credit_cards",
        "incomes",
    ]
    for table in user_tables_ordered:
        await db.execute(text(f"DELETE FROM {table} WHERE user_id = :uid"), {"uid": uid})  # noqa: S608

    await db.execute(
        text("DELETE FROM profiles WHERE id = :uid"),
        {"uid": uid}
    )
    await db.commit()

    # Delete physical files from disk (best-effort — do not fail the request)
    for path in file_paths:
        try:
            if path and os.path.isfile(path):
                os.remove(path)
        except OSError as e:
            logger.warning("Could not delete file %s: %s", path, e)

    logger.info("Account deleted: email_hash=%s", email_hash)
    return None


# ---------------------------------------------------------------------------
# Password Reset
# ---------------------------------------------------------------------------

@router.post("/auth/forgot-password", status_code=202)
async def forgot_password(
    req: PasswordResetRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Request a password reset link. Always returns 202 to avoid revealing
    whether an email address has an account.
    Rate-limited to 3 requests per email per hour.
    """
    email = req.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)

    # Find user silently — same response either way
    stmt = select(Profile).where(Profile.email == email, Profile.is_active == True)
    user = (await db.execute(stmt)).scalar_one_or_none()

    if user:
        # Rate limit: count recent tokens for this user
        count_stmt = select(PasswordResetToken).where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.created_at >= one_hour_ago
        )
        recent = (await db.execute(count_stmt)).scalars().all()
        if len(recent) >= settings.PASSWORD_RESET_RATE_LIMIT_PER_HOUR:
            # Silently swallow — still return 202 to prevent enumeration
            return {"detail": "If that email is registered, a reset link has been sent."}

        raw_token = secrets.token_urlsafe(32)
        token_hash = _hash_token(raw_token)
        expires_at = datetime.utcnow() + timedelta(minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES)

        prt = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            ip_address=ip
        )
        db.add(prt)
        await db.commit()

        reset_url = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={raw_token}"
        body_text = (
            f"Hi {user.full_name or 'there'},\n\n"
            f"Someone requested a password reset for your CLIQ account.\n\n"
            f"Reset link (expires in {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes):\n{reset_url}\n\n"
            f"If you did not request this, you can safely ignore this email.\n\n"
            f"— CLIQ"
        )
        body_html = (
            f"<p>Hi {user.full_name or 'there'},</p>"
            f"<p>Someone requested a password reset for your CLIQ account.</p>"
            f"<p><a href='{reset_url}'>Reset your password</a> "
            f"(expires in {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes)</p>"
            f"<p>If you did not request this, you can safely ignore this email.</p>"
            f"<p>— CLIQ</p>"
        )
        _try_send_email(email, "Reset your CLIQ password", body_html, body_text)

    return {"detail": "If that email is registered, a reset link has been sent."}


@router.post("/auth/reset-password")
async def reset_password(
    req: PasswordResetConfirm,
    db: AsyncSession = Depends(get_db)
):
    """Consume a password reset token and set a new password. Invalidates all existing tokens."""
    token_hash = _hash_token(req.token)
    now = datetime.utcnow()

    stmt = select(PasswordResetToken).where(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.is_used == False,
        PasswordResetToken.expires_at > now
    )
    prt = (await db.execute(stmt)).scalar_one_or_none()

    if not prt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset link is invalid or has expired."
        )

    # Load user
    user = await db.get(Profile, prt.user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset link is invalid or has expired."
        )

    # Update password
    user.hashed_password = get_password_hash(req.new_password)
    user.updated_at = datetime.utcnow()

    # Invalidate ALL tokens for this user (single-use + clear old ones)
    await db.execute(
        text("UPDATE password_reset_tokens SET is_used = 1 WHERE user_id = :uid"),
        {"uid": user.id}
    )

    db.add(AuditLog(
        user_id=user.id,
        action="PASSWORD_RESET",
        status="SUCCESS"
    ))

    await db.commit()
    return {"detail": "Password has been reset successfully. Please log in with your new password."}
