import time
import re
import urllib.robotparser
from urllib.parse import urlparse
from typing import Optional, Any, Dict, List
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.entities import OfferSource
from app.services.offers.channels.base import BaseIngestionChannel, IngestionResult
from app.services.offers.normalization import OfferNormalizer, CanonicalOfferPayload
from app.services.offers.source_registry import SourceRegistryService

class HtmlIngestionChannel(BaseIngestionChannel):
    name: str = "Permitted Public HTML Extraction Channel"
    channel_type: str = "HTML_EXTRACTION"

    async def ingest(
        self,
        db: AsyncSession,
        source_id: Optional[str] = None,
        raw_payload: Optional[Any] = None,
        actor_id: Optional[str] = None,
        actor_name: str = "HTML Ingestion Worker",
        actor_role: str = "SYSTEM"
    ) -> IngestionResult:
        """
        Attempts permitted public HTML extraction from configured source URL.
        Enforces robots.txt compliance and WAF boundaries without bypass.
        """
        source: Optional[OfferSource] = None
        if source_id:
            source = (await db.execute(select(OfferSource).where(OfferSource.id == source_id))).scalars().first()

        target_url = None
        if isinstance(raw_payload, dict) and "url" in raw_payload:
            target_url = raw_payload["url"]
        elif source:
            if source.source_key == "icici_bank":
                target_url = "https://www.icicibank.com/offers"
            elif source.source_key == "axis_bank":
                target_url = "https://www.axisbank.com/grabdeals"
            elif source.source_key == "hdfc_bank":
                target_url = "https://www.hdfcbank.com/personal/pay/cards/credit-cards/card-offers"
            else:
                target_url = f"https://www.{source.domain}"

        if not target_url:
            return IngestionResult(
                success=False,
                channel_name=self.name,
                source_id=source_id,
                errors=["No target URL specified for HTML extraction."]
            )

        # 1. Robots.txt Compliance Check
        parsed = urlparse(target_url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        user_agent = "CLIQ-Financial-Intelligence-Auditor/1.0 (+https://cliq.finance/bot; compliance-check)"
        headers = {
            "User-Agent": user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(robots_url)
        robots_allowed = True
        if "rupay.co.in" in target_url or (source and source.access_permission_status == "ROBOTS_RESTRICTED"):
            robots_allowed = False
        else:
            try:
                async with httpx.AsyncClient(timeout=3.0, follow_redirects=True) as client:
                    r_rob = await client.get(robots_url, headers=headers)
                    if r_rob.status_code == 200:
                        rp.parse(r_rob.text.splitlines())
                        robots_allowed = rp.can_fetch(user_agent, target_url)
            except Exception:
                pass

        if not robots_allowed:
            if source:
                await SourceRegistryService.log_failure(
                    db=db,
                    source_id=source.id,
                    error_type="ROBOTS_DISALLOWED",
                    error_message=f"Scraping {target_url} disallowed by official robots.txt.",
                    http_status=200
                )
            return IngestionResult(
                success=False,
                channel_name=self.name,
                source_id=source_id,
                errors=[f"Target URL {target_url} explicitly disallows automated crawlers in robots.txt. Ingestion halted for compliance."],
                telemetry={"robots_allowed": False, "target_url": target_url}
            )

        # 2. Probe & Fetch HTML
        t0 = time.time()
        try:
            async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
                resp = await client.get(target_url, headers=headers)
        except Exception as e:
            elapsed_ms = int((time.time() - t0) * 1000)
            err_msg = f"{type(e).__name__}: {str(e)}"
            if source:
                await SourceRegistryService.log_failure(
                    db=db,
                    source_id=source.id,
                    error_type="READ_TIMEOUT" if "Timeout" in err_msg else "NETWORK_ERROR",
                    error_message=err_msg,
                    http_status=0
                )
            return IngestionResult(
                success=False,
                channel_name=self.name,
                source_id=source_id,
                errors=[f"Network error probing {target_url}: {err_msg}"],
                telemetry={"latency_ms": elapsed_ms, "http_status": 0, "target_url": target_url}
            )

        elapsed_ms = int((time.time() - t0) * 1000)

        # Check for WAF blocks (403) or not found (404)
        if resp.status_code == 403:
            waf = "Cloudflare / AWS CloudFront / Akamai"
            if source:
                await SourceRegistryService.log_failure(
                    db=db,
                    source_id=source.id,
                    error_type="WAF_BLOCKED",
                    error_message="HTTP 403 Forbidden received during HTML extraction.",
                    http_status=403
                )
            return IngestionResult(
                success=False,
                channel_name=self.name,
                source_id=source_id,
                errors=[f"Source protected by {waf} (HTTP 403). Automated scraping not permitted."],
                telemetry={"http_status": 403, "latency_ms": elapsed_ms, "waf_blocked": True}
            )

        if resp.status_code != 200:
            return IngestionResult(
                success=False,
                channel_name=self.name,
                source_id=source_id,
                errors=[f"Received non-200 HTTP status: {resp.status_code}"],
                telemetry={"http_status": resp.status_code, "latency_ms": elapsed_ms}
            )

        # 3. Parse HTML and check for Client-side SPA vs Server-side HTML
        html_text = resp.text
        is_spa = ("<div id=\"root\">" in html_text or "<app-root>" in html_text or "window.__INITIAL_STATE__" in html_text)

        # If payload provides a specific test fixture or raw HTML with known offer cards:
        extracted_payloads: List[CanonicalOfferPayload] = []

        # Example pattern extraction for promotional meta tags or structured discount banners
        matches = re.findall(r"(?:get|flat|save|up to)\s*(\d{1,2}%|₹\s*\d+)\s*(?:off|cashback|discount).*?on\s*([a-zA-Z0-9\s]+)", html_text, re.IGNORECASE)
        for disc, merch in matches[:3]:
            # Convert matched snippet into CanonicalOfferPayload
            snippet = f"Extracted from HTML: Save {disc} on {merch.strip()}."
            raw_dict = {
                "merchant_name": merch.strip().title(),
                "offer_title": f"{disc} discount on {merch.strip().title()}",
                "category_id": OfferNormalizer.normalize_category(merch),
                "discount_type": "PERCENTAGE" if "%" in disc else "FLAT_AMOUNT",
                "discount_value": OfferNormalizer.normalize_monetary_value(disc),
                "min_transaction_value": "500.00",
                "source_url": str(resp.url),
                "source_name": source.source_name if source else "Public Web Portal",
                "source_evidence": snippet,
                "terms_and_conditions": "Extracted via permitted public HTML markup. Requires human verification before activation."
            }
            canonical = OfferNormalizer.validate_and_normalize(
                raw_dict,
                ingestion_channel="HTML_EXTRACTION",
                source_id=source_id,
                source_name=source.source_name if source else "Public Web Portal",
                source_url=str(resp.url)
            )
            extracted_payloads.append(canonical)

        return IngestionResult(
            success=True,
            channel_name=self.name,
            source_id=source_id,
            items=extracted_payloads,
            telemetry={
                "http_status": 200,
                "latency_ms": elapsed_ms,
                "is_spa": is_spa,
                "html_bytes": len(html_text),
                "extracted_count": len(extracted_payloads),
                "final_url": str(resp.url)
            }
        )

