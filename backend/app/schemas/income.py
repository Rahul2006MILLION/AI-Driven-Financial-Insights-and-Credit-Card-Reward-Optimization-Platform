from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class IncomeCreate(BaseModel):
    source_name: str = Field(..., min_length=1, max_length=128, description="Income source name e.g. Salary, Freelance, Business, Stipend")
    amount: Decimal = Field(..., gt=Decimal("0.00"), description="Income amount")
    currency: str = Field("INR", max_length=10)
    frequency: str = Field("MONTHLY", pattern="^(MONTHLY|BI_WEEKLY|WEEKLY|IRREGULAR|ONE_TIME)$")
    is_irregular: bool = Field(False, description="True if this income stream is variable or irregular")
    received_date: Optional[datetime] = Field(None, description="Date income was received or expected")
    expected_date: Optional[datetime] = Field(None, description="Next expected recurrence date if applicable")
    notes: Optional[str] = None

class IncomeUpdate(BaseModel):
    source_name: Optional[str] = Field(None, min_length=1, max_length=128)
    amount: Optional[Decimal] = Field(None, gt=Decimal("0.00"))
    currency: Optional[str] = Field(None, max_length=10)
    frequency: Optional[str] = Field(None, pattern="^(MONTHLY|BI_WEEKLY|WEEKLY|IRREGULAR|ONE_TIME)$")
    is_irregular: Optional[bool] = None
    received_date: Optional[datetime] = None
    expected_date: Optional[datetime] = None
    notes: Optional[str] = None

class IncomeResponse(BaseModel):
    id: str
    user_id: str
    source_name: str
    amount: Decimal
    currency: str
    frequency: str
    is_irregular: bool
    received_date: datetime
    expected_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class IncomeSourceBreakdown(BaseModel):
    source_name: str
    amount: Decimal
    frequency: str
    is_irregular: bool
    monthly_equivalent: Decimal
    percentage_of_total: Decimal

class IncomeSummaryResponse(BaseModel):
    total_monthly_income: Decimal
    regular_income: Decimal
    irregular_income: Decimal
    rolling_90d_median_monthly_income: Optional[Decimal] = None
    income_sources_count: int
    sources: List[IncomeSourceBreakdown]
    has_income_data: bool
    data_sufficiency_explanation: str

