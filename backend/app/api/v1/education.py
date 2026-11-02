from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from decimal import Decimal, ROUND_HALF_UP
import uuid
import json

from app.core.database import get_db
from app.models.entities import (
    Profile,
    UserBudget,
    UserLearningProgress,
    UserPreference,
    Transaction,
    CreditCard
)
from app.schemas.education import (
    LessonModuleSummary,
    LessonModuleDetail,
    CategorySummary,
    UserLearningProgressUpdate,
    UserLearningProgressResponse,
    InterestCalcRequest,
    InterestCalcResponse,
    MinimumPaymentCalcRequest,
    MinimumPaymentCalcResponse,
    BudgetPlannerRequest,
    BudgetPlannerResponse,
    CreditUtilizationRequest,
    CreditUtilizationResponse,
    CardBreakEvenRequest,
    CardBreakEvenResponse,
    FinancialPathUpdateRequest,
    FinancialPathResponse,
    UserBudgetUpsertRequest,
    UserBudgetResponse
)
from app.security.dependencies import get_current_user, security
from app.security.jwt import decode_access_token
from app.services.education.curriculum import CurriculumService, LESSONS_DATA, CATEGORIES_DATA
from app.services.education.calculators import EducationCalculators

router = APIRouter(prefix="/education", tags=["Financial Inclusion & CLIQ Learn"])

