import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import (
    String, Boolean, Integer, Numeric, Text, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    preferred_language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    role: Mapped[str] = mapped_column(String(32), default="USER", nullable=False)  # USER, ADMIN
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    credit_cards: Mapped[List["CreditCard"]] = relationship("CreditCard", back_populates="user", cascade="all, delete-orphan")
    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    documents: Mapped[List["UploadedDocument"]] = relationship("UploadedDocument", back_populates="user", cascade="all, delete-orphan")
    preferences: Mapped[Optional["UserPreference"]] = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    ai_consent: Mapped[Optional["UserAiConsent"]] = relationship("UserAiConsent", back_populates="user", uselist=False, cascade="all, delete-orphan")
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")

class CreditCard(Base):
    __tablename__ = "credit_cards"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    card_name: Mapped[str] = mapped_column(String(128), nullable=False)
    bank_name: Mapped[str] = mapped_column(String(128), nullable=False)
    network: Mapped[str] = mapped_column(String(32), default="VISA", nullable=False)  # VISA, MASTERCARD, AMEX, RUPAY, DINERS
    card_type: Mapped[str] = mapped_column(String(32), default="CREDIT", nullable=False)
    card_variant: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # e.g. Metal, Signature, Platinum, Select
    last_four_digits: Mapped[Optional[str]] = mapped_column(String(4), nullable=True)
    joining_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    annual_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    renewal_waiver_spend: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    fee_waiver_condition_details: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    renewal_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    billing_cycle_day: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    terms_source_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user: Mapped["Profile"] = relationship("Profile", back_populates="credit_cards")
    reward_rules: Mapped[List["CardRewardRule"]] = relationship("CardRewardRule", back_populates="card", cascade="all, delete-orphan")
    benefits: Mapped[List["CardBenefit"]] = relationship("CardBenefit", back_populates="card", cascade="all, delete-orphan")
    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="card")

class CardRewardRule(Base):
    __tablename__ = "card_reward_rules"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    card_id: Mapped[str] = mapped_column(String(36), ForeignKey("credit_cards.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)  # 'dining', 'travel', 'grocery', 'all', etc.
    merchant_pattern: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)  # Regex or substring e.g. 'Amazon', 'Swiggy'
    reward_type: Mapped[str] = mapped_column(String(32), default="CASHBACK", nullable=False)  # CASHBACK, REWARD_POINTS, MILES
    reward_rate_percentage: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)  # 5.00 = 5%
    point_monetary_value: Mapped[Decimal] = mapped_column(Numeric(6, 4), default=Decimal("1.0000"), nullable=False)  # 0.25 per point
    min_transaction_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    max_reward_per_transaction: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    monthly_cap_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    is_excluded: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    exclusion_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    card: Mapped["CreditCard"] = relationship("CreditCard", back_populates="reward_rules")

class CardBenefit(Base):
    __tablename__ = "card_benefits"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    card_id: Mapped[str] = mapped_column(String(36), ForeignKey("credit_cards.id", ondelete="CASCADE"), nullable=False, index=True)
    benefit_type: Mapped[str] = mapped_column(String(64), nullable=False)  # PERMANENT, PROMOTIONAL, MERCHANT_SPECIFIC, NETWORK_SPECIFIC, LOUNGE_ACCESS, INSURANCE, GOLF, MILESTONE
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    applicable_category: Mapped[str] = mapped_column(String(64), default="all", nullable=False)  # shopping_online, shopping_offline, dining, food_delivery, travel, flights, hotels, fuel, entertainment, grocery, utility, international, all
    reward_percentage_or_points: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 2), nullable=True)
    reward_basis: Mapped[str] = mapped_column(String(32), default="COMPLIMENTARY", nullable=False)  # PERCENTAGE, FIXED_POINTS_PER_100, CASHBACK_FIXED, COMPLIMENTARY
    max_reward: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    min_transaction_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    cap_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    cap_period: Mapped[str] = mapped_column(String(32), default="NONE", nullable=False)  # MONTHLY, ANNUAL, PER_TRANSACTION, NONE
    eligibility_restrictions: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    valid_from: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    valid_to: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    terms_and_conditions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_reference: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    last_verified_date: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow, nullable=True)
    annual_value_estimate: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    card: Mapped["CreditCard"] = relationship("CreditCard", back_populates="benefits")

