from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
import json
from datetime import datetime

from app.core.database import get_db
from app.models.entities import Profile, CreditCard, CardOffer, OfferAuditLog, AuditLog, OfferSource, SourceFailureLog, AdminOfferDocument
from app.schemas.offer import (
    CardOfferCreate,
    CardOfferUpdate,
    CardOfferResponse,
    AdminOfferApproveRequest,
    AdminOfferRejectRequest,
    AdminOfferEditRequest,
    AdminReverificationRequest,
    OfferAuditLogResponse,
    DiscoverySyncResponse,
    OfferSourceResponse,
    SourceHealthProbeResponse,
    SourceFailureLogResponse,
    AdminOfferDocumentResponse,
    ManualOfferCreateRequest,
    PartnerFeedIngestRequest,
)
from app.security.dependencies import get_current_user, require_admin
from app.services.offers.offer_service import OfferService
from app.services.offers.discovery_pipeline import DiscoveryPipeline
from app.services.offers.source_registry import SourceRegistryService
from app.services.offers.ingestion_engine import OfferIngestionEngine
from app.services.offers.normalization import OfferNormalizer
from app.services.offers.channels import (
    AdminDocumentIngestionChannel,
    PartnerFeedIngestionChannel,
    AdminManualIngestionChannel,
    HtmlIngestionChannel,
    PdfCircularIngestionChannel
)

router = APIRouter(prefix="/offers", tags=["Offers Discovery"])
admin_router = APIRouter(prefix="/admin/offers", tags=["Admin Offer Verification Desk"])

# ==============================================================================
# USER / PUBLIC ENDPOINTS
# ==============================================================================

