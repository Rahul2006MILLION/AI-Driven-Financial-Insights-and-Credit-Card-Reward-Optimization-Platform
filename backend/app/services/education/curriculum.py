from typing import Dict, List, Any, Optional

CATEGORIES_DATA = [
    {
        "id": "credit_fundamentals",
        "icon": "CreditCard",
        "title": {
            "en": "Credit Card Fundamentals",
            "hi": "क्रेडिट कार्ड की बुनियादी बातें",
            "kn": "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಮೂಲಭೂತ ವಿಷಯಗಳು"
        },
        "description": {
            "en": "Understand how credit cards work, billing cycles, credit limits, and grace periods without confusing jargon.",
            "hi": "समझें कि क्रेडिट कार्ड कैसे काम करते हैं, बिलिंग चक्र, क्रेडिट सीमा और ब्याज-मुक्त अवधि बिना किसी भ्रम के।",
            "kn": "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ, ಬಿಲ್ಲಿಂಗ್ ಚಕ್ರ, ಮಿತಿ ಮತ್ತು ರಿಯಾಯಿತಿ ಅವಧಿಯನ್ನು ಸುಲಭವಾಗಿ ತಿಳಿಯಿರಿ."
        }
    },
    {
        "id": "interest_debt",
        "icon": "TrendingDown",
        "title": {
            "en": "Interest & Debt Awareness",
            "hi": "ब्याज और कर्ज की समझ",
            "kn": "ಬಡ್ಡಿ ಮತ್ತು ಸಾಲದ ಜಾಗೃತಿ"
        },
        "description": {
            "en": "Expose the minimum payment trap, APR compounding, cash advance penalties, and how to stay completely debt-free.",
            "hi": "न्यूनतम भुगतान का जाल, वार्षिक ब्याज दर (APR), कैश निकासी शुल्क और कर्ज मुक्त रहने के उपाय जानें।",
            "kn": "ಕನಿಷ್ಠ ಬಾಕಿ ಪಾವತಿಯ ಅಪಾಯಗಳು, APR ಬಡ್ಡಿ ಲೆಕ್ಕಾಚಾರ ಮತ್ತು ಸಾಲಮುಕ್ತವಾಗಿರುವ ವಿಧಾನಗಳನ್ನು ಅರಿಯಿರಿ."
        }
    },
    {
        "id": "personal_finance",
        "icon": "PieChart",
        "title": {
            "en": "Personal Finance Fundamentals",
            "hi": "व्यक्तिगत वित्त और बजट निर्माण",
            "kn": "ವೈಯಕ್ತಿಕ ಹಣಕಾಸು ಮೂಲಗಳು"
        },
        "description": {
            "en": "Master the 50/30/20 budget framework, emergency funds, subscription hygiene, and mindful spending habits.",
            "hi": "50/30/20 बजट नियम, आपातकालीन निधि, अनावश्यक सब्सक्रिप्शन नियंत्रण और जिम्मेदार बचत सीखें।",
            "kn": "50/30/20 ಬಜೆಟ್ ನಿಯಮ, ತುರ್ತು ನಿಧಿ, ಚಂದಾದಾರಿಕೆ ವೆಚ್ಚ ನಿಯಂತ್ರಣ ಮತ್ತು ವಿವೇಕಯುತ ಉಳಿತಾಯ ಅಭ್ಯಾಸಗಳು."
        }
    },
    {
        "id": "credit_awareness",
        "icon": "Award",
        "title": {
            "en": "Credit Score & Health",
            "hi": "क्रेडिट स्कोर और वित्तीय प्रतिष्ठा",
            "kn": "ಕ್ರೆಡಿಟ್ ಸ್ಕೋರ್ ಮತ್ತು ಸಿಬಿಲ್ ಜಾಗೃತಿ"
        },
        "description": {
            "en": "Learn what affects your CIBIL/Experian score, the 30% utilization rule, hard vs soft inquiries, and credit myths.",
            "hi": "जानें CIBIL स्कोर कैसे बनता है, 30% उपयोग नियम, हार्ड पूछताछ बनाम सॉफ्ट पूछताछ और प्रचलित भ्रांतियां।",
            "kn": "CIBIL ಸ್ಕೋರ್ ಹೆಚ್ಚಿಸುವ ಕ್ರಮಗಳು, 30% ಮಿತಿ ಬಳಕೆ ನಿಯಮ ಮತ್ತು ಭಾರತೀಯ ಕ್ರೆಡಿಟ್ ತಪ್ಪು ಕಲ್ಪನೆಗಳು."
        }
    },
    {
        "id": "financial_safety",
        "icon": "ShieldCheck",
        "title": {
            "en": "Financial Safety & Fraud Prevention",
            "hi": "वित्तीय सुरक्षा और धोखाधड़ी से बचाव",
            "kn": "ಹಣಕಾಸು ಭದ್ರತೆ ಮತ್ತು ವಂಚನೆ ತಡೆಗಟ್ಟುವಿಕೆ"
        },
        "description": {
            "en": "Protect yourself from UPI PIN scams, phishing links, fake customer care numbers, and learn RBI's 72-hour zero-liability window.",
            "hi": "UPI पिन फ्रॉड, फिशिंग, फर्जी कस्टमर केयर और आरबीआई के 72 घंटे के शून्य-देनदारी नियम से सुरक्षा।",
            "kn": "UPI ಪಿನ್ ವಂಚನೆಗಳು, ನಕಲಿ ಕರೆಗಳು ಮತ್ತು RBI 72-ಗಂಟೆಗಳ ಹೊಣೆಗಾರಿಕೆ ನಿಯಮಗಳ ಮೂಲಕ ಸುರಕ್ಷಿತವಾಗಿರಿ."
        }
    }
]