class OfferSource(Base):
    __tablename__ = "offer_sources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    source_key: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    source_name: Mapped[str] = mapped_column(String(128), nullable=False)
    domain: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    source_type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)  # BANK, MERCHANT, NETWORK, PARTNER
    supported_ingestion_methods_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)  # JSON array
    access_permission_status: Mapped[str] = mapped_column(String(64), nullable=False)  # PUBLIC_PERMITTED, ROBOTS_RESTRICTED, BLOCKED_WAF, AUTHORIZED_PARTNER, MANUAL_ONLY, SPA_CLIENT_SIDE
    connector_status: Mapped[str] = mapped_column(String(64), default="NOT_INTEGRATED", nullable=False, index=True)  # IMPLEMENTED, PARTIALLY_IMPLEMENTED, MANUAL_ONLY, BLOCKED, ROBOTS_DISALLOWED, SOURCE_UNAVAILABLE, NOT_INTEGRATED
    source_health: Mapped[str] = mapped_column(String(32), default="UNKNOWN", nullable=False)  # HEALTHY, DEGRADED, FAILING, BLOCKED, UNKNOWN
    last_successful_fetch: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    last_attempted_fetch: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    last_http_status: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    last_extraction_result: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    failure_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    consecutive_failures: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    rate_limit_per_minute: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    active_offers_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    offers: Mapped[List["CardOffer"]] = relationship("CardOffer", back_populates="source")
    failure_logs: Mapped[List["SourceFailureLog"]] = relationship("SourceFailureLog", back_populates="source", cascade="all, delete-orphan")
    documents: Mapped[List["AdminOfferDocument"]] = relationship("AdminOfferDocument", back_populates="source")

class AdminOfferDocument(Base):
    __tablename__ = "admin_offer_documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    source_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("offer_sources.id", ondelete="SET NULL"), nullable=True, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(64), default="application/pdf", nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    sha256_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    uploaded_by_id: Mapped[str] = mapped_column(String(36), nullable=False)
    uploaded_by_name: Mapped[str] = mapped_column(String(128), nullable=False)
    processing_status: Mapped[str] = mapped_column(String(32), default="PROCESSING", nullable=False)  # PENDING, PROCESSING, EXTRACTED, FAILED
    extracted_offers_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    ocr_supported: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    raw_text_sample: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    source: Mapped[Optional["OfferSource"]] = relationship("OfferSource", back_populates="documents")
    offers: Mapped[List["CardOffer"]] = relationship("CardOffer", back_populates="source_document")

class SourceFailureLog(Base):
    __tablename__ = "source_failure_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    source_id: Mapped[str] = mapped_column(String(36), ForeignKey("offer_sources.id", ondelete="CASCADE"), nullable=False, index=True)
    http_status: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    error_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)  # WAF_BLOCKED, ROBOTS_DISALLOWED, TIMEOUT, PARSE_ERROR, 404_NOT_FOUND, RATE_LIMITED
    error_message: Mapped[str] = mapped_column(Text, nullable=False)
    attempt_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    retry_after_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    context_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    source: Mapped["OfferSource"] = relationship("OfferSource", back_populates="failure_logs")

