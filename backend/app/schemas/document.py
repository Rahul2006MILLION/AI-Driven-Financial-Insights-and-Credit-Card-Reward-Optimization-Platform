from typing import List, Optional, Any
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class ExtractedRuleDraft(BaseModel):
    category_id: str = "all"
    merchant_pattern: Optional[str] = None
    reward_type: str = "CASHBACK"
    reward_rate_percentage: Decimal
    point_monetary_value: Decimal = Decimal("1.0")
    min_transaction_amount: Decimal = Decimal("0.0")
    monthly_cap_amount: Optional[Decimal] = None
    is_excluded: bool = False
    exclusion_reason: Optional[str] = None

class ExtractedBenefitDraft(BaseModel):
    benefit_type: str
    title: str
    description: Optional[str] = ""
    annual_value_estimate: Decimal = Decimal("0.0")

class ExtractedDataResponse(BaseModel):
    id: str
    document_id: str
    extracted_card_name: Optional[str] = None
    extracted_bank_name: Optional[str] = None
    extracted_network: Optional[str] = "VISA"
    extracted_annual_fee: Optional[Decimal] = Decimal("0.00")
    rules: List[ExtractedRuleDraft] = []
    benefits: List[ExtractedBenefitDraft] = []
    confidence_score: Decimal
    is_verified: bool
    verified_at: Optional[datetime] = None

class DocumentResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    mime_type: str
    file_size_bytes: int
    processing_status: str
    error_message: Optional[str] = None
    uploaded_at: datetime
    extracted_data: Optional[ExtractedDataResponse] = None

    model_config = {"from_attributes": True}

class VerifyDocumentRequest(BaseModel):
    card_name: str = Field(..., min_length=2, max_length=128)
    bank_name: str = Field(..., min_length=2, max_length=128)
    network: str = Field("VISA", pattern="^(VISA|MASTERCARD|AMEX|RUPAY|DINERS)$")
    annual_fee: Decimal = Field(Decimal("0.00"), ge=Decimal("0.00"))
    rules: List[ExtractedRuleDraft] = []
    benefits: List[ExtractedBenefitDraft] = []
