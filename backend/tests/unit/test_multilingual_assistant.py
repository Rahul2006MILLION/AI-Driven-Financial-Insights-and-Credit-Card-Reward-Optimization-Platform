import pytest
from decimal import Decimal
from app.models.entities import CreditCard, CardRewardRule, CardBenefit
from app.services.language_intelligence.assistant import MultilingualAssistantService

@pytest.mark.asyncio
async def test_multilingual_assistant_responses():
    card = CreditCard(
        id="c_millennia",
        user_id="u1",
        card_name="HDFC Millennia",
        bank_name="HDFC Bank",
        network="VISA",
        annual_fee=Decimal("1000.00"),
        is_active=True
    )
    card.reward_rules = [
        CardRewardRule(
            id="r1",
            card_id="c_millennia",
            category_id="dining",
            merchant_pattern="Swiggy",
            reward_type="CASHBACK",
            reward_rate_percentage=Decimal("5.0"),
            point_monetary_value=Decimal("1.0"),
            min_transaction_amount=Decimal("0.0"),
            is_excluded=False
        ),
        CardRewardRule(
            id="r2",
            card_id="c_millennia",
            category_id="fuel",
            reward_type="CASHBACK",
            reward_rate_percentage=Decimal("0.0"),
            point_monetary_value=Decimal("1.0"),
            min_transaction_amount=Decimal("0.0"),
            is_excluded=True,
            exclusion_reason="Fuel excluded"
        )
    ]
    card.benefits = [
        CardBenefit(
            id="b1",
            card_id="c_millennia",
            benefit_type="LOUNGE_ACCESS",
            title="Airport Lounge",
            description="Domestic lounge access",
            annual_value_estimate=Decimal("4000.0")
        )
    ]

    # 1. Hindi Dining Query
    hi_resp = await MultilingualAssistantService.process_financial_query(
        query="स्विगी पर कौन सा कार्ड इस्तेमाल करूँ?",
        language="hi",
        user_cards=[card],
        user_transactions=[]
    )
    assert "HDFC Millennia" in hi_resp.response
    assert "5" in hi_resp.response

    # 2. Kannada Dining Query
    kn_resp = await MultilingualAssistantService.process_financial_query(
        query="ಸ್ವಿಗ್ಗಿಯಲ್ಲಿ ಯಾವ ಕಾರ್ಡ್ ಬಳಸಿದರೆ ಹೆಚ್ಚು ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್ ಸಿಗುತ್ತದೆ?",
        language="kn",
        user_cards=[card],
        user_transactions=[]
    )
    assert "HDFC Millennia" in kn_resp.response
    assert "ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್" in kn_resp.response

    # 3. Fuel Exclusion Query
    fuel_resp = await MultilingualAssistantService.process_financial_query(
        query="Do I get cashback on petrol pumps?",
        language="en",
        user_cards=[card],
        user_transactions=[]
    )
    assert "exclude" in fuel_resp.response.lower()

    # 4. Lounge Access Query
    lounge_resp = await MultilingualAssistantService.process_financial_query(
        query="Which card provides airport lounge access?",
        language="en",
        user_cards=[card],
        user_transactions=[]
    )
    assert "HDFC Millennia" in lounge_resp.response