class CardOffer(Base):
    __tablename__ = "card_offers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    source_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("offer_sources.id", ondelete="SET NULL"), nullable=True, index=True)
    ingestion_channel: Mapped[str] = mapped_column(String(32), default="MANUAL_ENTRY", nullable=False)  # HTML_EXTRACTION, PDF_CIRCULAR, AUTHORIZED_API, ADMIN_DOCUMENT, MANUAL_ENTRY
    source_document_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("admin_offer_documents.id", ondelete="SET NULL"), nullable=True, index=True)
    merchant_name: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    offer_title: Mapped[str] = mapped_column(String(255), nullable=False)
    category_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)  # food_delivery, dining, shopping, travel, entertainment, grocery, utility
    discount_type: Mapped[str] = mapped_column(String(32), default="PERCENTAGE", nullable=False)  # PERCENTAGE, FLAT_AMOUNT
    discount_value: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)  # e.g. 15.00 for 15% or 150.00 for ₹150
    min_transaction_value: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    max_discount_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)  # e.g. 200.00
    eligible_bank: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, index=True)  # e.g. "HDFC Bank", "ICICI Bank" or None for all
    eligible_network: Mapped[Optional[str]] = mapped_column(String(32), nullable=True, index=True)  # VISA, MASTERCARD, RUPAY, AMEX or None
    eligible_card_names_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)  # JSON array of specific card names e.g. ["Millennia", "Regalia"] or [] for all bank cards
    valid_from: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    valid_to: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    payment_channel: Mapped[str] = mapped_column(String(32), default="ONLINE", nullable=False)  # ONLINE, OFFLINE, BOTH
    promo_code: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    activation_requirement: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # e.g. "Apply coupon code at checkout"
    terms_and_conditions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    source_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)  # e.g. "HDFC SmartBuy", "Swiggy Offers"
    source_evidence: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Verbatim snippet extracted from source
    extraction_confidence: Mapped[Decimal] = mapped_column(Numeric(4, 2), default=Decimal("0.85"), nullable=False)
    verification_status: Mapped[str] = mapped_column(String(32), default="PENDING_REVIEW", nullable=False)  # DISCOVERED, PENDING_REVIEW, VERIFIED, REJECTED, EXPIRED, NEEDS_REVERIFICATION, SOURCE_UNAVAILABLE
    freshness_state: Mapped[str] = mapped_column(String(32), default="FRESH", nullable=False)  # FRESH, EXPIRING_SOON, STALE, EXPIRED, QUARANTINED, UNAVAILABLE
    content_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)  # Hash of canonical terms
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    previous_version_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Prior approved version for diff review
    rejection_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    reviewed_by_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    reviewed_by_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    last_verified_timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    change_history_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    source: Mapped[Optional["OfferSource"]] = relationship("OfferSource", back_populates="offers")
    source_document: Mapped[Optional["AdminOfferDocument"]] = relationship("AdminOfferDocument", back_populates="offers")
    audit_logs: Mapped[List["OfferAuditLog"]] = relationship("OfferAuditLog", back_populates="offer", cascade="all, delete-orphan")

class OfferAuditLog(Base):
    __tablename__ = "offer_audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    offer_id: Mapped[str] = mapped_column(String(36), ForeignKey("card_offers.id", ondelete="CASCADE"), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(64), nullable=False, index=True)  # DISCOVERED, EXTRACTED, SUBMITTED_FOR_REVIEW, APPROVED, REJECTED, EDITED, REVERIFICATION_TRIGGERED, EXPIRED, SOURCE_UNAVAILABLE
    actor_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    actor_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    actor_role: Mapped[str] = mapped_column(String(32), default="SYSTEM", nullable=False)  # SYSTEM, ADMIN
    from_status: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    to_status: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    snapshot_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    offer: Mapped["CardOffer"] = relationship("CardOffer", back_populates="audit_logs")

