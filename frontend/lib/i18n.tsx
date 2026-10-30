"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi" | "kn";

export interface Translations {
  tagline: string;
  supporting: string;
  nav: {
    dashboard: string;
    cards: string;
    offers: string;
    addCard: string;
    compare: string;
    optimizer: string;
    transactions: string;
    analytics: string;
    health: string;
    assistant: string;
    documents: string;
    profile: string;
    settings: string;
    logout: string;
    login: string;
    register: string;
  };
  offers: {
    title: string;
    subtitle: string;
    myCardsOnly: string;
    allOffers: string;
    expiringSoon: string;
    copyCode: string;
    codeCopied: string;
    minSpend: string;
    validTill: string;
    applicableOn: string;
    verified: string;
    sample: string;
  };
  dashboard: {
    title: string;
    registeredCards: string;
    totalSpend: string;
    rewardsEarned: string;
    efficiencyRate: string;
    quickOptimizer: string;
    amount: string;
    category: string;
    merchant: string;
    findBestCard: string;
    recentTransactions: string;
    portfolioOverview: string;
    viewAllCards: string;
  };
  cards: {
    title: string;
    subtitle: string;
    addNew: string;
    compare: string;
    annualFee: string;
    rules: string;
    benefits: string;
    cashback: string;
    rewardPoints: string;
    caps: string;
    exclusions: string;
    active: string;
  };
  optimizer: {
    title: string;
    subtitle: string;
    amountLabel: string;
    categoryLabel: string;
    merchantLabel: string;
    calculate: string;
    recommended: string;
    expectedReward: string;
    effectiveRate: string;
    breakdown: string;
    alternatives: string;
    delta: string;
  };
  analytics: {
    title: string;
    subtitle: string;
    spendByCategory: string;
    monthlyVelocity: string;
    rewardsRealized: string;
    leakage: string;
  };
  health: {
    title: string;
    subtitle: string;
    score: string;
    subscriptions: string;
    feeAudit: string;
    recommendations: string;
    forecast: string;
  };
  assistant: {
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    suggestions: string[];
    groundedIn: string;
  };
  documents: {
    title: string;
    subtitle: string;
    dragDrop: string;
    uploadButton: string;
    stagedRules: string;
    verifyButton: string;
    verified: string;
  };
  common: {
    rupee: string;
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    success: string;
    error: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    tagline: "Money Made Simple. In Your Language.",
    supporting: "Smarter decisions, Brighter futures. For everyone.",
    nav: {
      dashboard: "Dashboard",
      cards: "My Credit Cards",
      offers: "Offers & Deals",
      addCard: "Add Credit Card",
      compare: "Card Comparison",
      optimizer: "Reward Optimization",
      transactions: "Transactions",
      analytics: "Spending Analytics",
      health: "Financial Health",
      assistant: "AI Assistant",
      documents: "Document Processing",
      profile: "User Profile",
      settings: "Settings & Security",
      logout: "Sign Out",
      login: "Sign In",
      register: "Create Account",
    },
    offers: {
      title: "Credit Card Offers & Deals",
      subtitle: "Discover instant discounts and promotional deals matching your cards.",
      myCardsOnly: "My Cards Only",
      allOffers: "All Offers",
      expiringSoon: "Expiring Soon",
      copyCode: "Copy Code",
      codeCopied: "Copied!",
      minSpend: "Min. spend",
      validTill: "Valid till",
      applicableOn: "Applicable on",
      verified: "VERIFIED",
      sample: "SAMPLE",
    },
    dashboard: {
      title: "Financial Intelligence Overview",
      registeredCards: "Registered Cards",
      totalSpend: "Total Spend Tracked",
      rewardsEarned: "Rewards Earned",
      efficiencyRate: "Optimization Efficiency",
      quickOptimizer: "Quick Reward Optimizer",
      amount: "Spend Amount (₹)",
      category: "Category",
      merchant: "Merchant (Optional)",
      findBestCard: "Find Optimal Card",
      recentTransactions: "Recent Transactions",
      portfolioOverview: "Credit Card Portfolio",
      viewAllCards: "Manage All Cards",
    },
    cards: {
      title: "Credit Card Portfolio",
      subtitle: "Manage your registered credit cards, active multipliers, and verified benefits.",
      addNew: "Add Credit Card",
      compare: "Compare Cards",
      annualFee: "Annual Fee",
      rules: "Reward Rules",
      benefits: "Perks & Benefits",
      cashback: "Cashback",
      rewardPoints: "Reward Points",
      caps: "Monthly Cap",
      exclusions: "Exclusions",
      active: "Active",
    },
    optimizer: {
      title: "Deterministic Reward Optimizer",
      subtitle: "Calculates the exact highest-yield card using arbitrary-precision mathematical logic.",
      amountLabel: "Transaction Amount (₹)",
      categoryLabel: "Spending Category",
      merchantLabel: "Merchant Name (e.g., Swiggy, Amazon)",
      calculate: "Calculate Best Card",
      recommended: "Optimal Card Recommendation",
      expectedReward: "Expected Monetary Reward",
      effectiveRate: "Effective Yield Rate",
      breakdown: "Deterministic Calculation Breakdown",
      alternatives: "Alternative Cards Comparison",
      delta: "Reward Difference",
    },
    analytics: {
      title: "Spending & Reward Analytics",
      subtitle: "In-depth breakdown of spending categories, monthly velocity, and realized rewards.",
      spendByCategory: "Spending Allocation by Category",
      monthlyVelocity: "Monthly Spend vs. Rewards",
      rewardsRealized: "Reward Yield Realization",
      leakage: "Avoidable Reward Leakage",
    },
    health: {
      title: "Financial Health & Subscription Audit",
      subtitle: "Pinpoint recurring subscription leakage, annual fee breakeven, and future trajectories.",
      score: "Financial Health Score",
      subscriptions: "Detected Recurring Subscriptions",
      feeAudit: "Annual Fee Justification Audit",
      recommendations: "Actionable Insights",
      forecast: "30-Day Predictive Projection",
    },
    assistant: {
      title: "Multilingual AI Financial Assistant",
      subtitle: "Conversational intelligence grounded strictly in your verified card portfolio.",
      placeholder: "Ask about your cards, rewards, or specific purchases...",
      send: "Ask Assistant",
      suggestions: [
        "Which card gives the highest cashback on Swiggy?",
        "Do I get rewards on fuel purchases?",
        "Which card offers complimentary airport lounge access?",
        "What is the best card for Amazon shopping?",
      ],
      groundedIn: "Grounded in verified card portfolio",
    },
    documents: {
      title: "Document Intelligence & Verification",
      subtitle: "Upload PDF card statements or terms & conditions. Extracted rules are staged for human review.",
      dragDrop: "Drag and drop your credit card PDF (max 10MB)",
      uploadButton: "Choose PDF File",
      stagedRules: "Staged Extracted Rules (Pending Review)",
      verifyButton: "Verify & Activate Card",
      verified: "Card Verified & Active",
    },
    common: {
      rupee: "₹",
      loading: "Processing...",
      save: "Save Changes",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      success: "Operation Successful",
      error: "Something went wrong",
    },
  },
  hi: {
    tagline: "पैसे की समझ, अब सरल। आपकी अपनी भाषा में।",
    supporting: "सटीक निर्णय, उज्ज्वल भविष्य। हर किसी के लिए।",
    nav: {
      dashboard: "डैशबोर्ड",
      cards: "मेरे क्रेडिट कार्ड्स",
      offers: "ऑफ़र्स और छूट",
      addCard: "नया कार्ड जोड़ें",
      compare: "कार्ड तुलना",
      optimizer: "रिवॉर्ड ऑप्टिमाइज़र",
      transactions: "लेन-देन",
      analytics: "खर्च विश्लेषण",
      health: "वित्तीय स्वास्थ्य",
      assistant: "एआई वित्तीय सहायक",
      documents: "दस्तावेज़ प्रोसेसिंग",
      profile: "उपयोगकर्ता प्रोफ़ाइल",
      settings: "सेटिंग्स और सुरक्षा",
      logout: "साइन आउट",
      login: "लॉगिन करें",
      register: "खाता बनाएं",
    },
    offers: {
      title: "क्रेडिट कार्ड ऑफ़र्स और डील्स",
      subtitle: "अपने पंजीकृत कार्ड्स पर उपलब्ध तत्काल छूट और ऑफ़र्स खोजें।",
      myCardsOnly: "केवल मेरे कार्ड्स",
      allOffers: "सभी ऑफ़र्स",
      expiringSoon: "जल्द समाप्त होने वाले",
      copyCode: "कोड कॉपी करें",
      codeCopied: "कॉपी हो गया!",
      minSpend: "न्यूनतम खर्च",
      validTill: "वैधता तिथि",
      applicableOn: "लागू कार्ड्स",
      verified: "सत्यापित",
      sample: "सैंपल",
    },
    dashboard: {
      title: "वित्तीय बुद्धिमत्ता सारांश",
      registeredCards: "पंजीकृत कार्ड्स",
      totalSpend: "कुल ट्रैक किया गया खर्च",
      rewardsEarned: "अर्जित रिवॉर्ड्स",
      efficiencyRate: "ऑप्टिमाइज़ेशन दक्षता",
      quickOptimizer: "त्वरित रिवॉर्ड कैलकुलेटर",
      amount: "खर्च राशि (₹)",
      category: "श्रेणी",
      merchant: "मर्चेंट (वैकल्पिक)",
      findBestCard: "सर्वश्रेष्ठ कार्ड खोजें",
      recentTransactions: "हाल के लेन-देन",
      portfolioOverview: "कार्ड पोर्टफोलियो",
      viewAllCards: "सभी कार्ड्स देखें",
    },
    cards: {
      title: "क्रेडिट कार्ड पोर्टफोलियो",
      subtitle: "अपने क्रेडिट कार्ड्स, सक्रिय रिवॉर्ड दरें और प्रमाणित लाभ प्रबंधित करें।",
      addNew: "नया कार्ड जोड़ें",
      compare: "कार्ड्स की तुलना करें",
      annualFee: "वार्षिक शुल्क",
      rules: "रिवॉर्ड नियम",
      benefits: "सुविधाएं और लाउंज",
      cashback: "कैशबैक",
      rewardPoints: "रिवॉर्ड पॉइंट्स",
      caps: "मासिक सीमा",
      exclusions: "छूट (Exclusions)",
      active: "सक्रिय",
    },
    optimizer: {
      title: "सटीक रिवॉर्ड ऑप्टिमाइज़र",
      subtitle: "गणितीय सटीकता के साथ हर लेन-देन के लिए सबसे अधिक लाभ देने वाला कार्ड बताता है।",
      amountLabel: "लेन-देन राशि (₹)",
      categoryLabel: "खर्च की श्रेणी",
      merchantLabel: "मर्चेंट का नाम (जैसे स्विगी, अमेज़न)",
      calculate: "सर्वोत्तम कार्ड देखें",
      recommended: "सुझाया गया कार्ड",
      expectedReward: "अनुमानित रिवॉर्ड राशि",
      effectiveRate: "प्रभावी रिटर्न दर",
      breakdown: "गणना का पूर्ण विवरण",
      alternatives: "अन्य कार्ड्स की तुलना",
      delta: "लाभ का अंतर",
    },
    analytics: {
      title: "खर्च और रिवॉर्ड विश्लेषण",
      subtitle: "खर्च की श्रेणियों, मासिक गति और वास्तविक बचत का विस्तृत विवरण।",
      spendByCategory: "श्रेणी अनुसार खर्च",
      monthlyVelocity: "मासिक खर्च बनाम रिवॉर्ड्स",
      rewardsRealized: "प्राप्त रिवॉर्ड दर",
      leakage: "चूका हुआ संभावित लाभ",
    },
    health: {
      title: "वित्तीय स्वास्थ्य और सब्सक्रिप्शन ऑडिट",
      subtitle: "मासिक ऑटो-डेबिट, वार्षिक शुल्क वसूली और भविष्य के अनुमान का विश्लेषण।",
      score: "वित्तीय स्वास्थ्य स्कोर",
      subscriptions: "पहचाने गए आवर्ती सब्सक्रिप्शन",
      feeAudit: "वार्षिक शुल्क औचित्य जांच",
      recommendations: "कार्रवाई योग्य सुझाव",
      forecast: "30-दिनों का पूर्वानुमान",
    },
    assistant: {
      title: "बहुभाषी एआई वित्तीय सहायक",
      subtitle: "आपके सत्यापित कार्ड्स पर आधारित भरोसेमंद और सटीक वित्तीय मार्गदर्शन।",
      placeholder: "अपने कार्ड, रिवॉर्ड्स या किसी खरीदारी के बारे में पूछें...",
      send: "पूछें",
      suggestions: [
        "स्विगी पर कौन सा कार्ड इस्तेमाल करूँ?",
        "क्या पेट्रोल पर कैशबैक मिलता है?",
        "एयरपोर्ट लाउंज के लिए कौन सा कार्ड सही है?",
        "अमेज़न शॉपिंग के लिए बेस्ट कार्ड कौन सा है?",
      ],
      groundedIn: "सत्यापित कार्ड पोर्टफोलियो पर आधारित",
    },
    documents: {
      title: "दस्तावेज़ बुद्धिमत्ता और सत्यापन",
      subtitle: "क्रेडिट कार्ड पीडीएफ स्टेटमेंट या नियम पुस्तिका अपलोड करें और समीक्षा के बाद सक्रिय करें।",
      dragDrop: "क्रेडिट कार्ड पीडीएफ यहाँ खींचें और छोड़ें (अधिकतम 10MB)",
      uploadButton: "पीडीएफ फ़ाइल चुनें",
      stagedRules: "निकाले गए नियम (समीक्षा लंबित)",
      verifyButton: "सत्यापित करें और सक्रिय करें",
      verified: "कार्ड सत्यापित और सक्रिय",
    },
    common: {
      rupee: "₹",
      loading: "प्रक्रिया जारी है...",
      save: "सुरक्षित करें",
      cancel: "रद्द करें",
      delete: "हटाएं",
      edit: "संपादित करें",
      success: "सफलतापूर्वक संपन्न",
      error: "कुछ त्रुटि हुई",
    },
  },
  kn: {
    tagline: "ಹಣದ ನಿರ್ವಹಣೆ, ಈಗ ಸುಲಭ. ನಿಮ್ಮದೇ ಭಾಷೆಯಲ್ಲಿ.",
    supporting: "ಬುದ್ಧಿವಂತ ನಿರ್ಧಾರಗಳು, ಉಜ್ವಲ ಭವಿಷ್ಯ. ಪ್ರತಿಯೊಬ್ಬರಿಗೂ.",
    nav: {
      dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      cards: "ನನ್ನ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ಗಳು",
      offers: "ಆಫರ್‌ಗಳು ಮತ್ತು ಕೊಡುಗೆಗಳು",
      addCard: "ಹೊಸ ಕಾರ್ಡ್ ಸೇರಿಸಿ",
      compare: "ಕಾರ್ಡ್ ಹೋಲಿಕೆ",
      optimizer: "ರಿವಾರ್ಡ್ ಆಪ್ಟಿಮೈಜರ್",
      transactions: "ವಹಿವಾಟುಗಳು",
      analytics: "ವೆಚ್ಚ ವಿಶ್ಲೇಷಣೆ",
      health: "ಆರ್ಥಿಕ ಆರೋಗ್ಯ",
      assistant: "ಎಐ ಸಹಾಯಕ",
      documents: "ದಾಖಲೆ ಪ್ರಕ್ರಿಯೆ",
      profile: "ಬಳಕೆದಾರ ವಿವರ",
      settings: "ಸೆಟ್ಟಿಂಗ್ಸ್ ಮತ್ತು ಭದ್ರತೆ",
      logout: "ಸೈನ್ ಔಟ್",
      login: "ಲಾಗಿನ್",
      register: "ಖಾತೆ ತೆರೆಯಿರಿ",
    },
    offers: {
      title: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಆಫರ್‌ಗಳು ಮತ್ತು ಡೀಲ್‌ಗಳು",
      subtitle: "ನಿಮ್ಮ ಕಾರ್ಡ್‌ಗಳಿಗೆ ಲಭ್ಯವಿರುವ ರಿಯಾಯಿತಿ ಮತ್ತು ಕೊಡುಗೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.",
      myCardsOnly: "ನನ್ನ ಕಾರ್ಡ್‌ಗಳು ಮಾತ್ರ",
      allOffers: "ಎಲ್ಲಾ ಆಫರ್‌ಗಳು",
      expiringSoon: "ಶೀಘ್ರದಲ್ಲೇ ಮುಕ್ತಾಯ",
      copyCode: "ಕೋಡ್ ನಕಲಿಸಿ",
      codeCopied: "ನಕಲಿಸಲಾಗಿದೆ!",
      minSpend: "ಕನಿಷ್ಠ ವೆಚ್ಚ",
      validTill: "ಮಾನ್ಯತೆ",
      applicableOn: "ಅನ್ವಯವಾಗುವ ಕಾರ್ಡ್",
      verified: "ದೃಢೀಕರಿಸಲಾಗಿದೆ",
      sample: "ಮಾದರಿ",
    },
    dashboard: {
      title: "ಆರ್ಥಿಕ ಮಾಹಿತಿ ಅವಲೋಕನ",
      registeredCards: "ನೋಂದಾಯಿತ ಕಾರ್ಡ್‌ಗಳು",
      totalSpend: "ಒಟ್ಟು ಟ್ರ್ಯಾಕ್ ಮಾಡಿದ ವೆಚ್ಚ",
      rewardsEarned: "ಗಳಿಸಿದ ರಿವಾರ್ಡ್‌ಗಳು",
      efficiencyRate: "ಉಳಿತಾಯ ದಕ್ಷತೆ",
      quickOptimizer: "ತ್ವರಿತ ರಿವಾರ್ಡ್ ಆಪ್ಟಿಮೈಜರ್",
      amount: "ಖರ್ಚಿನ ಮೊತ್ತ (₹)",
      category: "ವರ್ಗ",
      merchant: "ವರ್ತಕ (ಐಚ್ಛಿಕ)",
      findBestCard: "ಉತ್ತಮ ಕಾರ್ಡ್ ಹುಡುಕಿ",
      recentTransactions: "ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು",
      portfolioOverview: "ಕಾರ್ಡ್ ಪೋರ್ಟ್‌ಫೋಲಿಯೊ",
      viewAllCards: "ಎಲ್ಲಾ ಕಾರ್ಡ್ ನಿರ್ವಹಿಸಿ",
    },
    cards: {
      title: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಪೋರ್ಟ್‌ಫೋಲಿಯೊ",
      subtitle: "ನಿಮ್ಮ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ಗಳು ಮತ್ತು ರಿವಾರ್ಡ್ ನಿಯಮಗಳನ್ನು ಸುಲಭವಾಗಿ ನಿರ್ವಹಿಸಿ.",
      addNew: "ಹೊಸ ಕಾರ್ಡ್ ಸೇರಿಸಿ",
      compare: "ಕಾರ್ಡ್‌ಗಳನ್ನು ಹೋಲಿಕೆ ಮಾಡಿ",
      annualFee: "ವಾರ್ಷಿಕ ಶುಲ್ಕ",
      rules: "ರಿವಾರ್ಡ್ ನಿಯಮಗಳು",
      benefits: "ಪ್ರಯೋಜನಗಳು ಮತ್ತು ಲೌಂಜ್",
      cashback: "ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್",
      rewardPoints: "ರಿವಾರ್ಡ್ ಪಾಯಿಂಟ್‌ಗಳು",
      caps: "ಮಾಸಿಕ ಮಿತಿ",
      exclusions: "ಹೊರಗಿಡುವಿಕೆಗಳು",
      active: "ಸಕ್ರಿಯ",
    },
    optimizer: {
      title: "ಖಚಿತ ರಿವಾರ್ಡ್ ಆಪ್ಟಿಮೈಜರ್",
      subtitle: "ನಿಖರ ಗಣಿತ ಲೆಕ್ಕಾಚಾರದ ಮೂಲಕ ಗರಿಷ್ಠ ರಿವಾರ್ಡ್ ನೀಡುವ ಕಾರ್ಡ್ ತೋರಿಸುತ್ತದೆ.",
      amountLabel: "ವಹಿವಾಟಿನ ಮೊತ್ತ (₹)",
      categoryLabel: "ವೆಚ್ಚದ ವರ್ಗ",
      merchantLabel: "ವರ್ತಕನ ಹೆಸರು (ಉದಾ: ಸ್ವಿಗ್ಗಿ, ಅಮೆಜಾನ್)",
      calculate: "ಅತ್ಯುತ್ತಮ ಕಾರ್ಡ್ ಪರಿಶೀಲಿಸಿ",
      recommended: "ಶಿಫಾರಸು ಮಾಡಿದ ಕಾರ್ಡ್",
      expectedReward: "ನಿರೀಕ್ಷಿತ ರಿವಾರ್ಡ್ ಮೊತ್ತ",
      effectiveRate: "ಪರಿಣಾಮಕಾರಿ ರಿವಾರ್ಡ್ ದರ",
      breakdown: "ಗಣಿತ ಲೆಕ್ಕಾಚಾರದ ವಿವರ",
      alternatives: "ಇತರ ಕಾರ್ಡ್‌ಗಳ ಹೋಲಿಕೆ",
      delta: "ಲಾಭದ ವ್ಯತ್ಯಾಸ",
    },
    analytics: {
      title: "ವೆಚ್ಚ ಮತ್ತು ರಿವಾರ್ಡ್ ವಿಶ್ಲೇಷಣೆ",
      subtitle: "ವೆಚ್ಚದ ವರ್ಗಗಳು, ಮಾಸಿಕ ಗತಿ ಮತ್ತು ಗಳಿಸಿದ ರಿವಾರ್ಡ್‌ಗಳ ವಿವರವಾದ ಮಾಹಿತಿ.",
      spendByCategory: "ವರ್ಗವಾರು ವೆಚ್ಚ ಹಂಚಿಕೆ",
      monthlyVelocity: "ಮಾಸಿಕ ವೆಚ್ಚ ಮತ್ತು ರಿವಾರ್ಡ್",
      rewardsRealized: "ಗಳಿಸಿದ ರಿವಾರ್ಡ್ ದರ",
      leakage: "ತಪ್ಪಿಹೋದ ಸಂಭವನೀಯ ಲಾಭ",
    },
    health: {
      title: "ಆರ್ಥಿಕ ಆರೋಗ್ಯ ಮತ್ತು ಚಂದಾದಾರಿಕೆ ತಪಾಸಣೆ",
      subtitle: "ಮರುಕಳಿಸುವ ಚಂದಾದಾರಿಕೆಗಳು ಮತ್ತು ವಾರ್ಷಿಕ ಶುಲ್ಕದ ಸಮರ್ಥನೆ ಪರಿಶೀಲಿಸಿ.",
      score: "ಆರ್ಥಿಕ ಆರೋಗ್ಯ ಸ್ಕೋರ್",
      subscriptions: "ಗುರುತಿಸಲಾದ ಮರುಕಳಿಸುವ ವೆಚ್ಚಗಳು",
      feeAudit: "ವಾರ್ಷಿಕ ಶುಲ್ಕ ತಪಾಸಣೆ",
      recommendations: "ಉಪಯುಕ್ತ ಸಲಹೆಗಳು",
      forecast: "30-ದಿನಗಳ ಅಂದಾಜು",
    },
    assistant: {
      title: "ಬಹುಭಾಷಾ ಎಐ ಆರ್ಥಿಕ ಸಹಾಯಕ",
      subtitle: "ನಿಮ್ಮ ಕಾರ್ಡ್ ನಿಯಮಗಳನ್ನು ಆಧರಿಸಿದ ವಿಶ್ವಾಸಾರ್ಹ ಆರ್ಥಿಕ ಮಾರ್ಗದರ್ಶನ.",
      placeholder: "ನಿಮ್ಮ ಕಾರ್ಡ್ ಅಥವಾ ಖರೀದಿಯ ಬಗ್ಗೆ ಕೇಳಿ...",
      send: "ಕೇಳಿ",
      suggestions: [
        "ಸ್ವಿಗ್ಗಿಯಲ್ಲಿ ಯಾವ ಕಾರ್ಡ್ ಬಳಸಿದರೆ ಹೆಚ್ಚು ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್ ಸಿಗುತ್ತದೆ?",
        "ಇಂಧನ ಖರೀದಿಗೆ ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್ ಸಿಗುತ್ತದೆಯೇ?",
        "ವಿಮಾನ ನಿಲ್ದಾಣದ ಲೌಂಜ್‌ಗೆ ಯಾವ ಕಾರ್ಡ್ ಬಳಸಬಹುದು?",
        "ಅಮೆಜಾನ್ ಶಾಪಿಂಗ್‌ಗೆ ಉತ್ತಮ ಕಾರ್ಡ್ ಯಾವುದು?",
      ],
      groundedIn: "ನೋಂದಾಯಿತ ಕಾರ್ಡ್ ಮಾಹಿತಿ ಆಧರಿತ",
    },
    documents: {
      title: "ದಾಖಲೆ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ಪರಿಶೀಲನೆ",
      subtitle: "ಕಾರ್ಡ್ ಪಿಡಿಎಫ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್‌ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ಪರಿಶೀಲಿಸಿ ಸಕ್ರಿಯಗೊಳಿಸಿ.",
      dragDrop: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಪಿಡಿಎಫ್ ಅನ್ನು ಇಲ್ಲಿ ಎಳೆಯಿರಿ (ಗರಿಷ್ಠ 10MB)",
      uploadButton: "ಪಿಡಿಎಫ್ ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ",
      stagedRules: "ಹೊರತೆಗೆದ ನಿಯಮಗಳು (ಪರಿಶೀಲನೆ ಬಾಕಿ)",
      verifyButton: "ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸಕ್ರಿಯಗೊಳಿಸಿ",
      verified: "ಕಾರ್ಡ್ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ",
    },
    common: {
      rupee: "₹",
      loading: "ಪ್ರಕ್ರಿಯೆ ಪ್ರಗತಿಯಲ್ಲಿದೆ...",
      save: "ಉಳಿಸಿ",
      cancel: "ರದ್ದುಮಾಡಿ",
      delete: "ಅಳಿಸಿ",
      edit: "ತಿದ್ದುಪಡಿ",
      success: "ಯಶಸ್ವಿಯಾಗಿದೆ",
      error: "ದೋಷ ಸಂಭವಿಸಿದೆ",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: translations.en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("cliq_preferred_language") as Language;
    if (saved && (saved === "en" || saved === "hi" || saved === "kn")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("cliq_preferred_language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