LESSONS_DATA: List[Dict[str, Any]] = [
    # Category 1: Credit Fundamentals
    {
        "id": "cf-01-how-cards-work",
        "category_id": "credit_fundamentals",
        "order": 1,
        "reading_time_minutes": 3,
        "title": {
            "en": "What is a Credit Card and How Does It Work?",
            "hi": "क्रेडिट कार्ड क्या है और यह कैसे काम करता है?",
            "kn": "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಎಂದರೇನು ಮತ್ತು ಅದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?"
        },
        "summary": {
            "en": "A credit card is a short-term, interest-free revolving credit line from a bank, distinct from your bank balance.",
            "hi": "क्रेडिट कार्ड बैंक द्वारा दी गई एक अल्पकालिक, ब्याज-मुक्त क्रेडिट सीमा है, जो आपके बैंक खाते से अलग होती है।",
            "kn": "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಬ್ಯಾಂಕ್ ಒದಗಿಸುವ ಅಲ್ಪಾವಧಿ ಬಡ್ಡಿ-ರಹಿತ ಸಾಲ ಸೌಲಭ್ಯವಾಗಿದ್ದು, ನಿಮ್ಮ ಉಳಿತಾಯ ಖಾತೆಗಿಂತ ಭಿನ್ನವಾಗಿರುತ್ತದೆ."
        },
        "content": {
            "en": """### Understanding the Basics

When you swipe a debit card, money leaves your bank account immediately. When you use a **credit card**, the bank pays the merchant on your behalf, and you receive an aggregated bill at the end of your billing cycle.

#### Key Mechanics:
1. **Revolving Credit:** You are granted a credit limit (e.g. ₹50,000). As you spend ₹10,000, your available limit becomes ₹40,000. When you repay the ₹10,000 on your due date, your available limit resets back to ₹50,000.
2. **Short-Term Interest-Free Window:** If you pay your **Total Amount Due** on or before the due date, you pay **₹0 interest**.
3. **Cardholder Discipline:** A credit card is not free income; it is a convenience and cashflow tool. Spending only what you already have in your bank account is the single most important rule of credit cards.

> **Golden Rule:** Treat your credit card like a debit card with a buffer. If you do not have ₹5,000 in your bank account today, do not swipe your credit card for ₹5,000.""",
            "hi": """### बुनियादी बातें समझें

जब आप डेबिट कार्ड का उपयोग करते हैं, तो पैसा तुरंत आपके बैंक खाते से कट जाता है। लेकिन जब आप **क्रेडिट कार्ड** स्वाइप करते हैं, तो बैंक आपकी ओर से व्यापारी को भुगतान करता है, और आपको महीने के अंत में एक संयुक्त बिल मिलता है।

#### मुख्य प्रक्रिया:
1. **रिवॉल्विंग क्रेडिट:** बैंक आपको एक सीमा देता है (जैसे ₹50,000)। यदि आप ₹10,000 खर्च करते हैं, तो बची हुई सीमा ₹40,000 हो जाती है। बिल भरने पर सीमा वापस ₹50,000 हो जाती है।
2. **ब्याज-मुक्त अवधि:** यदि आप देय तिथि तक अपना **कुल देय राशि (Total Amount Due)** भर देते हैं, तो आपको **₹0 ब्याज** देना होता है।
3. **अनुशासन:** क्रेडिट कार्ड अतिरिक्त आय नहीं है; यह एक वित्तीय सुविधा है। बैंक खाते में मौजूद राशि से अधिक कभी खर्च न करें।

> **स्वर्ण नियम:** क्रेडिट कार्ड का उपयोग हमेशा डेबिट कार्ड की तरह करें। यदि आज आपके पास पैसे नहीं हैं, तो क्रेडिट कार्ड पर खरीदारी न करें।""",
            "kn": """### ಮೂಲಭೂತ ವಿಷಯಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ

ನೀವು ಡೆಬಿಟ್ ಕಾರ್ಡ್ ಬಳಸಿದಾಗ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಯಿಂದ ಹಣ ನೇರವಾಗಿ ಕಡಿತಗೊಳ್ಳುತ್ತದೆ. ಆದರೆ **ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್** ಬಳಸಿದಾಗ, ಬ್ಯಾಂಕ್ ವ್ಯಾಪಾರಿಗೆ ನಿಮ್ಮ ಪರವಾಗಿ ಪಾವತಿಸುತ್ತದೆ, ಮತ್ತು ತಿಂಗಳ ಕೊನೆಯಲ್ಲಿ ನಿಮಗೆ ಒಟ್ಟು ಬಿಲ್ ನೀಡುತ್ತದೆ.

#### ಪ್ರಮುಖ ಅಂಶಗಳು:
1. **ಸಾಲದ ಮಿತಿ:** ಬ್ಯಾಂಕ್ ನಿಮಗೆ ₹50,000 ಮಿತಿ ನೀಡಿದ್ದರೆ, ನೀವು ₹10,000 ಖರ್ಚು ಮಾಡಿದಾಗ ಲಭ್ಯವಿರುವ ಮಿತಿ ₹40,000 ಆಗುತ್ತದೆ. ಬಿಲ್ ದಿನಾಂಕದಂದು ಪೂರ್ಣ ಪಾವತಿಸಿದಾಗ ಮಿತಿ ಮತ್ತೆ ₹50,000 ಆಗುತ್ತದೆ.
2. **ಬಡ್ಡಿ-ರಹಿತ ರಿಯಾಯಿತಿ ಕಾಲಾವಧಿ:** ನಿಯಮಿತ ಅವಧಿಯೊಳಗೆ **ಒಟ್ಟು ಬಾಕಿ ಮೊತ್ತ (Total Amount Due)** ಪಾವತಿಸಿದರೆ ನೀವು **₹0 ಬಡ್ಡಿ** ನೀಡಬೇಕಾಗುತ್ತದೆ.
3. **ಶಿಸ್ತು:** ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಉಚಿತ ಹಣವಲ್ಲ; ಇದು ಸುಲಭ ಪಾವತಿ ಸಾಧನ ಮಾತ್ರ.

> **ಚಿನ್ನದ ನಿಯಮ:** ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಅನ್ನು ಡೆಬಿಟ್ ಕಾರ್ಡ್‌ನಂತೆ ಬಳಸಿ. ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ ಹಣವಿಲ್ಲದಿದ್ದರೆ ಕಾರ್ಡ್ ಸ್ವೈಪ್ ಮಾಡಬೇಡಿ."""
        },
        "key_takeaways": {
            "en": [
                "Credit cards lend bank funds up to a set limit; you repay later.",
                "Pay 100% of the statement balance by the due date to incur zero interest.",
                "Never spend money you do not already have in your savings account."
            ],
            "hi": [
                "क्रेडिट कार्ड बैंक का पैसा उधार देता है जिसे आपको बाद में चुकाना होता है।",
                "बिल की पूरी राशि देय तिथि पर चुकाने पर 0% ब्याज लगता है।",
                "कभी भी अपनी बचत से अधिक राशि क्रेडिट कार्ड पर खर्च न करें।"
            ],
            "kn": [
                "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಬ್ಯಾಂಕಿನ ಹಣವನ್ನು ತಾತ್ಕಾಲಿಕವಾಗಿ ನೀಡುತ್ತದೆ; ನಂತರ ಮರುಪಾವತಿಸಬೇಕು.",
                "ನಿಗದಿತ ದಿನಾಂಕದಂದು ಪೂರ್ಣ ಬಿಲ್ ಪಾವತಿಸಿದರೆ ಶೂನ್ಯ ಬಡ್ಡಿ.",
                "ನಿಮ್ಮ ಉಳಿತಾಯಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಹಣವನ್ನು ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಮೂಲಕ ಖರ್ಚು ಮಾಡಬೇಡಿ."
            ]
        },
        "quiz": [
            {
                "id": 1,
                "question": "What happens if you pay your Total Amount Due in full every month before the due date?",
                "options": [
                    {"id": 1, "text": "You pay zero interest to the bank and build positive credit."},
                    {"id": 2, "text": "The bank charges you a 3.5% maintenance fee."},
                    {"id": 3, "text": "Your credit limit is immediately reduced."}
                ],
                "correct_option_id": 1,
                "explanation": "Paying your full statement balance within the grace period results in zero interest charges and builds a healthy credit history."
            },
            {
                "id": 2,
                "question": "If your credit limit is ₹80,000 and you spend ₹25,000, what is your available limit?",
                "options": [
                    {"id": 1, "text": "₹80,000"},
                    {"id": 2, "text": "₹55,000"},
                    {"id": 3, "text": "₹105,000"}
                ],
                "correct_option_id": 2,
                "explanation": "Available limit is total limit minus current unbilled and billed spends (₹80,000 - ₹25,000 = ₹55,000)."
            }
        ]
    },
    {
        "id": "cf-02-billing-cycle-grace-period",
        "category_id": "credit_fundamentals",
        "order": 2,
        "reading_time_minutes": 4,
        "title": {
            "en": "Billing Cycles, Statement Dates & Grace Periods",
            "hi": "बिलिंग चक्र, स्टेटमेंट तिथि और ग्रेस पीरियड",
            "kn": "ಬಿಲ್ಲಿಂಗ್ ಚಕ್ರ, ಸ್ಟೇಟ್‌ಮೆಂಟ್ ದಿನಾಂಕ ಮತ್ತು ಗ್ರೇಸ್ ಅವಧಿ"
        },
        "summary": {
            "en": "Demystify statement dates, payment due dates, and how to maximize your 20 to 50 days interest-free window.",
            "hi": "स्टेटमेंट की तारीख, देय तिथि और 20 से 50 दिनों की ब्याज-मुक्त अवधि का सही लाभ उठाना सीखें।",
            "kn": "ಸ್ಟೇಟ್‌ಮೆಂಟ್ ದಿನಾಂಕ, ಪಾವತಿ ದಿನಾಂಕ ಮತ್ತು 20 ರಿಂದ 50 ದಿನಗಳ ಬಡ್ಡಿ-ರಹಿತ ಅವಧಿಯನ್ನು ಸರಿಯಾಗಿ ಬಳಸುವುದು."
        },
        "content": {
            "en": """### Key Dates Every Cardholder Must Know

A credit card does not bill continuously; it operates on a fixed 30-day rhythm known as the **Billing Cycle**.

#### 1. Statement Generation Date:
The date the bank tallies all transactions from the preceding 30 days and issues your monthly bill (e.g., the 15th of every month).

#### 2. Payment Due Date:
Usually 15 to 25 days after the statement generation date (e.g., the 5th of the following month). You must settle the bill on or before this day.

#### 3. Grace Period (Interest-Free Window):
The period between the transaction date and the payment due date. This can range from **20 to 50 days**.
- If you purchase groceries on the 16th (one day after your statement is generated), that transaction is billed on the *next* statement (30 days later) and due 20 days after that. You get **50 days of interest-free credit**!
- If you purchase on the 14th (one day before statement generation), it is due in 20 days.

> **Crucial Warning:** The grace period is valid **only if** you have zero revolving balance carried over from the previous month. If you leave even ₹100 unpaid, the grace period is revoked on all subsequent transactions!""",
            "hi": """### प्रत्येक कार्डधारक के लिए महत्वपूर्ण तिथियां

क्रेडिट कार्ड पर खर्च 30 दिनों के एक निश्चित चक्र में दर्ज होता है जिसे **बिलिंग चक्र (Billing Cycle)** कहते हैं।

#### 1. स्टेटमेंट बनने की तिथि (Statement Date):
वह दिन जब बैंक पिछले 30 दिनों के खर्चों का हिसाब कर बिल जारी करता है (उदा. हर महीने की 15 तारीख)।

#### 2. भुगतान की अंतिम तिथि (Payment Due Date):
आमतौर पर स्टेटमेंट जारी होने के 15 से 25 दिन बाद (उदा. अगले महीने की 5 तारीख)।

#### 3. ग्रेस पीरियड (ब्याज-मुक्त अवधि):
खरीदारी के दिन से भुगतान की अंतिम तिथि के बीच का समय (लगभग **20 से 50 दिन**)।
- यदि आप 16 तारीख को खरीदारी करते हैं (स्टेटमेंट बनने के ठीक एक दिन बाद), तो वह अगले महीने के बिल में आएगी। आपको लगभग 50 दिनों का ब्याज-मुक्त समय मिलता है!

> **सतर्कता:** ग्रेस पीरियड तभी लागू रहता है जब पिछले महीने का कोई भी बकाया न हो। यदि आपने ₹100 भी बाकी रखे, तो नए खर्चों पर पहले ही दिन से ब्याज लगना शुरू हो जाता है!""",
            "kn": """### ಪ್ರತಿಯೊಬ್ಬರೂ ತಿಳಿದಿರಬೇಕಾದ ದಿನಾಂಕಗಳು

ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಪ್ರತಿ ತಿಂಗಳ 30 ದಿನಗಳ ಚಕ್ರದಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ. ಇದನ್ನು **ಬಿಲ್ಲಿಂಗ್ ಸೈಕಲ್** ಎನ್ನಲಾಗುತ್ತದೆ.

#### 1. ಸ್ಟೇಟ್‌ಮೆಂಟ್ ದಿನಾಂಕ:
ಕಳೆದ 30 ದಿನಗಳ ನಿಮ್ಮ ಎಲ್ಲಾ ವಹಿವಾಟುಗಳನ್ನು ಒಟ್ಟುಗೂಡಿಸಿ ಬ್ಯಾಂಕ್ ಬಿಲ್ ನೀಡುವ ದಿನಾಂಕ (ಉದಾಹರಣೆಗೆ ಪ್ರತಿ ತಿಂಗಳ 15ನೇ ತಾರೀಕು).

#### 2. ಬಾಕಿ ಪಾವತಿ ದಿನಾಂಕ (Due Date):
ಸ್ಟೇಟ್‌ಮೆಂಟ್ ಬಂದ 15 ರಿಂದ 25 ದಿನಗಳ ನಂತರದ ದಿನಾಂಕ (ಉದಾಹರಣೆಗೆ ಮುಂದಿನ ತಿಂಗಳ 5ನೇ ತಾರೀಕು).

#### 3. ರಿಯಾಯಿತಿ ಅವಧಿ (Grace Period):
ವಹಿವಾಟು ನಡೆಸಿದ ದಿನದಿಂದ ಪಾವತಿ ದಿನಾಂಕದವರೆಗಿನ ಸಮಯ (ಸಾಮಾನ್ಯವಾಗಿ **20 ರಿಂದ 50 ದಿನಗಳು**).
- ಬಿಲ್ ಬಂದ ಮರುದಿನವೇ (16ನೇ ತಾರೀಕು) ಮಾಡಿದ ಖರೀದಿಗೆ ಗರಿಷ್ಠ 50 ದಿನಗಳ ಬಡ್ಡಿ-ರಹಿತ ಸಮಯ ಸಿಗುತ್ತದೆ!"""
        },
        "key_takeaways": {
            "en": [
                "Statement date marks the close of the 30-day billing cycle.",
                "Purchasing right after your statement date gives you up to 50 interest-free days.",
                "Carrying forward any balance cancels the grace period for all future purchases."
            ],
            "hi": [
                "स्टेटमेंट की तारीख 30 दिनों के बिलिंग चक्र का समापन होती है।",
                "स्टेटमेंट बनने के तुरंत बाद खरीदारी करने से अधिकतम 50 दिनों का समय मिलता है।",
                "कोई भी बकाया रखने पर भविष्य की सभी खरीदारियों से ब्याज-मुक्त अवधि समाप्त हो जाती है।"
            ],
            "kn": [
                "ಸ್ಟೇಟ್‌ಮೆಂಟ್ ದಿನಾಂಕವು 30 ದಿನಗಳ ಸೈಕಲ್‌ನ ಮುಕ್ತಾಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
                "ಸ್ಟೇಟ್‌ಮೆಂಟ್ ಬಂದ ಕೂಡಲೇ ಖರೀದಿ ಮಾಡಿದರೆ 50 ದಿನಗಳವರೆಗೆ ಬಡ್ಡಿ ಇರುವುದಿಲ್ಲ.",
                "ಸ್ವಲ್ಪ ಬಾಕಿ ಉಳಿಸಿಕೊಂಡರೂ ಮುಂದಿನ ಎಲ್ಲಾ ವಹಿವಾಟುಗಳಿಗೂ ಬಡ್ಡಿ ಅನ್ವಯಿಸುತ್ತದೆ."
            ]
        },
        "quiz": [
            {
                "id": 1,
                "question": "When do you get the longest interest-free grace period on a credit card purchase?",
                "options": [
                    {"id": 1, "text": "Purchasing 1 day after the statement generation date."},
                    {"id": 2, "text": "Purchasing 1 day before the statement generation date."},
                    {"id": 3, "text": "Purchasing on the payment due date."}
                ],
                "correct_option_id": 1,
                "explanation": "Buying right after statement generation allows the charge to roll into the next month's bill, yielding up to 45-50 days before the due date."
            },
            {
                "id": 2,
                "question": "What happens to your grace period if you carry forward ₹500 unpaid from last month?",
                "options": [
                    {"id": 1, "text": "You still get 50 days for free."},
                    {"id": 2, "text": "The grace period is lost, and new purchases accumulate interest from day one."},
                    {"id": 3, "text": "The bank doubles your grace period."}
                ],
                "correct_option_id": 2,
                "explanation": "Under Indian banking standards, carrying forward any revolving debt revokes the interest-free grace period on new transactions immediately."
            }
        ]
    },
    {
        "id": "cf-03-total-due-vs-min-due",
        "category_id": "credit_fundamentals",
        "order": 3,
        "reading_time_minutes": 4,
        "title": {
            "en": "Total Amount Due vs Minimum Amount Due",
            "hi": "कुल देय राशि (Total Due) बनाम न्यूनतम देय राशि (Minimum Due)",
            "kn": "ಒಟ್ಟು ಬಾಕಿ ಮೊತ್ತ (Total Due) ಮತ್ತು ಕನಿಷ್ಠ ಬಾಕಿ ಮೊತ್ತ (Minimum Due)"
        },
        "summary": {
            "en": "Learn why paying only the minimum due is one of the most expensive financial traps in consumer banking.",
            "hi": "जानें क्यों केवल न्यूनतम देय राशि चुकाना वित्तीय दुनिया का सबसे महंगा और खतरनाक जाल है।",
            "kn": "ಕೇವಲ ಕನಿಷ್ಠ ಮೊತ್ತವನ್ನು ಪಾವತಿಸುವುದು ಸಾಲದ ಚಕ್ರದಲ್ಲಿ ಸಿಲುಕಿಸುವ ದೊಡ್ಡ ಬಲೆ ಎಂದು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ."
        },
        "content": {
            "en": """### The Biggest Confusion in Credit Cards

Every monthly statement shows two numbers prominently:
1. **Total Amount Due (TAD)**
2. **Minimum Amount Due (MAD)**

#### What is Minimum Amount Due?
The Minimum Amount Due is usually **5% of your total balance** (or ₹500, whichever is higher).
- **What it does:** Paying the MAD prevents your account from being reported as 'Late' to credit bureaus (CIBIL/Experian), and avoids late payment penalty fees.
- **What it DOES NOT do:** It does **NOT** stop interest from accumulating.

#### The Interest Reality:
When you pay only the MAD, the remaining 95% balance continues to attract interest at **3.5% to 3.75% per month** (over **42% to 48% APR**), compounded daily! Furthermore, 18% GST is added to all finance charges.

#### Practical Indian Example:
Suppose you spend ₹20,000 on electronic gadgets.
- If you pay ₹1,000 (5% MAD):
  - Remaining ₹19,000 attracts ~₹700 interest this month alone.
  - Plus 18% GST (₹126) on the interest.
  - Next month your balance is back up to ₹19,826!
  - It would take you **over 6 years** to pay off this ₹20,000 purchase, and you would pay over ₹18,000 in interest alone!

> **Always Pay Total Amount Due:** Enable auto-debit for 'Total Amount Due' in your netbanking app to protect your finances.""",
            "hi": """### क्रेडिट कार्ड का सबसे बड़ा भ्रम

आपके मासिक बिल में दो आंकड़े मुख्य रूप से दिखते हैं:
1. **कुल देय राशि (Total Amount Due - TAD)**
2. **न्यूनतम देय राशि (Minimum Amount Due - MAD)**

#### न्यूनतम देय राशि क्या है?
यह आमतौर पर आपके कुल बिल का **5% या ₹500** (जो भी अधिक हो) होता है।
- **इसका फायदा:** इसे भरने से लेट फीस नहीं लगती और CIBIL में डिफ़ॉल्ट दर्ज नहीं होता।
- **इसका नुकसान:** यह ब्याज को नहीं रोकता!

बचे हुए 95% बिल पर **3.5% प्रति माह (लगभग 42% से 48% वार्षिक)** की दर से भारी ब्याज लगता है, साथ ही ब्याज पर 18% GST भी लगता है।

#### उदाहरण:
यदि आपका बिल ₹20,000 है और आप सिर्फ ₹1,000 न्यूनतम देय भरते हैं:
- बाकी ₹19,000 पर लगभग ₹700 ब्याज और उस पर ₹126 GST लग जाएगा।
- इसे पूरी तरह चुकाने में **6 वर्ष से अधिक** का समय लग जाएगा और आपको लगभग ₹18,000 केवल ब्याज भरना पड़ेगा!

> **हमेशा 'Total Amount Due' भरें:** अपने बैंक ऐप में ऑटो-डेबिट हमेशा 'Total Amount Due' पर सेट करें।""",
            "kn": """### ಬಿಲ್‌ನಲ್ಲಿನ ಎರಡು ಪ್ರಮುಖ ಮೊತ್ತಗಳು

ಪ್ರತಿ ತಿಂಗಳ ಬಿಲ್‌ನಲ್ಲಿ ಎರಡು ಆಯ್ಕೆಗಳು ಇರುತ್ತವೆ:
1. **ಒಟ್ಟು ಬಾಕಿ ಮೊತ್ತ (Total Amount Due)**
2. **ಕನಿಷ್ಠ ಬಾಕಿ ಮೊತ್ತ (Minimum Amount Due)**

#### ಕನಿಷ್ಠ ಮೊತ್ತದ ಸತ್ಯಾಸತ್ಯತೆ:
ಇದು ಒಟ್ಟು ಬಿಲ್‌ನ ಕೇವಲ **5%** ಆಗಿರುತ್ತದೆ.
- ಇದನ್ನು ಪಾವತಿಸಿದರೆ ಬ್ಯಾಂಕ್ ಲೇಟ್ ಫೀ ವಿಧಿಸುವುದಿಲ್ಲ.
- ಆದರೆ ಉಳಿದ 95% ಹಣಕ್ಕೆ ತಿಂಗಳಿಗೆ **3.5% (ವಾರ್ಷಿಕ 42%-48%)** ಭಾರಿ ಬಡ್ಡಿ ಮತ್ತು ಅದರ ಮೇಲೆ 18% GST ಬೀಳುತ್ತದೆ!

#### ಉದಾಹರಣೆ:
₹20,000 ಬಿಲ್‌ನಲ್ಲಿ ಕೇವಲ ₹1,000 ಕನಿಷ್ಠ ಮೊತ್ತ ಪಾವತಿಸುತ್ತಾ ಹೋದರೆ, ಅದನ್ನು ತೀರಿಸಲು **6 ವರ್ಷಕ್ಕೂ ಹೆಚ್ಚು** ಸಮಯ ಬೇಕು ಮತ್ತು ಅಸಲಿಗಿಂತ ಹೆಚ್ಚು ಬಡ್ಡಿ ಕಟ್ಟಬೇಕಾಗುತ್ತದೆ!"""
        },
        "key_takeaways": {
            "en": [
                "Minimum Amount Due (5%) only avoids late fees; it does NOT avoid interest.",
                "Unpaid balances accrue interest at 42%-48% APR plus 18% GST.",
                "Always set auto-pay to Total Amount Due, not Minimum Amount Due."
            ],
            "hi": [
                "न्यूनतम देय केवल लेट फीस बचाता है, ब्याज नहीं।",
                "बकाए पर 42%-48% वार्षिक ब्याज और 18% GST लगता है।",
                "ऑटो-डेबिट हमेशा कुल देय राशि (Total Due) पर रखें।"
            ],
            "kn": [
                "ಕನಿಷ್ಠ ಮೊತ್ತ ಕೇವಲ ದಂಡ ತಪ್ಪಿಸುತ್ತದೆ, ಆದರೆ ಭಾರಿ ಬಡ್ಡಿಯನ್ನು ತಪ್ಪಿಸುವುದಿಲ್ಲ.",
                "ಉಳಿದ ಹಣಕ್ಕೆ ವಾರ್ಷಿಕ 42%-48% ಬಡ್ಡಿ ಮತ್ತು 18% GST ವಿಧಿಸಲಾಗುತ್ತದೆ.",
                "ಯಾವಾಗಲೂ ಸಂಪೂರ್ಣ ಬಿಲ್ ಮೊತ್ತವನ್ನೇ ಪಾವತಿಸಿ."
            ]
        },
        "quiz": [
            {
                "id": 1,
                "question": "What is the primary danger of paying only the Minimum Amount Due?",
                "options": [
                    {"id": 1, "text": "Your card is immediately canceled."},
                    {"id": 2, "text": "The remaining 95% balance accrues compounding interest at 42-48% APR."},
                    {"id": 3, "text": "You are forced to take a personal loan."}
                ],
                "correct_option_id": 2,
                "explanation": "Paying minimum due triggers aggressive monthly compounding interest on the unpaid principal plus 18% GST."
            },
            {
                "id": 2,
                "question": "Which auto-debit setting protects you completely from interest charges?",
                "options": [
                    {"id": 1, "text": "Auto-debit Minimum Amount Due."},
                    {"id": 2, "text": "Auto-debit Total Amount Due."},
                    {"id": 3, "text": "Auto-debit ₹1,000 flat."}
                ],
                "correct_option_id": 2,
                "explanation": "Auto-debiting the Total Amount Due ensures the entire billed balance is cleared before the due date, guaranteeing zero interest."
            }
        ]
    },
    {
        "id": "cf-04-secured-vs-unsecured",
        "category_id": "credit_fundamentals",
        "order": 4,
        "reading_time_minutes": 3,
        "title": {
            "en": "Secured vs Unsecured Credit Cards",
            "hi": "सुरक्षित (FD-आधारित) बनाम असुरक्षित क्रेडिट कार्ड",
            "kn": "ಸೆಕ್ಯೂರ್ಡ್ (FD ಆಧಾರಿತ) ಮತ್ತು ಅನ್‌ಸೆಕ್ಯೂರ್ಡ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ಗಳು"
        },
        "summary": {
            "en": "How students, freelancers, and beginners can use Fixed Deposit (FD) backed cards to build a strong CIBIL score from scratch.",
            "hi": "छात्र, फ्रीलांसर और पहली बार कार्ड लेने वाले लोग फिक्स्ड डिपॉजिट (FD) कार्ड से शून्य से CIBIL स्कोर कैसे बनाएं।",
            "kn": "ವಿದ್ಯಾರ್ಥಿಗಳು ಮತ್ತು ಹೊಸಬರು ಫಿಕ್ಸೆಡ್ ಡೆಪಾಸಿಟ್ (FD) ಆಧಾರಿತ ಕಾರ್ಡ್‌ಗಳ ಮೂಲಕ ಉತ್ತಮ CIBIL ಸ್ಕೋರ್ ನಿರ್ಮಿಸುವುದು ಹೇಗೆ."
        },
        "content": {
            "en": """### Building Credit with Zero History

If you are a student, gig worker, or starting your first job, traditional banks may reject your application due to 'No Credit History' (NH). The solution is a **Secured Credit Card**.

#### Unsecured Credit Card:
- Granted based on your monthly salary slips, ITR filings, and existing CIBIL score (750+).
- No collateral is required.

#### Secured Credit Card (FD-Backed):
- Issued against a Fixed Deposit (e.g., ₹10,000 to ₹50,000) placed with the bank.
- You typically receive **80% to 90% of your FD amount** as your credit limit (e.g. ₹18,000 limit on a ₹20,000 FD).
- Your FD continues to earn its regular interest rate (e.g. 6.5% to 7.5% per annum)!
- The bank reports your timely payments to CIBIL and Experian every month just like an unsecured card.

After 6 to 12 months of disciplined usage (paying full bills on time and keeping utilization under 30%), banks will proactively offer you pre-approved unsecured cards!""",
            "hi": """### शून्य से क्रेडिट इतिहास का निर्माण

यदि आप छात्र हैं या नई नौकरी शुरू कर रहे हैं, तो बैंक क्रेडिट इतिहास न होने के कारण आपका आवेदन अस्वीकार कर सकते हैं। इसका सबसे सुरक्षित समाधान है **सिक्योर्ड (FD-आधारित) क्रेडिट कार्ड**।

#### सिक्योर्ड कार्ड कैसे काम करता है?
- आप बैंक में एक फिक्स्ड डिपॉजिट (जैसे ₹15,000 या ₹25,000) करते हैं।
- बैंक उस FD के 80% से 90% हिस्से जितनी क्रेडिट सीमा का कार्ड दे देता है।
- आपकी FD पर पूरा ब्याज (6.5% - 7.5%) मिलता रहता है!
- समय पर बिल भरने पर बैंक हर महीने CIBIL को सकारात्मक रिपोर्ट भेजता है।

6 से 12 महीने बाद जब आपका CIBIL स्कोर 750+ बन जाता है, तो बैंक आपको बिना FD वाला नियमित कार्ड ऑफर कर देते हैं।""",
            "kn": """### ಯಾವುದೇ ಕ್ರೆಡಿಟ್ ಇತಿಹಾಸವಿಲ್ಲದೆ ಆರಂಭಿಸುವುದು ಹೇಗೆ?

ವಿದ್ಯಾರ್ಥಿಗಳು ಅಥವಾ ಹೊಸ ಉದ್ಯೋಗಿಗಳಿಗೆ CIBIL ಸ್ಕೋರ್ ಇಲ್ಲದ ಕಾರಣ ನಿಯಮಿತ ಕಾರ್ಡ್ ಸಿಗುವುದು ಕಷ್ಟ. ಇದಕ್ಕೆ ಉತ್ತಮ ಪರಿಹಾರ **ಸೆಕ್ಯೂರ್ಡ್ (FD ಬೆಂಬಲಿತ) ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್** ಆಗಿದೆ.

- ನೀವು ಬ್ಯಾಂಕಿನಲ್ಲಿ ₹15,000 ಅಥವಾ ₹20,000 ಫಿಕ್ಸೆಡ್ ಡೆಪಾಸಿಟ್ (FD) ಇಡುತ್ತೀರಿ.
- ಬ್ಯಾಂಕ್ ಆ FD ಮೊತ್ತದ 80%-90% ಮಿತಿಯ ಕಾರ್ಡ್ ನೀಡುತ್ತದೆ.
- ನಿಮ್ಮ ಡೆಪಾಸಿಟ್‌ಗೆ ಬ್ಯಾಂಕಿನ ಪೂರ್ಣ ಬಡ್ಡಿ ಸಿಗುತ್ತಿರುತ್ತದೆ.
- ನೀವು ನಿಯಮಿತವಾಗಿ ಬಿಲ್ ಪಾವತಿಸಿದಾಗ ಉತ್ತಮ CIBIL ಸ್ಕೋರ್ ನಿರ್ಮಾಣವಾಗುತ್ತದೆ."""
        },
        "key_takeaways": {
            "en": [
                "Secured cards are backed by a fixed deposit and have almost 100% approval rates.",
                "Your fixed deposit continues to earn standard interest while you build credit.",
                "6 to 12 months of disciplined use unlocks regular unsecured cards."
            ],
            "hi": [
                "सिक्योर्ड कार्ड FD द्वारा समर्थित होते हैं और आसानी से मिल जाते हैं।",
                "क्रेडिट स्कोर बनते समय आपकी FD पर सामान्य ब्याज भी मिलता रहता है।",
                "6-12 महीने अनुशासित उपयोग से सामान्य कार्ड के दरवाजे खुल जाते हैं।"
            ],
            "kn": [
                "FD ಆಧಾರಿತ ಕಾರ್ಡ್‌ಗಳು ಎಲ್ಲರಿಗೂ ಸುಲಭವಾಗಿ ಲಭ್ಯವಿರುತ್ತವೆ.",
                "ಕ್ರೆಡಿಟ್ ಸ್ಕೋರ್ ಬೆಳೆಯುವ ಜೊತೆಗೆ FD ಮೇಲಿನ ಬಡ್ಡಿಯೂ ಬರುತ್ತದೆ.",
                "6-12 ತಿಂಗಳ ಸರಿಯಾದ ಬಳಕೆಯ ನಂತರ ಸಾಮಾನ್ಯ ಕಾರ್ಡ್ ಪಡೆಯಬಹುದು."
            ]
        },
        "quiz": [
            {
                "id": 1,
                "question": "Does your Fixed Deposit earn bank interest while backing a secured credit card?",
                "options": [
                    {"id": 1, "text": "Yes, your FD earns standard interest as usual."},
                    {"id": 2, "text": "No, the bank stops interest payments."},
                    {"id": 3, "text": "The interest is surrendered as a penalty."}
                ],
                "correct_option_id": 1,
                "explanation": "Your FD remains active and earns interest per its term. It simply acts as lien collateral for the credit limit."
            },
            {
                "id": 2,
                "question": "Who benefits most from an FD-backed credit card?",
                "options": [
                    {"id": 1, "text": "Individuals with no credit history, students, or those rebuilding CIBIL."},
                    {"id": 2, "text": "People with 850 CIBIL scores and high incomes."},
                    {"id": 3, "text": "Only corporate treasuries."}
                ],
                "correct_option_id": 1,
                "explanation": "Secured cards are designed for individuals without existing credit footprints to safely establish a credit score."
            }
        ]
    },

    # Category 2: Interest & Debt Awareness
    {
        "id": "id-01-how-interest-is-calculated",
        "category_id": "interest_debt",
        "order": 1,
        "reading_time_minutes": 4,
        "title": {
            "en": "How Credit Card Interest & APR Actually Work",
            "hi": "क्रेडिट कार्ड का ब्याज और APR वास्तव में कैसे काम करते हैं",
            "kn": "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಬಡ್ಡಿ ಮತ್ತು APR ಲೆಕ್ಕಾಚಾರ ಹೇಗೆ ನಡೆಯುತ್ತದೆ"
        },
        "summary": {
            "en": "Understand the Average Daily Balance method, 42%+ APR, and how finance charges compound daily.",
            "hi": "दैनिक औसत शेष (Average Daily Balance) विधि, 42%+ APR और दैनिक चक्रवृद्धि ब्याज को समझें।",
            "kn": "ದೈನಂದಿನ ಸರಾಸರಿ ಬಾಕಿ ವಿಧಾನ, 42%+ APR ಬಡ್ಡಿ ಮತ್ತು ಚಕ್ರಬಡ್ಡಿ ಲೆಕ್ಕಾಚಾರವನ್ನು ಅರಿಯಿರಿ."
        },
        "content": {
            "en": """### Decoding the 3.5% Myth

Credit card advertisements often state: *"Interest rate is just 3.5% per month."*
3.5% sounds small, but in financial reality:
- **Annualized APR:** `3.5% x 12 = 42.0%`
- **Compounded Effective APR:** Over **51.1% per year**!
- Compare this with a home loan (8.5% p.a.) or education loan (10% p.a.). Credit card debt is almost **5 times more expensive** than any other formal debt.

#### The Average Daily Balance Formula:
Indian banks calculate interest using:
$$\\text{Interest} = \\frac{\\text{Outstanding Balance} \\times \\text{Number of Days} \\times \\text{Monthly Rate} \\times 12}{365}$$

#### The Silent Addition: 18% GST
In India, the government levies **18% Goods and Services Tax (GST)** on all bank finance charges, processing fees, and interest payments. If your monthly interest is ₹1,000, you pay ₹1,180 total!

#### Immediate Revocation of Grace Period:
If you carry over a balance, **new purchases begin accumulating interest immediately from the minute of the transaction swipe**, without any 45-day interest-free window!""",
            "hi": """### 3.5% का भ्रम

बैंक अक्सर कहते हैं: *"ब्याज सिर्फ 3.5% प्रति माह है।"*
सुनने में यह कम लगता है, लेकिन:
- **वार्षिक दर (APR):** 3.5% x 12 = **42% प्रति वर्ष**!
- होम लोन (8.5%) या एजुकेशन लोन (10%) की तुलना में क्रेडिट कार्ड 4 से 5 गुना महंगा होता है।

#### 18% GST का अतिरिक्त भार:
भारत में सभी बैंक शुल्कों और ब्याज पर **18% GST** लगता है। यदि ₹1,000 ब्याज बना, तो आपको ₹1,180 चुकाने होंगे।

#### ग्रेस पीरियड का तुरंत खात्मा:
यदि आपने पिछले महीने का बिल पूरा नहीं चुकाया, तो अगली किसी भी खरीदारी पर पहले ही दिन से 42% का ब्याज लगना शुरू हो जाता है!""",
            "kn": """### 3.5% ಬಡ್ಡಿಯ ಹಿಂದಿನ ರಹಸ್ಯ

ಬ್ಯಾಂಕುಗಳು *"ತಿಂಗಳಿಗೆ ಕೇವಲ 3.5% ಬಡ್ಡಿ"* ಎಂದು ಜಾಹೀರಾತು ನೀಡುತ್ತವೆ.
ಆದರೆ ವಾರ್ಷಿಕವಾಗಿ ಇದು:
- 3.5% x 12 = **ವಾರ್ಷಿಕ 42% APR** ಆಗುತ್ತದೆ!
- ಇದಕ್ಕೆ 18% GST ಸೇರಿಸಿದಾಗ ಬಡ್ಡಿಯ ಪ್ರಮಾಣ ಇನ್ನೂ ಹೆಚ್ಚಾಗುತ್ತದೆ.

ಹೊಸ ಖರೀದಿಗಳಿಗೂ ಮೊದಲ ದಿನದಿಂದಲೇ ಬಡ್ಡಿ ಕಡಿತವಾಗಲು ಶುರುವಾಗುತ್ತದೆ."""
        },
        "key_takeaways": {
            "en": [
                "3.5% monthly translates to 42% to 51% effective annualized APR.",
                "All finance charges and interest attract mandatory 18% GST in India.",
                "Carrying an outstanding balance causes new purchases to be charged interest immediately."
            ],
            "hi": [
                "3.5% मासिक का अर्थ 42% से 51% वार्षिक ब्याज होता है।",
                "ब्याज पर सरकार द्वारा अनिवार्य 18% GST भी लगाया जाता है।",
                "बकाया रहने पर नए खर्चों पर पहले ही दिन से ब्याज लगना शुरू हो जाता है।"
            ],
            "kn": [
                "ತಿಂಗಳಿಗೆ 3.5% ಎಂದರೆ ವಾರ್ಷಿಕವಾಗಿ 42% ಕ್ಕಿಂತ ಅಧಿಕ ಬಡ್ಡಿ.",
                "ಬಡ್ಡಿಯ ಮೇಲೆ ಭಾರತ ಸರ್ಕಾರದ 18% GST ಕಡ್ಡಾಯ.",
                "ಬಾಕಿ ಉಳಿದಿದ್ದರೆ ಹೊಸ ಖರ್ಚುಗಳಿಗೂ ತಕ್ಷಣವೇ ಬಡ್ಡಿ ಶುರುವಾಗುತ್ತದೆ."
            ]
        },
        "quiz": [
            {
                "id": 1,
                "question": "What is the approximate annual APR of a card charging 3.5% monthly interest?",
                "options": [
                    {"id": 1, "text": "3.5%"},
                    {"id": 2, "text": "12.0%"},
                    {"id": 3, "text": "42.0% to 51.0% effective"}
                ],
                "correct_option_id": 3,
                "explanation": "3.5% monthly nominal interest translates to 42% simple APR and exceeds 50% with monthly compounding."
            },
            {
                "id": 2,
                "question": "Is GST charged on credit card interest in India?",
                "options": [
                    {"id": 1, "text": "Yes, 18% GST is added to all finance charges."},
                    {"id": 2, "text": "No, financial interest is exempt from GST."},
                    {"id": 3, "text": "Only if you spend more than ₹10 Lakhs."}
                ],
                "correct_option_id": 1,
                "explanation": "Under Indian tax regulations, 18% GST applies to all bank service fees and credit card finance charges."
            }
        ]
    },
    {
        "id": "id-02-cash-advance-penalties",
        "category_id": "interest_debt",
        "order": 2,
        "reading_time_minutes": 3,
        "title": {
            "en": "ATM Cash Advances: The Most Dangerous Card Feature",
            "hi": "ATM से कैश निकासी: क्रेडिट कार्ड की सबसे खतरनाक सुविधा",
            "kn": "ATM ನಿಂದ ನಗದು ಹಿಂಪಡೆಯುವಿಕೆ: ಅತ್ಯಂತ ಅಪಾಯಕಾರಿ ಆಯ್ಕೆ"
        },
        "summary": {
            "en": "Why inserting your credit card into an ATM for cash withdrawal comes with instant fees and zero grace period.",
            "hi": "क्रेडिट कार्ड से एटीएम से पैसे निकालने पर तुरंत भारी शुल्क और बिना किसी ग्रेस पीरियड के ब्याज क्यों लगता है।",
            "kn": "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಬಳಸಿ ATM ನಿಂದ ಹಣ ತೆಗೆದರೆ ತಕ್ಷಣವೇ ಭಾರಿ ಶುಲ್ಕ ಮತ್ತು ಬಡ್ಡಿ ಏಕೆ ಬೀಳುತ್ತದೆ."
        },
        "content": {
            "en": """### Never Withdraw Cash on a Credit Card

Using your credit card to withdraw physical cash from an ATM is known as a **Cash Advance**. It is widely regarded by financial planners as the single most punitive transaction you can perform.

#### Why is it so harmful?
1. **Immediate Upfront Fee:** Banks charge a cash advance fee of **2.5% to 3.0% of the withdrawal amount** (subject to a minimum of ₹300 to ₹500), plus 18% GST.
2. **Zero Grace Period:** Unlike retail shopping, **there is NO interest-free window**. Finance charges (3.5%/month = 42% APR) begin compounding from the very second the cash leaves the ATM machine.
3. **Double Impact:** If you withdraw ₹10,000:
   - Upfront fee: ₹300 + 18% GST = ₹354
   - Daily interest begins immediately.
   - You have already lost 4% to 5% of your money on Day 1.

> **Emergency Alternative:** If you urgently need cash, use your debit card, UPI from a savings account, or look at a micro-overdraft/pre-approved personal loan which charges far lower interest.""",
            "hi": """### क्रेडिट कार्ड से कभी कैश न निकालें

एटीएम में क्रेडिट कार्ड डालकर पैसे निकालना (Cash Advance) सबसे महंगा सौदा है।

#### यह इतना नुकसानदेह क्यों है?
1. **तत्काल निकासी शुल्क:** बैंक तुरंत **2.5% से 3% (न्यूनतम ₹300 से ₹500)** शुल्क और उस पर 18% GST काट लेते हैं।
2. **शून्य ग्रेस पीरियड:** खरीदारी की तरह इसमें कोई 45 दिन का समय नहीं मिलता। एटीएम से नोट निकलते ही पहले मिनट से 42% वार्षिक ब्याज लगना शुरू हो जाता है।
3. यदि आपने ₹10,000 निकाले, तो पहले ही दिन लगभग ₹400-₹500 का नुकसान हो जाता है।

> **सलाह:** आपात स्थिति में भी डेबिट कार्ड या यूपीआई का उपयोग करें। क्रेडिट कार्ड से एटीएम निकासी से हमेशा बचें।""",
            "kn": """### ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ನಿಂದ ಎಂದಿಗೂ ನಗದು ಹಣ ತೆಗೆಯಬೇಡಿ

ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಬಳಸಿ ATM ನಿಂದ ಕ್ಯಾಶ್ ತೆಗೆಯುವುದು (Cash Advance) ಅತ್ಯಂತ ದುಬಾರಿ.

- ಬ್ಯಾಂಕ್ ತಕ್ಷಣವೇ 2.5% ರಿಂದ 3% (ಕನಿಷ್ಠ ₹300-₹500) ಶುಲ್ಕ ಮತ್ತು 18% GST ವಿಧಿಸುತ್ತದೆ.
- ಇದಕ್ಕೆ ಯಾವುದೇ ರಿಯಾಯಿತಿ ಅವಧಿ ಇರುವುದಿಲ್ಲ; ಹಣ ಬಂದ ಕ್ಷಣದಿಂದಲೇ ಬಡ್ಡಿ ಆರಂಭವಾಗುತ್ತದೆ.
- ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ ಯಾವಾಗಲೂ ಡೆಬಿಟ್ ಕಾರ್ಡ್ ಅಥವಾ UPI ಬಳಸಿ."""
        },
        "key_takeaways": {
            "en": [
                "Cash advances carry an immediate upfront fee (2.5%-3%) + 18% GST.",
                "Zero grace period: interest starts compounding from the day of withdrawal.",
                "Always use a debit card or UPI for physical cash needs."
            ],
            "hi": [
                "कैश निकासी पर तुरंत 2.5%-3% शुल्क और 18% GST लगता है।",
                "कोई ब्याज-मुक्त समय नहीं मिलता; पहले दिन से ही ब्याज शुरू हो जाता है।",
                "नकद की जरूरत के लिए हमेशा डेबिट कार्ड या यूपीआई का प्रयोग करें।"
            ],
            "kn": [
                "ನಗದು ಹಿಂಪಡೆಯುವಿಕೆಗೆ ತಕ್ಷಣವೇ 2.5%-3% ಶುಲ್ಕ ಮತ್ತು 18% GST ಬೀಳುತ್ತದೆ.",
                "ಯಾವುದೇ ಗ್ರೇಸ್ ಪೀರಿಯಡ್ ಇರುವುದಿಲ್ಲ; ಮೊದಲ ದಿನದಿಂದಲೇ ಬಡ್ಡಿ.",
                "ಕ್ಯಾಶ್ ಅಗತ್ಯಕ್ಕೆ ಯಾವಾಗಲೂ ಡೆಬಿಟ್ ಕಾರ್ಡ್ ಬಳಸಿ."
            ]
        },
        "quiz": [
            {
                "id": 1,
                "question": "When does interest start accruing on a credit card ATM cash withdrawal?",
                "options": [
                    {"id": 1, "text": "After 45 days."},
                    {"id": 2, "text": "On the payment due date."},
                    {"id": 3, "text": "Immediately from the date and minute of withdrawal."}
                ],
                "correct_option_id": 3,
                "explanation": "Cash advances have no grace period; interest accrues immediately from the date of the cash withdrawal."
            },
            {
                "id": 2,
                "question": "What is the typical upfront fee charged on a credit card cash withdrawal?",
                "options": [
                    {"id": 1, "text": "Zero fee."},
                    {"id": 2, "text": "2.5% to 3.0% of the amount (minimum ₹300 to ₹500) plus GST."},
                    {"id": 3, "text": "₹10 flat."}
                ],
                "correct_option_id": 2,
                "explanation": "Banks levy an instant transaction fee of 2.5% to 3.0% subject to a minimum floor of ₹300-₹500 plus 18% GST."
            }
        ]
    },

    # Category 3: Personal Finance Fundamentals
    {
        "id": "pf-01-the-50-30-20-rule",
        "category_id": "personal_finance",
        "order": 1,
        "reading_time_minutes": 4,
        "title": {
            "en": "Budgeting Made Simple: The 50-30-20 Rule",
            "hi": "सरल बजट निर्माण: 50-30-20 का नियम",
            "kn": "ಸರಳ ಬಜೆಟ್ ನಿಯಮ: 50-30-20 ತತ್ವ"
        },
        "summary": {
            "en": "A proven, stress-free formula to allocate your monthly take-home salary into Needs, Wants, and Savings.",
            "hi": "अपने मासिक वेतन को जरूरत (Needs), इच्छाओं (Wants) और बचत (Savings) में बांटने का सबसे आसान तरीका।",
            "kn": "ನಿಮ್ಮ ಮಾಸಿಕ ಸಂಬಳವನ್ನು ಅಗತ್ಯಗಳು, ಆಸೆಗಳು ಮತ್ತು ಉಳಿತಾಯಕ್ಕೆ ಸರಿಯಾಗಿ ಹಂಚಿಕೆ ಮಾಡುವ ಮಾರ್ಗ."
        },
        "content": {
            "en": """### The Benchmark of Financial Health

Budgeting doesn't mean depriving yourself of good coffee or dinner with friends. It simply means giving every rupee a specific job. The **50-30-20 rule** is the most widely adopted framework in personal finance.

#### 1. 50% for Needs (Essentials):
Expenses you cannot avoid to survive and work:
- House rent or home EMI
- Groceries and basic cooking supplies
- Electricity, water, Wi-Fi, mobile recharges
- Commute and vehicle fuel
- Basic health and life insurance

#### 2. 30% for Wants (Lifestyle & Discretionary):
Expenses that upgrade your life but are not strictly vital:
- Weekend dining out and food delivery apps
- Movies, OTT subscriptions (Netflix, Prime, Hotstar)
- Fashion, gadgets, shopping sales
- Vacation and travel

#### 3. 20% for Savings & Debt Reduction:
Building your future self and safety net:
- Emergency fund contributions (liquid funds/FD)
- Monthly Mutual Fund SIPs
- PPF, EPF, NPS retirement contributions
- Extra principal payments against high-interest debt

#### Example with ₹40,000 Monthly Salary:
- **Needs (50%):** ₹20,000
- **Wants (30%):** ₹12,000
- **Savings (20%):** ₹8,000""",
            "hi": """### वित्तीय स्वास्थ्य का सरल पैमाना

बजट का मतलब खुद को खुशियों से वंचित करना नहीं, बल्कि हर रुपये का सही हिसाब रखना है। **50-30-20 नियम** इसके लिए सबसे बेहतरीन है।

#### 1. 50% जरूरतें (Needs):
अनिवार्य खर्च:
- मकान किराया
- राशन और किराने का सामान
- बिजली, पानी, इंटरनेट और मोबाइल बिल
- पेट्रोल और सफर का खर्च
- स्वास्थ्य बीमा

#### 2. 30% इच्छाएं (Wants):
मनोरंजन और शौक:
- बाहर खाना या फूड डिलीवरी
- फिल्में और OTT (Netflix, Hotstar आदि)
- नए कपड़े और गैजेट्स
- छुट्टियां और घूमना

#### 3. 20% बचत और निवेश (Savings):
- आपातकालीन फंड (Emergency Fund)
- म्यूचुअल फंड SIP या RD
- रिटायरमेंट बचत

#### यदि आपकी आय ₹40,000 है:
- जरूरतें: ₹20,000
- इच्छाएं: ₹12,000
- बचत: ₹8,000""",
            "kn": """### ಹಣಕಾಸು ನಿರ್ವಹಣೆಯ 50-30-20 ಸೂತ್ರ

ನಿಮ್ಮ ಮಾಸಿಕ ಆದಾಯವನ್ನು ಮೂರು ಭಾಗಗಳಾಗಿ ವಿಂಗಡಿಸಿ:

1. **50% ಅಗತ್ಯಗಳು (Needs):** ಬಾಡಿಗೆ, ದಿನಸಿ, ಕರೆಂಟ್ ಬಿಲ್, ಇಂಧನ, ಶಾಲಾ ಶುಲ್ಕ ಮತ್ತು ಆರೋಗ್ಯ ವಿಮೆ.
2. **30% ಇಷ್ಟಗಳು (Wants):** ಹೋಟೆಲ್ ಊಟ, ಸಿನಿಮಾ, OTT ಚಂದಾದಾರಿಕೆಗಳು, ಹೊಸ ಬಟ್ಟೆಗಳು ಮತ್ತು ಪ್ರವಾಸ.
3. **20% ಉಳಿತಾಯ (Savings):** ತುರ್ತು ನಿಧಿ, ಮ್ಯೂಚುಯಲ್ ಫಂಡ್ SIP, RD ಮತ್ತು ಪಿಂಚಣಿ ಉಳಿತಾಯ.

ತಿಂಗಳಿಗೆ ₹40,000 ಸಂಬಳವಿದ್ದರೆ: ಅಗತ್ಯಗಳಿಗೆ ₹20,000, ಇಷ್ಟಗಳಿಗೆ ₹12,000, ಉಳಿತಾಯಕ್ಕೆ ₹8,000 ಮೀಸಲಿಡಿ."""
        },
        "key_takeaways": {
            "en": [
                "Allocate 50% to essential living needs, 30% to lifestyle wants, and 20% to savings.",
                "Automate your 20% savings on salary day before spending on wants.",
                "If needs exceed 50%, reduce discretionary wants first rather than stopping savings."
            ],
            "hi": [
                "50% अनिवार्य जरूरतों पर, 30% जीवनशैली पर और 20% बचत में लगाएं।",
                "वेतन मिलते ही सबसे पहले 20% बचत अलग कर दें।",
                "जरूरतें 50% से अधिक होने पर पहले इच्छाओं के खर्चों में कटौती करें।"
            ],
            "kn": [
                "50% ಅಗತ್ಯಗಳಿಗೆ, 30% ಇಷ್ಟಗಳಿಗೆ ಮತ್ತು 20% ಉಳಿತಾಯಕ್ಕೆ ಮೀಸಲಿಡಿ.",
                "ಸಂಬಳ ಬಂದ ದಿನವೇ ಮೊದಲು 20% ಉಳಿತಾಯಕ್ಕೆ ವರ್ಗಾಯಿಸಿ.",
                "ಖರ್ಚು ಹೆಚ್ಚಾದಾಗ ಮೊದಲು ಮನರಂಜನೆಯ ಖರ್ಚನ್ನು ಕಡಿಮೆ ಮಾಡಿ."
            ]
        },
        "quiz": [
            {
                "id": 1,
                "question": "Under the 50-30-20 rule, which category does a Netflix subscription fall into?",
                "options": [
                    {"id": 1, "text": "Needs (50%)"},
                    {"id": 2, "text": "Wants (30%)"},
                    {"id": 3, "text": "Savings (20%)"}
                ],
                "correct_option_id": 2,
                "explanation": "Entertainment, streaming services, and lifestyle upgrades are classified as discretionary Wants."
            },
            {
                "id": 2,
                "question": "If your take-home pay is ₹50,000, what is the recommended minimum monthly savings?",
                "options": [
                    {"id": 1, "text": "₹5,000 (10%)"},
                    {"id": 2, "text": "₹10,000 (20%)"},
                    {"id": 3, "text": "₹25,000 (50%)"}
                ],
                "correct_option_id": 2,
                "explanation": "20% of ₹50,000 equals ₹10,000 dedicated towards savings, investments, or debt reduction."
            }
        ]
    },
    {
        "id": "pf-02-emergency-funds",
        "category_id": "personal_finance",
        "order": 2,
        "reading_time_minutes": 3,
        "title": {
            "en": "Building Your First Emergency Fund",
            "hi": "अपनी पहली आपातकालीन निधि (Emergency Fund) का निर्माण",
            "kn": "ಮೊದಲ ತುರ್ತು ನಿಧಿಯನ್ನು ನಿರ್ಮಿಸುವುದು ಹೇಗೆ"
        },
        "summary": {
            "en": "Why 3 to 6 months of mandatory living expenses kept in safe, liquid instruments protects you from predatory debt.",
            "hi": "3 से 6 महीने के अनिवार्य खर्चों को सुरक्षित और सुलभ जगह रखना आपको कर्ज के जाल से कैसे बचाता है।",
            "kn": "3 ರಿಂದ 6 ತಿಂಗಳ ಖರ್ಚಿಗೆ ಸಮನಾದ ತುರ್ತು ನಿಧಿಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಇಟ್ಟುಕೊಳ್ಳುವ ಮಹತ್ವ."
        },
        "content": {
            "en": """### Your Shield Against Unplanned Crises

Life is unpredictable: unexpected medical emergencies, sudden family needs, vehicle breakdowns, or temporary job transitions. Without an emergency fund, people are forced to swipe credit cards or take high-interest instant personal loans.

#### How Much Do You Need?
- **Salaried with steady job:** 3 months of essential living expenses (Needs).
- **Freelancers or single earning members:** 6 months of essential living expenses.

If your bare-minimum living expenses are ₹25,000/month, your target emergency fund is **₹75,000 to ₹1,50,000**.

#### Where Should You Park This Money?
An emergency fund is for **safety and liquidity, NOT high returns**.
1. **Sweep-in Fixed Deposits:** Earns 6.5%+ interest but breaks automatically when you withdraw.
2. **Liquid Mutual Funds / High-Interest Savings Account:** Accessible within 24 hours without market volatility.
3. **Never in Stocks or Crypto:** Never put emergency funds in volatile assets that could drop 20% on the day you need them.""",
            "hi": """### वित्तीय संकट से सुरक्षा की ढाल

जीवन में अप्रत्याशित घटनाएं कभी भी आ सकती हैं: बीमारी, नौकरी में बदलाव या परिवार में कोई आपात स्थिति। इमरजेंसी फंड न होने पर लोग कर्ज या क्रेडिट कार्ड के जाल में फंस जाते हैं।

#### कितनी राशि आवश्यक है?
- नौकरीपेशा लोगों के लिए: कम से कम **3 महीने** का अनिवार्य खर्च।
- फ्रीलांसर या परिवार के अकेले कमाने वाले के लिए: **6 महीने** का अनिवार्य खर्च।

यदि आपका महीने का बुनियादी खर्च ₹20,000 है, तो आपका इमरजेंसी फंड **₹60,000 से ₹1,20,000** होना चाहिए।

#### इस पैसे को कहां रखें?
इसे शेयर बाजार में कभी न लगाएं। इसे स्वीप-इन एफडी (Sweep-in FD), लिक्विड म्यूचुअल फंड या बचत खाते में रखें ताकि जरूरत पड़ने पर 24 घंटे में निकाला जा सके।""",
            "kn": """### ನಿಮ್ಮ ಹಣಕಾಸಿನ ಸುರಕ್ಷಾ ಕವಚ

ಅನಿರೀಕ್ಷಿತ ಆಸ್ಪತ್ರೆ ಖರ್ಚು, ವಾಹನ ರಿಪೇರಿ ಅಥವಾ ಉದ್ಯೋಗ ಬದಲಾವಣೆಯ ಸಂದರ್ಭದಲ್ಲಿ ತುರ್ತು ನಿಧಿ ನೆರವಿಗೆ ಬರುತ್ತದೆ.

- ಕನಿಷ್ಠ **3 ರಿಂದ 6 ತಿಂಗಳ** ಮೂಲಭೂತ ಖರ್ಚಿನ ಮೊತ್ತವನ್ನು ಸಿದ್ಧವಾಗಿಟ್ಟುಕೊಳ್ಳಿ.
- ತಿಂಗಳ ಅಗತ್ಯ ವೆಚ್ಚ ₹20,000 ಆಗಿದ್ದರೆ, ₹60,000 ರಿಂದ ₹1,20,000 ತುರ್ತು ನಿಧಿ ಇರಬೇಕು.
- ಈ ಹಣವನ್ನು ಶೇರ್ ಮಾರ್ಕೆಟ್‌ನಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡಬೇಡಿ; ಬ್ಯಾಂಕ್ FD ಅಥವಾ ಲಿಕ್ವಿಡ್ ಫಂಡ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿಡಿ."""
        },
        "key_takeaways": {
            "en": [
                "Aim for 3 to 6 months of mandatory living expenses in liquid form.",
                "Emergency funds exist for capital preservation and instant access, not high return.",
                "Keep funds in sweep-in FDs or liquid funds, never in volatile equity markets."
            ],
            "hi": [
                "3 से 6 महीने के बुनियादी खर्च जितनी राशि हमेशा तैयार रखें।",
                "इसका उद्देश्य तुरंत उपलब्ध होना और सुरक्षित रहना है, अधिक मुनाफा कमाना नहीं।",
                "पैसे को एफडी या लिक्विड फंड में रखें, शेयर बाजार में नहीं।"
            ],
            "kn": [
                "3 ರಿಂದ 6 ತಿಂಗಳ ಅಗತ್ಯ ವೆಚ್ಚವನ್ನು ತುರ್ತು ನಿಧಿಯಾಗಿ ಮೀಸಲಿಡಿ.",
                "ಈ ನಿಧಿ ತಕ್ಷಣವೇ ಲಭ್ಯವಿರಬೇಕು ಮತ್ತು ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತವಾಗಿರಬೇಕು.",
                "ಬ್ಯಾಂಕ್ ಫಿಕ್ಸೆಡ್ ಡೆಪಾಸಿಟ್ ಅಥವಾ ಲಿಕ್ವಿಡ್ ಫಂಡ್‌ಗಳಲ್ಲಿ ಹಣವಿಡಿ."
            ]
        },
        "quiz": [
            {
                "id": 1,
                "question": "What is the recommended size of an emergency fund for a salaried employee?",
                "options": [
                    {"id": 1, "text": "1 week of spending."},
                    {"id": 2, "text": "3 to 6 months of essential living expenses."},
                    {"id": 3, "text": "10 years of salary."}
                ],
                "correct_option_id": 2,
                "explanation": "3 to 6 months of essential survival expenses provides adequate buffer for sudden job disruptions or medical crises."
            },
            {
                "id": 2,
                "question": "Where is the best place to park an emergency fund?",
                "options": [
                    {"id": 1, "text": "Volatile cryptocurrencies."},
                    {"id": 2, "text": "Sweep-in Fixed Deposits or Liquid Funds."},
                    {"id": 3, "text": "Illiquid real estate."}
                ],
                "correct_option_id": 2,
                "explanation": "Sweep-in FDs and liquid funds offer security, modest yield, and immediate 24-hour liquidity without capital loss."
            }
        ]
    },

    # Category 4: Credit Score & Health
    {
        "id": "ca-01-cibil-score-demystified",
        "category_id": "credit_awareness",
        "order": 1,
        "reading_time_minutes": 4,
        "title": {
            "en": "Demystifying Your CIBIL & Credit Score",
            "hi": "CIBIL और क्रेडिट स्कोर को आसान भाषा में समझें",
            "kn": "CIBIL ಮತ್ತು ಕ್ರೆಡಿಟ್ ಸ್ಕೋರ್ ಎಂದರೇನು?"
        },
        "summary": {
            "en": "Understand the 300 to 900 score scale, why 750+ is the magic threshold in India, and the 5 factors that determine it.",
            "hi": "300 से 900 का स्कोर पैमाना, भारत में 750+ का महत्व और इसे निर्धारित करने वाले 5 प्रमुख कारक।",
            "kn": "300 ರಿಂದ 900 ರವರೆಗಿನ ಅಂಕಗಳು, ಭಾರತದಲ್ಲಿ 750+ ಸ್ಕೋರ್‌ನ ಮಹತ್ವ ಮತ್ತು ಅದನ್ನು ನಿರ್ಧರಿಸುವ ಅಂಶಗಳು."
        },
        "content": {
            "en": """### What is a Credit Score?

A credit score is a 3-digit number ranging from **300 to 900** compiled by authorized bureaus in India (TransUnion CIBIL, Experian, CRIF High Mark, Equifax). It summarizes how reliably you repay borrowed money.

#### The Score Ranges in India:
- **750 to 900 (Excellent):** Instant loan approvals, lowest interest rates on home/car loans, premium credit cards.
- **700 to 749 (Good):** Likely approvals with standard market interest rates.
- **650 to 699 (Fair):** May face higher interest rates, stricter income verification, or collateral requirements.
- **Below 650 (Poor):** High risk of loan rejection; indicates past defaults or excessive borrowing.

#### The 5 Pillars of Your CIBIL Score:
1. **Repayment History (35% weight):** Did you pay on time? A single 30-day delay can drop your score by 50+ points.
2. **Credit Utilization Ratio (30% weight):** Are you maxing out your cards? Keep usage below 30%.
3. **Credit History Age (15% weight):** How long have you responsibly managed credit? Keep your oldest credit card active.
4. **Credit Mix (10% weight):** A balanced blend of secured loans (home/car) and unsecured lines (credit cards).
5. **Recent Inquiries (10% weight):** Applying for 5 credit cards in one week triggers 'Hard Inquiries' and flags you as credit-hungry.""",
            "hi": """### क्रेडिट स्कोर क्या है?

क्रेडिट स्कोर **300 से 900** के बीच का 3 अंकों का नंबर होता है, जिसे भारत में अधिकृत ब्यूरो (CIBIL, Experian आदि) तैयार करते हैं। यह आपकी वित्तीय साख को दर्शाता है।

#### भारत में स्कोर का स्तर:
- **750 से 900 (उत्कृष्ट):** सबसे कम ब्याज दर पर होम और कार लोन, प्रीमियम कार्ड तुरंत उपलब्ध।
- **700 से 749 (अच्छा):** सामान्य दरों पर लोन स्वीकृत।
- **650 से कम:** लोन और कार्ड मिलने में भारी परेशानी।

#### स्कोर को प्रभावित करने वाले 5 मुख्य बिंदु:
1. **समय पर भुगतान (35%):** सभी बिल नियत तारीख से पहले भरें।
2. **क्रेडिट उपयोग दर (30%):** अपनी सीमा का 30% से कम ही खर्च करें।
3. **क्रेडिट इतिहास की अवधि (15%):** पुराने कार्ड चालू रखें।
4. **क्रेडिट प्रकार (10%):** सिक्योर्ड और अनसिक्योर्ड लोन का संतुलन।
5. **नई पूछताछ (10%):** एक साथ कई बैंकों में लोन की अर्जी न दें।""",
            "kn": """### CIBIL ಸ್ಕೋರ್ ಮಹತ್ವ

ಕಲಿಕಾ ಮತ್ತು ಹಣಕಾಸು ಜಗತ್ತಿನಲ್ಲಿ ಕ್ರೆಡಿಟ್ ಸ್ಕೋರ್ **300 ರಿಂದ 900** ಅಂಕಗಳ ವ್ಯಾಪ್ತಿಯಲ್ಲಿರುತ್ತದೆ.

- **750+ ಸ್ಕೋರ್:** ಅತಿ ಕಡಿಮೆ ಬಡ್ಡಿದರದಲ್ಲಿ ಗೃಹ ಸಾಲ ಮತ್ತು ವಾಹನ ಸಾಲ ಸುಲಭವಾಗಿ ಸಿಗುತ್ತದೆ.
- **700 ಕ್ಕಿಂತ ಕಡಿಮೆ:** ಸಾಲ ಪಡೆಯುವುದು ಕಷ್ಟ ಮತ್ತು ಬಡ್ಡಿದರವೂ ಹೆಚ್ಚಾಗಿರುತ್ತದೆ.

#### ಪ್ರಮುಖ ಅಂಶಗಳು:
- ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಬಿಲ್ ಪಾವತಿಸುವುದು (35%).
- ಕಾರ್ಡ್ ಮಿತಿಯ 30% ಗಿಂತ ಕಡಿಮೆ ಬಳಸುವುದು (30%).
- ಹಳೆಯ ಕಾರ್ಡ್‌ಗಳನ್ನು ಮುಚ್ಚದೆ ಇರಿಸಿಕೊಳ್ಳುವುದು."""
        },
        "key_takeaways": {
            "en": [
                "Aim for a CIBIL score of 750 or above for optimal loan rates and approvals.",
                "Payment history (35%) and utilization ratio (30%) account for 65% of your total score.",
                "CLIQ is educational and does not pull or modify official bureau credit reports."
            ],
            "hi": [
                "सर्वोत्तम ब्याज दरों के लिए अपना स्कोर 750 या उससे अधिक बनाए रखें।",
                "समय पर भुगतान और 30% से कम उपयोग स्कोर का 65% हिस्सा तय करते हैं।",
                "CLIQ शैक्षणिक मंच है और आधिकारिक क्रेडिट रिपोर्ट में कोई फेरबदल नहीं करता।"
            ],
            "kn": [
                "ಉತ್ತಮ ಸಾಲದ ಕೊಡುಗೆಗಳಿಗಾಗಿ 750+ CIBIL ಸ್ಕೋರ್ ಕಾಪಾಡಿಕೊಳ್ಳಿ.",
                "ಸಮಯಕ್ಕೆ ಸರಿಯಾದ ಪಾವತಿ ಮತ್ತು ಕಡಿಮೆ ಮಿತಿ ಬಳಕೆ ಅತಿ ಮುಖ್ಯ.",
                "CLIQ ಕೇವಲ ಜಾಗೃತಿ ಮೂಡಿಸುವ ವೇದಿಕೆಯಾಗಿದೆ."
            ]
        },
        "quiz": [
            {
                "id": 1,
                "question": "What is considered the ideal benchmark CIBIL score for quick loan approvals in India?",
                "options": [
                    {"id": 1, "text": "500"},
                    {"id": 2, "text": "750 and above"},
                    {"id": 3, "text": "1000"}
                ],
                "correct_option_id": 2,
                "explanation": "A score of 750 or higher demonstrates consistent creditworthiness and unlocks preferential rates from lenders."
            },
            {
                "id": 2,
                "question": "Which single factor carries the heaviest weight in calculating your credit score?",
                "options": [
                    {"id": 1, "text": "Your monthly salary."},
                    {"id": 2, "text": "Timely payment history (35%)."},
                    {"id": 3, "text": "The color of your credit card."}
                ],
                "correct_option_id": 2,
                "explanation": "Repayment history accounts for approximately 35% of scoring algorithms. Timely bill settlement is paramount."
            }
        ]
    },
    {
        "id": "ca-02-the-30-percent-utilization-rule",
        "category_id": "credit_awareness",
        "order": 2,
        "reading_time_minutes": 3,
        "title": {
            "en": "The 30% Credit Utilization Ratio Rule",
            "hi": "30% क्रेडिट उपयोग अनुपात का नियम",
            "kn": "30% ಕ್ರೆಡಿಟ್ ಬಳಕೆ ನಿಯಮದ ಮಹತ್ವ"
        },
        "summary": {
            "en": "Why spending ₹90,000 on a ₹1,00,000 limit damages your score even if you pay the full bill on time.",
            "hi": "समय पर पूरा बिल भरने के बाद भी सीमा का 90% खर्च करने से आपका स्कोर क्यों गिरता है।",
            "kn": "ಸಂಪೂರ್ಣ ಬಿಲ್ ಪಾವತಿಸಿದರೂ ಕಾರ್ಡ್ ಮಿತಿಯ 90% ಬಳಸಿದರೆ ಸ್ಕೋರ್ ಏಕೆ ಕಡಿಮೆಯಾಗುತ್ತದೆ."
        },
        "content": {
            "en": """### The Hidden Utilization Trap

Many disciplined cardholders ask: *"I always pay 100% of my bill on time. Why did my CIBIL score drop by 20 points?"*

The answer is almost always **Credit Utilization Ratio (CUR)**.

#### How Utilization is Calculated:
$$\\text{CUR} = \\frac{\\text{Total Balance Reported on Statement Date}}{\\text{Total Credit Limit}} \\times 100$$

If your credit limit is ₹1,00,000 and you spend ₹70,000, your utilization is **70%**.

#### Why Bureaus Penalize High Utilization:
Credit scoring models view individuals who frequently use more than 30% to 50% of their limit as *'credit hungry'* or under cashflow strain.

#### How to Fix It:
1. **Keep Usage Under 30%:** On a ₹1,00,000 limit, try to ensure the statement balance remains below ₹30,000.
2. **The Pre-Statement Payment Hack:** If you spent ₹60,000 during the month, pay ₹40,000 **two days before** the statement generation date. When the statement generates, only ₹20,000 is reported to the bureau (20% utilization)!
3. **Request a Limit Enhancement:** If your bank offers an increase from ₹1,00,000 to ₹2,00,000, accept it! Spending ₹30,000 on a ₹2,00,000 limit instantly drops your utilization from 30% down to 15%.""",
            "hi": """### उपयोग दर का छिपा हुआ जाल

कई लोग सोचते हैं: *"मैं तो हर महीने पूरा बिल भरता हूँ, फिर मेरा CIBIL स्कोर कम क्यों हुआ?"*
इसका कारण है **क्रेडिट यूटिलाइज़ेशन रेशियो (CUR)**।

यदि आपकी सीमा ₹1,00,000 है और आपका बिल ₹70,000 का बना, तो आपका उपयोग **70%** दर्ज होगा। क्रेडिट ब्यूरो 30% से अधिक उपयोग को जोखिम मानते हैं।

#### इसे कैसे ठीक करें:
1. **खर्च 30% से कम रखें:** ₹1,00,000 की सीमा पर बिल ₹30,000 से कम रहने दें।
2. **स्टेटमेंट से पहले भुगतान:** यदि आपने ₹50,000 खर्च किए हैं, तो बिल बनने से 2 दिन पहले ₹30,000 जमा कर दें। ब्यूरो को सिर्फ ₹20,000 (20%) का बिल दिखेगा!
3. **क्रेडिट सीमा बढ़वाएं:** बैंक से सीमा बढ़वाने पर भी उपयोग का प्रतिशत अपने आप घट जाता है।""",
            "kn": """### 30% ಮಿತಿ ಬಳಕೆಯ ನಿಯಮ

ನಿಮ್ಮ ಕಾರ್ಡ್ ಮಿತಿ ₹1,00,000 ಇದ್ದು, ನೀವು ₹80,000 ಖರ್ಚು ಮಾಡಿದರೆ ನಿಮ್ಮ ಬಳಕೆ 80% ಆಗುತ್ತದೆ. ಪೂರ್ಣ ಬಿಲ್ ಕಟ್ಟಿದರೂ ಸಹ, 30% ಕ್ಕಿಂತ ಹೆಚ್ಚು ಬಳಸಿದರೆ CIBIL ಸ್ಕೋರ್ ಕಡಿಮೆಯಾಗುತ್ತದೆ.

- ಮಿತಿಯ 30% ಗಿಂತ ಕಡಿಮೆ (ಅಂದರೆ ₹30,000 ಒಳಗೆ) ಬಿಲ್ ಬರುವಂತೆ ನೋಡಿಕೊಳ್ಳಿ.
- ಬಿಲ್ ಬರುವ 2 ದಿನಗಳ ಮುಂಚಿತವಾಗಿ ಸ್ವಲ್ಪ ಹಣ ಪಾವತಿಸಿ ಬಿಲ್ ಮೊತ್ತವನ್ನು ಕಡಿಮೆ ಮಾಡಿಕೊಳ್ಳಬಹುದು."""
        },
        "key_takeaways": {
            "en": [
                "Keep total statement balance under 30% of your total credit limit.",
                "Pay down large purchases before the statement date to report lower utilization.",
                "Increasing your credit limit lowers your utilization ratio automatically."
            ],
            "hi": [
                "अपना स्टेटमेंट बिल कुल क्रेडिट सीमा के 30% से नीचे रखें।",
                "बड़ी खरीदारी करने पर बिल बनने से पहले ही थोड़ा भुगतान कर दें।",
                "क्रेडिट सीमा बढ़ाने से उपयोग प्रतिशत स्वतः घट जाता है।"
            ],
            "kn": [
                "ನಿಮ್ಮ ಬಿಲ್ ಮೊತ್ತ ಒಟ್ಟು ಮಿತಿಯ 30% ಕ್ಕಿಂತ ಕಡಿಮೆ ಇರಲಿ.",
                "ಬಿಲ್ ಬರುವ ಮುನ್ನವೇ ಹಣ ಪಾವತಿಸಿ ಬಳಕೆಯ ಶೇಕಡಾವಾರು ಕಡಿಮೆ ಮಾಡಿ.",
                "ಕಾರ್ಡ್ ಮಿತಿ ಹೆಚ್ಚಿಸಿಕೊಳ್ಳುವುದರಿಂದ ಸ್ಕೋರ್ ಸುಧಾರಿಸುತ್ತದೆ."
            ]
        },
        "quiz": [
            {
                "id": 1,
                "question": "On a total credit limit of ₹2,00,000, what is the maximum recommended balance to stay under the 30% threshold?",
                "options": [
                    {"id": 1, "text": "₹30,000"},
                    {"id": 2, "text": "₹60,000"},
                    {"id": 3, "text": "₹1,20,000"}
                ],
                "correct_option_id": 2,
                "explanation": "30% of ₹2,00,000 is ₹60,000. Keeping statement balances below this preserves optimal credit score velocity."
            },
            {
                "id": 2,
                "question": "How does accepting a credit limit increase from your bank help your score?",
                "options": [
                    {"id": 1, "text": "It automatically lowers your credit utilization ratio for the same level of spending."},
                    {"id": 2, "text": "It forces you to pay more annual fees."},
                    {"id": 3, "text": "It reduces your bank savings account interest."}
                ],
                "correct_option_id": 1,
                "explanation": "Higher total limits expand the denominator, so standard monthly spending represents a lower utilization percentage."
            }
        ]
    },

    # Category 5: Financial Safety & Fraud Prevention
    {
        "id": "fs-01-the-golden-rule-of-upi-pin",
        "category_id": "financial_safety",
        "order": 1,
        "reading_time_minutes": 3,
        "title": {
            "en": "The Golden Rule of UPI PIN: Never Enter to Receive Money",
            "hi": "UPI पिन का स्वर्णिम नियम: पैसे प्राप्त करने के लिए पिन कभी न डालें",
            "kn": "UPI ಪಿನ್ ನಿಯಮ: ಹಣ ಪಡೆಯಲು ಎಂದಿಗೂ ಪಿನ್ ನಮೂದಿಸಬೇಡಿ"
        },
        "summary": {
            "en": "The most widespread digital fraud in India: fraudsters sending 'Collect Requests' or QR codes claiming you won a lottery or cashback.",
            "hi": "भारत का सबसे बड़ा डिजिटल फ्रॉड: पैसे भेजने या इनाम के बहाने 'रिक्वेस्ट मनी' भेजकर पिन डलवाना।",
            "kn": "ಹಣ ಅಥವಾ ಬಹುಮಾನ ಬಂದಿದೆ ಎಂದು ಹೇಳಿ UPI ಪಿನ್ ಹಾಕಿಸಿ ಹಣ ಲಪಟಾಯಿಸುವ ವಂಚನೆಗಳಿಂದ ಎಚ್ಚರವಾಗಿರಿ."
        },
        "content": {
            "en": """### The #1 Digital Banking Scam in India

Unified Payments Interface (UPI) is convenient and instantaneous, but millions of rupees are stolen each week through one simple psychological trick.

#### The Golden Law of UPI:
> **ENTERING YOUR UPI PIN DEBITS MONEY FROM YOUR ACCOUNT. YOU NEVER, EVER NEED TO ENTER YOUR PIN TO RECEIVE MONEY.**

#### How Scammers Trick Users:
1. **The OLX / Marketplace Buyer:** A scammer pretends to buy your used sofa on OLX. They send you a QR code or screenshot saying *"Scan this QR code to receive ₹5,000 advance."* The moment you scan and enter your UPI PIN, ₹5,000 is deducted from YOUR bank!
2. **Fake Cashback / Lottery:** An SMS arrives stating: *"Congratulations! You won ₹2,450 cashback from PhonePe/GPay. Click here to claim."* Clicking opens a collect request. Entering your PIN sends your money straight to the fraudster.
3. **Wrong Transfer Drama:** A fraudster calls crying: *"I accidentally sent ₹10,000 to your Google Pay number. Please refund it."* Check your actual bank statement via your netbanking app first—never act on SMS or phone calls alone.""",
            "hi": """### भारत का सबसे बड़ा डिजिटल धोखा

यूपीआई बहुत आसान है, लेकिन एक छोटी सी नासमझी से लोग अपनी मेहनत की कमाई गंवा देते हैं।

#### यूपीआई का अटल नियम:
> **यूपीआई पिन (UPI PIN) डालने का मतलब है आपके खाते से पैसे कटना। पैसे प्राप्त करने (Receive) के लिए कभी भी पिन की आवश्यकता नहीं होती!**

#### धोखेबाज कैसे फंसाते हैं:
1. **ओएलएक्स (OLX) पर खरीददार बनकर:** पुराना सामान खरीदने के नाम पर कहेंगे कि *"यह क्यूआर कोड स्कैन करके पिन डालें, आपको एडवांस पैसे मिल जाएंगे।"* जैसे ही आप पिन डालेंगे, पैसे आपके खाते से कट जाएंगे!
2. **फर्जी कैशबैक:** मैसेज आता है कि आपको ₹2,500 का रिवॉर्ड मिला है, क्लेम करने के लिए पिन डालें।
3. **गलत ट्रांसफर का बहाना:** कॉल करके कहेंगे कि गलती से पैसे भेज दिए हैं, वापस भेजें। हमेशा बैंक स्टेटमेंट चेक करें।""",
            "kn": """### UPI ವಂಚನೆಗಳಿಂದ ರಕ್ಷಣೆ

ಭಾರತದಲ್ಲಿ UPI ಅತ್ಯಂತ ಜನಪ್ರಿಯವಾಗಿದೆ, ಆದರೆ ಎಚ್ಚರ ತಪ್ಪಿದರೆ ಹಣ ಕಳೆದುಕೊಳ್ಳಬಹುದು.

#### ಮುಖ್ಯ ನಿಯಮ:
> **UPI ಪಿನ್ ನಮೂದಿಸಿದರೆ ನಿಮ್ಮ ಖಾತೆಯಿಂದ ಹಣ ಕಡಿತವಾಗುತ್ತದೆ. ಹಣ ಪಡೆಯಲು (Receive) ಎಂದಿಗೂ UPI ಪಿನ್ ಹಾಕುವ ಅಗತ್ಯವಿಲ್ಲ!**

- ಯಾವುದೇ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಪಿನ್ ಹಾಕಬೇಡಿ.
- PhonePe ಅಥವಾ Google Pay ನಲ್ಲಿ ಬಹುಮಾನ ಬಂದಿದೆ ಎಂದು ಬರುವ ಲಿಂಕ್‌ಗಳನ್ನು ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ."""
        },
        "key_takeaways": {
            "en": [
                "You NEVER enter a UPI PIN to receive money under any circumstances.",
                "Scanning a QR code and entering your PIN ALWAYS transfers money out of your account.",
                "Verify bank balances directly in your official banking app, never rely on SMS screenshots."
            ],
            "hi": [
                "पैसे प्राप्त करने के लिए कभी भी UPI पिन डालने की आवश्यकता नहीं होती।",
                "QR कोड स्कैन करके पिन डालने से हमेशा आपके खाते से पैसा कटता है।",
                "स्क्रीनशॉट या SMS के बजाय हमेशा अपने बैंक ऐप में बैलेंस चेक करें।"
            ],
            "kn": [
                "ಹಣ ಪಡೆಯಲು ಎಂದಿಗೂ UPI ಪಿನ್ ನಮೂದಿಸಬೇಡಿ.",
                "QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಪಿನ್ ಹಾಕಿದರೆ ಹಣ ಖಾತೆಯಿಂದ ಹೋಗುತ್ತದೆ.",
                "ಯಾವಾಗಲೂ ಅಧಿಕೃತ ಬ್ಯಾಂಕಿಂಗ್ ಆ್ಯಪ್‌ನಲ್ಲಿ ಬ್ಯಾಲೆನ್ಸ್ ಪರಿಶೀಲಿಸಿ."
            ]
        },
        "quiz": [
            {
                "id": 1,
                "question": "A buyer on OLX sends you a QR code claiming it will transfer ₹4,000 into your account once you enter your UPI PIN. What should you do?",
                "options": [
                    {"id": 1, "text": "Scan and enter your PIN immediately."},
                    {"id": 2, "text": "Refuse and report them. You never enter a PIN to receive funds."},
                    {"id": 3, "text": "Share your debit card CVV instead."}
                ],
                "correct_option_id": 2,
                "explanation": "Entering your UPI PIN authorizes a debit from your account. Receiving funds requires no PIN action whatsoever."
            },
            {
                "id": 2,
                "question": "What is the only purpose of entering your UPI PIN?",
                "options": [
                    {"id": 1, "text": "To verify identity to receive incoming refunds."},
                    {"id": 2, "text": "To authorize money leaving your bank account."},
                    {"id": 3, "text": "To reset your mobile phone network."}
                ],
                "correct_option_id": 2,
                "explanation": "A UPI PIN is an authorization credential solely used to approve outward debits from your bank."
            }
        ]
    },
    {
        "id": "fs-02-rbi-zero-liability-window",
        "category_id": "financial_safety",
        "order": 2,
        "reading_time_minutes": 4,
        "title": {
            "en": "RBI's 72-Hour Zero-Liability Rule & Immediate Fraud Steps",
            "hi": "आरबीआई का 72 घंटे का शून्य-देनदारी नियम और तुरंत उठाए जाने वाले कदम",
            "kn": "RBI ನ 72-ಗಂಟೆಗಳ ಶೂನ್ಯ ಹೊಣೆಗಾರಿಕೆ ನಿಯಮ ಮತ್ತು ತುರ್ತು ಕ್ರಮಗಳು"
        },
        "summary": {
            "en": "What the law says: reporting unauthorized electronic transactions within 3 working days protects you from 100% of financial losses.",
            "hi": "यदि आपके साथ ऑनलाइन फ्रॉड हो जाए, तो 3 दिन (72 घंटे) के भीतर बैंक को सूचित करने पर आपकी कोई देनदारी नहीं बनती।",
            "kn": "ಅನಧಿಕೃತ ವಹಿವಾಟು ನಡೆದರೆ 72 ಗಂಟೆಗಳ ಒಳಗೆ ದೂರು ದಾಖಲಿಸಿದರೆ ನಿಮ್ಮ ಹಣ ಸುರಕ್ಷಿತವಾಗಿರುತ್ತದೆ."
        },
        "content": {
            "en": """### Your Legal Rights Under Reserve Bank of India (RBI) Guidelines

Did you know the Reserve Bank of India provides explicit consumer protection against unauthorized electronic transactions? The speed at which you notify your bank determines who bears the financial loss.

#### The 3-Tier RBI Liability Framework:
1. **Zero Liability (100% Refund by Bank):**
   - If the fraud is due to contributory negligence or deficiency on the part of the bank.
   - If a third-party breach occurs where neither the bank nor the customer is at fault, and you report it to the bank **within 3 working days (72 hours)** of receiving the transaction alert!
2. **Limited Liability (₹5,000 to ₹25,000 maximum):**
   - If you report the unauthorized transaction between **4 to 7 working days**, your liability is capped by RBI rules (Basic savings account: ₹5,000 max; Credit card with limit > ₹5 Lakhs: ₹25,000 max).
3. **Customer Liability:**
   - Beyond 7 working days, liability is determined per your bank's board-approved policy.
   - If you voluntarily shared your confidential OTP or password, you are held liable until you report the compromise to the bank.

#### Emergency Action Steps If You Suspect Fraud:
1. **Immediately Block Card / Freeze UPI:** Use your mobile banking app to toggle off online/international transactions or block the card completely.
2. **Call 1930 (National Cyber Crime Helpline):** In India, dialling `1930` connects you directly to the Citizen Financial Cyber Fraud Reporting System to freeze fraudulent beneficiary accounts.
3. **Notify Your Bank in Writing:** File an official dispute / chargeback ticket within 72 hours and preserve the acknowledgement number.""",
            "hi": """### भारतीय रिजर्व बैंक (RBI) के तहत आपके कानूनी अधिकार

क्या आप जानते हैं कि ऑनलाइन धोखाधड़ी होने पर आरबीआई के नियम आपकी सुरक्षा करते हैं? बस आपको तुरंत कदम उठाना होता है।

#### आरबीआई का 72 घंटे का नियम:
1. **शून्य देनदारी (Zero Liability - 100% रिफंड):**
   - यदि आपके खाते से अनधिकृत लेन-देन हुआ है और आपने **3 कार्य दिवसों (72 घंटे)** के भीतर बैंक को सूचित कर दिया, तो बैंक को पूरा पैसा वापस करना होता है।
2. **सीमित देनदारी (4 से 7 दिन):**
   - यदि आप 4 से 7 दिनों के बीच सूचना देते हैं, तो नुकसान की अधिकतम सीमा ₹5,000 से ₹25,000 तक सीमित होती है।
3. **सावधानी:** यदि आपने खुद अपना OTP या पासवर्ड किसी को दिया है, तो रिपोर्ट करने से पहले हुए नुकसान के जिम्मेदार आप स्वयं होंगे।

#### फ्रॉड होने पर तुरंत क्या करें:
1. **कार्ड तुरंत ब्लॉक करें:** बैंक ऐप से इंटरनेशनल और ऑनलाइन ट्रांजेक्शन तुरंत बंद करें।
2. **1930 पर कॉल करें:** भारत सरकार की राष्ट्रीय साइबर क्राइम हेल्पलाइन `1930` पर कॉल करके फ्रॉड रिपोर्ट करें ताकि चोर के खाते को फ्रीज किया जा सके।
3. **बैंक में लिखित शिकायत दर्ज करें** और पावती संख्या (Reference Number) संभाल कर रखें।""",
            "kn": """### ಭಾರತೀಯ ರಿಸರ್ವ್ ಬ್ಯಾಂಕ್ (RBI) ನಿಯಮಗಳು

ಅನಧಿಕೃತ ಆನ್‌ಲೈನ್ ವಹಿವಾಟುಗಳಿಂದ ಗ್ರಾಹಕರನ್ನು ರಕ್ಷಿಸಲು RBI ಕಟ್ಟುನಿಟ್ಟಿನ ನಿಯಮಗಳನ್ನು ರೂಪಿಸಿದೆ.

#### 72 ಗಂಟೆಗಳ ನಿಯಮ:
- ಯಾವುದೇ ಅನಧಿಕೃತ ವಹಿವಾಟು ನಡೆದ **3 ಕೆಲಸದ ದಿನಗಳೊಳಗೆ (72 ಗಂಟೆಗಳು)** ಬ್ಯಾಂಕಿಗೆ ದೂರು ನೀಡಿದರೆ ಗ್ರಾಹಕರಿಗೆ **ಶೂನ್ಯ ಹೊಣೆಗಾರಿಕೆ** (ಸಂಪೂರ್ಣ ಹಣ ವಾಪಸ್ ಬರುತ್ತದೆ).
- ನೀವು ತಾವಾಗಿಯೇ OTP ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ಹಂಚಿಕೊಂಡಿದ್ದರೆ ಈ ಸೌಲಭ್ಯ ಸಿಗುವುದಿಲ್ಲ.

#### ತಕ್ಷಣ ಮಾಡಬೇಕಾದ ಕೆಲಸಗಳು:
1. ತಕ್ಷಣವೇ ಬ್ಯಾಂಕ್ ಆ್ಯಪ್ ಮೂಲಕ ಕಾರ್ಡ್ ಅಥವಾ UPI ಬ್ಲಾಕ್ ಮಾಡಿ.
2. ಭಾರತ ಸರ್ಕಾರದ ಸೈಬರ್ ಕ್ರೈಮ್ ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆ **1930** ಗೆ ಕರೆ ಮಾಡಿ ದೂರು ದಾಖಲಿಸಿ.
3. 72 ಗಂಟೆಗಳ ಒಳಗೆ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಶಾಖೆಗೆ ಲಿಖಿತ ದೂರು ನೀಡಿ."""
        },
        "key_takeaways": {
            "en": [
                "Reporting unauthorized transactions within 72 hours (3 working days) guarantees Zero Customer Liability under RBI rules.",
                "Call 1930 immediately to freeze funds before scammers can withdraw them.",
                "Never share OTPs; sharing credentials waives your zero-liability protection."
            ],
            "hi": [
                "72 घंटे (3 दिन) के भीतर बैंक को सूचित करने पर RBI के नियमानुसार शून्य देनदारी रहती है।",
                "ठगों द्वारा पैसे निकालने से पहले तुरंत 1930 पर कॉल करके खाता फ्रीज करवाएं।",
                "कभी किसी को OTP न दें; OTP साझा करने पर शून्य-देनदारी का लाभ नहीं मिलता।"
            ],
            "kn": [
                "72 ಗಂಟೆಗಳ ಒಳಗೆ ಬ್ಯಾಂಕಿಗೆ ಮಾಹಿತಿ ನೀಡಿದರೆ ಸಂಪೂರ್ಣ ಹಣ ವಾಪಸ್ ಪಡೆಯಬಹುದು.",
                "ವಂಚಕರ ಖಾತೆ ಫ್ರೀಜ್ ಮಾಡಲು ತಕ್ಷಣವೇ 1930 ಗೆ ಕರೆ ಮಾಡಿ.",
                "ಯಾರೊಂದಿಗೂ OTP ಹಂಚಿಕೊಳ್ಳಬೇಡಿ."
            ]
        },
        "quiz": [
            {
                "id": 1,
                "question": "Under RBI regulations, within what timeframe must you report an unauthorized electronic transaction to claim Zero Customer Liability?",
                "options": [
                    {"id": 1, "text": "Within 3 working days (72 hours)."},
                    {"id": 2, "text": "Within 6 months."},
                    {"id": 3, "text": "Within 1 year."}
                ],
                "correct_option_id": 1,
                "explanation": "RBI directives mandate that reporting within 3 working days ensures zero customer liability for third-party electronic fraud."
            },
            {
                "id": 2,
                "question": "What is the dedicated National Cyber Crime helpline number in India for financial frauds?",
                "options": [
                    {"id": 1, "text": "100"},
                    {"id": 2, "text": "1930"},
                    {"id": 3, "text": "1800"}
                ],
                "correct_option_id": 2,
                "explanation": "1930 is the official citizen financial cyber fraud reporting helpline operated by the Ministry of Home Affairs."
            }
        ]
    }
]

