from typing import List, Optional
from pydantic import BaseModel, Field

class ChatQueryRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=1000)
    language: str = Field("en", pattern="^(en|hi|kn)$")

class ChatQueryResponse(BaseModel):
    query: str
    response: str
    language: str
    grounded_card_ids: List[str] = []
    citations: List[str] = []
    confidence: float = 0.95
    # Privacy Architecture Fields
    is_external_ai_used: bool = False
    provider_used: str = "local_grounded_engine"
    data_classification: str = "PUBLIC"
    redacted_items_count: int = 0
    privacy_status: str = "LOCAL_PROCESSING_PROTECTED"
    audit_request_id: Optional[str] = None
