from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.core.database import get_db
from app.models.entities import Profile, UserPreference, AuditLog
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    ProfileResponse,
    ProfileUpdate,
)
from app.security.password import verify_password, get_password_hash
from app.security.jwt import create_access_token
from app.security.dependencies import get_current_user

router = APIRouter(prefix="", tags=["Authentication & Profile"])

@router.post("/auth/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    stmt = select(Profile).where(Profile.email == req.email.lower().strip())
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Create profile
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

    # Create default user preference
    pref = UserPreference(
        user_id=user.id,
        prioritize_cashback=True,
        prioritize_miles=False,
        include_annual_fee_in_net=False,
        financial_path="NEW_TO_FINANCE" if (req.financial_pathway == "NO_CREDIT_CARD") else "OPTIMIZE_EXISTING"
    )
    db.add(pref)

    # Audit log
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
        # Audit failure
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

    # Audit success
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
