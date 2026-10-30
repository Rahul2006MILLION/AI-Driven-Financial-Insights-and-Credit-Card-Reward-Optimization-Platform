# CLIQ — Project Overview

## 1. Vision & Problem Statement

Modern consumers own multiple credit cards, each governed by convoluted reward structures, complex merchant categorization rules, hidden exclusion clauses (e.g. rent, fuel, education, utility bill exclusions), dynamic multiplier tiers, and monthly/annual reward caps. Consequently:
- **Reward Leakage:** Consumers leave 30%–60% of potential cashback and reward value on the table simply by using suboptimal cards for routine purchases.
- **Cognitive Overload:** Terms and conditions documents are dense PDFs running tens of pages with fine print that consumers rarely read.
- **Language Barriers:** Mainstream fintech applications are predominantly English-first, alienating hundreds of millions of users in India and globally who prefer native languages such as Hindi or Kannada.
- **Chatbot Hallucinations:** Generic conversational AI interfaces often fabricate reward percentages and rules because they lack deterministic calculation engines and grounded card databases.

### The CLIQ Solution
**CLIQ** (*Money Made Simple. In Your Language.*) bridges this gap by combining:
1. **A Deterministic Reward Optimization Engine** (built in Python using exact `Decimal` precision) that calculates real rewards, enforces caps, filters exclusions, and ranks cards transparently.
2. **Document Intelligence Engine** that ingests credit card policy PDFs, extracts structured rules, and submits them to human-in-the-loop verification before activation.
3. **Multilingual Language Intelligence** supporting English, Hindi, and Kannada for conversational natural language interactions grounded strictly in verified platform data.
4. **Financial Health & Predictive Analytics** to pinpoint recurring subscriptions, annual fee vs. reward breakevens, and future reward trajectories.
5. **A Cinematic, Neon-Mountain Aesthetic** offering a dark fintech interface with high-contrast emerald and cyan accents.

---

## 2. Core Objectives

| Objective | Description |
|---|---|
| **Optimal Card Recommendation** | Given a transaction amount, merchant, and category, determine the exact highest-yield card. |
| **Deterministic Precision** | Financial calculations use arbitrary-precision decimals (`Decimal`), completely decoupled from LLM guessing. |
| **Rule & Exclusion Transparency** | Every reward calculation produces a full step-by-step breakdown displaying base rates, category bonuses, applied caps, and reasons for exclusions. |
| **Document Understanding** | Users can upload credit card statement or benefit guide PDFs to automatically extract rewards, fees, and rules into a staging review workflow. |
| **Multilingual Accessibility** | Seamless localized experience across English, Hindi (`हिन्दी`), and Kannada (`ಕನ್ನಡ`). |
| **Bank-Grade Security** | Full Row-Level Security (RLS) ownership guarantees, IDOR protection, JWT verification, encrypted document storage, zero sensitive credential leaks. |

---

## 3. Key Target Audiences

- **Everyday Consumers:** Wanting clear advice on which card to swipe at supermarket checkouts, fuel stations, flight bookings, or dining.
- **Points & Miles Maximizers:** Power users tracking multiple co-branded credit cards with complex monthly spending thresholds and category caps.
- **Multilingual Users:** Individuals who prefer financial advice, card comparisons, and dashboard insights in their mother tongue (Hindi or Kannada).
