from typing import List, Dict, Any, Optional
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import CreditCard, Transaction
from app.schemas.assistant import ChatQueryResponse
from app.services.reward_optimization.engine import RewardOptimizationEngine
from app.core.config import settings

class MultilingualAssistantService:
    """
    Multilingual Language Intelligence Engine for CLIQ.
    Grounded strictly in verified user card data and platform rules.
    Natively supports English, Hindi, and Kannada.
    Routes all external processing strictly through the Privacy Gateway.
    """

    @classmethod
    async def process_financial_query(
        cls,
        query: str,
        language: str,
        user_cards: List[CreditCard],
        user_transactions: List[Transaction],
        db: Optional[AsyncSession] = None,
        user_id: Optional[str] = None
    ) -> ChatQueryResponse:
        query_clean = query.strip()
        lower_query = query_clean.lower()
        citations = [c.card_name for c in user_cards]
        card_ids = [c.id for c in user_cards]

        # Determine task type for privacy minimization
        from app.services.privacy.privacy_gateway import AiTaskType
        task_type = AiTaskType.GENERAL_QUERY
        if any(w in lower_query for w in ["what is", "explain", "how does", "apr", "interest", "billing cycle", "cvv", "credit score"]):
            task_type = AiTaskType.FINANCIAL_EDUCATION
        elif any(w in lower_query for w in ["spend", "spending", "expenses", "expense", "transaction", "transactions"]):
            task_type = AiTaskType.SPENDING_ANALYSIS_SUMMARY
        elif any(w in lower_query for w in ["swiggy", "amazon", "flipkart", "fuel", "petrol", "best card", "which card", "recommend", "lounge"]):
            task_type = AiTaskType.CARD_RECOMMENDATION_EXPLANATION

        # If database session is present, process strictly via PrivacyGateway
        if db:
            from app.services.privacy.privacy_gateway import PrivacyGateway
            gw_result = await PrivacyGateway.execute_request(
                db=db,
                user_id=user_id,
                task_type=task_type,
                user_query=query_clean,
                language=language,
                user_cards=user_cards,
                user_transactions=user_transactions
            )
            return ChatQueryResponse(
                query=query_clean,
                response=gw_result["response"],
                language=language,
                grounded_card_ids=card_ids,
                citations=citations,
                confidence=0.95,
                is_external_ai_used=gw_result["is_external_ai_used"],
                provider_used=gw_result["provider_used"],
                data_classification=gw_result["data_classification"],
                redacted_items_count=gw_result["redacted_items_count"],
                privacy_status=gw_result["privacy_status"],
                audit_request_id=gw_result.get("audit_request_id")
            )

        # Deterministic Grounded Multilingual Engine fallback
        res = cls._generate_grounded_response(
            query=query_clean,
            lower_query=lower_query,
            language=language,
            user_cards=user_cards,
            card_ids=card_ids
        )
        res.privacy_status = "LOCAL_PROCESSING_STANDALONE"
        return res

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

        # --- FINANCIAL EDUCATION INTENTS (Accessible to everyone, with or without credit cards) ---

        # 1. Minimum Amount Due vs Total Amount Due
        if any(w in lower_query for w in ["minimum due", "min due", "minimum payment", "न्यूनतम देय", "न्यूनतम भुगतान", "ಕನಿಷ್ಠ ಬಾಕಿ", "ಕನಿಷ್ಠ ಪಾವತಿ"]):
            ed_citations = ["CLIQ Learn: Interest & Debt Awareness", "RBI Consumer Credit Guidelines"]
            if language == "hi":
                text = (
                    "**न्यूनतम देय राशि (Minimum Amount Due - MAD) का सच:**\n\n"
                    "न्यूनतम देय राशि आपके कुल बिल का आमतौर पर सिर्फ **5%** होती है।\n"
                    "- इसे भरने से केवल लेट पेमेंट पेनाल्टी बचती है, लेकिन **ब्याज कभी नहीं रुकता**!\n"
                    "- बाकी 95% बकाए पर **3.5% प्रति माह (42% से 51% वार्षिक)** की दर से भारी चक्रवृद्धि ब्याज और उस पर 18% GST लगता है।\n"
                    "- उदाहरण: ₹20,000 के बिल पर सिर्फ न्यूनतम देय भरने से इसे चुकाने में 6 साल से ज्यादा लग सकते हैं और आप ₹18,000 से अधिक सिर्फ ब्याज भरेंगे।\n\n"
                    "> **सलाह:** हमेशा 'Total Amount Due' का ही भुगतान करें।"
                )
            elif language == "kn":
                text = (
                    "**ಕನಿಷ್ಠ ಬಾಕಿ ಮೊತ್ತ (Minimum Amount Due) ದ ಅಪಾಯಗಳು:**\n\n"
                    "ಕನಿಷ್ಠ ಮೊತ್ತವು ನಿಮ್ಮ ಒಟ್ಟು ಬಿಲ್‌ನ ಕೇವಲ **5%** ಆಗಿರುತ್ತದೆ.\n"
                    "- ಇದನ್ನು ಪಾವತಿಸಿದರೆ ಕೇವಲ ಲೇಟ್ ಫೀ ತಪ್ಪುತ್ತದೆ, ಆದರೆ **ಬಡ್ಡಿ ನಿಲ್ಲುವುದಿಲ್ಲ**!\n"
                    "- ಉಳಿದ 95% ಮೊತ್ತಕ್ಕೆ ವಾರ್ಷಿಕ **42% ರಿಂದ 51% ವರೆಗೆ** ಚಕ್ರಬಡ್ಡಿ ಮತ್ತು 18% GST ವಿಧಿಸಲಾಗುತ್ತದೆ.\n"
                    "- ₹20,000 ಬಿಲ್ ಮೇಲೆ ಕೇವಲ ಕನಿಷ್ಠ ಮೊತ್ತ ಪಾವತಿಸಿದರೆ, ಸಾಲ ತೀರಲು 6 ವರ್ಷಗಳಿಗಿಂತ ಹೆಚ್ಚು ಸಮಯ ಬೇಕಾಗುತ್ತದೆ.\n\n"
                    "> **ಸಲಹೆ:** ಯಾವಾಗಲೂ ಸಂಪೂರ್ಣ 'Total Amount Due' ಪಾವತಿಸಿ."
                )
            else:
                text = (
                    "**Total Amount Due vs. Minimum Amount Due (The 5% Trap):**\n\n"
                    "Minimum Amount Due (MAD) is typically just **5% of your total statement balance**.\n"
                    "- **What it does:** Prevents late payment penalty fees and avoids negative reporting to CIBIL.\n"
                    "- **What it DOES NOT do:** It does NOT stop finance charges! The remaining 95% balance continues to accrue compounding interest at **42% to 51% APR**, plus 18% GST.\n"
                    "- **The Reality:** Paying only minimum due on a ₹20,000 balance takes **over 6 years to clear**, costing over ₹18,000 in interest alone.\n\n"
                    "> **Actionable Rule:** Always enable auto-debit for **Total Amount Due** in your banking app."
                )
            return ChatQueryResponse(query=query, response=text, language=language, grounded_card_ids=card_ids, citations=ed_citations)

        # 2. Billing Cycle / Grace Period / Statement Date
        if any(w in lower_query for w in ["billing cycle", "grace period", "statement date", "बिलिंग चक्र", "ग्रेस पीरियड", "स्टेटमेंट तारीख", "ಬಿಲ್ಲಿಂಗ್ ಸೈಕಲ್", "ಗ್ರೇಸ್ ಅವಧಿ"]):
            ed_citations = ["CLIQ Learn: Credit Card Fundamentals"]
            if language == "hi":
                text = (
                    "**बिलिंग चक्र और ग्रेस पीरियड की कार्यप्रणाली:**\n\n"
                    "1. **स्टेटमेंट तिथि:** वह दिन जब बैंक पिछले 30 दिनों के लेन-देन का बिल बनाता है।\n"
                    "2. **देय तिथि (Due Date):** आमतौर पर बिल बनने के 15-25 दिन बाद की तारीख।\n"
                    "3. **ग्रेस पीरियड (20 से 50 दिन):** यदि आप स्टेटमेंट बनने के ठीक अगले दिन खरीदारी करते हैं, तो वह अगले महीने के बिल में जुड़ेगी, जिससे आपको **अधिकतम 50 दिनों तक ब्याज-मुक्त समय** मिलता है!\n\n"
                    "> **चेतावनी:** यदि आपने पिछले महीने का ₹100 भी बकाया छोड़ा, तो ग्रेस पीरियड तुरंत समाप्त हो जाता है और नई खरीदारी पर पहले ही दिन से ब्याज लगने लगता है।"
                )
            elif language == "kn":
                text = (
                    "**ಬಿಲ್ಲಿಂಗ್ ಚಕ್ರ ಮತ್ತು ಬಡ್ಡಿ-ರಹಿತ ರಿಯಾಯಿತಿ ಅವಧಿ (Grace Period):**\n\n"
                    "1. **ಸ್ಟೇಟ್‌ಮೆಂಟ್ ದಿನಾಂಕ:** 30 ದಿನಗಳ ಖರ್ಚುಗಳನ್ನು ಲೆಕ್ಕಹಾಕಿ ಬ್ಯಾಂಕ್ ಬಿಲ್ ನೀಡುವ ದಿನ.\n"
                    "2. **ಪಾವತಿ ದಿನಾಂಕ (Due Date):** ಬಿಲ್ ಬಂದ 15-25 ದಿನಗಳ ನಂತರದ ದಿನಾಂಕ.\n"
                    "3. **50 ದಿನಗಳ ರಿಯಾಯಿತಿ:** ಬಿಲ್ ಬಂದ ಮರುದಿನವೇ ಖರೀದಿ ಮಾಡಿದರೆ, ಮುಂದಿನ ತಿಂಗಳ ಬಿಲ್ ಬರುವವರೆಗೆ ಗರಿಷ್ಠ **50 ದಿನಗಳ ಬಡ್ಡಿ-ರಹಿತ ಸೌಲಭ್ಯ** ಸಿಗುತ್ತದೆ.\n\n"
                    "> **ಗಮನಿಸಿ:** ಹಳೆಯ ಬಿಲ್‌ನಲ್ಲಿ ಬಾಕಿ ಉಳಿಸಿಕೊಂಡಿದ್ದರೆ ಈ ರಿಯಾಯಿತಿ ಸಿಗುವುದಿಲ್ಲ."
                )
            else:
                text = (
                    "**How Billing Cycles & Grace Periods Function:**\n\n"
                    "1. **Statement Date:** The day your 30-day billing cycle closes and your bill is generated.\n"
                    "2. **Payment Due Date:** Generally 15 to 25 days after the statement date.\n"
                    "3. **Interest-Free Grace Period (20 to 50 Days):** Purchases made the day after your statement is generated enjoy the longest grace period (up to 50 days) before payment is due.\n\n"
                    "> **Crucial Caveat:** If you carry forward any revolving balance from a previous month, your grace period is revoked on all new transactions."
                )
            return ChatQueryResponse(query=query, response=text, language=language, grounded_card_ids=card_ids, citations=ed_citations)

        # 3. APR / Interest Rate / Finance Charges
        if any(w in lower_query for w in ["apr", "interest", "finance charge", "ब्याज", "वार्षिक दर", "ಬಡ್ಡಿ", "ಹಣಕಾಸು ಶುಲ್ಕ"]):
            ed_citations = ["CLIQ Learn: Interest & Debt Awareness", "RBI Master Direction on Credit Cards"]
            if language == "hi":
                text = (
                    "**क्रेडिट कार्ड का ब्याज (APR) और 3.5% का भ्रम:**\n\n"
                    "- बैंक अक्सर 3.5% मासिक ब्याज की बात करते हैं। वार्षिक रूप से यह **42% से 51% APR** बैठता है!\n"
                    "- तुलना करें: होम लोन 8.5% और कार लोन 9% पर मिलता है, जबकि क्रेडिट कार्ड 5 गुना महंगा है।\n"
                    "- इसके अतिरिक्त भारत में सभी बैंक शुल्कों और ब्याज पर **18% GST** अनिवार्य रूप से लगाया जाता है।\n"
                    "- क्रेडिट कार्ड से कभी भी एटीएम से नकदी (Cash Advance) न निकालें, उस पर पहले मिनट से 42% ब्याज और भारी फीस लगती है।"
                )
            elif language == "kn":
                text = (
                    "**ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಬಡ್ಡಿ (APR) ವಿವರಣೆ:**\n\n"
                    "- ತಿಂಗಳಿಗೆ 3.5% ಬಡ್ಡಿ ಎಂದರೆ ವಾರ್ಷಿಕವಾಗಿ **42% ರಿಂದ 51% APR** ಆಗುತ್ತದೆ.\n"
                    "- ಗೃಹ ಸಾಲ (8.5%) ಕ್ಕೆ ಹೋಲಿಸಿದರೆ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಸಾಲ ಅತ್ಯಂತ ದುಬಾರಿ.\n"
                    "- ಬಡ್ಡಿಯ ಮೇಲೆ ಭಾರತ ಸರ್ಕಾರದ **18% GST** ಕೂಡ ಅನ್ವಯಿಸುತ್ತದೆ.\n"
                    "- ಎಂದಿಗೂ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಬಳಸಿ ATM ನಿಂದ ನಗದು ಹಣ ಹಿಂಪಡೆಯಬೇಡಿ."
                )
            else:
                text = (
                    "**Understanding Credit Card APR & Finance Charges:**\n\n"
                    "- While banks quote ~3.5% per month, the effective Annualized Percentage Rate (APR) is **42.0% to 51.1% per year**.\n"
                    "- Credit card revolving debt is approximately 5x more expensive than home or personal loans.\n"
                    "- In India, an additional **18% GST** applies to all finance charges and interest fees.\n"
                    "- Avoid ATM cash advances at all costs, as they trigger immediate compounding interest with zero grace period."
                )
            return ChatQueryResponse(query=query, response=text, language=language, grounded_card_ids=card_ids, citations=ed_citations)

        # 4. Credit Score / CIBIL / 30% Utilization
        if any(w in lower_query for w in ["cibil", "credit score", "utilization", "क्रेडिट स्कोर", "सिबिल", "उपयोग दर", "ಕ್ರೆಡಿಟ್ ಸ್ಕೋರ್", "ಸಿಬಿಲ್"]):
            ed_citations = ["CLIQ Learn: Credit Score & Health", "TransUnion CIBIL Scoring Model"]
            if language == "hi":
                text = (
                    "**CIBIL स्कोर और 30% उपयोग का नियम:**\n\n"
                    "- भारत में क्रेडिट स्कोर **300 से 900** के बीच होता है। **750+ स्कोर** को सबसे बेहतरीन माना जाता है।\n"
                    "- **30% उपयोग नियम:** यदि आपकी कुल सीमा ₹1,00,000 है, तो अपना बिल ₹30,000 से कम रखें। भले ही आप पूरा बिल भरते हों, 30% से अधिक खर्च करने पर CIBIL स्कोर गिर सकता है!\n"
                    "- **टिप:** यदि खर्च ज्यादा हो गया है, तो स्टेटमेंट बनने से 2 दिन पहले थोड़ा भुगतान कर दें ताकि बिल 30% से नीचे रहे।"
                )
            elif language == "kn":
                text = (
                    "**CIBIL ಸ್ಕೋರ್ ಮತ್ತು 30% ಬಳಕೆ ನಿಯಮ:**\n\n"
                    "- ಭಾರತದಲ್ಲಿ ಕ್ರೆಡಿಟ್ ಸ್ಕೋರ್ **300 ರಿಂದ 900** ರವರೆಗೆ ಇರುತ್ತದೆ. **750+ ಸ್ಕೋರ್** ಅತ್ಯುತ್ತಮ.\n"
                    "- **30% ಮಿತಿ ಬಳಕೆ:** ₹1,00,000 ಮಿತಿಯಿದ್ದರೆ ₹30,000 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಖರ್ಚು ಮಾಡಬೇಡಿ. ಸಂಪೂರ್ಣ ಬಿಲ್ ಕಟ್ಟಿದರೂ ಸಹ 30% ಗಿಂತ ಹೆಚ್ಚು ಬಳಸಿದರೆ ಸ್ಕೋರ್ ಕಡಿಮೆಯಾಗುತ್ತದೆ.\n"
                    "- ಹಳೆಯ ಕಾರ್ಡ್‌ಗಳನ್ನು ಮುಚ್ಚದೆ ಇಡುವುದು ಸ್ಕೋರ್ ಹೆಚ್ಚಿಸಲು ಸಹಕಾರಿ."
                )
            else:
                text = (
                    "**CIBIL Credit Score & The 30% Utilization Rule:**\n\n"
                    "- Scores in India range from **300 to 900**, with **750+ being the gold standard** for prime loan interest rates.\n"
                    "- **The 30% Rule:** Keep your reported statement balance under 30% of your total limit (e.g. max ₹30,000 on a ₹1,00,000 limit). High utilization suppresses your score even if you pay in full every month.\n"
                    "- **Smart Tip:** Pay down heavy balances 2 to 3 days before your statement generation date so only a modest balance is reported to the bureau."
                )
            return ChatQueryResponse(query=query, response=text, language=language, grounded_card_ids=card_ids, citations=ed_citations)

        # 5. Budgeting & The 50-30-20 Rule
        if any(w in lower_query for w in ["budget", "50-30-20", "50/30/20", "savings", "बजट", "बचत नियम", "ಬಜೆಟ್", "ಉಳಿತಾಯ"]):
            ed_citations = ["CLIQ Learn: Personal Finance Fundamentals"]
            if language == "hi":
                text = (
                    "**50-30-20 बजट नियम:**\n\n"
                    "- **50% जरूरतें (Needs):** घर का किराया, राशन, बिजली-पानी बिल, पेट्रोल और स्वास्थ्य बीमा।\n"
                    "- **30% इच्छाएं (Wants):** बाहर खाना, फिल्में, शॉपिंग, OTT सब्सक्रिप्शन और छुट्टियां।\n"
                    "- **20% बचत (Savings):** इमरजेंसी फंड, म्यूचुअल फंड SIP, पीपीएफ और भविष्य की सुरक्षा।\n\n"
                    "> वेतन मिलते ही सबसे पहले 20% बचत अलग कर दें, फिर बाकी 80% में अपना महीना प्लान करें।"
                )
            elif language == "kn":
                text = (
                    "**50-30-20 ಬಜೆಟ್ ತತ್ವ:**\n\n"
                    "- **50% ಅಗತ್ಯಗಳು (Needs):** ಬಾಡಿಗೆ, ದಿನಸಿ, ಕರೆಂಟ್ ಬಿಲ್, ಇಂಧನ ಮತ್ತು ವಿಮೆ.\n"
                    "- **30% ಇಷ್ಟಗಳು (Wants):** ಹೋಟೆಲ್ ಊಟ, ಸಿನಿಮಾ, ಶಾಪಿಂಗ್ ಮತ್ತು ಪ್ರವಾಸ.\n"
                    "- **20% ಉಳಿತಾಯ (Savings):** ತುರ್ತು ನಿಧಿ, SIP ಮತ್ತು ಉಳಿತಾಯ ಯೋಜನೆಗಳು.\n\n"
                    "> ಸಂಬಳ ಬಂದ ತಕ್ಷಣ 20% ಉಳಿತಾಯಕ್ಕೆ ಮೀಸಲಿಡಿ."
                )
            else:
                text = (
                    "**The 50-30-20 Budgeting Framework:**\n\n"
                    "- **50% Essentials (Needs):** Housing/rent, groceries, utilities, commute, and baseline insurance.\n"
                    "- **30% Discretionary (Wants):** Dining out, shopping, OTT streaming, travel, and lifestyle hobbies.\n"
                    "- **20% Wealth Building (Savings):** Emergency fund accumulation, mutual fund SIPs, and retirement corpus.\n\n"
                    "> **Golden Habit:** Pay yourself first by automating the 20% transfer to investments on salary day."
                )
            return ChatQueryResponse(query=query, response=text, language=language, grounded_card_ids=card_ids, citations=ed_citations)

        # 6. UPI Fraud / Financial Safety / RBI 72-Hour Rule
        if any(w in lower_query for w in ["upi pin", "fraud", "scam", "phishing", "पिन", "धोखाधड़ी", "ವಂಚನೆ", "ಯುಪಿಐ"]):
            ed_citations = ["CLIQ Learn: Financial Safety & Fraud Prevention", "RBI Cyber Crime Advisory"]
            if language == "hi":
                text = (
                    "**यूपीआई सुरक्षा और वित्तीय धोखाधड़ी से बचाव:**\n\n"
                    "1. **स्वर्ण नियम:** पैसे प्राप्त (Receive) करने के लिए कभी भी UPI पिन की जरूरत नहीं होती। पिन डालने का मतलब सिर्फ पैसा कटना होता है!\n"
                    "2. कभी भी OLX या अनजान व्यक्ति के क्यूआर कोड को स्कैन करके पिन न डालें।\n"
                    "3. **RBI का 72 घंटे का नियम:** अनधिकृत लेन-देन होने पर 3 दिनों (72 घंटे) के भीतर बैंक को सूचित करने पर आपकी देनदारी शून्य होती है।\n"
                    "4. तुरंत राष्ट्रीय साइबर हेल्पलाइन **1930** पर कॉल करके फ्रॉड रिपोर्ट करें।"
                )
            elif language == "kn":
                text = (
                    "**ಹಣಕಾಸು ಭದ್ರತೆ ಮತ್ತು UPI ಜಾಗೃತಿ:**\n\n"
                    "1. **ಮುಖ್ಯ ನಿಯಮ:** ಹಣ ಪಡೆಯಲು ಎಂದಿಗೂ UPI ಪಿನ್ ನಮೂದಿಸಬೇಡಿ. ಪಿನ್ ಹಾಕಿದರೆ ಹಣ ಖಾತೆಯಿಂದ ಹೋಗುತ್ತದೆ!\n"
                    "2. ಅಪರಿಚಿತರ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಬೇಡಿ.\n"
                    "3. **RBI 72 ಗಂಟೆಗಳ ನಿಯಮ:** ಆನ್‌ಲೈನ್ ವಂಚನೆ ನಡೆದ 3 ದಿನಗಳೊಳಗೆ ಬ್ಯಾಂಕಿಗೆ ದೂರು ನೀಡಿದರೆ ಸಂಪೂರ್ಣ ಹಣ ಮರಳಿ ಪಡೆಯಬಹುದು.\n"
                    "4. ತಕ್ಷಣವೇ **1930** ಸೈಬರ್ ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ."
                )
            else:
                text = (
                    "**Financial Safety & Fraud Prevention Rules:**\n\n"
                    "1. **The UPI Law:** Entering your UPI PIN ALWAYS debits money from your account. You NEVER enter a PIN to receive money or lottery refunds!\n"
                    "2. Beware of marketplace buyers asking you to scan QR codes to receive advance payments.\n"
                    "3. **RBI 72-Hour Rule:** Reporting unauthorized electronic transactions within 3 working days protects you with Zero Customer Liability.\n"
                    "4. Dial **1930** (Citizen Cyber Fraud Helpline) immediately to freeze fraudulent beneficiary accounts."
                )
            return ChatQueryResponse(query=query, response=text, language=language, grounded_card_ids=card_ids, citations=ed_citations)

        # If user has no cards registered and it's not a generic education question:
        if not user_cards:
            if language == "hi":
                text = (
                    "आपके खाते में अभी कोई क्रेडिट कार्ड पंजीकृत नहीं है।\n\n"
                    "- आप **'CLIQ Learn' (सीखें)** सेक्शन में जाकर क्रेडिट कार्ड के नियम, 50-30-20 बजट और वित्तीय सुरक्षा के पाठ पढ़ सकते हैं।\n"
                    "- यदि आपके पास क्रेडिट कार्ड है, तो वैयक्तिकृत कैशबैक सलाह के लिए 'My Credit Cards' पृष्ठ पर जाकर अपना कार्ड जोड़ें।"
                )
            elif language == "kn":
                text = (
                    "ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ ಯಾವುದೇ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ನೋಂದಾಯಿಸಲಾಗಿಲ್ಲ.\n\n"
                    "- ನೀವು **'CLIQ Learn' (ಕಲಿಯಿರಿ)** ವಿಭಾಗದಲ್ಲಿ ಬಜೆಟ್, ಸಿಬಿಲ್ ಮತ್ತು ಹಣಕಾಸು ಪಾಠಗಳನ್ನು ಕಲಿಯಬಹುದು.\n"
                    "- ವೈಯಕ್ತಿಕ ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್ ಶಿಫಾರಸುಗಳಿಗಾಗಿ 'My Credit Cards' ಪುಟದಲ್ಲಿ ನಿಮ್ಮ ಕಾರ್ಡ್ ಸೇರಿಸಿ."
                )
            else:
                text = (
                    "You currently have no credit cards registered in your CLIQ portfolio.\n\n"
                    "- You can explore the **'CLIQ Learn'** section for lessons on credit card fundamentals, debt avoidance, budgeting, and fraud safety.\n"
                    "- To receive merchant-specific reward optimization recommendations, add your cards in the 'My Credit Cards' section."
                )
            return ChatQueryResponse(query=query, response=text, language=language, grounded_card_ids=[], citations=["CLIQ Financial Inclusion Platform"])

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