class CurriculumService:
    """Provides querying and localization for financial literacy modules."""

    @staticmethod
    def get_categories(lang: str = "en") -> List[Dict[str, Any]]:
        lang_key = lang if lang in ["en", "hi", "kn"] else "en"
        res = []
        for c in CATEGORIES_DATA:
            res.append({
                "id": c["id"],
                "icon": c["icon"],
                "title": c["title"].get(lang_key, c["title"]["en"]),
                "description": c["description"].get(lang_key, c["description"]["en"]),
                "total_lessons": len([l for l in LESSONS_DATA if l["category_id"] == c["id"]])
            })
        return res

    @staticmethod
    def get_modules(category_id: Optional[str] = None, lang: str = "en") -> List[Dict[str, Any]]:
        lang_key = lang if lang in ["en", "hi", "kn"] else "en"
        modules = LESSONS_DATA
        if category_id:
            modules = [m for m in modules if m["category_id"] == category_id]

        res = []
        for m in sorted(modules, key=lambda x: (x["category_id"], x["order"])):
            res.append({
                "id": m["id"],
                "category_id": m["category_id"],
                "order": m["order"],
                "reading_time_minutes": m["reading_time_minutes"],
                "title": m["title"].get(lang_key, m["title"]["en"]),
                "summary": m["summary"].get(lang_key, m["summary"]["en"])
            })
        return res

    @staticmethod
    def get_module_detail(topic_id: str, lang: str = "en") -> Optional[Dict[str, Any]]:
        lang_key = lang if lang in ["en", "hi", "kn"] else "en"
        match = next((m for m in LESSONS_DATA if m["id"] == topic_id), None)
        if not match:
            return None

        return {
            "id": match["id"],
            "category_id": match["category_id"],
            "order": match["order"],
            "reading_time_minutes": match["reading_time_minutes"],
            "title": match["title"].get(lang_key, match["title"]["en"]),
            "summary": match["summary"].get(lang_key, match["summary"]["en"]),
            "content_markdown": match["content"].get(lang_key, match["content"]["en"]),
            "key_takeaways": match["key_takeaways"].get(lang_key, match["key_takeaways"]["en"]),
            "quiz": match["quiz"]
        }

