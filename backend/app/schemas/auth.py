from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: Optional[str] = None
    preferred_language: str = "en"
    role: str = "USER"
    is_admin: bool = False

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    full_name: Optional[str] = Field(None, max_length=255)
    preferred_language: str = Field("en", pattern="^(en|hi|kn)$")
    currency: str = Field("INR", max_length=10)

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=255)
    preferred_language: Optional[str] = Field(None, pattern="^(en|hi|kn)$")
    currency: Optional[str] = Field(None, max_length=10)

class ProfileResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    preferred_language: str = "en"
    currency: str = "INR"
    role: str = "USER"
    is_admin: bool = False
    is_active: bool = True

    model_config = {"from_attributes": True}