class SpendingCategory(Base):
    __tablename__ = "spending_categories"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)  # 'dining', 'grocery', 'shopping', 'travel', etc.
    display_name_en: Mapped[str] = mapped_column(String(128), nullable=False)
    display_name_hi: Mapped[str] = mapped_column(String(128), nullable=False)
    display_name_kn: Mapped[str] = mapped_column(String(128), nullable=False)
    icon_name: Mapped[str] = mapped_column(String(64), default="Tag", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    card_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("credit_cards.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id: Mapped[str] = mapped_column(String(64), ForeignKey("spending_categories.id"), nullable=False, index=True)
    merchant_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    transaction_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    reward_earned_monetary: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    potential_optimal_reward: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    optimal_card_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user: Mapped["Profile"] = relationship("Profile", back_populates="transactions")
    card: Mapped[Optional["CreditCard"]] = relationship("CreditCard", back_populates="transactions")

class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(64), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    processing_status: Mapped[str] = mapped_column(String(32), default="PENDING", nullable=False)  # PENDING, PROCESSING, EXTRACTED, VERIFIED, FAILED
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user: Mapped["Profile"] = relationship("Profile", back_populates="documents")
    extracted_data: Mapped[Optional["ExtractedCardData"]] = relationship("ExtractedCardData", back_populates="document", uselist=False, cascade="all, delete-orphan")

class ExtractedCardData(Base):
    __tablename__ = "extracted_card_data"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("uploaded_documents.id", ondelete="CASCADE"), unique=True, nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    extracted_card_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    extracted_bank_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    extracted_network: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    extracted_annual_fee: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    extracted_rules_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    extracted_benefits_json: Mapped[Optional[str]] = mapped_column(Text, default="[]", nullable=True)
    confidence_score: Mapped[Decimal] = mapped_column(Numeric(4, 2), default=Decimal("0.85"), nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    document: Mapped["UploadedDocument"] = relationship("UploadedDocument", back_populates="extracted_data")

class RewardAnalysis(Base):
    __tablename__ = "reward_analysis"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    transaction_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    category_id: Mapped[str] = mapped_column(String(64), nullable=False)
    merchant_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    recommended_card_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    recommended_card_name: Mapped[str] = mapped_column(String(128), nullable=False)
    expected_monetary_reward: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    effective_reward_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    calculation_breakdown_json: Mapped[str] = mapped_column(Text, nullable=False)
    alternatives_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    queried_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    prioritize_cashback: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    prioritize_miles: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    include_annual_fee_in_net: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    monthly_spend_target: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user: Mapped["Profile"] = relationship("Profile", back_populates="preferences")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(128), nullable=False, index=True)  # LOGIN, CARD_ADDED, OPTIMIZATION_RUN, etc.
    ip_address: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="SUCCESS", nullable=False)  # SUCCESS, FAILURE, WARNING
    details_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user: Mapped[Optional["Profile"]] = relationship("Profile", back_populates="audit_logs")


class UserAiConsent(Base):
    __tablename__ = "user_ai_consents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    external_ai_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)  # Privacy by default: disabled until explicitly enabled
    allow_card_context: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    allow_spending_context: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    provider_preference: Mapped[str] = mapped_column(String(32), default="gemini", nullable=False)
    consent_version: Mapped[str] = mapped_column(String(16), default="1.0", nullable=False)
    consent_timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    purpose_description: Mapped[Optional[str]] = mapped_column(String(255), default="Conversational financial assistant and card rewards explanation", nullable=True)

    user: Mapped["Profile"] = relationship("Profile", back_populates="ai_consent")


class AiRequestAuditLog(Base):
    __tablename__ = "ai_request_audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    request_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    task_type: Mapped[str] = mapped_column(String(64), nullable=False)  # FINANCIAL_EDUCATION, CARD_RECOMMENDATION_EXPLANATION, etc.
    data_classification: Mapped[str] = mapped_column(String(32), nullable=False)  # PUBLIC, INTERNAL, SENSITIVE, HIGHLY_SENSITIVE
    provider: Mapped[str] = mapped_column(String(32), nullable=False)  # gemini, mock, local
    model_name: Mapped[str] = mapped_column(String(64), nullable=False)
    consent_status: Mapped[str] = mapped_column(String(32), nullable=False)  # GRANTED, DENIED, WITHDRAWN, LOCAL_FALLBACK, NOT_REQUIRED
    redaction_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    redacted_types_json: Mapped[str] = mapped_column(String(255), default="[]", nullable=False)
    prompt_tokens: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    completion_tokens: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    latency_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="SUCCESS", nullable=False)  # SUCCESS, LOCAL_FALLBACK, REJECTED, ERROR
    rejection_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)

