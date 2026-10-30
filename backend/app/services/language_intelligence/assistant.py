from typing import List, Dict, Any, Optional
from decimal import Decimal
from app.models.entities import CreditCard, Transaction
from app.schemas.assistant import ChatQueryResponse
from app.services.reward_optimization.engine import RewardOptimizationEngine
from app.core.config import settings

class MultilingualAssistantService:
    """
    Multilingual Language Intelligence Engine for CLIQ.
    Grounded strictly in verified user card data and platform rules.
    Natively supports English, Hindi, and Kannada.
    """

    @classmethod
    async def process_financial_query(
        cls,
        query: str,
        language: str,
        user_cards: List[CreditCard],
        user_transactions: List[Transaction]
    ) -> ChatQueryResponse:
        query_clean = query.strip()
        lower_query = query_clean.lower()
        
        # Build grounding context from user's actual cards
        card_summaries = []
        card_ids = []
        for c in user_cards:
            card_ids.append(c.id)
            rule_texts = []
            for r in c.reward_rules:
                if r.is_excluded:
                    rule_texts.append(f"{r.category_id or 'all'}: 0% (Excluded: {r.exclusion_reason or 'No rewards'})")
                else:
                    rule_texts.append(f"{r.category_id or r.merchant_pattern or 'all'}: {r.reward_rate_percentage}% {r.reward_type}")
            card_summaries.append(f"- {c.card_name} ({c.bank_name}, {c.network}): Annual fee ₹{c.annual_fee}. Rules: {'; '.join(rule_texts)}")

        grounded_context = "\n".join(card_summaries) if card_summaries else "User has no registered credit cards."

        # Check if external Gemini API key is configured
        if settings.GEMINI_API_KEY and settings.AI_PROVIDER == "gemini":
            try:
                import httpx
                api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL_NAME}:generateContent?key={settings.GEMINI_API_KEY}"
                prompt = (
                    f"You are CLIQ's AI Financial Intelligence Assistant. Tagline: 'Money Made Simple. In Your Language.'\n"
                    f"Target language code: '{language}' (en=English, hi=Hindi, kn=Kannada).\n"
                    f"Strict rules:\n"
                    f"1. Respond ONLY using the verified card details provided below.\n"
                    f"2. Never invent reward rates or fees.\n"
                    f"3. All numerical amounts and calculations must remain exact.\n"
                    f"4. Respond naturally and fluently in the requested language ({language}).\n\n"
                    f"USER'S REGISTERED CARDS:\n{grounded_context}\n\n"
                    f"USER QUERY: {query_clean}"
                )
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(api_url, json={"contents": [{"parts": [{"text": prompt}]}]})
                    if resp.status_code == 200:
                        data = resp.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        return ChatQueryResponse(
                            query=query_clean,
                            response=text,
                            language=language,
                            grounded_card_ids=card_ids,
                            citations=[c.card_name for c in user_cards]
                        )
            except Exception:
                pass  # Gracefully fall back to deterministic grounded engine

        # Deterministic Grounded Multilingual Engine
        return cls._generate_grounded_response(
            query=query_clean,
            lower_query=lower_query,
            language=language,
            user_cards=user_cards,
            card_ids=card_ids
        )

    @classmethod
    def _generate_grounded_response(
        cls,
        query: str,
        lower_query: str,
        language: str,
        user_cards: List[CreditCard],
        card_ids: List[str]
    ) -> ChatQueryResponse:
        citations = [c.card_name for c in user_cards]

        if not user_cards:
            if language == "hi":
                text = "आपके खाते में अभी कोई क्रेडिट कार्ड पंजीकृत नहीं है। वैयक्तिकृत सलाह के लिए कृपया 'My Credit Cards' पृष्ठ पर जाकर अपना कार्ड जोड़ें।"
            elif language == "kn":
                text = "ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ ಯಾವುದೇ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ನೋಂದಾಯಿಸಲಾಗಿಲ್ಲ. ಸೂಕ್ತ ಶಿಫಾರಸುಗಳಿಗಾಗಿ ದಯವಿಟ್ಟು 'My Credit Cards' ಪುಟದಲ್ಲಿ ನಿಮ್ಮ ಕಾರ್ಡ್ ಸೇರಿಸಿ."
            else:
                text = "You currently have no credit cards registered in your CLIQ portfolio. Please add a card to receive personalized recommendations and reward optimization."
            return ChatQueryResponse(query=query, response=text, language=language, grounded_card_ids=[], citations=[])

        # Detect intent: Swiggy / Dining
        if any(w in lower_query for w in ["swiggy", "स्विगी", "ಸ್ವಿಗ್ಗಿ", "zomato", "ज़ोमैटो", "dining", "food", "खाना", "ರೆಸ್ಟೋರೆಂಟ್"]):
            best_opt = RewardOptimizationEngine.optimize_transaction(
                cards=user_cards,
                amount=Decimal("1500.00"),
                category_id="dining",
                merchant_name="Swiggy",
                language=language
            )
            rec = best_opt.recommended_card
            if language == "hi":
                text = (
                    f"स्विगी या डाइनिंग के लिए आपका सर्वोत्तम कार्ड **{rec.card_name}** ({rec.bank_name}) है। "
                    f"इस पर आपको {rec.effective_rate_percentage}% का प्रभावी कैशबैक मिलता है। "
                    f"उदाहरण के लिए, ₹1,500 के ऑर्डर पर आपको सीधे ₹{rec.expected_reward_monetary} का लाभ मिलेगा।"
                )
            elif language == "kn":
                text = (
                    f"ಸ್ವಿಗ್ಗಿ ಅಥವಾ ಊಟದ ಖರ್ಚಿಗೆ ನಿಮ್ಮ ಅತ್ಯುತ್ತಮ ಕಾರ್ಡ್ **{rec.card_name}** ({rec.bank_name}). "
                    f"ಇದರಲ್ಲಿ ನೀವು {rec.effective_rate_percentage}% ಪರಿಣಾಮಕಾರಿ ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್ ಗಳಿಸಬಹುದು. "
                    f"ಉದಾಹರಣೆಗೆ, ₹1,500 ಆರ್ಡರ್ ಮೇಲೆ ನಿಮಗೆ ₹{rec.expected_reward_monetary} ಲಾಭ ಸಿಗುತ್ತದೆ."
                )
            else:
                text = (
                    f"For food delivery (Swiggy/Zomato), your best card is **{rec.card_name}** ({rec.bank_name}). "
                    f"It yields an effective rate of {rec.effective_rate_percentage}%, delivering ₹{rec.expected_reward_monetary} on a ₹1,500 transaction."
                )
            return ChatQueryResponse(query=query, response=text, language=language, grounded_card_ids=card_ids, citations=citations)

        # Detect intent: Amazon / Online Shopping
        if any(w in lower_query for w in ["amazon", "flipkart", "shopping", "ऑनलाइन", "ಶಾಪಿಂಗ್"]):
            best_opt = RewardOptimizationEngine.optimize_transaction(
                cards=user_cards,
                amount=Decimal("3000.00"),
                category_id="shopping",
                merchant_name="Amazon",
                language=language
            )
            rec = best_opt.recommended_card
            if language == "hi":
                text = (
                    f"ऑनलाइन शॉपिंग (अमेज़न/फ्लिपकार्ट) के लिए आपका सबसे लाभदायक कार्ड **{rec.card_name}** है। "
                    f"इस कार्ड से आपको {rec.effective_rate_percentage}% का रिवॉर्ड/कैशबैक मिलेगा (₹3,000 की खरीद पर ₹{rec.expected_reward_monetary})।"
                )
            elif language == "kn":
                text = (
                    f"ಆನ್‌ಲೈನ್ ಶಾಪಿಂಗ್‌ಗಾಗಿ ನಿಮ್ಮ ಅತ್ಯುತ್ತಮ ಆಯ್ಕೆ **{rec.card_name}**. "
                    f"ಈ ಕಾರ್ಡ್ ಮೂಲಕ ನಿಮಗೆ {rec.effective_rate_percentage}% ರಿವಾರ್ಡ್ ಸಿಗುತ್ತದೆ (₹3,000 ಖರೀದಿಗೆ ₹{rec.expected_reward_monetary})."
                )
            else:
                text = (
                    f"For online shopping on Amazon or Flipkart, your optimal card is **{rec.card_name}**, earning {rec.effective_rate_percentage}% "
                    f"(yielding ₹{rec.expected_reward_monetary} on a ₹3,000 purchase)."
                )
            return ChatQueryResponse(query=query, response=text, language=language, grounded_card_ids=card_ids, citations=citations)

        # Detect intent: Fuel / Petrol
        if any(w in lower_query for w in ["fuel", "petrol", "diesel", "पेट्रोल", "ಇಂಧನ"]):
            fuel_eval = RewardOptimizationEngine.optimize_transaction(
                cards=user_cards,
                amount=Decimal("2000.00"),
                category_id="fuel",
                merchant_name="HPCL Petrol",
                language=language
            )
            rec = fuel_eval.recommended_card
            if rec.is_excluded:
                if language == "hi":
                    text = f"ध्यान दें: आपके अधिकांश कार्ड्स (जैसे {rec.card_name}) पर फ्यूल/पेट्रोल खर्च रिवॉर्ड्स से बाहर हैं। सरचार्ज छूट का लाभ पाने के लिए न्यूनतम ₹400 से ₹4,000 के बीच का स्वाइप करें।"
                elif language == "kn":
                    text = f"ಗಮನಿಸಿ: ನಿಮ್ಮ ಕಾರ್ಡ್‌ಗಳಲ್ಲಿ ({rec.card_name}) ಇಂಧನ ಖರ್ಚುಗಳಿಗೆ ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್ ಇರುವುದಿಲ್ಲ. ಸರ್ಚಾರ್ಜ್ ಮನ್ನಾ ಪಡೆಯಲು ₹400 ರಿಂದ ₹4,000 ವರೆಗೆ ವಹಿವಾಟು ನಡೆಸಿ."
                else:
                    text = f"Note: Most standard cashback cards (including {rec.card_name}) exclude fuel transactions from earning rewards. You can, however, utilize the 1% fuel surcharge waiver for transactions between ₹400 and ₹4,000."
            else:
                if language == "hi":
                    text = f"फ्यूल के लिए **{rec.card_name}** का उपयोग करें, जो आपको {rec.effective_rate_percentage}% लाभ प्रदान करता है।"
                elif language == "kn":
                    text = f"ಇಂಧನಕ್ಕಾಗಿ **{rec.card_name}** ಬಳಸಿ, ಇದು {rec.effective_rate_percentage}% ಪ್ರಯೋಜನವನ್ನು ನೀಡುತ್ತದೆ."
                else:
                    text = f"For fuel spending, use **{rec.card_name}**, which earns an effective {rec.effective_rate_percentage}% value-back."
            return ChatQueryResponse(query=query, response=text, language=language, grounded_card_ids=card_ids, citations=citations)

        # Detect intent: Lounge Access / Travel
        if any(w in lower_query for w in ["lounge", "airport", "flight", "लाउंज", "ಲಾಉಂಜ್"]):
            lounge_cards = [c.card_name for c in user_cards if any(b.benefit_type == "LOUNGE_ACCESS" for b in c.benefits)]
            lounge_str = ", ".join(lounge_cards) if lounge_cards else user_cards[0].card_name
            if language == "hi":
                text = f"एयरपोर्ट लाउंज सुविधा के लिए आपके पास **{lounge_str}** उपलब्ध है। यात्रा से पहले तिमाही खर्च शर्तों की पुष्टि अवश्य कर लें।"
            elif language == "kn":
                text = f"ವಿಮಾನ ನಿಲ್ದಾಣದ ಲೌಂಜ್ ಪ್ರವೇಶಕ್ಕಾಗಿ ನಿಮ್ಮ ಬಳಿ **{lounge_str}** ಇದೆ. ಪ್ರಯಾಣಿಸುವ ಮುನ್ನ ತ್ರೈಮಾಸಿಕ ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸಿ."
            else:
                text = f"For complimentary airport lounge access, you can utilize your **{lounge_str}**. Ensure you meet any quarterly spend criteria specified in your benefits schedule."
            return ChatQueryResponse(query=query, response=text, language=language, grounded_card_ids=card_ids, citations=citations)

        # General Card Portfolio Summary
        card_list_str = ", ".join([f"{c.card_name} ({c.bank_name})" for c in user_cards])
        if language == "hi":
            text = (
                f"आपके पोर्टफोलियो में कुल {len(user_cards)} कार्ड सक्रिय हैं: {card_list_str}। "
                f"विशिष्ट लेन-देन के लिए आप कभी भी मर्चेंट (जैसे स्विगी, अमेज़न, पेट्रोल) का नाम लिखकर पूछ सकते हैं।"
            )
        elif language == "kn":
            text = (
                f"ನಿಮ್ಮ ಪೋರ್ಟ್‌ಫೋಲಿಯೊದಲ್ಲಿ {len(user_cards)} ಸಕ್ರಿಯ ಕಾರ್ಡ್‌ಗಳಿವೆ: {card_list_str}. "
                f"ನಿರ್ದಿಷ್ಟ ವಹಿವಾಟಿಗೆ ಅತ್ಯುತ್ತಮ ಕಾರ್ಡ್ ತಿಳಿಯಲು ಮರ್ಚೆಂಟ್ ಹೆಸರನ್ನು (ಸ್ವಿಗ್ಗಿ, ಅಮೆಜಾನ್) ಕೇಳಿ."
            )
        else:
            text = (
                f"You currently have {len(user_cards)} active cards in CLIQ: {card_list_str}. "
                f"You can ask me which card to use for specific merchants (e.g. Swiggy, Amazon, Uber, Airlines, Utility bills) or check your reward caps and benefits anytime."
            )
        return ChatQueryResponse(query=query, response=text, language=language, grounded_card_ids=card_ids, citations=citations)
