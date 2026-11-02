from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from decimal import Decimal

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: Optional[str] = None
    preferred_language: str = "en"
    role: str = "USER"
    is_admin: bool = False
    financial_pathway: str = "CREDIT_CARD"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    full_name: Optional[str] = Field(None, max_length=255)
    preferred_language: str = Field("en", pattern="^(en|hi|kn)$")
    currency: str = Field("INR", max_length=10)
    financial_pathway: Optional[str] = Field("CREDIT_CARD", pattern="^(CREDIT_CARD|NO_CREDIT_CARD)$")

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=255)
    preferred_language: Optional[str] = Field(None, pattern="^(en|hi|kn)$")
    currency: Optional[str] = Field(None, max_length=10)
    financial_pathway: Optional[str] = Field(None, pattern="^(CREDIT_CARD|NO_CREDIT_CARD)$")

class ProfileResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    preferred_language: str = "en"
    currency: str = "INR"
    role: str = "USER"
    is_admin: bool = False
    is_active: bool = True
    financial_pathway: str = "CREDIT_CARD"

    model_config = {"from_attributes": True}


class PreferencesResponse(BaseModel):
    user_id: str
    prioritize_cashback: bool
    prioritize_miles: bool
    include_annual_fee_in_net: bool
    monthly_spend_target: Optional[float] = None
    financial_path: str
    budget_alert_threshold: float

    model_config = {"from_attributes": True}


class PreferencesUpdate(BaseModel):
    prioritize_cashback: Optional[bool] = None
    prioritize_miles: Optional[bool] = None
    include_annual_fee_in_net: Optional[bool] = None
    monthly_spend_target: Optional[float] = Field(None, ge=0)
    budget_alert_threshold: Optional[float] = Field(None, ge=1, le=100)


class AccountDeleteRequest(BaseModel):
    password: str = Field(..., min_length=1, max_length=128)
    confirmation: str  # must equal "DELETE MY ACCOUNT"


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6, max_length=128)
