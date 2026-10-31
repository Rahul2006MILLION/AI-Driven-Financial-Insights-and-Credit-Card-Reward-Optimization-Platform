from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.offers.normalization import CanonicalOfferPayload

@dataclass
class IngestionResult:
    success: bool
    channel_name: str
    source_id: Optional[str]
    staged_count: int = 0
    quarantined_count: int = 0
    unchanged_count: int = 0
    errors: List[str] = field(default_factory=list)
    items: List[CanonicalOfferPayload] = field(default_factory=list)
    telemetry: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "channel_name": self.channel_name,
            "source_id": self.source_id,
            "staged_count": self.staged_count,
            "quarantined_count": self.quarantined_count,
            "unchanged_count": self.unchanged_count,
            "errors": self.errors,
            "items_count": len(self.items),
            "telemetry": self.telemetry
        }

class BaseIngestionChannel:
    name: str = "Base Ingestion Channel"
    channel_type: str = "MANUAL_ENTRY"

    async def ingest(
        self,
        db: AsyncSession,
        source_id: Optional[str] = None,
        raw_payload: Optional[Any] = None,
        actor_id: Optional[str] = None,
        actor_name: str = "System Ingestion Worker",
        actor_role: str = "SYSTEM"
    ) -> IngestionResult:
        raise NotImplementedError("Ingestion channels must implement ingest()")