async def get_optional_user(
    credentials=Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Optional[Profile]:
    if not credentials or not credentials.credentials:
        return None
    try:
        payload = decode_access_token(credentials.credentials)
        if not payload or not payload.get("sub"):
            return None
        stmt = select(Profile).where(Profile.id == payload.get("sub"), Profile.is_active == True)
        res = await db.execute(stmt)
        return res.scalar_one_or_none()
    except Exception:
        return None

# --- 1. CURRICULUM MODULES & CATEGORIES ---

@router.get("/categories", response_model=List[CategorySummary])
async def list_categories(
    lang: str = Query("en", pattern="^(en|hi|kn)$"),
    user: Optional[Profile] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    categories = CurriculumService.get_categories(lang=lang)
    completed_map: Dict[str, int] = {}

    if user:
        stmt = select(UserLearningProgress.category_id, func.count(UserLearningProgress.id))\
            .where(UserLearningProgress.user_id == user.id, UserLearningProgress.is_completed == True)\
            .group_by(UserLearningProgress.category_id)
        rows = (await db.execute(stmt)).all()
        for cat_id, cnt in rows:
            completed_map[cat_id] = cnt

    res = []
    for c in categories:
        res.append(CategorySummary(
            id=c["id"],
            title=c["title"],
            description=c["description"],
            icon=c["icon"],
            total_lessons=c["total_lessons"],
            completed_lessons=completed_map.get(c["id"], 0)
        ))
    return res

@router.get("/modules", response_model=List[LessonModuleSummary])
async def list_modules(
    category_id: Optional[str] = None,
    lang: str = Query("en", pattern="^(en|hi|kn)$"),
    user: Optional[Profile] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    modules = CurriculumService.get_modules(category_id=category_id, lang=lang)
    completed_topics: Dict[str, Optional[int]] = {}

    if user:
        stmt = select(UserLearningProgress).where(
            UserLearningProgress.user_id == user.id,
            UserLearningProgress.is_completed == True
        )
        records = (await db.execute(stmt)).scalars().all()
        for r in records:
            completed_topics[r.topic_id] = r.quiz_score

    res = []
    for m in modules:
        tid = m["id"]
        res.append(LessonModuleSummary(
            id=tid,
            category_id=m["category_id"],
            order=m["order"],
            reading_time_minutes=m["reading_time_minutes"],
            title=m["title"],
            summary=m["summary"],
            is_completed=(tid in completed_topics),
            quiz_score=completed_topics.get(tid)
        ))
    return res

@router.get("/modules/{topic_id}", response_model=LessonModuleDetail)
async def get_module_detail(
    topic_id: str,
    lang: str = Query("en", pattern="^(en|hi|kn)$"),
    user: Optional[Profile] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    detail = CurriculumService.get_module_detail(topic_id=topic_id, lang=lang)
    if not detail:
        raise HTTPException(status_code=404, detail="Educational module not found")

    is_completed = False
    quiz_score = None

    if user:
        stmt = select(UserLearningProgress).where(
            UserLearningProgress.user_id == user.id,
            UserLearningProgress.topic_id == topic_id
        )
        rec = (await db.execute(stmt)).scalar_one_or_none()
        if rec:
            is_completed = rec.is_completed
            quiz_score = rec.quiz_score

    return LessonModuleDetail(
        id=detail["id"],
        category_id=detail["category_id"],
        order=detail["order"],
        reading_time_minutes=detail["reading_time_minutes"],
        title=detail["title"],
        summary=detail["summary"],
        content_markdown=detail["content_markdown"],
        key_takeaways=detail["key_takeaways"],
        quiz=detail["quiz"],
        is_completed=is_completed,
        quiz_score=quiz_score
    )

# --- 2. LEARNING PROGRESS TRACKING ---

@router.post("/progress/{topic_id}")
async def update_module_progress(
    topic_id: str,
    data: UserLearningProgressUpdate,
    user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify topic exists
    topic_meta = next((m for m in LESSONS_DATA if m["id"] == topic_id), None)
    if not topic_meta:
        raise HTTPException(status_code=404, detail="Topic not recognized")

    stmt = select(UserLearningProgress).where(
        UserLearningProgress.user_id == user.id,
        UserLearningProgress.topic_id == topic_id
    )
    progress_rec = (await db.execute(stmt)).scalar_one_or_none()

    if not progress_rec:
        progress_rec = UserLearningProgress(
            id=str(uuid.uuid4()),
            user_id=user.id,
            topic_id=topic_id,
            category_id=topic_meta["category_id"],
            is_completed=data.is_completed,
            quiz_score=data.quiz_score,
            notes=data.notes,
            completed_at=datetime.utcnow() if data.is_completed else None
        )
        db.add(progress_rec)
    else:
        progress_rec.is_completed = data.is_completed
        if data.quiz_score is not None:
            progress_rec.quiz_score = data.quiz_score
        if data.notes is not None:
            progress_rec.notes = data.notes
        if data.is_completed and not progress_rec.completed_at:
            progress_rec.completed_at = datetime.utcnow()

    await db.commit()
    await db.refresh(progress_rec)
    return {
        "status": "SUCCESS",
        "topic_id": topic_id,
        "is_completed": progress_rec.is_completed,
        "quiz_score": progress_rec.quiz_score
    }

@router.get("/progress", response_model=UserLearningProgressResponse)
async def get_overall_progress(
    lang: str = Query("en", pattern="^(en|hi|kn)$"),
    user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserLearningProgress).where(
        UserLearningProgress.user_id == user.id,
        UserLearningProgress.is_completed == True
    )
    records = (await db.execute(stmt)).scalars().all()
    completed_ids = [r.topic_id for r in records]
    scores = [r.quiz_score for r in records if r.quiz_score is not None]

    total_topics = len(LESSONS_DATA)
    completed_topics = len(completed_ids)
    pct = round((completed_topics / total_topics) * 100.0, 1) if total_topics > 0 else 0.0
    avg_score = round(sum(scores) / len(scores), 1) if scores else None

    # Categories breakdown
    categories_raw = CurriculumService.get_categories(lang=lang)
    category_summaries = []
    for c in categories_raw:
        cat_id = c["id"]
        cat_completed = len([r for r in records if r.category_id == cat_id])
        category_summaries.append(CategorySummary(
            id=cat_id,
            title=c["title"],
            description=c["description"],
            icon=c["icon"],
            total_lessons=c["total_lessons"],
            completed_lessons=cat_completed
        ))

    return UserLearningProgressResponse(
        total_topics=total_topics,
        completed_topics=completed_topics,
        completion_percentage=pct,
        average_quiz_score=avg_score,
        categories=category_summaries,
        completed_topic_ids=completed_ids
    )

# --- 3. INTERACTIVE FINANCIAL CALCULATORS ---

@router.post("/calculators/interest", response_model=InterestCalcResponse)
async def calculate_interest(req: InterestCalcRequest):
    return EducationCalculators.calculate_interest(req)

@router.post("/calculators/minimum-due", response_model=MinimumPaymentCalcResponse)
async def calculate_minimum_due(req: MinimumPaymentCalcRequest):
    return EducationCalculators.calculate_minimum_due(req)

@router.post("/calculators/budget", response_model=BudgetPlannerResponse)
async def calculate_budget(req: BudgetPlannerRequest):
    return EducationCalculators.calculate_budget(req)

@router.post("/calculators/utilization", response_model=CreditUtilizationResponse)
async def calculate_utilization(
    req: CreditUtilizationRequest,
    user: Optional[Profile] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    # If user provided no inputs but is logged in, autofill from their registered credit cards
    if not req.total_limit and not req.cards and user:
        stmt = select(CreditCard).where(CreditCard.user_id == user.id, CreditCard.is_active == True)
        cards = (await db.execute(stmt)).scalars().all()
        if cards:
            tot_limit = sum(Decimal(str(c.credit_limit)) for c in cards)
            tot_bal = sum(Decimal(str(c.current_balance)) for c in cards)
            req.total_limit = tot_limit
            req.total_balance = tot_bal

    return EducationCalculators.calculate_utilization(req)

@router.post("/calculators/break-even", response_model=CardBreakEvenResponse)
async def calculate_card_break_even(req: CardBreakEvenRequest):
    return EducationCalculators.calculate_break_even(req)

# --- 4. USER BUDGET & EXPENSE MONITORING ---

@router.get("/budget", response_model=UserBudgetResponse)
async def get_user_budget(
    user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserBudget).where(UserBudget.user_id == user.id)
    budget = (await db.execute(stmt)).scalar_one_or_none()

    if not budget:
        # Default placeholder budget
        return UserBudgetResponse(
            id="not_configured",
            monthly_income=Decimal("50000.00"),
            total_budget=Decimal("40000.00"),
            category_budgets={
                "grocery": Decimal("10000.00"),
                "utility": Decimal("6000.00"),
                "dining": Decimal("5000.00"),
                "fuel": Decimal("4000.00"),
                "shopping": Decimal("5000.00"),
                "savings": Decimal("10000.00")
            },
            actual_spending_this_month=Decimal("0.00"),
            spending_by_category={},
            budget_utilization_pct=Decimal("0.00"),
            alerts=["You have not configured your custom monthly budget yet. Click 'Edit Budget' to get started."]
        )

    # Calculate actual spending for current calendar month
    today = date.today()
    first_day_of_month = datetime(today.year, today.month, 1)

    tx_stmt = select(Transaction).where(
        Transaction.user_id == user.id,
        Transaction.transaction_date >= first_day_of_month
    )
    txs = (await db.execute(tx_stmt)).scalars().all()

    spending_by_cat: Dict[str, Decimal] = {}
    total_spent = Decimal("0.00")
    for t in txs:
        amt = Decimal(str(t.amount))
        total_spent += amt
        spending_by_cat[t.category_id] = spending_by_cat.get(t.category_id, Decimal("0.00")) + amt

    category_budgets: Dict[str, Decimal] = {}
    if budget.category_budgets_json:
        try:
            raw_cats = json.loads(budget.category_budgets_json)
            category_budgets = {k: Decimal(str(v)) for k, v in raw_cats.items()}
        except Exception:
            category_budgets = {}

    util_pct = Decimal("0.00")
    if budget.total_budget > Decimal("0.00"):
        util_pct = ((total_spent / budget.total_budget) * Decimal("100.0")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)

    # Check alert threshold from user preferences
    pref_stmt = select(UserPreference).where(UserPreference.user_id == user.id)
    pref = (await db.execute(pref_stmt)).scalar_one_or_none()
    threshold = Decimal(str(pref.budget_alert_threshold)) if pref and pref.budget_alert_threshold else Decimal("80.00")

    alerts: List[str] = []
    if util_pct > Decimal("100.0"):
        alerts.append(f"Budget Alert: You have spent ₹{total_spent:,.2f}, exceeding your total monthly budget of ₹{budget.total_budget:,.2f} ({util_pct}%).")
    elif util_pct >= threshold:
        alerts.append(f"Budget Notice: You have reached {util_pct}% of your monthly budget (₹{total_spent:,.2f} of ₹{budget.total_budget:,.2f}).")

    for cat_id, alloc in category_budgets.items():
        actual_cat = spending_by_cat.get(cat_id, Decimal("0.00"))
        if alloc > Decimal("0.00") and actual_cat > alloc:
            over = actual_cat - alloc
            alerts.append(f"Category Notice: {cat_id.title()} spending (₹{actual_cat:,.2f}) exceeded allocation by ₹{over:,.2f}.")

    return UserBudgetResponse(
        id=budget.id,
        monthly_income=budget.monthly_income,
        total_budget=budget.total_budget,
        category_budgets=category_budgets,
        actual_spending_this_month=total_spent,
        spending_by_category=spending_by_cat,
        budget_utilization_pct=util_pct,
        alerts=alerts
    )

@router.put("/budget", response_model=UserBudgetResponse)
async def upsert_user_budget(
    data: UserBudgetUpsertRequest,
    user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserBudget).where(UserBudget.user_id == user.id)
    budget = (await db.execute(stmt)).scalar_one_or_none()

    total_alloc = sum(data.category_budgets.values())
    cats_json = json.dumps({k: float(v) for k, v in data.category_budgets.items()})

    if not budget:
        budget = UserBudget(
            id=str(uuid.uuid4()),
            user_id=user.id,
            monthly_income=data.monthly_income,
            total_budget=total_alloc,
            category_budgets_json=cats_json
        )
        db.add(budget)
    else:
        budget.monthly_income = data.monthly_income
        budget.total_budget = total_alloc
        budget.category_budgets_json = cats_json

    await db.commit()
    await db.refresh(budget)

    return UserBudgetResponse(
        id=budget.id,
        monthly_income=budget.monthly_income,
        total_budget=budget.total_budget,
        category_budgets=data.category_budgets,
        actual_spending_this_month=Decimal("0.00"),
        spending_by_category={},
        budget_utilization_pct=Decimal("0.00"),
        alerts=["Budget successfully saved!"]
    )

# --- 5. FINANCIAL PATH & ONBOARDING ---

@router.get("/path", response_model=FinancialPathResponse)
async def get_financial_path(
    user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserPreference).where(UserPreference.user_id == user.id)
    pref = (await db.execute(stmt)).scalar_one_or_none()
    path = pref.financial_path if pref and pref.financial_path else "NEW_TO_FINANCE"
    return FinancialPathResponse(financial_path=path, onboarding_completed=True)

@router.put("/path", response_model=FinancialPathResponse)
async def update_financial_path(
    data: FinancialPathUpdateRequest,
    user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserPreference).where(UserPreference.user_id == user.id)
    pref = (await db.execute(stmt)).scalar_one_or_none()
    if not pref:
        pref = UserPreference(
            id=str(uuid.uuid4()),
            user_id=user.id,
            financial_path=data.financial_path
        )
        db.add(pref)
    else:
        pref.financial_path = data.financial_path

    if getattr(data, "financial_pathway", None):
        user.financial_pathway = data.financial_pathway
        user.updated_at = datetime.utcnow()
        db.add(user)

    await db.commit()
    return FinancialPathResponse(financial_path=data.financial_path, onboarding_completed=True)

