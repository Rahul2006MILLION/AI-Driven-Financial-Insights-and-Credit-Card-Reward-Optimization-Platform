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
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    credit_cards: Mapped[List["CreditCard"]] = relationship("CreditCard", back_populates="user", cascade="all, delete-orphan")
    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    documents: Mapped[List["UploadedDocument"]] = relationship("UploadedDocument", back_populates="user", cascade="all, delete-orphan")
    preferences: Mapped[Optional["UserPreference"]] = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")

class CreditCard(Base):
    __tablename__ = "credit_cards"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    card_name: Mapped[str] = mapped_column(String(128), nullable=False)
    bank_name: Mapped[str] = mapped_column(String(128), nullable=False)
    network: Mapped[str] = mapped_column(String(32), default="VISA", nullable=False)  # VISA, MASTERCARD, AMEX, RUPAY, DINERS
    card_type: Mapped[str] = mapped_column(String(32), default="CREDIT", nullable=False)
    last_four_digits: Mapped[Optional[str]] = mapped_column(String(4), nullable=True)
    annual_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    renewal_waiver_spend: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    billing_cycle_day: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
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
    benefit_type: Mapped[str] = mapped_column(String(64), nullable=False)  # LOUNGE_ACCESS, GOLF, INSURANCE, MILESTONE, CONCIERGE
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    annual_value_estimate: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    card: Mapped["CreditCard"] = relationship("CreditCard", back_populates="benefits")

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
