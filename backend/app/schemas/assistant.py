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
