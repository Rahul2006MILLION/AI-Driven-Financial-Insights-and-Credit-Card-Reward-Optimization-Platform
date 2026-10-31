from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class AiConsentResponse(BaseModel):
    user_id: str
    external_ai_enabled: bool = False
    allow_card_context: bool = False
    allow_spending_context: bool = False
    provider_preference: str = "gemini"
    consent_version: str = "1.0"
    consent_timestamp: datetime
    revoked_at: Optional[datetime] = None
    purpose_description: Optional[str] = None
    privacy_disclosure: str

    model_config = {"from_attributes": True}

class AiConsentUpdateRequest(BaseModel):
    external_ai_enabled: bool
    allow_card_context: bool = False
    allow_spending_context: bool = False
    provider_preference: Optional[str] = Field("gemini", pattern="^(gemini|mock)$")

class AiAuditLogResponse(BaseModel):
    id: str
    request_id: str
    task_type: str
    data_classification: str
    provider: str
    model_name: str
    consent_status: str
    redaction_count: int
    redacted_types: List[str] = []
    status: str
    rejection_reason: Optional[str] = None
    latency_ms: Optional[int] = None
    timestamp: datetime

    model_config = {"from_attributes": True}

class DataMinimizationAuditItem(BaseModel):
    field_name: str
    classification: str  # PUBLIC, INTERNAL, SENSITIVE, HIGHLY_SENSITIVE
    action_taken: str    # RETAINED, AGGREGATED, REDACTED, BLOCKED
    rationale: str
