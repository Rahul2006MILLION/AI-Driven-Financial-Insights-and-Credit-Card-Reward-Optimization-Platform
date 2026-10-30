from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.entities import Profile, CreditCard, Transaction, AuditLog
from app.schemas.assistant import ChatQueryRequest, ChatQueryResponse
from app.security.dependencies import get_current_user
from app.services.language_intelligence.assistant import MultilingualAssistantService

router = APIRouter(prefix="/assistant", tags=["Multilingual AI Assistant"])

@router.post("/chat", response_model=ChatQueryResponse)
async def chat_with_assistant(
    req: ChatQueryRequest,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch user's registered cards with rules and benefits
    stmt_cards = (
        select(CreditCard)
        .where(CreditCard.user_id == current_user.id, CreditCard.is_active == True)
        .options(
            selectinload(CreditCard.reward_rules),
            selectinload(CreditCard.benefits)
        )
    )
    user_cards = (await db.execute(stmt_cards)).scalars().all()

    # Fetch recent transactions
    stmt_tx = (
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(Transaction.transaction_date.desc())
        .limit(20)
    )
    user_txns = (await db.execute(stmt_tx)).scalars().all()

    # Determine language preference
    lang = req.language or current_user.preferred_language or "en"

    response = await MultilingualAssistantService.process_financial_query(
        query=req.query,
        language=lang,
        user_cards=user_cards,
        user_transactions=user_txns
    )

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="ASSISTANT_QUERY",
        status="SUCCESS",
        details_json=f'{{"language": "{lang}", "grounded_cards_count": {len(user_cards)}}}'
    )
    db.add(audit)
    await db.commit()

    return response
