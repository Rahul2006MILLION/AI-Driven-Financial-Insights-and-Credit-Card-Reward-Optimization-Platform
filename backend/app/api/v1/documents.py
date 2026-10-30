from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
import os
import uuid
import json
from datetime import datetime
from pathlib import Path
from decimal import Decimal

from app.core.database import get_db
from app.models.entities import (
    Profile,
    UploadedDocument,
    ExtractedCardData,
    CreditCard,
    CardRewardRule,
    CardBenefit,
    AuditLog,
)
from app.schemas.document import (
    DocumentResponse,
    ExtractedDataResponse,
    VerifyDocumentRequest,
)
from app.security.dependencies import get_current_user
from app.services.document_intelligence.parser import DocumentParserService
from app.core.config import settings

router = APIRouter(prefix="/documents", tags=["Document Intelligence"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Validate file extension and MIME type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF documents (.pdf) are supported."
        )

    # 2. Read content & validate file size
    contents = await file.read()
    file_size = len(contents)
    if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB."
        )

    # 3. Magic bytes validation for PDF (%PDF-)
    if not contents.startswith(b"%PDF"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. File does not contain valid PDF headers."
        )

    # 4. Save to safe isolated location with random UUID filename
    safe_filename = f"{uuid.uuid4().hex}.pdf"
    file_path = UPLOAD_DIR / safe_filename
    with open(file_path, "wb") as f:
        f.write(contents)

    doc = UploadedDocument(
        user_id=current_user.id,
        filename=file.filename,
        file_path=str(file_path),
        mime_type="application/pdf",
        file_size_bytes=file_size,
        processing_status="PROCESSING"
    )
    db.add(doc)
    await db.flush()

    # 5. Extract structured rules using Document Intelligence
    try:
        parsed = DocumentParserService.parse_card_document(str(file_path), file.filename)
        staged = ExtractedCardData(
            document_id=doc.id,
            user_id=current_user.id,
            extracted_card_name=parsed.get("card_name"),
            extracted_bank_name=parsed.get("bank_name"),
            extracted_network=parsed.get("network", "VISA"),
            extracted_annual_fee=parsed.get("annual_fee", Decimal("0.00")),
            extracted_rules_json=json.dumps(parsed.get("rules", []), default=str),
            extracted_benefits_json=json.dumps(parsed.get("benefits", []), default=str),
            confidence_score=parsed.get("confidence_score", Decimal("0.85")),
            is_verified=False
        )
        db.add(staged)
        doc.processing_status = "EXTRACTED"
    except Exception as e:
        doc.processing_status = "FAILED"
        doc.error_message = f"Failed to extract card intelligence: {str(e)}"

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="DOCUMENT_UPLOADED",
        status="SUCCESS" if doc.processing_status != "FAILED" else "FAILURE",
        details_json=f'{{"filename": "{file.filename}", "status": "{doc.processing_status}"}}'
    )
    db.add(audit)

    await db.commit()

    # Reload
    stmt = (
        select(UploadedDocument)
        .where(UploadedDocument.id == doc.id)
        .options(selectinload(UploadedDocument.extracted_data))
    )
    fresh_doc = (await db.execute(stmt)).scalar_one()
    return cls_to_document_response(fresh_doc)

@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(UploadedDocument)
        .where(UploadedDocument.user_id == current_user.id)
        .options(selectinload(UploadedDocument.extracted_data))
        .order_by(UploadedDocument.uploaded_at.desc())
    )
    docs = (await db.execute(stmt)).scalars().all()
    return [cls_to_document_response(d) for d in docs]

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(UploadedDocument)
        .where(UploadedDocument.id == document_id, UploadedDocument.user_id == current_user.id)
        .options(selectinload(UploadedDocument.extracted_data))
    )
    doc = (await db.execute(stmt)).scalar_one_or_none()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or unauthorized access."
        )
    return cls_to_document_response(doc)

@router.post("/{document_id}/verify", status_code=status.HTTP_200_OK)
async def verify_and_activate_card(
    document_id: str,
    req: VerifyDocumentRequest,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(UploadedDocument)
        .where(UploadedDocument.id == document_id, UploadedDocument.user_id == current_user.id)
        .options(selectinload(UploadedDocument.extracted_data))
    )
    doc = (await db.execute(stmt)).scalar_one_or_none()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or unauthorized access."
        )

    # Create active credit card from verified data
    card = CreditCard(
        user_id=current_user.id,
        card_name=req.card_name.strip(),
        bank_name=req.bank_name.strip(),
        network=req.network,
        card_type="CREDIT",
        annual_fee=req.annual_fee,
        is_active=True
    )
    db.add(card)
    await db.flush()

    for r in req.rules:
        rule_entity = CardRewardRule(
            card_id=card.id,
            category_id=r.category_id,
            merchant_pattern=r.merchant_pattern,
            reward_type=r.reward_type,
            reward_rate_percentage=r.reward_rate_percentage,
            point_monetary_value=r.point_monetary_value,
            min_transaction_amount=r.min_transaction_amount,
            monthly_cap_amount=r.monthly_cap_amount,
            is_excluded=r.is_excluded,
            exclusion_reason=r.exclusion_reason
        )
        db.add(rule_entity)

    for b in req.benefits:
        ben_entity = CardBenefit(
            card_id=card.id,
            benefit_type=b.benefit_type,
            title=b.title,
            description=b.description,
            annual_value_estimate=b.annual_value_estimate
        )
        db.add(ben_entity)

    if doc.extracted_data:
        doc.extracted_data.is_verified = True
        doc.extracted_data.verified_at = datetime.utcnow()
    doc.processing_status = "VERIFIED"

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="DOCUMENT_VERIFIED_AND_CARD_ACTIVATED",
        status="SUCCESS",
        details_json=f'{{"document_id": "{document_id}", "card_id": "{card.id}", "card_name": "{card.card_name}"}}'
    )
    db.add(audit)

    await db.commit()
    return {
        "status": "SUCCESS",
        "message": f"Card '{card.card_name}' successfully verified and activated into your portfolio.",
        "card_id": card.id
    }

def cls_to_document_response(doc: UploadedDocument) -> DocumentResponse:
    ext_resp = None
    if doc.extracted_data:
        try:
            rules_raw = json.loads(doc.extracted_data.extracted_rules_json)
        except Exception:
            rules_raw = []
        try:
            bens_raw = json.loads(doc.extracted_data.extracted_benefits_json or "[]")
        except Exception:
            bens_raw = []

        ext_resp = ExtractedDataResponse(
            id=doc.extracted_data.id,
            document_id=doc.id,
            extracted_card_name=doc.extracted_data.extracted_card_name,
            extracted_bank_name=doc.extracted_data.extracted_bank_name,
            extracted_network=doc.extracted_data.extracted_network,
            extracted_annual_fee=doc.extracted_data.extracted_annual_fee,
            rules=rules_raw,
            benefits=bens_raw,
            confidence_score=doc.extracted_data.confidence_score,
            is_verified=doc.extracted_data.is_verified,
            verified_at=doc.extracted_data.verified_at
        )

    return DocumentResponse(
        id=doc.id,
        user_id=doc.user_id,
        filename=doc.filename,
        mime_type=doc.mime_type,
        file_size_bytes=doc.file_size_bytes,
        processing_status=doc.processing_status,
        error_message=doc.error_message,
        uploaded_at=doc.uploaded_at,
        extracted_data=ext_resp
    )