@router.get("", response_model=List[CardOfferResponse])
async def list_offers(
    category: Optional[str] = Query(None, description="Category filter (shopping, dining, food_delivery, travel, entertainment, grocery, utility)"),
    merchant: Optional[str] = Query(None, description="Filter by merchant name e.g. Swiggy, Amazon"),
    only_user_cards: bool = Query(False, description="Filter to offers applicable to user's registered cards"),
    expiring_soon: bool = Query(False, description="Filter offers expiring within 7 days"),
    verification_status: Optional[str] = Query(None, description="VERIFIED, SAMPLE, MANUALLY_ENTERED"),
    query: Optional[str] = Query(None, description="Free text search query"),
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch active user cards for applicability matching
    card_stmt = select(CreditCard).where(CreditCard.user_id == current_user.id, CreditCard.is_active == True)
    user_cards = (await db.execute(card_stmt)).scalars().all()

    is_admin = bool(current_user.is_admin or current_user.role == "ADMIN")

    # Query offers via OfferService (strictly filtered to VERIFIED for regular users)
    offers = await OfferService.list_offers(
        db=db,
        user_cards=user_cards,
        category=category,
        merchant_name=merchant,
        only_user_cards=only_user_cards,
        expiring_soon=expiring_soon,
        verification_status=verification_status,
        query=query,
        is_admin=is_admin
    )
    return offers

@router.get("/{offer_id}", response_model=CardOfferResponse)
async def get_offer(
    offer_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(CardOffer).where(CardOffer.id == offer_id)
    offer = (await db.execute(stmt)).scalar_one_or_none()
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found."
        )

    # If regular user, do not expose unverified / rejected offers
    is_admin = bool(current_user.is_admin or current_user.role == "ADMIN")
    if not is_admin and offer.verification_status not in ["VERIFIED", "SAMPLE"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found or under review."
        )

    card_stmt = select(CreditCard).where(CreditCard.user_id == current_user.id, CreditCard.is_active == True)
    user_cards = (await db.execute(card_stmt)).scalars().all()
    matching_cards = OfferService.find_matching_user_cards(offer, user_cards)

    try:
        card_names = json.loads(offer.eligible_card_names_json or "[]")
    except Exception:
        card_names = []

    return CardOfferResponse(
        id=offer.id,
        merchant_name=offer.merchant_name,
        offer_title=offer.offer_title,
        category_id=offer.category_id,
        discount_type=offer.discount_type,
        discount_value=offer.discount_value,
        min_transaction_value=offer.min_transaction_value,
        max_discount_amount=offer.max_discount_amount,
        eligible_bank=offer.eligible_bank,
        eligible_network=offer.eligible_network,
        eligible_card_names=card_names,
        valid_from=offer.valid_from,
        valid_to=offer.valid_to,
        payment_channel=offer.payment_channel,
        promo_code=offer.promo_code,
        activation_requirement=offer.activation_requirement,
        terms_and_conditions=offer.terms_and_conditions,
        source_url=offer.source_url,
        source_name=offer.source_name,
        source_evidence=offer.source_evidence,
        extraction_confidence=offer.extraction_confidence,
        verification_status=offer.verification_status,
        version=offer.version,
        previous_version_json=offer.previous_version_json,
        rejection_reason=offer.rejection_reason,
        reviewed_by_name=offer.reviewed_by_name,
        reviewed_at=offer.reviewed_at,
        content_hash=offer.content_hash,
        last_verified_timestamp=offer.last_verified_timestamp,
        created_at=offer.created_at,
        matching_user_card_names=matching_cards,
        is_applicable_to_user=len(matching_cards) > 0
    )

@router.post("", response_model=CardOfferResponse, status_code=status.HTTP_201_CREATED)
async def create_offer(
    req: CardOfferCreate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    is_admin = bool(current_user.is_admin or current_user.role == "ADMIN")
    # Ordinary users cannot self-verify offers; status defaults to PENDING_REVIEW
    v_status = req.verification_status if (is_admin and req.verification_status) else "PENDING_REVIEW"

    offer = CardOffer(
        merchant_name=req.merchant_name.strip(),
        offer_title=req.offer_title.strip(),
        category_id=req.category_id.strip(),
        discount_type=req.discount_type,
        discount_value=req.discount_value,
        min_transaction_value=req.min_transaction_value,
        max_discount_amount=req.max_discount_amount,
        eligible_bank=req.eligible_bank.strip() if req.eligible_bank else None,
        eligible_network=req.eligible_network,
        eligible_card_names_json=json.dumps(req.eligible_card_names),
        valid_from=req.valid_from,
        valid_to=req.valid_to,
        payment_channel=req.payment_channel,
        promo_code=req.promo_code.strip() if req.promo_code else None,
        activation_requirement=req.activation_requirement,
        terms_and_conditions=req.terms_and_conditions,
        source_url=req.source_url,
        source_name=req.source_name or "Manual Submission",
        source_evidence=req.source_evidence,
        extraction_confidence=req.extraction_confidence,
        verification_status=v_status,
        version=1,
        last_verified_timestamp=datetime.utcnow()
    )
    db.add(offer)
    await db.flush()

    audit = OfferAuditLog(
        offer_id=offer.id,
        action="USER_SUBMITTED" if not is_admin else "ADMIN_CREATED",
        actor_id=current_user.id,
        actor_name=current_user.full_name or current_user.email,
        actor_role="ADMIN" if is_admin else "USER",
        from_status="DISCOVERED",
        to_status=v_status,
        notes="Offer created through API portal."
    )
    db.add(audit)
    await db.commit()
    await db.refresh(offer)

    return CardOfferResponse(
        id=offer.id,
        merchant_name=offer.merchant_name,
        offer_title=offer.offer_title,
        category_id=offer.category_id,
        discount_type=offer.discount_type,
        discount_value=offer.discount_value,
        min_transaction_value=offer.min_transaction_value,
        max_discount_amount=offer.max_discount_amount,
        eligible_bank=offer.eligible_bank,
        eligible_network=offer.eligible_network,
        eligible_card_names=req.eligible_card_names,
        valid_from=offer.valid_from,
        valid_to=offer.valid_to,
        payment_channel=offer.payment_channel,
        promo_code=offer.promo_code,
        activation_requirement=offer.activation_requirement,
        terms_and_conditions=offer.terms_and_conditions,
        source_url=offer.source_url,
        source_name=offer.source_name,
        source_evidence=offer.source_evidence,
        extraction_confidence=offer.extraction_confidence,
        verification_status=offer.verification_status,
        version=offer.version,
        previous_version_json=offer.previous_version_json,
        rejection_reason=offer.rejection_reason,
        reviewed_by_name=offer.reviewed_by_name,
        reviewed_at=offer.reviewed_at,
        content_hash=offer.content_hash,
        last_verified_timestamp=offer.last_verified_timestamp,
        created_at=offer.created_at,
        matching_user_card_names=[],
        is_applicable_to_user=False
    )

# ==============================================================================
# ADMINISTRATOR OFFER REVIEW DESK ENDPOINTS
# ==============================================================================

@admin_router.get("/review-queue", response_model=List[CardOfferResponse])
async def get_admin_review_queue(
    status_filter: Optional[str] = Query(None, description="PENDING_REVIEW, NEEDS_REVERIFICATION, VERIFIED, REJECTED, EXPIRED, ALL"),
    query: Optional[str] = Query(None, description="Search query across merchant, title, promo code"),
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await OfferService.get_admin_review_queue(
        db=db,
        status_filter=status_filter,
        query=query
    )

@admin_router.post("/{offer_id}/approve", response_model=CardOfferResponse)
async def admin_approve_offer(
    offer_id: str,
    req: AdminOfferApproveRequest = AdminOfferApproveRequest(),
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    try:
        offer = await OfferService.approve_offer(
            db=db,
            offer_id=offer_id,
            admin_user=admin_user,
            notes=req.notes
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    try:
        card_names = json.loads(offer.eligible_card_names_json or "[]")
    except Exception:
        card_names = []

    return CardOfferResponse(
        id=offer.id,
        merchant_name=offer.merchant_name,
        offer_title=offer.offer_title,
        category_id=offer.category_id,
        discount_type=offer.discount_type,
        discount_value=offer.discount_value,
        min_transaction_value=offer.min_transaction_value,
        max_discount_amount=offer.max_discount_amount,
        eligible_bank=offer.eligible_bank,
        eligible_network=offer.eligible_network,
        eligible_card_names=card_names,
        valid_from=offer.valid_from,
        valid_to=offer.valid_to,
        payment_channel=offer.payment_channel,
        promo_code=offer.promo_code,
        activation_requirement=offer.activation_requirement,
        terms_and_conditions=offer.terms_and_conditions,
        source_url=offer.source_url,
        source_name=offer.source_name,
        source_evidence=offer.source_evidence,
        extraction_confidence=offer.extraction_confidence,
        verification_status=offer.verification_status,
        version=offer.version,
        previous_version_json=offer.previous_version_json,
        rejection_reason=offer.rejection_reason,
        reviewed_by_name=offer.reviewed_by_name,
        reviewed_at=offer.reviewed_at,
        content_hash=offer.content_hash,
        last_verified_timestamp=offer.last_verified_timestamp,
        created_at=offer.created_at,
        matching_user_card_names=[],
        is_applicable_to_user=False
    )

@admin_router.post("/{offer_id}/reject", response_model=CardOfferResponse)
async def admin_reject_offer(
    offer_id: str,
    req: AdminOfferRejectRequest,
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    try:
        offer = await OfferService.reject_offer(
            db=db,
            offer_id=offer_id,
            admin_user=admin_user,
            rejection_reason=req.rejection_reason,
            notes=req.notes
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    try:
        card_names = json.loads(offer.eligible_card_names_json or "[]")
    except Exception:
        card_names = []

    return CardOfferResponse(
        id=offer.id,
        merchant_name=offer.merchant_name,
        offer_title=offer.offer_title,
        category_id=offer.category_id,
        discount_type=offer.discount_type,
        discount_value=offer.discount_value,
        min_transaction_value=offer.min_transaction_value,
        max_discount_amount=offer.max_discount_amount,
        eligible_bank=offer.eligible_bank,
        eligible_network=offer.eligible_network,
        eligible_card_names=card_names,
        valid_from=offer.valid_from,
        valid_to=offer.valid_to,
        payment_channel=offer.payment_channel,
        promo_code=offer.promo_code,
        activation_requirement=offer.activation_requirement,
        terms_and_conditions=offer.terms_and_conditions,
        source_url=offer.source_url,
        source_name=offer.source_name,
        source_evidence=offer.source_evidence,
        extraction_confidence=offer.extraction_confidence,
        verification_status=offer.verification_status,
        version=offer.version,
        previous_version_json=offer.previous_version_json,
        rejection_reason=offer.rejection_reason,
        reviewed_by_name=offer.reviewed_by_name,
        reviewed_at=offer.reviewed_at,
        content_hash=offer.content_hash,
        last_verified_timestamp=offer.last_verified_timestamp,
        created_at=offer.created_at,
        matching_user_card_names=[],
        is_applicable_to_user=False
    )

@admin_router.put("/{offer_id}", response_model=CardOfferResponse)
async def admin_edit_offer(
    offer_id: str,
    req: AdminOfferEditRequest,
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    try:
        offer = await OfferService.edit_offer(
            db=db,
            offer_id=offer_id,
            admin_user=admin_user,
            req=req
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    try:
        card_names = json.loads(offer.eligible_card_names_json or "[]")
    except Exception:
        card_names = []

    return CardOfferResponse(
        id=offer.id,
        merchant_name=offer.merchant_name,
        offer_title=offer.offer_title,
        category_id=offer.category_id,
        discount_type=offer.discount_type,
        discount_value=offer.discount_value,
        min_transaction_value=offer.min_transaction_value,
        max_discount_amount=offer.max_discount_amount,
        eligible_bank=offer.eligible_bank,
        eligible_network=offer.eligible_network,
        eligible_card_names=card_names,
        valid_from=offer.valid_from,
        valid_to=offer.valid_to,
        payment_channel=offer.payment_channel,
        promo_code=offer.promo_code,
        activation_requirement=offer.activation_requirement,
        terms_and_conditions=offer.terms_and_conditions,
        source_url=offer.source_url,
        source_name=offer.source_name,
        source_evidence=offer.source_evidence,
        extraction_confidence=offer.extraction_confidence,
        verification_status=offer.verification_status,
        version=offer.version,
        previous_version_json=offer.previous_version_json,
        rejection_reason=offer.rejection_reason,
        reviewed_by_name=offer.reviewed_by_name,
        reviewed_at=offer.reviewed_at,
        content_hash=offer.content_hash,
        last_verified_timestamp=offer.last_verified_timestamp,
        created_at=offer.created_at,
        matching_user_card_names=[],
        is_applicable_to_user=False
    )

@admin_router.post("/{offer_id}/reverification", response_model=CardOfferResponse)
async def admin_trigger_reverification(
    offer_id: str,
    req: AdminReverificationRequest = AdminReverificationRequest(),
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    try:
        offer = await OfferService.trigger_reverification(
            db=db,
            offer_id=offer_id,
            admin_user=admin_user,
            reason=req.reason
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    try:
        card_names = json.loads(offer.eligible_card_names_json or "[]")
    except Exception:
        card_names = []

    return CardOfferResponse(
        id=offer.id,
        merchant_name=offer.merchant_name,
        offer_title=offer.offer_title,
        category_id=offer.category_id,
        discount_type=offer.discount_type,
        discount_value=offer.discount_value,
        min_transaction_value=offer.min_transaction_value,
        max_discount_amount=offer.max_discount_amount,
        eligible_bank=offer.eligible_bank,
        eligible_network=offer.eligible_network,
        eligible_card_names=card_names,
        valid_from=offer.valid_from,
        valid_to=offer.valid_to,
        payment_channel=offer.payment_channel,
        promo_code=offer.promo_code,
        activation_requirement=offer.activation_requirement,
        terms_and_conditions=offer.terms_and_conditions,
        source_url=offer.source_url,
        source_name=offer.source_name,
        source_evidence=offer.source_evidence,
        extraction_confidence=offer.extraction_confidence,
        verification_status=offer.verification_status,
        version=offer.version,
        previous_version_json=offer.previous_version_json,
        rejection_reason=offer.rejection_reason,
        reviewed_by_name=offer.reviewed_by_name,
        reviewed_at=offer.reviewed_at,
        content_hash=offer.content_hash,
        last_verified_timestamp=offer.last_verified_timestamp,
        created_at=offer.created_at,
        matching_user_card_names=[],
        is_applicable_to_user=False
    )

@admin_router.get("/{offer_id}/audit-trail", response_model=List[OfferAuditLogResponse])
async def get_offer_audit_trail(
    offer_id: str,
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await OfferService.get_offer_audit_trail(db=db, offer_id=offer_id)

@admin_router.post("/sync-discovery", response_model=DiscoverySyncResponse)
async def sync_discovery(
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    stats = await DiscoveryPipeline.run_discovery_pipeline(
        db=db,
        actor_id=admin_user.id,
        actor_name=admin_user.full_name or admin_user.email
    )
    return DiscoverySyncResponse(
        discovered_count=stats["discovered_count"],
        extracted_count=stats["extracted_count"],
        pending_review_count=stats["pending_review_count"],
        reverification_triggered_count=stats["reverification_triggered_count"],
        unchanged_count=stats["unchanged_count"],
        errors=stats["errors"]
    )

# ==============================================================================
# SOURCE REGISTRY & MULTI-CHANNEL INGESTION ADMIN ENDPOINTS
# ==============================================================================

@admin_router.get("/sources", response_model=List[OfferSourceResponse])
async def list_sources(
    source_type: Optional[str] = Query(None, description="BANK, MERCHANT, NETWORK, PARTNER"),
    connector_status: Optional[str] = Query(None, description="IMPLEMENTED, PARTIALLY_IMPLEMENTED, MANUAL_ONLY, BLOCKED, ROBOTS_DISALLOWED, SOURCE_UNAVAILABLE, NOT_INTEGRATED"),
    health: Optional[str] = Query(None, description="HEALTHY, DEGRADED, FAILING, BLOCKED, UNKNOWN"),
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Lists registered Indian bank, merchant, and network offer sources with health metrics."""
    await SourceRegistryService.seed_default_sources(db)
    sources = await SourceRegistryService.list_sources(
        db=db,
        source_type=source_type,
        connector_status=connector_status,
        health=health
    )
    results = []
    for s in sources:
        try:
            methods = json.loads(s.supported_ingestion_methods_json or "[]")
        except Exception:
            methods = []
        results.append(
            OfferSourceResponse(
                id=s.id,
                source_key=s.source_key,
                source_name=s.source_name,
                domain=s.domain,
                source_type=s.source_type,
                supported_ingestion_methods=methods,
                access_permission_status=s.access_permission_status,
                connector_status=s.connector_status,
                source_health=s.source_health,
                last_successful_fetch=s.last_successful_fetch,
                last_attempted_fetch=s.last_attempted_fetch,
                last_http_status=s.last_http_status,
                last_extraction_result=s.last_extraction_result,
                failure_reason=s.failure_reason,
                consecutive_failures=s.consecutive_failures,
                rate_limit_per_minute=s.rate_limit_per_minute,
                active_offers_count=s.active_offers_count,
                notes=s.notes,
                created_at=s.created_at,
                updated_at=s.updated_at
            )
        )
    return results

@admin_router.get("/sources/{source_id}", response_model=OfferSourceResponse)
async def get_source_details(
    source_id: str,
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    source = await SourceRegistryService.get_source(db, source_id)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found.")
    try:
        methods = json.loads(source.supported_ingestion_methods_json or "[]")
    except Exception:
        methods = []
    return OfferSourceResponse(
        id=source.id,
        source_key=source.source_key,
        source_name=source.source_name,
        domain=source.domain,
        source_type=source.source_type,
        supported_ingestion_methods=methods,
        access_permission_status=source.access_permission_status,
        connector_status=source.connector_status,
        source_health=source.source_health,
        last_successful_fetch=source.last_successful_fetch,
        last_attempted_fetch=source.last_attempted_fetch,
        last_http_status=source.last_http_status,
        last_extraction_result=source.last_extraction_result,
        failure_reason=source.failure_reason,
        consecutive_failures=source.consecutive_failures,
        rate_limit_per_minute=source.rate_limit_per_minute,
        active_offers_count=source.active_offers_count,
        notes=source.notes,
        created_at=source.created_at,
        updated_at=source.updated_at
    )

@admin_router.post("/sources/{source_id}/probe", response_model=SourceHealthProbeResponse)
async def probe_source_health(
    source_id: str,
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    source = await SourceRegistryService.get_source(db, source_id)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found.")
    res = await SourceRegistryService.probe_source_health(db, source)
    return SourceHealthProbeResponse(
        source_key=res.get("source_key", source.source_key),
        http_status=res.get("http_status", 0),
        latency_ms=res.get("latency_ms"),
        health=res.get("health", source.source_health),
        waf=res.get("waf", []),
        robots_allowed=res.get("robots_allowed"),
        message=res.get("message"),
        error=res.get("error")
    )

@admin_router.post("/sources/probe-all", response_model=List[SourceHealthProbeResponse])
async def probe_all_sources(
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    await SourceRegistryService.seed_default_sources(db)
    raw_results = await SourceRegistryService.probe_all_sources(db)
    results = []
    for r in raw_results:
        results.append(
            SourceHealthProbeResponse(
                source_key=r.get("source_key", "unknown"),
                http_status=r.get("http_status", 0),
                latency_ms=r.get("latency_ms"),
                health=r.get("health", "UNKNOWN"),
                waf=r.get("waf", []),
                robots_allowed=r.get("robots_allowed"),
                message=r.get("message"),
                error=r.get("error")
            )
        )
    return results

@admin_router.get("/failures", response_model=List[SourceFailureLogResponse])
async def list_source_failures(
    limit: int = Query(50, ge=1, le=200),
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Lists ingestion failures across WAF blocks, timeouts, and robots.txt disallows."""
    failures = await SourceRegistryService.get_recent_failures(db, limit=limit)
    return [SourceFailureLogResponse.model_validate(f) for f in failures]

@admin_router.post("/upload-circular", response_model=AdminOfferDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_official_circular(
    file: UploadFile = File(...),
    source_id: Optional[str] = Query(None, description="Optional OfferSource UUID"),
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Channel D: Ingests official PDF bank or merchant circulars.
    Validates PDF format, prevents duplicate documents, extracts structured offers,
    and stages all discovered promotions into PENDING_REVIEW.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only official PDF circulars (.pdf) are supported.")

    file_bytes = await file.read()
    channel = AdminDocumentIngestionChannel()
    result = await channel.ingest(
        db=db,
        source_id=source_id,
        raw_payload={"filename": file.filename, "bytes": file_bytes, "mime_type": file.content_type or "application/pdf"},
        actor_id=admin_user.id,
        actor_name=admin_user.full_name or admin_user.email,
        actor_role="ADMIN"
    )

    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="; ".join(result.errors) or "Failed to ingest circular document."
        )

    # Stage items into PENDING_REVIEW via OfferIngestionEngine
    if result.items:
        await OfferIngestionEngine.process_and_stage_payloads(
            db=db,
            payloads=result.items,
            channel_name="ADMIN_DOCUMENT",
            source_id=source_id,
            actor_id=admin_user.id,
            actor_name=admin_user.full_name or admin_user.email,
            actor_role="ADMIN"
        )

    doc_id = result.telemetry.get("document_id")
    doc_record = (await db.execute(select(AdminOfferDocument).where(AdminOfferDocument.id == doc_id))).scalar_one()
    return AdminOfferDocumentResponse.model_validate(doc_record)

@admin_router.get("/documents", response_model=List[AdminOfferDocumentResponse])
async def list_admin_documents(
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Lists uploaded official circular documents with extraction status."""
    stmt = select(AdminOfferDocument).order_by(desc(AdminOfferDocument.uploaded_at))
    docs = (await db.execute(stmt)).scalars().all()
    return [AdminOfferDocumentResponse.model_validate(d) for d in docs]

@admin_router.post("/partner-feed", response_model=DiscoverySyncResponse)
async def ingest_partner_feed(
    req: PartnerFeedIngestRequest,
    x_partner_signature: Optional[str] = Header(None, alias="X-Partner-Signature"),
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Channel C: Ingests structured JSON partner feed from authorized partner network.
    All incoming offers are staged into PENDING_REVIEW pending human verification.
    """
    channel = PartnerFeedIngestionChannel()
    ingest_res = await channel.ingest(
        db=db,
        raw_payload={"offers": [o.model_dump() for o in req.offers]},
        actor_id=admin_user.id,
        actor_name=f"Partner API ({req.partner_id})",
        actor_role="SYSTEM"
    )

    if not ingest_res.success and not ingest_res.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="; ".join(ingest_res.errors))

    engine_res = await OfferIngestionEngine.process_and_stage_payloads(
        db=db,
        payloads=ingest_res.items,
        channel_name="AUTHORIZED_API",
        source_id=ingest_res.source_id,
        actor_id=admin_user.id,
        actor_name=admin_user.full_name or admin_user.email,
        actor_role="ADMIN"
    )

    return DiscoverySyncResponse(
        discovered_count=len(ingest_res.items),
        extracted_count=len(ingest_res.items),
        pending_review_count=engine_res.staged_count,
        reverification_triggered_count=engine_res.quarantined_count,
        unchanged_count=engine_res.unchanged_count,
        errors=engine_res.errors + ingest_res.errors
    )

@admin_router.post("/manual", response_model=CardOfferResponse, status_code=status.HTTP_201_CREATED)
async def create_manual_offer(
    req: ManualOfferCreateRequest,
    admin_user: Profile = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Channel E: Admin-entered offers with mandatory source URL and verbatim evidence snippet.
    Staged as PENDING_REVIEW for audit compliance.
    """
    channel = AdminManualIngestionChannel()
    res = await channel.ingest(
        db=db,
        source_id=req.source_id,
        raw_payload=req.model_dump(),
        actor_id=admin_user.id,
        actor_name=admin_user.full_name or admin_user.email,
        actor_role="ADMIN"
    )

    if not res.success or not res.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="; ".join(res.errors))

    engine_res = await OfferIngestionEngine.process_and_stage_payloads(
        db=db,
        payloads=res.items,
        channel_name="MANUAL_ENTRY",
        source_id=req.source_id,
        actor_id=admin_user.id,
        actor_name=admin_user.full_name or admin_user.email,
        actor_role="ADMIN"
    )

    # Find the created or updated offer
    canonical = res.items[0]
    stmt = select(CardOffer).where(
        CardOffer.merchant_name == canonical.merchant_name,
        CardOffer.offer_title == canonical.offer_title
    ).order_by(desc(CardOffer.created_at))
    created = (await db.execute(stmt)).scalars().first()

    if not created:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve staged manual offer.")

    try:
        card_names = json.loads(created.eligible_card_names_json or "[]")
    except Exception:
        card_names = []

    return CardOfferResponse(
        id=created.id,
        merchant_name=created.merchant_name,
        offer_title=created.offer_title,
        category_id=created.category_id,
        discount_type=created.discount_type,
        discount_value=created.discount_value,
        min_transaction_value=created.min_transaction_value,
        max_discount_amount=created.max_discount_amount,
        eligible_bank=created.eligible_bank,
        eligible_network=created.eligible_network,
        eligible_card_names=card_names,
        valid_from=created.valid_from,
        valid_to=created.valid_to,
        payment_channel=created.payment_channel,
        promo_code=created.promo_code,
        activation_requirement=created.activation_requirement,
        terms_and_conditions=created.terms_and_conditions,
        source_url=created.source_url,
        source_name=created.source_name,
        source_evidence=created.source_evidence,
        extraction_confidence=created.extraction_confidence,
        verification_status=created.verification_status,
        freshness_state=created.freshness_state,
        source_id=created.source_id,
        ingestion_channel=created.ingestion_channel,
        source_document_id=created.source_document_id,
        version=created.version,
        previous_version_json=created.previous_version_json,
        rejection_reason=created.rejection_reason,
        reviewed_by_name=created.reviewed_by_name,
        reviewed_at=created.reviewed_at,
        content_hash=created.content_hash,
        last_verified_timestamp=created.last_verified_timestamp,
        created_at=created.created_at,
        matching_user_card_names=[],
        is_applicable_to_user=False
    )


