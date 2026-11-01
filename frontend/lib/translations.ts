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
    profileSettings: string;
    adminDesk: string;
    proMember: string;
    administrator: string;
  };

  sidebar: {
    workspace: string;
    administration: string;
    staffBadge: string;
    offerReviewDesk: string;
  };

  landing: {
    badge: string;
    heroTitlePrefix: string;
    heroTitleAccent: string;
    heroSubtitle: string;
    exploreCta: string;
    signInCta: string;
    featureOptimizerTitle: string;
    featureOptimizerDesc: string;
    featureWalletTitle: string;
    featureWalletDesc: string;
    featurePrivacyTitle: string;
    featurePrivacyDesc: string;
    footerBrand: string;
    footerRls: string;
    footerPan: string;
    footerIndia: string;
  };

  dashboard: {
    title: string;
    subtitle: string;
    commandCenter: string;
    registeredCards: string;
    activeInWallet: string;
    viewFan: string;
    totalSpend: string;
    rewardsEarned: string;
    rewardsRealized: string;
    potentialReward: string;
    efficiencyRate: string;
    rewardEfficiency: string;
    optimalSpendRate: string;
    leakage: string;
    financialHealth: string;
    subscriptions: string;
    viewDetails: string;
    quickOptimizer: string;
    decimalPrecision: string;
    amount: string;
    category: string;
    merchant: string;
    findBestCard: string;
    recommendBestCard: string;
    optimalRecommendation: string;
    yield: string;
    expectedValue: string;
    inspectAlternatives: string;
    recentTransactions: string;
    recentActivity: string;
    viewAllTransactions: string;
    statusSettled: string;
    noRecentActivity: string;
    recordFirstTransaction: string;
    portfolioOverview: string;
    portfolioShowcase: string;
    manageAllCards: string;
    noCardsInPortfolio: string;
    seedDemoPortfolio: string;
    addYourFirstCard: string;
    financialIntelligenceTitle: string;
    financialIntelligenceDesc: string;
    askAssistant: string;
    addCardCta: string;
    sampleSuggestion1: string;
    sampleSuggestion2: string;
  };

  cards: {
    title: string;
    subtitle: string;
    cardCollectionTitle: string;
    cardCollectionSubtitle: string;
    cardsCountLabel: string;
    verifiedCountLabel: string;
    viewFan: string;
    viewGrid: string;
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
    searchPlaceholder: string;
    allBanks: string;
    allNetworks: string;
    noMatchingCards: string;
    resetFilters: string;
    editCardTitle: string;
    deleteCardConfirm: string;
    deleteCardSuccess: string;
    deleteCardFailed: string;
    lastFourValidation: string;
    savingCard: string;
    saveChanges: string;
    cancel: string;
  };

  cardDetails: {
    selectCardPrompt: string;
    selectCardHelper: string;
    activePortfolioBadge: string;
    cardNetwork: string;
    billingCycle: string;
    dayOfMonth: string;
    annualFeeLabel: string;
    feeWaiverLabel: string;
    spendPrefix: string;
    waiverAchieved: string;
    multipliersRulesTitle: string;
    perksBenefitsTitle: string;
    editCard: string;
    deleteCard: string;
    deleting: string;
    noRulesAvailable: string;
    noBenefitsAvailable: string;
    rulePerkExclusion: string;
    monthlyCapPrefix: string;
  };

  cardSelection: {
    title: string;
    subtitle: string;
    zeroStorageBadge: string;
    step1Title: string;
    issuersCount: string;
    step2Title: string;
    verifiedCardsCount: string;
    step3Title: string;
    cardholderNameLabel: string;
    nicknameLabel: string;
    lastFourLabel: string;
    networkLabel: string;
    billingDayLabel: string;
    feeStructureTitle: string;
    joiningFeeLabel: string;
    annualFeeLabel: string;
    waiverSpendLabel: string;
    waiverDetailsLabel: string;
    termsUrlLabel: string;
    rulesAccordionTitle: string;
    benefitsAccordionTitle: string;
    addRuleButton: string;
    addBenefitButton: string;
    submitAddCard: string;
    registering: string;
    cardAddedSuccess: string;
    selectIssuerFirst: string;
    customCardNotice: string;
  };

  compare: {
    title: string;
    subtitle: string;
    selectionPrompt: string;
    runComparison: string;
    comparing: string;
    annualFeeRow: string;
    renewalWaiverRow: string;
    topMultipliersRow: string;
    keyPerksRow: string;
    netBenefitProjection: string;
    bestForSummary: string;
    noCardsToCompare: string;
  };

  offers: {
    title: string;
    subtitle: string;
    reviewDeskCta: string;
    optimizeSpendCta: string;
    searchPlaceholder: string;
    allCategories: string;
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
    noOffersFound: string;
    clearFilters: string;
  };

  optimizer: {
    title: string;
    subtitle: string;
    intelligenceTitle: string;
    intelligenceSubtitle: string;
    amountLabel: string;
    categoryLabel: string;
    merchantLabel: string;
    channelLabel: string;
    onlineChannel: string;
    offlineChannel: string;
    calculate: string;
    calculating: string;
    recommended: string;
    topRecommendation: string;
    expectedReward: string;
    effectiveRate: string;
    yieldLabel: string;
    instantDiscount: string;
    postRewardCashback: string;
    netBenefit: string;
    breakdown: string;
    calculationStepsTitle: string;
    alternatives: string;
    ineligibleOffersTitle: string;
    delta: string;
    stepNumber: string;
    ruleApplied: string;
    ratePercentage: string;
    benefitValue: string;
    stepReason: string;
    capStatus: string;
    matchedCoupons: string;
  };

  transactions: {
    title: string;
    subtitle: string;
    addNewTransaction: string;
    addModalTitle: string;
    merchantLabel: string;
    amountLabel: string;
    categoryLabel: string;
    cardLabel: string;
    recurringLabel: string;
    recordTransactionButton: string;
    recording: string;
    tableDate: string;
    tableMerchant: string;
    tableCategory: string;
    tableCard: string;
    tableAmount: string;
    tableReward: string;
    tableActions: string;
    noTransactionsFound: string;
    recordFirstPrompt: string;
    deletePrompt: string;
    deleteFailed: string;
  };

  analytics: {
    title: string;
    subtitle: string;
    spendByCategory: string;
    monthlyVelocity: string;
    rewardsRealized: string;
    leakage: string;
    totalSpendingTracked: string;
    acrossPurchases: string;
    efficiencyRate: string;
    avoidableLeakage: string;
    computingAnalytics: string;
    categoryAllocation: string;
    monthlyVelocityChart: string;
  };

  health: {
    title: string;
    subtitle: string;
    score: string;
    healthIndex: string;
    efficiencyRate: string;
    subscriptions: string;
    feeAudit: string;
    recommendations: string;
    forecast: string;
    projectionsTitle: string;
    projectedSpend: string;
    projectedRewards: string;
    auditingMetrics: string;
    justifiedCards: string;
    atRiskCards: string;
    annualFee: string;
    earnedRewards: string;
    netRoi: string;
    feeWaiverStatus: string;
    actionableAdvice: string;
  };

  assistant: {
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    asking: string;
    suggestions: string[];
    groundedIn: string;
    welcomeMessage: string;
    privacyGatewayTitle: string;
    privacyGatewaySubtitle: string;
    externalAiToggleLabel: string;
    allowCardContextLabel: string;
    allowSpendingContextLabel: string;
    saveConsentButton: string;
    activeProviderLabel: string;
    dataClassificationLabel: string;
    auditIdLabel: string;
    tokensRedactedLabel: string;
    localProtectedStatus: string;
  };

  documents: {
    title: string;
    subtitle: string;
    dragDrop: string;
    uploadButton: string;
    uploading: string;
    stagedRules: string;
    verifyButton: string;
    verifying: string;
    verified: string;
    pdfOnlyError: string;
    fileSizeError: string;
    uploadedDocumentsList: string;
    extractedSpecTitle: string;
    processingDocument: string;
  };

  settings: {
    title: string;
    subtitle: string;
    preferencesSavedMsg: string;
    securityArchitectureTitle: string;
    securityDesc: string;
    rlsTitle: string;
    rlsDesc: string;
    tokenEncryptionTitle: string;
    tokenEncryptionDesc: string;
    optimizationPreferencesTitle: string;
    prioritizeCashbackLabel: string;
    prioritizeCashbackDesc: string;
    includeFeeNetLabel: string;
    includeFeeNetDesc: string;
    savePreferencesButton: string;
    dataSovereigntyTitle: string;
    exportArchiveButton: string;
    deleteAccountButton: string;
    deleteAccountConfirm: string;
  };

  profile: {
    title: string;
    subtitle: string;
    fullNameLabel: string;
    emailLabel: string;
    preferredLanguageLabel: string;
    currencyLabel: string;
    saveProfileButton: string;
    saving: string;
    savedSuccess: string;
  };

  auth: {
    signInTitle: string;
    signInSubtitle: string;
    createAccountTitle: string;
    createAccountSubtitle: string;
    emailLabel: string;
    passwordLabel: string;
    fullNameLabel: string;
    preferredLanguageLabel: string;
    signInButton: string;
    createAccountButton: string;
    signingIn: string;
    creatingAccount: string;
    quickDemoCredentials: string;
    noAccountPrompt: string;
    haveAccountPrompt: string;
    registeredSuccessBanner: string;
  };

  onboarding: {
    stepLangTitle: string;
    stepPortfolioTitle: string;
    stepCompleteTitle: string;
    selectLanguageHeading: string;
    selectLanguageSub: string;
    continueButton: string;
    seedDemoButton: string;
    finishButton: string;
    seedingText: string;
    portfolioHeading: string;
    portfolioSub: string;
    readyHeading: string;
    readySub: string;
  };

  adminOffers: {
    title: string;
    subtitle: string;
    tabReview: string;
    tabSources: string;
    tabUpload: string;
    tabManual: string;
    tabFailures: string;
    pendingFilter: string;
    approvedFilter: string;
    rejectedFilter: string;
    syncButton: string;
    syncing: string;
    approveCta: string;
    rejectCta: string;
    editCta: string;
    sourceHealthTitle: string;
    circularUploadTitle: string;
    manualCreateTitle: string;
  };

  categories: {
    all: string;
    dining: string;
    food_delivery: string;
    shopping: string;
    grocery: string;
    travel: string;
    entertainment: string;
    utility: string;
    fuel: string;
    international: string;
    other: string;
  };

  channels: {
    online: string;
    offline: string;
    both: string;
  };

  common: {
    rupee: string;
    loading: string;
    processing: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    success: string;
    error: string;
    verified: string;
    active: string;
    inactive: string;
    status: string;
    actions: string;
    samplePortfolio: string;
    provisioningPortfolio: string;
    samplePortfolioInitialized: string;
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
      profileSettings: "Profile & Settings",
      adminDesk: "Offer Review Desk",
      proMember: "PRO Member",
      administrator: "Administrator",
    },

    sidebar: {
      workspace: "Workspace",
      administration: "Administration",
      staffBadge: "STAFF",
      offerReviewDesk: "Offer Review Desk",
    },

    landing: {
      badge: "Liquid Glass Fintech Platform",
      heroTitlePrefix: "Money, Made ",
      heroTitleAccent: "Intelligent.",
      heroSubtitle: "Your cards. Your rewards. Your financial clarity.",
      exploreCta: "Explore CLIQ",
      signInCta: "Sign In",
      featureOptimizerTitle: "Purchase Optimizer",
      featureOptimizerDesc: "Exact calculations for merchant rewards and fee waivers.",
      featureWalletTitle: "Fan Wallet",
      featureWalletDesc: "Interactive 3D collection with real issuer card specs.",
      featurePrivacyTitle: "Privacy Gateway",
      featurePrivacyDesc: "Local processing by default. Zero unauthorized egress.",
      footerBrand: "Money, Made Intelligent.",
      footerRls: "256-Bit RLS Protection",
      footerPan: "Zero PAN Storage",
      footerIndia: "India First",
    },

    dashboard: {
      title: "Financial Intelligence Overview",
      subtitle: "Financial intelligence and real-time portfolio metrics",
      commandCenter: "Command Center",
      registeredCards: "Registered Cards",
      activeInWallet: "Active in Wallet",
      viewFan: "Fan",
      totalSpend: "Total Spend Tracked",
      rewardsEarned: "Rewards Earned",
      rewardsRealized: "Rewards Realized",
      potentialReward: "Potential",
      efficiencyRate: "Optimization Efficiency",
      rewardEfficiency: "Reward Efficiency",
      optimalSpendRate: "Optimal Spend Rate",
      leakage: "Leakage",
      financialHealth: "Financial Health",
      subscriptions: "Subscriptions",
      viewDetails: "Details",
      quickOptimizer: "Quick Reward Optimizer",
      decimalPrecision: "Decimal Precision",
      amount: "Spend Amount (₹)",
      category: "Category",
      merchant: "Merchant (Optional)",
      findBestCard: "Find Optimal Card",
      recommendBestCard: "Recommend Best Card",
      optimalRecommendation: "Optimal Recommendation",
      yield: "Yield",
      expectedValue: "Expected Value",
      inspectAlternatives: "Inspect Alternatives",
      recentTransactions: "Recent Transactions",
      recentActivity: "Recent Activity",
      viewAllTransactions: "View All Transactions",
      statusSettled: "Status: Settled",
      noRecentActivity: "No recent transactions found.",
      recordFirstTransaction: "Record First Transaction",
      portfolioOverview: "Credit Card Portfolio",
      portfolioShowcase: "Portfolio Showcase",
      manageAllCards: "Manage All Cards",
      noCardsInPortfolio: "No cards registered in portfolio",
      seedDemoPortfolio: "Seed Demo Portfolio",
      addYourFirstCard: "Add Your First Card",
      financialIntelligenceTitle: "Financial Intelligence",
      financialIntelligenceDesc: "Local-first assistant grounded in your verified card portfolio.",
      askAssistant: "Ask Assistant",
      addCardCta: "Add Card",
      sampleSuggestion1: "Which card gives the highest cashback on Swiggy?",
      sampleSuggestion2: "Show airport lounge access across my cards",
    },

    cards: {
      title: "Credit Card Portfolio",
      subtitle: "Manage your registered credit cards, active multipliers, and verified benefits.",
      cardCollectionTitle: "Card Collection",
      cardCollectionSubtitle: "Interactive multi-card portfolio & privileges",
      cardsCountLabel: "Cards:",
      verifiedCountLabel: "Verified:",
      viewFan: "Fan",
      viewGrid: "Grid",
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
      searchPlaceholder: "Filter cards by name, bank, or nickname...",
      allBanks: "All Banks",
      allNetworks: "All Networks",
      noMatchingCards: "No cards match your filter criteria.",
      resetFilters: "Reset Filters",
      editCardTitle: "Edit Card Details",
      deleteCardConfirm: "Are you sure you want to deactivate this credit card? Historical transaction links will be preserved.",
      deleteCardSuccess: "Card deactivated successfully.",
      deleteCardFailed: "Failed to delete card",
      lastFourValidation: "Last 4 digits must contain exactly 4 numeric digits.",
      savingCard: "Saving...",
      saveChanges: "Save Changes",
      cancel: "Cancel",
    },

    cardDetails: {
      selectCardPrompt: "Select a Card",
      selectCardHelper: "Hover or tap any card in the collection to inspect multipliers, fee waivers, and verified benefits.",
      activePortfolioBadge: "Active Card Portfolio",
      cardNetwork: "Card Network",
      billingCycle: "Billing Cycle",
      dayOfMonth: "day of month",
      annualFeeLabel: "Annual Fee",
      feeWaiverLabel: "Fee Waiver",
      spendPrefix: "Spend",
      waiverAchieved: "Eligible for automatic renewal waiver",
      multipliersRulesTitle: "Reward Multipliers & Rules",
      perksBenefitsTitle: "Verified Perks & Benefits",
      editCard: "Edit Card Details",
      deleteCard: "Delete Card",
      deleting: "Deactivating...",
      noRulesAvailable: "No special category multipliers configured.",
      noBenefitsAvailable: "No complimentary benefits registered.",
      rulePerkExclusion: "Exclusion Rule",
      monthlyCapPrefix: "Cap: ₹",
    },

    cardSelection: {
      title: "Select & Customize Credit Card",
      subtitle: "Choose from 10 verified Indian credit card catalogues with real fee schedules and reward multipliers, or enter a custom card.",
      zeroStorageBadge: "Zero PAN / CVV Storage",
      step1Title: "1. Select Card Issuer",
      issuersCount: "10 Issuers Available",
      step2Title: "2. Select Card Variant",
      verifiedCardsCount: "Verified Cards",
      step3Title: "3. Customize & Register Card",
      cardholderNameLabel: "Cardholder Name",
      nicknameLabel: "Card Nickname (Optional)",
      lastFourLabel: "Last 4 Digits (Optional)",
      networkLabel: "Card Network",
      billingDayLabel: "Billing Cycle Day",
      feeStructureTitle: "Fee Structure & Waivers",
      joiningFeeLabel: "Joining Fee (₹)",
      annualFeeLabel: "Annual Fee (₹)",
      waiverSpendLabel: "Waiver Spend Requirement (₹)",
      waiverDetailsLabel: "Fee Waiver Condition Details",
      termsUrlLabel: "Terms & Conditions Source URL",
      rulesAccordionTitle: "Verified Reward Multipliers & Rules",
      benefitsAccordionTitle: "Verified Perks & Benefits",
      addRuleButton: "Add Custom Multiplier Rule",
      addBenefitButton: "Add Custom Perk / Benefit",
      submitAddCard: "Add Card to Portfolio",
      registering: "Registering Card...",
      cardAddedSuccess: "Card successfully registered in portfolio!",
      selectIssuerFirst: "Please select an issuing bank above.",
      customCardNotice: "Custom card parameters can be manually defined.",
    },

    compare: {
      title: "Card Comparison",
      subtitle: "Side-by-side multiplier matrix and annual fee breakeven analysis",
      selectionPrompt: "Select 2 to 5 Cards",
      runComparison: "Compare",
      comparing: "Comparing...",
      annualFeeRow: "Annual Fee",
      renewalWaiverRow: "Renewal Waiver Spend",
      topMultipliersRow: "Top Category Multipliers",
      keyPerksRow: "Key Perks & Lounges",
      netBenefitProjection: "Net Benefit Projection",
      bestForSummary: "Ideal Spend Profile",
      noCardsToCompare: "Please add at least 2 cards to run a comparative matrix.",
    },

    offers: {
      title: "Credit Card Offers & Deals",
      subtitle: "Discover instant discounts and promotional deals matching your cards.",
      reviewDeskCta: "Review Desk",
      optimizeSpendCta: "Optimize Spend",
      searchPlaceholder: "Search merchant, coupon, or deal...",
      allCategories: "All Categories",
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
      noOffersFound: "No verified offers match your search criteria.",
      clearFilters: "Clear Filters",
    },

    optimizer: {
      title: "Deterministic Reward Optimizer",
      subtitle: "Calculates the exact highest-yield card using arbitrary-precision mathematical logic.",
      intelligenceTitle: "Purchase Intelligence",
      intelligenceSubtitle: "Real-time reward maximization and instant coupon detection",
      amountLabel: "Transaction Amount (₹)",
      categoryLabel: "Spending Category",
      merchantLabel: "Merchant Name (e.g., Swiggy, Amazon)",
      channelLabel: "Payment Channel",
      onlineChannel: "Online",
      offlineChannel: "In-Store",
      calculate: "Calculate Best Card",
      calculating: "Computing Optimal Return...",
      recommended: "Optimal Card Recommendation",
      topRecommendation: "Top Recommendation",
      expectedReward: "Expected Monetary Reward",
      effectiveRate: "Effective Yield Rate",
      yieldLabel: "Yield",
      instantDiscount: "Instant Discount",
      postRewardCashback: "Post-Reward Cashback",
      netBenefit: "Net Financial Benefit",
      breakdown: "Deterministic Calculation Breakdown",
      calculationStepsTitle: "Calculation Steps",
      alternatives: "Alternative Cards Comparison",
      ineligibleOffersTitle: "Ineligible Offers Evaluated",
      delta: "Reward Difference",
      stepNumber: "Step",
      ruleApplied: "Rule Applied",
      ratePercentage: "Rate",
      benefitValue: "Calculated Benefit",
      stepReason: "Reason / Logic",
      capStatus: "Monthly Cap",
      matchedCoupons: "Matched Promotional Offers",
    },

    transactions: {
      title: "Transactions",
      subtitle: "Historical purchases and reward allocation efficiency",
      addNewTransaction: "Add Transaction",
      addModalTitle: "Record New Purchase",
      merchantLabel: "Merchant / Store Name",
      amountLabel: "Transaction Amount (₹)",
      categoryLabel: "Spending Category",
      cardLabel: "Payment Card Used",
      recurringLabel: "Recurring Monthly Subscription",
      recordTransactionButton: "Record Transaction",
      recording: "Saving...",
      tableDate: "Date",
      tableMerchant: "Merchant",
      tableCategory: "Category",
      tableCard: "Card Used",
      tableAmount: "Amount",
      tableReward: "Reward Yield",
      tableActions: "Actions",
      noTransactionsFound: "No transaction records found.",
      recordFirstPrompt: "Record your first transaction to unlock spending analytics.",
      deletePrompt: "Are you sure you want to delete this transaction record?",
      deleteFailed: "Failed to delete transaction",
    },

    analytics: {
      title: "Spending & Reward Analytics",
      subtitle: "In-depth breakdown of spending categories, monthly velocity, and realized rewards.",
      spendByCategory: "Spending Allocation by Category",
      monthlyVelocity: "Monthly Spend vs. Rewards",
      rewardsRealized: "Reward Yield Realization",
      leakage: "Avoidable Reward Leakage",
      totalSpendingTracked: "Total Spending Tracked",
      acrossPurchases: "Across Purchases",
      efficiencyRate: "Optimization Efficiency",
      avoidableLeakage: "Avoidable Reward Leakage",
      computingAnalytics: "Computing portfolio telemetry...",
      categoryAllocation: "Category Distribution",
      monthlyVelocityChart: "Spend vs. Rewards Velocity",
    },

    health: {
      title: "Financial Health & Subscription Audit",
      subtitle: "Pinpoint recurring subscription leakage, annual fee breakeven, and future trajectories.",
      score: "Financial Health Score",
      healthIndex: "Health Index",
      efficiencyRate: "Efficiency Rate",
      subscriptions: "Detected Recurring Subscriptions",
      feeAudit: "Annual Fee Justification Audit",
      recommendations: "Actionable Insights",
      forecast: "30-Day Predictive Projection",
      projectionsTitle: "30-Day Forward Projection",
      projectedSpend: "Estimated 30-Day Spend",
      projectedRewards: "Projected Rewards",
      auditingMetrics: "Auditing financial metrics...",
      justifiedCards: "Fee Justified",
      atRiskCards: "Fee at Risk",
      annualFee: "Annual Fee",
      earnedRewards: "Rewards Earned",
      netRoi: "Net Fee ROI",
      feeWaiverStatus: "Fee Waiver Trajectory",
      actionableAdvice: "Actionable Recommendations",
    },

    assistant: {
      title: "Multilingual AI Financial Assistant",
      subtitle: "Conversational intelligence grounded strictly in your verified card portfolio.",
      placeholder: "Ask about your cards, rewards, or specific purchases...",
      send: "Ask Assistant",
      asking: "Consulting Grounded Engine...",
      suggestions: [
        "Which card gives the highest cashback on Swiggy?",
        "Do I get rewards on fuel purchases?",
        "Which card offers complimentary airport lounge access?",
        "What is the best card for Amazon shopping?",
      ],
      groundedIn: "Grounded in verified card portfolio",
      welcomeMessage: "Hello. I am your CLIQ Financial Intelligence Assistant. In accordance with our Privacy-First Architecture, all queries are processed locally by default with zero cloud exposure.",
      privacyGatewayTitle: "Privacy & Data Protection Gateway",
      privacyGatewaySubtitle: "Granular controls for external AI processing and data minimization",
      externalAiToggleLabel: "Enable External AI (Google Gemini)",
      allowCardContextLabel: "Allow Minimized Card Context",
      allowSpendingContextLabel: "Allow Aggregated Spending Context",
      saveConsentButton: "Save Privacy Preferences",
      activeProviderLabel: "Active Provider",
      dataClassificationLabel: "Data Classification",
      auditIdLabel: "Audit Request ID",
      tokensRedactedLabel: "Tokens Redacted",
      localProtectedStatus: "Local Processing (Zero Exposure)",
    },

    documents: {
      title: "Document Intelligence & Verification",
      subtitle: "Upload PDF card statements or terms & conditions. Extracted rules are staged for human review.",
      dragDrop: "Drag and drop your credit card PDF (max 10MB)",
      uploadButton: "Choose PDF File",
      uploading: "Extracting Specifications...",
      stagedRules: "Staged Extracted Rules (Pending Review)",
      verifyButton: "Verify & Activate Card",
      verifying: "Activating...",
      verified: "Card Verified & Active",
      pdfOnlyError: "Only PDF documents (.pdf) are supported.",
      fileSizeError: "File size exceeds 10MB limit.",
      uploadedDocumentsList: "Uploaded Documents Archive",
      extractedSpecTitle: "Extracted Card Specifications",
      processingDocument: "Processing document rules with PyMuPDF...",
    },

    settings: {
      title: "Settings & Security",
      subtitle: "Cryptographic protections, optimization parameters, and data sovereignty",
      preferencesSavedMsg: "Optimization preferences saved.",
      securityArchitectureTitle: "Security Architecture & Tenant Isolation",
      securityDesc: "CLIQ enforces hardware-isolated database tenants with cryptographic JWT tokens and strict ownership checks on every request.",
      rlsTitle: "PostgreSQL Row-Level Security (RLS)",
      rlsDesc: "All database queries strictly filter by authenticated user tenancy. Cross-user access is impossible.",
      tokenEncryptionTitle: "AES-256 / SHA-256 Data Integrity",
      tokenEncryptionDesc: "Tokens and session identifiers are signed using HMAC-SHA256. Financial numbers are stored in arbitrary-precision Decimal fields.",
      optimizationPreferencesTitle: "Optimization Preferences",
      prioritizeCashbackLabel: "Prioritize Direct Cashback over Points",
      prioritizeCashbackDesc: "Prefers instant statement credits and direct discounts when yields are within 0.25% of points.",
      includeFeeNetLabel: "Include Net Annual Fee in Yield",
      includeFeeNetDesc: "Deducts prorated annual fee burdens from net yield forecasts.",
      savePreferencesButton: "Save Preferences",
      dataSovereigntyTitle: "Data Sovereignty & Portability",
      exportArchiveButton: "Export Encrypted Portfolio Archive",
      deleteAccountButton: "Delete Account & Purge Data",
      deleteAccountConfirm: "Are you sure you want to delete your account? All stored card profiles and transaction logs will be scrubbed.",
    },

    profile: {
      title: "User Profile",
      subtitle: "Personal details, language preference, and portfolio currency",
      fullNameLabel: "Full Name",
      emailLabel: "Email Address",
      preferredLanguageLabel: "Preferred Language",
      currencyLabel: "Base Currency",
      saveProfileButton: "Save Profile",
      saving: "Saving Profile...",
      savedSuccess: "Profile updated successfully.",
    },

    auth: {
      signInTitle: "Sign In to CLIQ",
      signInSubtitle: "Financial Intelligence & Zero-Exposure Rewards",
      createAccountTitle: "Create Your CLIQ Account",
      createAccountSubtitle: "Smart Card Optimization. In Your Language.",
      emailLabel: "Email Address",
      passwordLabel: "Password",
      fullNameLabel: "Full Name",
      preferredLanguageLabel: "Preferred Language",
      signInButton: "Sign In",
      createAccountButton: "Create Account",
      signingIn: "Authenticating...",
      creatingAccount: "Creating Account...",
      quickDemoCredentials: "Quick fill demo credentials",
      noAccountPrompt: "Don't have an account?",
      haveAccountPrompt: "Already have an account?",
      registeredSuccessBanner: "Account created successfully! Please sign in with your credentials.",
    },

    onboarding: {
      stepLangTitle: "Language & Region",
      stepPortfolioTitle: "Portfolio",
      stepCompleteTitle: "Complete",
      selectLanguageHeading: "Select Your Language",
      selectLanguageSub: "All recommendations, assistant dialogues, and analytics adapt to your language.",
      continueButton: "Continue to Portfolio",
      seedDemoButton: "Provision Demo Portfolio",
      finishButton: "Launch Command Center",
      seedingText: "Provisioning Verified Portfolio...",
      portfolioHeading: "Credit Card Portfolio",
      portfolioSub: "Start with verified Indian credit cards or seed sample demo data.",
      readyHeading: "You're All Set!",
      readySub: "Your account is secured with local-first privacy and deterministic calculation engines.",
    },

    adminOffers: {
      title: "Offer Review & Ingestion Desk",
      subtitle: "Staged human-in-the-loop review, source health monitoring, and circular ingestion",
      tabReview: "Review Queue",
      tabSources: "Source Health",
      tabUpload: "Upload Circular",
      tabManual: "Manual Entry",
      tabFailures: "Failure Logs",
      pendingFilter: "Pending Review",
      approvedFilter: "Approved",
      rejectedFilter: "Rejected",
      syncButton: "Sync All Sources",
      syncing: "Syncing Sources...",
      approveCta: "Approve Offer",
      rejectCta: "Reject Offer",
      editCta: "Edit Details",
      sourceHealthTitle: "Offer Ingestion Sources",
      circularUploadTitle: "Upload Bank Circular PDF",
      manualCreateTitle: "Manually Create Verified Offer",
    },

    categories: {
      all: "All Categories",
      dining: "Dining & Restaurants",
      food_delivery: "Food Delivery (Swiggy, Zomato)",
      shopping: "Shopping & Retail",
      grocery: "Grocery & Mart",
      travel: "Travel & Hotels",
      entertainment: "Entertainment & Movies",
      utility: "Utility & Bills",
      fuel: "Fuel & Petrol Pumps",
      international: "International Spends",
      other: "General Spends",
    },

    channels: {
      online: "Online",
      offline: "In-Store",
      both: "All Channels",
    },

    common: {
      rupee: "₹",
      loading: "Processing...",
      processing: "Calculating...",
      save: "Save Changes",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      success: "Operation Successful",
      error: "Something went wrong",
      verified: "VERIFIED",
      active: "Active",
      inactive: "Inactive",
      status: "Status",
      actions: "Actions",
      samplePortfolio: "Sample Portfolio",
      provisioningPortfolio: "Provisioning Portfolio...",
      samplePortfolioInitialized: "Sample portfolio initialized",
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
      profileSettings: "प्रोफ़ाइल और सेटिंग्स",
      adminDesk: "ऑफ़र समीक्षा डेस्क",
      proMember: "प्रो सदस्य",
      administrator: "प्रशासक",
    },

    sidebar: {
      workspace: "कार्यक्षेत्र",
      administration: "प्रशासन",
      staffBadge: "स्टाफ़",
      offerReviewDesk: "ऑफ़र समीक्षा डेस्क",
    },

    landing: {
      badge: "लिक्विड ग्लास फिनटेक प्लेटफॉर्म",
      heroTitlePrefix: "पैसे की समझ, अब ",
      heroTitleAccent: "बुद्धिमानी से।",
      heroSubtitle: "आपके कार्ड्स। आपके रिवॉर्ड्स। आपकी वित्तीय स्पष्टता।",
      exploreCta: "CLIQ एक्सप्लोर करें",
      signInCta: "साइन इन करें",
      featureOptimizerTitle: "खरीदारी ऑप्टिमाइज़र",
      featureOptimizerDesc: "मर्चेंट रिवॉर्ड्स और शुल्क छूट के लिए सटीक गणितीय गणना।",
      featureWalletTitle: "फैन वॉलेट",
      featureWalletDesc: "वास्तविक बैंक कार्ड विवरण के साथ इंटरैक्टिव 3D कलेक्शन।",
      featurePrivacyTitle: "प्राइवेसी गेटवे",
      featurePrivacyDesc: "डिफ़ॉल्ट रूप से स्थानीय प्रोसेसिंग। शून्य अनधिकृत डेटा रिसाव।",
      footerBrand: "पैसे की समझ, अब बुद्धिमानी से।",
      footerRls: "256-बिट RLS सुरक्षा",
      footerPan: "शून्य PAN भंडारण",
      footerIndia: "भारत प्रथम",
    },

    dashboard: {
      title: "वित्तीय बुद्धिमत्ता सारांश",
      subtitle: "वित्तीय विश्लेषण और वास्तविक समय पोर्टफोलियो मेट्रिक्स",
      commandCenter: "कमांड सेंटर",
      registeredCards: "पंजीकृत कार्ड्स",
      activeInWallet: "वॉलेट में सक्रिय",
      viewFan: "फैन व्यू",
      totalSpend: "कुल ट्रैक किया गया खर्च",
      rewardsEarned: "अर्जित रिवॉर्ड्स",
      rewardsRealized: "प्राप्त रिवॉर्ड्स",
      potentialReward: "संभावित",
      efficiencyRate: "ऑप्टिमाइज़ेशन दक्षता",
      rewardEfficiency: "रिवॉर्ड दक्षता",
      optimalSpendRate: "इष्टतम खर्च दर",
      leakage: "चूका हुआ लाभ",
      financialHealth: "वित्तीय स्वास्थ्य",
      subscriptions: "सब्सक्रिप्शन्स",
      viewDetails: "विवरण",
      quickOptimizer: "त्वरित रिवॉर्ड कैलकुलेटर",
      decimalPrecision: "दशमलव सटीकता",
      amount: "खर्च राशि (₹)",
      category: "श्रेणी",
      merchant: "मर्चेंट (वैकल्पिक)",
      findBestCard: "सर्वश्रेष्ठ कार्ड खोजें",
      recommendBestCard: "सर्वोत्तम कार्ड देखें",
      optimalRecommendation: "सर्वोत्तम सुझाव",
      yield: "रिटर्न",
      expectedValue: "अनुमानित लाभ",
      inspectAlternatives: "अन्य विकल्प देखें",
      recentTransactions: "हाल के लेन-देन",
      recentActivity: "हाल की गतिविधि",
      viewAllTransactions: "सभी लेन-देन देखें",
      statusSettled: "स्थिति: संपन्न",
      noRecentActivity: "हाल ही में कोई लेन-देन दर्ज नहीं है।",
      recordFirstTransaction: "पहला लेन-देन दर्ज करें",
      portfolioOverview: "कार्ड पोर्टफोलियो",
      portfolioShowcase: "पोर्टफोलियो प्रदर्शन",
      manageAllCards: "सभी कार्ड्स प्रबंधित करें",
      noCardsInPortfolio: "पोर्टफोलियो में कोई कार्ड पंजीकृत नहीं है",
      seedDemoPortfolio: "डेमो पोर्टफोलियो लोड करें",
      addYourFirstCard: "अपना पहला कार्ड जोड़ें",
      financialIntelligenceTitle: "वित्तीय बुद्धिमत्ता",
      financialIntelligenceDesc: "आपके सत्यापित कार्ड्स पर आधारित स्थानीय-प्रथम सहायक।",
      askAssistant: "सहायक से पूछें",
      addCardCta: "कार्ड जोड़ें",
      sampleSuggestion1: "Swiggy पर कौन सा कार्ड सबसे ज्यादा कैशबैक देता है?",
      sampleSuggestion2: "मेरे कार्ड्स पर एयरपोर्ट लाउंज सुविधा दिखाएं",
    },

    cards: {
      title: "क्रेडिट कार्ड पोर्टफोलियो",
      subtitle: "अपने क्रेडिट कार्ड्स, सक्रिय रिवॉर्ड दरें और प्रमाणित लाभ प्रबंधित करें।",
      cardCollectionTitle: "कार्ड कलेक्शन",
      cardCollectionSubtitle: "इंटरैक्टिव मल्टी-कार्ड पोर्टफोलियो और विशेषाधिकार",
      cardsCountLabel: "कार्ड्स:",
      verifiedCountLabel: "सत्यापित:",
      viewFan: "फैन",
      viewGrid: "ग्रिड",
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
      searchPlaceholder: "नाम, बैंक या उपनाम से कार्ड्स खोजें...",
      allBanks: "सभी बैंक",
      allNetworks: "सभी नेटवर्क",
      noMatchingCards: "आपके फ़िल्टर के अनुसार कोई कार्ड नहीं मिला।",
      resetFilters: "फ़िल्टर रीसेट करें",
      editCardTitle: "कार्ड विवरण संपादित करें",
      deleteCardConfirm: "क्या आप वाकई इस क्रेडिट कार्ड को निष्क्रिय करना चाहते हैं? पुराने लेन-देन सुरक्षित रहेंगे।",
      deleteCardSuccess: "कार्ड सफलतापूर्वक निष्क्रिय कर दिया गया।",
      deleteCardFailed: "कार्ड हटाने में विफलता",
      lastFourValidation: "अंतिम 4 अंक केवल 4 संख्यात्मक अंक होने चाहिए।",
      savingCard: "सुरक्षित हो रहा है...",
      saveChanges: "सुरक्षित करें",
      cancel: "रद्द करें",
    },

    cardDetails: {
      selectCardPrompt: "एक कार्ड चुनें",
      selectCardHelper: "रिवॉर्ड दरें, शुल्क माफी और सत्यापित लाभ देखने के लिए किसी भी कार्ड पर टैप करें।",
      activePortfolioBadge: "सक्रिय कार्ड पोर्टफोलियो",
      cardNetwork: "कार्ड नेटवर्क",
      billingCycle: "बिलिंग चक्र",
      dayOfMonth: "तारीख प्रति माह",
      annualFeeLabel: "वार्षिक शुल्क",
      feeWaiverLabel: "शुल्क माफी",
      spendPrefix: "वार्षिक खर्च",
      waiverAchieved: "स्वचालित वार्षिक शुल्क माफी के लिए पात्र",
      multipliersRulesTitle: "रिवॉर्ड नियम और मल्टीप्लायर्स",
      perksBenefitsTitle: "सत्यापित सुविधाएं और लाभ",
      editCard: "कार्ड विवरण संपादित करें",
      deleteCard: "कार्ड हटाएं",
      deleting: "निष्क्रिय किया जा रहा है...",
      noRulesAvailable: "कोई विशेष श्रेणी रिवॉर्ड नियम कॉन्फ़िगर नहीं है।",
      noBenefitsAvailable: "कोई मानार्थ सुविधा पंजीकृत नहीं है।",
      rulePerkExclusion: "छूट नियम",
      monthlyCapPrefix: "अधिकतम सीमा: ₹",
    },

    cardSelection: {
      title: "क्रेडिट कार्ड चुनें और कस्टमाइज़ करें",
      subtitle: "वास्तविक शुल्क और रिवॉर्ड नियमों के साथ 10 सत्यापित भारतीय बैंक कैटलॉग में से चुनें, या कस्टम कार्ड दर्ज करें।",
      zeroStorageBadge: "शून्य PAN / CVV भंडारण",
      step1Title: "1. कार्ड जारीकर्ता बैंक चुनें",
      issuersCount: "10 बैंक उपलब्ध",
      step2Title: "2. कार्ड का प्रकार चुनें",
      verifiedCardsCount: "सत्यापित कार्ड्स",
      step3Title: "3. कार्ड विवरण और पंजीकरण",
      cardholderNameLabel: "कार्डधारक का नाम",
      nicknameLabel: "कार्ड का उपनाम (वैकल्पिक)",
      lastFourLabel: "अंतिम 4 अंक (वैकल्पिक)",
      networkLabel: "कार्ड नेटवर्क",
      billingDayLabel: "बिलिंग चक्र दिवस",
      feeStructureTitle: "शुल्क संरचना और छूट",
      joiningFeeLabel: "ज्वाइनिंग शुल्क (₹)",
      annualFeeLabel: "वार्षिक शुल्क (₹)",
      waiverSpendLabel: "माफी के लिए आवश्यक खर्च (₹)",
      waiverDetailsLabel: "शुल्क माफी की शर्तें",
      termsUrlLabel: "नियम और शर्तें स्रोत URL",
      rulesAccordionTitle: "सत्यापित रिवॉर्ड दरें और नियम",
      benefitsAccordionTitle: "सत्यापित सुविधाएं और लाउंज लाभ",
      addRuleButton: "कस्टम रिवॉर्ड नियम जोड़ें",
      addBenefitButton: "कस्टम लाभ जोड़ें",
      submitAddCard: "पोर्टफोलियो में कार्ड जोड़ें",
      registering: "कार्ड पंजीकृत हो रहा है...",
      cardAddedSuccess: "कार्ड सफलतापूर्वक पंजीकृत हो गया!",
      selectIssuerFirst: "कृपया ऊपर दिए गए जारीकर्ता बैंक का चयन करें।",
      customCardNotice: "कस्टम कार्ड विवरण मैन्युअल रूप से सेट किए जा सकते हैं।",
    },

    compare: {
      title: "कार्ड तुलना",
      subtitle: "आमने-सामने रिवॉर्ड मल्टीप्लायर और वार्षिक शुल्क वसूली विश्लेषण",
      selectionPrompt: "2 से 5 कार्ड चुनें",
      runComparison: "तुलना करें",
      comparing: "तुलना जारी है...",
      annualFeeRow: "वार्षिक शुल्क",
      renewalWaiverRow: "शुल्क माफी खर्च सीमा",
      topMultipliersRow: "प्रमुख श्रेणी रिवॉर्ड दरें",
      keyPerksRow: "मुख्य सुविधाएं और लाउंज",
      netBenefitProjection: "शुद्ध वार्षिक लाभ अनुमान",
      bestForSummary: "उपयुक्त खर्च प्रोफ़ाइल",
      noCardsToCompare: "तुलना करने के लिए कृपया कम से कम 2 कार्ड चुनें।",
    },

    offers: {
      title: "क्रेडिट कार्ड ऑफ़र्स और डील्स",
      subtitle: "अपने पंजीकृत कार्ड्स पर उपलब्ध तत्काल छूट और ऑफ़र्स खोजें।",
      reviewDeskCta: "समीक्षा डेस्क",
      optimizeSpendCta: "खर्च ऑप्टिमाइज़ करें",
      searchPlaceholder: "मर्चेंट, कूपन या ऑफ़र खोजें...",
      allCategories: "सभी श्रेणियां",
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
      noOffersFound: "आपकी खोज के अनुसार कोई ऑफ़र उपलब्ध नहीं है।",
      clearFilters: "फ़िल्टर हटाएं",
    },

    optimizer: {
      title: "सटीक रिवॉर्ड ऑप्टिमाइज़र",
      subtitle: "गणितीय सटीकता के साथ हर लेन-देन के लिए सबसे अधिक लाभ देने वाला कार्ड बताता है।",
      intelligenceTitle: "खरीदारी बुद्धिमत्ता",
      intelligenceSubtitle: "वास्तविक समय रिवॉर्ड अधिकतमकरण और त्वरित कूपन पहचान",
      amountLabel: "लेन-देन राशि (₹)",
      categoryLabel: "खर्च की श्रेणी",
      merchantLabel: "मर्चेंट का नाम (जैसे Swiggy, Amazon)",
      channelLabel: "भुगतान माध्यम",
      onlineChannel: "ऑनलाइन",
      offlineChannel: "इन-स्टोर (दुकान पर)",
      calculate: "सर्वोत्तम कार्ड देखें",
      calculating: "गणना जारी है...",
      recommended: "सुझाया गया कार्ड",
      topRecommendation: "सर्वश्रेष्ठ सुझाव",
      expectedReward: "अनुमानित रिवॉर्ड राशि",
      effectiveRate: "प्रभावी रिटर्न दर",
      yieldLabel: "रिटर्न",
      instantDiscount: "तत्काल छूट",
      postRewardCashback: "पोस्ट-ट्रांजेक्शन कैशबैक",
      netBenefit: "कुल शुद्ध लाभ",
      breakdown: "गणना का पूर्ण विवरण",
      calculationStepsTitle: "गणना चरण",
      alternatives: "अन्य कार्ड्स की तुलना",
      ineligibleOffersTitle: "अपात्र ऑफ़र्स की जांच",
      delta: "लाभ का अंतर",
      stepNumber: "चरण",
      ruleApplied: "लागू नियम",
      ratePercentage: "दर",
      benefitValue: "गणना किया गया लाभ",
      stepReason: "तर्क / कारण",
      capStatus: "मासिक सीमा स्थिति",
      matchedCoupons: "लागू प्रोमोशनल ऑफ़र्स",
    },

    transactions: {
      title: "लेन-देन",
      subtitle: "पिछली खरीदारियां और रिवॉर्ड आवंटन दक्षता",
      addNewTransaction: "लेन-देन जोड़ें",
      addModalTitle: "नई खरीदारी दर्ज करें",
      merchantLabel: "मर्चेंट / स्टोर का नाम",
      amountLabel: "लेन-देन राशि (₹)",
      categoryLabel: "खर्च की श्रेणी",
      cardLabel: "इस्तेमाल किया गया कार्ड",
      recurringLabel: "मासिक आवर्ती सब्सक्रिप्शन",
      recordTransactionButton: "लेन-देन दर्ज करें",
      recording: "सुरक्षित हो रहा है...",
      tableDate: "तारीख",
      tableMerchant: "मर्चेंट",
      tableCategory: "श्रेणी",
      tableCard: "कार्ड",
      tableAmount: "राशि",
      tableReward: "रिवॉर्ड",
      tableActions: "कार्रवाई",
      noTransactionsFound: "कोई लेन-देन नहीं मिला।",
      recordFirstPrompt: "खर्च विश्लेषण देखने के लिए अपना पहला लेन-देन दर्ज करें।",
      deletePrompt: "क्या आप इस लेन-देन रिकॉर्ड को हटाना चाहते हैं?",
      deleteFailed: "लेन-देन हटाने में विफलता",
    },

    analytics: {
      title: "खर्च और रिवॉर्ड विश्लेषण",
      subtitle: "खर्च की श्रेणियों, मासिक गति और वास्तविक बचत का विस्तृत विवरण।",
      spendByCategory: "श्रेणी अनुसार खर्च",
      monthlyVelocity: "मासिक खर्च बनाम रिवॉर्ड्स",
      rewardsRealized: "प्राप्त रिवॉर्ड दर",
      leakage: "चूका हुआ संभावित लाभ",
      totalSpendingTracked: "कुल ट्रैक किया गया खर्च",
      acrossPurchases: "कुल खरीदारियों में",
      efficiencyRate: "ऑप्टिमाइज़ेशन दक्षता",
      avoidableLeakage: "चूका हुआ संभावित लाभ",
      computingAnalytics: "डेटा विश्लेषण जारी है...",
      categoryAllocation: "श्रेणीवार वितरण",
      monthlyVelocityChart: "मासिक खर्च और रिवॉर्ड गति",
    },

    health: {
      title: "वित्तीय स्वास्थ्य और सब्सक्रिप्शन ऑडिट",
      subtitle: "मासिक ऑटो-डेबिट, वार्षिक शुल्क वसूली और भविष्य के अनुमान का विश्लेषण।",
      score: "वित्तीय स्वास्थ्य स्कोर",
      healthIndex: "स्वास्थ्य सूचकांक",
      efficiencyRate: "दक्षता दर",
      subscriptions: "पहचाने गए आवर्ती सब्सक्रिप्शन",
      feeAudit: "वार्षिक शुल्क औचित्य जांच",
      recommendations: "कार्रवाई योग्य सुझाव",
      forecast: "30-दिनों का पूर्वानुमान",
      projectionsTitle: "30-दिनों का आगामी अनुमान",
      projectedSpend: "अनुमानित 30-दिवसीय खर्च",
      projectedRewards: "अनुमानित रिवॉर्ड्स",
      auditingMetrics: "वित्तीय मेट्रिक्स का ऑडिट जारी है...",
      justifiedCards: "शुल्क उचित",
      atRiskCards: "शुल्क जोखिम में",
      annualFee: "वार्षिक शुल्क",
      earnedRewards: "अर्जित रिवॉर्ड्स",
      netRoi: "वार्षिक शुल्क ROI",
      feeWaiverStatus: "शुल्क माफी प्रगति",
      actionableAdvice: "कार्रवाई योग्य सुझाव",
    },

    assistant: {
      title: "बहुभाषी एआई वित्तीय सहायक",
      subtitle: "आपके सत्यापित कार्ड्स पर आधारित भरोसेमंद और सटीक वित्तीय मार्गदर्शन।",
      placeholder: "अपने कार्ड, रिवॉर्ड्स या किसी खरीदारी के बारे में पूछें...",
      send: "पूछें",
      asking: "सत्यापित डेटा से उत्तर तैयार हो रहा है...",
      suggestions: [
        "Swiggy पर कौन सा कार्ड इस्तेमाल करूँ?",
        "क्या पेट्रोल पर कैशबैक मिलता है?",
        "एयरपोर्ट लाउंज के लिए कौन सा कार्ड सही है?",
        "Amazon शॉपिंग के लिए बेस्ट कार्ड कौन सा है?",
      ],
      groundedIn: "सत्यापित कार्ड पोर्टफोलियो पर आधारित",
      welcomeMessage: "नमस्ते! मैं आपका CLIQ वित्तीय सहायक हूँ। गोपनीयता नीति के तहत, आपका डेटा डिफ़ॉल्ट रूप से स्थानीय रूप से सुरक्षित रखा जाता है और क्लाउड पर नहीं भेजा जाता।",
      privacyGatewayTitle: "प्राइवेसी और डेटा सुरक्षा गेटवे",
      privacyGatewaySubtitle: "बाहरी एआई प्रोसेसिंग और डेटा न्यूनीकरण के लिए विस्तृत नियंत्रण",
      externalAiToggleLabel: "बाहरी एआई (Google Gemini) सक्षम करें",
      allowCardContextLabel: "न्यूनतम कार्ड विवरण भेजने की अनुमति दें",
      allowSpendingContextLabel: "श्रेणीवार खर्च सारांश भेजने की अनुमति दें",
      saveConsentButton: "गोपनीयता प्राथमिकताएं सुरक्षित करें",
      activeProviderLabel: "सक्रिय प्रदाता",
      dataClassificationLabel: "डेटा वर्गीकरण",
      auditIdLabel: "ऑडिट अनुरोध आईडी",
      tokensRedactedLabel: "हटाए गए संवेदनशील टोकन",
      localProtectedStatus: "स्थानीय प्रोसेसिंग (पूर्ण सुरक्षा)",
    },

    documents: {
      title: "दस्तावेज़ बुद्धिमत्ता और सत्यापन",
      subtitle: "क्रेडिट कार्ड पीडीएफ स्टेटमेंट या नियम पुस्तिका अपलोड करें और समीक्षा के बाद सक्रिय करें।",
      dragDrop: "क्रेडिट कार्ड पीडीएफ यहाँ खींचें और छोड़ें (अधिकतम 10MB)",
      uploadButton: "पीडीएफ फ़ाइल चुनें",
      uploading: "नियम निकाले जा रहे हैं...",
      stagedRules: "निकाले गए नियम (समीक्षा लंबित)",
      verifyButton: "सत्यापित करें और सक्रिय करें",
      verifying: "सक्रिय किया जा रहा है...",
      verified: "कार्ड सत्यापित और सक्रिय",
      pdfOnlyError: "केवल पीडीएफ (.pdf) दस्तावेज़ समर्थित हैं।",
      fileSizeError: "फ़ाइल का आकार 10MB की सीमा से अधिक है।",
      uploadedDocumentsList: "अपलोड किए गए दस्तावेज़",
      extractedSpecTitle: "निकाले गए कार्ड विनिर्देश",
      processingDocument: "PyMuPDF के साथ दस्तावेज़ प्रोसेस हो रहा है...",
    },

    settings: {
      title: "सेटिंग्स और सुरक्षा",
      subtitle: "क्रिप्टोग्राफिक सुरक्षा, अनुकूलन पैरामीटर और डेटा संप्रभुता",
      preferencesSavedMsg: "अनुकूलन प्राथमिकताएं सुरक्षित की गईं।",
      securityArchitectureTitle: "सुरक्षा वास्तुकला और किरायेदार अलगाव",
      securityDesc: "CLIQ हर अनुरोध पर क्रिप्टोग्राफिक टोकन और सख्त स्वामित्व जांच लागू करता है।",
      rlsTitle: "PostgreSQL पंक्ति-स्तरीय सुरक्षा (RLS)",
      rlsDesc: "सभी डेटाबेस क्वेरी केवल प्रमाणित उपयोगकर्ता तक सीमित रहती हैं। क्रॉस-यूज़र डेटा देखना असंभव है।",
      tokenEncryptionTitle: "AES-256 / SHA-256 डेटा अखंडता",
      tokenEncryptionDesc: "टोकन HMAC-SHA256 से सुरक्षित हैं और वित्तीय आंकड़े उच्च परिशुद्धता दशमलव प्रारूप में रखे जाते हैं।",
      optimizationPreferencesTitle: "ऑप्टिमाइज़ेशन प्राथमिकताएं",
      prioritizeCashbackLabel: "रिवॉर्ड पॉइंट्स की तुलना में सीधे कैशबैक को प्राथमिकता दें",
      prioritizeCashbackDesc: "जब लाभ 0.25% के भीतर हो तो तत्काल स्टेटमेंट क्रेडिट को प्राथमिकता मिलती है।",
      includeFeeNetLabel: "शुद्ध रिटर्न गणना में वार्षिक शुल्क शामिल करें",
      includeFeeNetDesc: "वार्षिक शुल्क का आनुपातिक प्रभाव रिटर्न गणना से घटाता है।",
      savePreferencesButton: "प्राथमिकताएं सुरक्षित करें",
      dataSovereigntyTitle: "डेटा संप्रभुता और पोर्टेबिलिटी",
      exportArchiveButton: "एन्क्रिप्टेड डेटा डाउनलोड करें",
      deleteAccountButton: "खाता और डेटा पूरी तरह हटाएं",
      deleteAccountConfirm: "क्या आप वाकई अपना खाता हटाना चाहते हैं? सभी कार्ड और लेन-देन हमेशा के लिए मिटा दिए जाएंगे।",
    },

    profile: {
      title: "उपयोगकर्ता प्रोफ़ाइल",
      subtitle: "व्यक्तिगत विवरण, पसंदीदा भाषा और आधार मुद्रा",
      fullNameLabel: "पूरा नाम",
      emailLabel: "ईमेल पता",
      preferredLanguageLabel: "पसंदीदा भाषा",
      currencyLabel: "आधार मुद्रा",
      saveProfileButton: "प्रोफ़ाइल सुरक्षित करें",
      saving: "सुरक्षित हो रहा है...",
      savedSuccess: "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई।",
    },

    auth: {
      signInTitle: "CLIQ में लॉगिन करें",
      signInSubtitle: "वित्तीय बुद्धिमत्ता और पूर्ण डेटा सुरक्षा",
      createAccountTitle: "अपना CLIQ खाता बनाएं",
      createAccountSubtitle: "स्मार्ट कार्ड रिवॉर्ड्स। आपकी अपनी भाषा में।",
      emailLabel: "ईमेल पता",
      passwordLabel: "पासवर्ड",
      fullNameLabel: "पूरा नाम",
      preferredLanguageLabel: "पसंदीदा भाषा",
      signInButton: "लॉगिन करें",
      createAccountButton: "खाता बनाएं",
      signingIn: "प्रमाणीकरण जारी है...",
      creatingAccount: "खाता बनाया जा रहा है...",
      quickDemoCredentials: "डेमो क्रेडेंशियल्स भरें",
      noAccountPrompt: "खाता नहीं है?",
      haveAccountPrompt: "पहले से खाता है?",
      registeredSuccessBanner: "खाता सफलतापूर्वक बन गया! कृपया अपनी साख के साथ लॉगिन करें।",
    },

    onboarding: {
      stepLangTitle: "भाषा और क्षेत्र",
      stepPortfolioTitle: "पोर्टफोलियो",
      stepCompleteTitle: "पूर्ण",
      selectLanguageHeading: "अपनी भाषा चुनें",
      selectLanguageSub: "सभी सुझाव, सहायक और खर्च विश्लेषण आपकी भाषा में रूपांतरित होंगे।",
      continueButton: "पोर्टफोलियो पर जाएं",
      seedDemoButton: "डेमो पोर्टफोलियो जोड़ें",
      finishButton: "कमांड सेंटर शुरू करें",
      seedingText: "सत्यापित पोर्टफोलियो तैयार हो रहा है...",
      portfolioHeading: "क्रेडिट कार्ड पोर्टफोलियो",
      portfolioSub: "सत्यापित भारतीय कार्ड जोड़ें या डेमो डेटा के साथ शुरुआत करें।",
      readyHeading: "सब कुछ तैयार है!",
      readySub: "आपका खाता स्थानीय डेटा सुरक्षा और गणितीय इंजनों से सुरक्षित है।",
    },

    adminOffers: {
      title: "ऑफ़र समीक्षा और डेटा डेस्क",
      subtitle: "मानवीय समीक्षा, डेटा स्रोतों की निगरानी और बैंक परिपत्र प्रसंस्करण",
      tabReview: "समीक्षा कतार",
      tabSources: "स्रोत स्वास्थ्य",
      tabUpload: "सर्कुलर अपलोड",
      tabManual: "मैन्युअल प्रविष्टि",
      tabFailures: "त्रुटि लॉग",
      pendingFilter: "समीक्षा लंबित",
      approvedFilter: "स्वीकृत",
      rejectedFilter: "अस्वीकृत",
      syncButton: "सभी स्रोत सिंक करें",
      syncing: "सिंक हो रहा है...",
      approveCta: "ऑफ़र स्वीकृत करें",
      rejectCta: "ऑफ़र अस्वीकार करें",
      editCta: "संपादित करें",
      sourceHealthTitle: "ऑफ़र डेटा स्रोत",
      circularUploadTitle: "बैंक परिपत्र पीडीएफ अपलोड करें",
      manualCreateTitle: "मैन्युअल रूप से नया ऑफ़र बनाएं",
    },

    categories: {
      all: "सभी श्रेणियां",
      dining: "डाइनिंग और रेस्तरां",
      food_delivery: "फ़ूड डिलीवरी (Swiggy, Zomato)",
      shopping: "शॉपिंग और रीटेल",
      grocery: "किराना और ग्रोसरी",
      travel: "यात्रा और होटल",
      entertainment: "मनोरंजन और सिनेमा",
      utility: "बिजली-पानी बिल और उपयोगिताएं",
      fuel: "पेट्रोल और फ्यूल",
      international: "अंतर्राष्ट्रीय खर्च",
      other: "सामान्य खर्च",
    },

    channels: {
      online: "ऑनलाइन",
      offline: "इन-स्टोर (दुकान पर)",
      both: "सभी माध्यम",
    },

    common: {
      rupee: "₹",
      loading: "प्रक्रिया जारी है...",
      processing: "गणना जारी है...",
      save: "सुरक्षित करें",
      cancel: "रद्द करें",
      delete: "हटाएं",
      edit: "संपादित करें",
      success: "सफलतापूर्वक संपन्न",
      error: "कुछ त्रुटि हुई",
      verified: "सत्यापित",
      active: "सक्रिय",
      inactive: "निष्क्रिय",
      status: "स्थिति",
      actions: "कार्रवाई",
      samplePortfolio: "सैंपल पोर्टफोलियो",
      provisioningPortfolio: "पोर्टफोलियो तैयार हो रहा है...",
      samplePortfolioInitialized: "सैंपल पोर्टफोलियो लोड हो गया",
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
      profileSettings: "ಪ್ರೊಫೈಲ್ ಮತ್ತು ಸೆಟ್ಟಿಂಗ್ಸ್",
      adminDesk: "ಆಫರ್ ಪರಿಶೀಲನಾ ಡೆಸ್ಕ್",
      proMember: "ಪ್ರೊ ಸದಸ್ಯ",
      administrator: "ನಿರ್ವಾಹಕ",
    },

    sidebar: {
      workspace: "ಕಾರ್ಯಕ್ಷೇತ್ರ",
      administration: "ಆಡಳಿತ",
      staffBadge: "ಸಿಬ್ಬಂದಿ",
      offerReviewDesk: "ಆಫರ್ ಪರಿಶೀಲನಾ ಡೆಸ್ಕ್",
    },

    landing: {
      badge: "ಲಿಕ್ವಿಡ್ ಗ್ಲಾಸ್ ಫಿನ್‌ಟೆಕ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್",
      heroTitlePrefix: "ಹಣದ ನಿರ್ವಹಣೆ, ಈಗ ",
      heroTitleAccent: "ಬುದ್ಧಿವಂತಿಕೆಯಿಂದ.",
      heroSubtitle: "ನಿಮ್ಮ ಕಾರ್ಡ್‌ಗಳು. ನಿಮ್ಮ ರಿವಾರ್ಡ್‌ಗಳು. ನಿಮ್ಮ ಆರ್ಥಿಕ ಸ್ಪಷ್ಟತೆ.",
      exploreCta: "CLIQ ಅನ್ವೇಷಿಸಿ",
      signInCta: "ಸೈನ್ ಇನ್ ಮಾಡಿ",
      featureOptimizerTitle: "ಖರೀದಿ ಆಪ್ಟಿಮೈಜರ್",
      featureOptimizerDesc: "ವರ್ತಕರ ರಿವಾರ್ಡ್‌ಗಳು ಮತ್ತು ಶುಲ್ಕ ಮನ್ನಾಗಳಿಗೆ ನಿಖರ ಗಣಿತ ಲೆಕ್ಕಾಚಾರ.",
      featureWalletTitle: "ಫ್ಯಾನ್ ವಾಲೆಟ್",
      featureWalletDesc: "ನೈಜ ಬ್ಯಾಂಕ್ ಕಾರ್ಡ್ ವಿವರಗಳೊಂದಿಗೆ ಸಂವಾದಾತ್ಮಕ 3D ಸಂಗ್ರಹ.",
      featurePrivacyTitle: "ಗೌಪ್ಯತೆ ಗೇಟ್‌ವೇ",
      featurePrivacyDesc: "ಸ್ಥಳೀಯ ಸಂಸ್ಕರಣೆ ಪೂರ್ವನಿಯೋಜಿತ. ಅನಧಿಕೃತ ಡೇಟಾ ವರ್ಗಾವಣೆ ಶೂನ್ಯ.",
      footerBrand: "ಹಣದ ನಿರ್ವಹಣೆ, ಈಗ ಬುದ್ಧಿವಂತಿಕೆಯಿಂದ.",
      footerRls: "256-ಬಿಟ್ RLS ಭದ್ರತೆ",
      footerPan: "ಶೂನ್ಯ PAN ಸಂಗ್ರಹಣೆ",
      footerIndia: "ಭಾರತ ಮೊದಲು",
    },

    dashboard: {
      title: "ಆರ್ಥಿಕ ಮಾಹಿತಿ ಅವಲೋಕನ",
      subtitle: "ಆರ್ಥಿಕ ಮಾಹಿತಿ ಮತ್ತು ನೈಜ ಸಮಯದ ಪೋರ್ಟ್‌ಫೋಲಿಯೊ ವಿವರ",
      commandCenter: "ಕಮಾಂಡ್ ಸೆಂಟರ್",
      registeredCards: "ನೋಂದಾಯಿತ ಕಾರ್ಡ್‌ಗಳು",
      activeInWallet: "ವಾಲೆಟ್‌ನಲ್ಲಿ ಸಕ್ರಿಯ",
      viewFan: "ಫ್ಯಾನ್ ನೋಟ",
      totalSpend: "ಒಟ್ಟು ಟ್ರ್ಯಾಕ್ ಮಾಡಿದ ವೆಚ್ಚ",
      rewardsEarned: "ಗಳಿಸಿದ ರಿವಾರ್ಡ್‌ಗಳು",
      rewardsRealized: "ಪಡೆದ ರಿವಾರ್ಡ್‌ಗಳು",
      potentialReward: "ಸಂಭಾವ್ಯ",
      efficiencyRate: "ಉಳಿತಾಯ ದಕ್ಷತೆ",
      rewardEfficiency: "ರಿವಾರ್ಡ್ ದಕ್ಷತೆ",
      optimalSpendRate: "ಸೂಕ್ತ ವೆಚ್ಚ ದರ",
      leakage: "ತಪ್ಪಿಹೋದ ಲಾಭ",
      financialHealth: "ಆರ್ಥಿಕ ಆರೋಗ್ಯ",
      subscriptions: "ಚಂದಾದಾರಿಕೆಗಳು",
      viewDetails: "ವಿವರಗಳು",
      quickOptimizer: "ತ್ವರಿತ ರಿವಾರ್ಡ್ ಆಪ್ಟಿಮೈಜರ್",
      decimalPrecision: "ನಿಖರ ದಶಮಾಂಶ ಗಣಿತ",
      amount: "ಖರ್ಚಿನ ಮೊತ್ತ (₹)",
      category: "ವರ್ಗ",
      merchant: "ವರ್ತಕ (ಐಚ್ಛಿಕ)",
      findBestCard: "ಉತ್ತಮ ಕಾರ್ಡ್ ಹುಡುಕಿ",
      recommendBestCard: "ಉತ್ತಮ ಕಾರ್ಡ್ ಪರಿಶೀಲಿಸಿ",
      optimalRecommendation: "ಶಿಫಾರಸು ಮಾಡಿದ ಕಾರ್ಡ್",
      yield: "ಲಾಭ ದರ",
      expectedValue: "ನಿರೀಕ್ಷಿತ ಮೌಲ್ಯ",
      inspectAlternatives: "ಇತರ ಆಯ್ಕೆಗಳನ್ನು ನೋಡಿ",
      recentTransactions: "ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು",
      recentActivity: "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ",
      viewAllTransactions: "ಎಲ್ಲಾ ವಹಿವಾಟುಗಳನ್ನು ನೋಡಿ",
      statusSettled: "ಸ್ಥಿತಿ: ಪೂರ್ಣಗೊಂಡಿದೆ",
      noRecentActivity: "ಯಾವುದೇ ಇತ್ತೀಚಿನ ವಹಿವಾಟು ದಾಖಲಾಗಿಲ್ಲ.",
      recordFirstTransaction: "ಮೊದಲ ವಹಿವಾಟು ದಾಖಲಿಸಿ",
      portfolioOverview: "ಕಾರ್ಡ್ ಪೋರ್ಟ್‌ಫೋಲಿಯೊ",
      portfolioShowcase: "ಪೋರ್ಟ್‌ಫೋಲಿಯೊ ಪ್ರದರ್ಶನ",
      manageAllCards: "ಎಲ್ಲಾ ಕಾರ್ಡ್ ನಿರ್ವಹಿಸಿ",
      noCardsInPortfolio: "ಯಾವುದೇ ಕಾರ್ಡ್ ನೋಂದಾಯಿಸಲಾಗಿಲ್ಲ",
      seedDemoPortfolio: "ಮಾದರಿ ಕಾರ್ಡ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಿ",
      addYourFirstCard: "ನಿಮ್ಮ ಮೊದಲ ಕಾರ್ಡ್ ಸೇರಿಸಿ",
      financialIntelligenceTitle: "ಆರ್ಥಿಕ ಬುದ್ಧಿಮತ್ತೆ",
      financialIntelligenceDesc: "ನಿಮ್ಮ ಕಾರ್ಡ್ ವಿವರಗಳ ಆಧಾರದ ಮೇಲೆ ಸ್ಥಳೀಯ ಎಐ ಸಹಾಯಕ.",
      askAssistant: "ಸಹಾಯಕರನ್ನು ಕೇಳಿ",
      addCardCta: "ಕಾರ್ಡ್ ಸೇರಿಸಿ",
      sampleSuggestion1: "Swiggy ನಲ್ಲಿ ಯಾವ ಕಾರ್ಡ್ ಬಳಸಿದರೆ ಹೆಚ್ಚು ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್ ಸಿಗುತ್ತದೆ?",
      sampleSuggestion2: "ನನ್ನ ಕಾರ್ಡ್‌ಗಳ ಏರ್‌ಪೋರ್ಟ್ ಲೌಂಜ್ ಪ್ರವೇಶ ವಿವರಗಳನ್ನು ತೋರಿಸಿ",
    },

    cards: {
      title: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಪೋರ್ಟ್‌ಫೋಲಿಯೊ",
      subtitle: "ನಿಮ್ಮ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ಗಳು ಮತ್ತು ರಿವಾರ್ಡ್ ನಿಯಮಗಳನ್ನು ಸುಲಭವಾಗಿ ನಿರ್ವಹಿಸಿ.",
      cardCollectionTitle: "ಕಾರ್ಡ್ ಸಂಗ್ರಹ",
      cardCollectionSubtitle: "ಸಂವಾದಾತ್ಮಕ ಮಲ್ಟಿ-ಕಾರ್ಡ್ ಪೋರ್ಟ್‌ಫೋಲಿಯೊ ಮತ್ತು ಸವಲತ್ತುಗಳು",
      cardsCountLabel: "ಕಾರ್ಡ್‌ಗಳು:",
      verifiedCountLabel: "ದೃಢೀಕರಿಸಲಾಗಿದೆ:",
      viewFan: "ಫ್ಯಾನ್",
      viewGrid: "ಗ್ರಿಡ್",
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
      searchPlaceholder: "ಹೆಸರು, ಬ್ಯಾಂಕ್ ಅಥವಾ ಅಡ್ಡಹೆಸರಿನ ಮೂಲಕ ಕಾರ್ಡ್ ಹುಡುಕಿ...",
      allBanks: "ಎಲ್ಲಾ ಬ್ಯಾಂಕ್‌ಗಳು",
      allNetworks: "ಎಲ್ಲಾ ನೆಟ್‌ವರ್ಕ್‌ಗಳು",
      noMatchingCards: "ನಿಮ್ಮ ಶೋಧನೆಗೆ ಯಾವುದೇ ಕಾರ್ಡ್ ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತಿಲ್ಲ.",
      resetFilters: "ಫಿಲ್ಟರ್ ಮರುಹೊಂದಿಸಿ",
      editCardTitle: "ಕಾರ್ಡ್ ವಿವರಗಳನ್ನು ತಿದ್ದಿ",
      deleteCardConfirm: "ಈ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಅನ್ನು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ? ಹಿಂದಿನ ವಹಿವಾಟುಗಳು ಸುರಕ್ಷಿತವಾಗಿರುತ್ತವೆ.",
      deleteCardSuccess: "ಕಾರ್ಡ್ ಯಶಸ್ವಿಯಾಗಿ ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ.",
      deleteCardFailed: "ಕಾರ್ಡ್ ಅಳಿಸಲು ವಿಫಲವಾಗಿದೆ",
      lastFourValidation: "ಕೊನೆಯ 4 ಅಂಕಿಗಳು ಕೇವಲ 4 ಸಂಖ್ಯಾತ್ಮಕ ಅಕ್ಷರಗಳಾಗಿರಬೇಕು.",
      savingCard: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
      saveChanges: "ಉಳಿಸಿ",
      cancel: "ರದ್ದುಮಾಡಿ",
    },

    cardDetails: {
      selectCardPrompt: "ಒಂದು ಕಾರ್ಡ್ ಆಯ್ಕೆಮಾಡಿ",
      selectCardHelper: "ರಿವಾರ್ಡ್ ದರಗಳು, ಶುಲ್ಕ ಮನ್ನಾ ಮತ್ತು ಸವಲತ್ತುಗಳನ್ನು ನೋಡಲು ಸಂಗ್ರಹದಲ್ಲಿನ ಯಾವುದೇ ಕಾರ್ಡ್ ಸ್ಪರ್ಶಿಸಿ.",
      activePortfolioBadge: "ಸಕ್ರಿಯ ಕಾರ್ಡ್ ಪೋರ್ಟ್‌ಫೋಲಿಯೊ",
      cardNetwork: "ಕಾರ್ಡ್ ನೆಟ್‌ವರ್ಕ್",
      billingCycle: "ಬಿಲ್ಲಿಂಗ್ ದಿನ",
      dayOfMonth: "ಪ್ರತಿ ತಿಂಗಳ ದಿನಾಂಕ",
      annualFeeLabel: "ವಾರ್ಷಿಕ ಶುಲ್ಕ",
      feeWaiverLabel: "ಶುಲ್ಕ ಮನ್ನಾ",
      spendPrefix: "ವಾರ್ಷಿಕ ವೆಚ್ಚ",
      waiverAchieved: "ಸ್ವಯಂಚಾಲಿತ ಶುಲ್ಕ ಮನ್ನಾಗೆ ಅರ್ಹವಾಗಿದೆ",
      multipliersRulesTitle: "ರಿವಾರ್ಡ್ ನಿಯಮಗಳು ಮತ್ತು ಗುಣಕಗಳು",
      perksBenefitsTitle: "ದೃಢೀಕೃತ ಸವಲತ್ತುಗಳು ಮತ್ತು ಲೌಂಜ್",
      editCard: "ಕಾರ್ಡ್ ವಿವರ ತಿದ್ದಿ",
      deleteCard: "ಕಾರ್ಡ್ ಅಳಿಸಿ",
      deleting: "ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗುತ್ತಿದೆ...",
      noRulesAvailable: "ಯಾವುದೇ ವಿಶೇಷ ವರ್ಗ ನಿಯಮಗಳು ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ.",
      noBenefitsAvailable: "ಯಾವುದೇ ಪೂರಕ ಪ್ರಯೋಜನಗಳು ನೋಂದಾಯಿತವಾಗಿಲ್ಲ.",
      rulePerkExclusion: "ಹೊರಗಿಡುವಿಕೆ ನಿಯಮ",
      monthlyCapPrefix: "ಗರಿಷ್ಠ ಮಿತಿ: ₹",
    },

    cardSelection: {
      title: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಕಸ್ಟಮೈಸ್ ಮಾಡಿ",
      subtitle: "ನೈಜ ಶುಲ್ಕ ಮತ್ತು ರಿವಾರ್ಡ್ ನಿಯಮಗಳೊಂದಿಗೆ 10 ಭಾರತೀಯ ಬ್ಯಾಂಕ್ ಕ್ಯಾಟಲಾಗ್‌ಗಳಿಂದ ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಕಸ್ಟಮ್ ಕಾರ್ಡ್ ನಮೂದಿಸಿ.",
      zeroStorageBadge: "ಶೂನ್ಯ PAN / CVV ಸಂಗ್ರಹಣೆ",
      step1Title: "1. ಬ್ಯಾಂಕ್ ಆಯ್ಕೆಮಾಡಿ",
      issuersCount: "10 ಬ್ಯಾಂಕ್‌ಗಳು ಲಭ್ಯವಿದೆ",
      step2Title: "2. ಕಾರ್ಡ್ ಮಾದರಿ ಆಯ್ಕೆಮಾಡಿ",
      verifiedCardsCount: "ದೃಢೀಕರಿಸಿದ ಕಾರ್ಡ್‌ಗಳು",
      step3Title: "3. ಕಾರ್ಡ್ ಕಸ್ಟಮೈಸ್ ಮತ್ತು ನೋಂದಣಿ",
      cardholderNameLabel: "ಕಾರ್ಡ್‌ದಾರರ ಹೆಸರು",
      nicknameLabel: "ಕಾರ್ಡ್ ಅಡ್ಡಹೆಸರು (ಐಚ್ಛಿಕ)",
      lastFourLabel: "ಕೊನೆಯ 4 ಅಂಕಿಗಳು (ಐಚ್ಛಿಕ)",
      networkLabel: "ಕಾರ್ಡ್ ನೆಟ್‌ವರ್ಕ್",
      billingDayLabel: "ಬಿಲ್ಲಿಂಗ್ ದಿನ",
      feeStructureTitle: "ಶುಲ್ಕ ರಚನೆ ಮತ್ತು ಮನ್ನಾಗಳು",
      joiningFeeLabel: "ಪ್ರವೇಶ ಶುಲ್ಕ (₹)",
      annualFeeLabel: "ವಾರ್ಷಿಕ ಶುಲ್ಕ (₹)",
      waiverSpendLabel: "ಶುಲ್ಕ ಮನ್ನಾಗೆ ವೆಚ್ಚ ಮಿತಿ (₹)",
      waiverDetailsLabel: "ಶುಲ್ಕ ಮನ್ನಾ ನಿಯಮ ವಿವರಗಳು",
      termsUrlLabel: "ನಿಯಮಗಳ ಮೂಲ URL",
      rulesAccordionTitle: "ದೃಢೀಕೃತ ರಿವಾರ್ಡ್ ದರಗಳು ಮತ್ತು ನಿಯಮಗಳು",
      benefitsAccordionTitle: "ದೃಢೀಕೃತ ಸವಲತ್ತುಗಳು ಮತ್ತು ಲೌಂಜ್ ಪ್ರವೇಶ",
      addRuleButton: "ಕಸ್ಟಮ್ ರಿವಾರ್ಡ್ ನಿಯಮ ಸೇರಿಸಿ",
      addBenefitButton: "ಕಸ್ಟಮ್ ಸವಲತ್ತು ಸೇರಿಸಿ",
      submitAddCard: "ಪೋರ್ಟ್‌ಫೋಲಿಯೊಗೆ ಕಾರ್ಡ್ ಸೇರಿಸಿ",
      registering: "ಕಾರ್ಡ್ ನೋಂದಾಯಿಸಲಾಗುತ್ತಿದೆ...",
      cardAddedSuccess: "ಕಾರ್ಡ್ ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ!",
      selectIssuerFirst: "ದಯವಿಟ್ಟು ಮೇಲೆ ಬ್ಯಾಂಕ್ ಆಯ್ಕೆಮಾಡಿ.",
      customCardNotice: "ಕಸ್ಟಮ್ ಕಾರ್ಡ್ ವಿವರಗಳನ್ನು ಹಸ್ತಚಾಲಿತವಾಗಿ ಹೊಂದಿಸಬಹುದು.",
    },

    compare: {
      title: "ಕಾರ್ಡ್ ಹೋಲಿಕೆ",
      subtitle: "ಮುಖಾಮುಖಿ ರಿವಾರ್ಡ್ ಹೋಲಿಕೆ ಮತ್ತು ವಾರ್ಷಿಕ ಶುಲ್ಕ ಸಮರ್ಥನೆ ವಿಶ್ಲೇಷಣೆ",
      selectionPrompt: "2 ರಿಂದ 5 ಕಾರ್ಡ್‌ಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      runComparison: "ಹೋಲಿಕೆ ಮಾಡಿ",
      comparing: "ಹೋಲಿಸಲಾಗುತ್ತಿದೆ...",
      annualFeeRow: "ವಾರ್ಷಿಕ ಶುಲ್ಕ",
      renewalWaiverRow: "ಶುಲ್ಕ ಮನ್ನಾ ವೆಚ್ಚ ಮಿತಿ",
      topMultipliersRow: "ಪ್ರಮುಖ ವರ್ಗ ರಿವಾರ್ಡ್ ದರಗಳು",
      keyPerksRow: "ಮುಖ್ಯ ಸವಲತ್ತುಗಳು ಮತ್ತು ಲೌಂಜ್",
      netBenefitProjection: "ನಿವ್ವಳ ವಾರ್ಷಿಕ ಲಾಭ ಅಂದಾಜು",
      bestForSummary: "ಸೂಕ್ತ ವೆಚ್ಚ ಪ್ರೊಫೈಲ್",
      noCardsToCompare: "ಹೋಲಿಕೆ ಮಾಡಲು ದಯವಿಟ್ಟು ಕನಿಷ್ಠ 2 ಕಾರ್ಡ್‌ಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    },

    offers: {
      title: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಆಫರ್‌ಗಳು ಮತ್ತು ಡೀಲ್‌ಗಳು",
      subtitle: "ನಿಮ್ಮ ಕಾರ್ಡ್‌ಗಳಿಗೆ ಲಭ್ಯವಿರುವ ರಿಯಾಯಿತಿ ಮತ್ತು ಕೊಡುಗೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.",
      reviewDeskCta: "ಪರಿಶೀಲನಾ ಡೆಸ್ಕ್",
      optimizeSpendCta: "ಖರ್ಚು ಆಪ್ಟಿಮೈಜ್ ಮಾಡಿ",
      searchPlaceholder: "ವರ್ತಕ, ಕೂಪನ್ ಅಥವಾ ಆಫರ್ ಹುಡುಕಿ...",
      allCategories: "ಎಲ್ಲಾ ವರ್ಗಗಳು",
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
      noOffersFound: "ನಿಮ್ಮ ಶೋಧನೆಗೆ ಯಾವುದೇ ಆಫರ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
      clearFilters: "ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ",
    },

    optimizer: {
      title: "ಖಚಿತ ರಿವಾರ್ಡ್ ಆಪ್ಟಿಮೈಜರ್",
      subtitle: "ನಿಖರ ಗಣಿತ ಲೆಕ್ಕಾಚಾರದ ಮೂಲಕ ಗರಿಷ್ಠ ರಿವಾರ್ಡ್ ನೀಡುವ ಕಾರ್ಡ್ ತೋರಿಸುತ್ತದೆ.",
      intelligenceTitle: "ಖರೀದಿ ಬುದ್ಧಿಮತ್ತೆ",
      intelligenceSubtitle: "ನೈಜ ಸಮಯದಲ್ಲಿ ರಿವಾರ್ಡ್ ಗರಿಷ್ಠಗೊಳಿಸುವಿಕೆ ಮತ್ತು ಕೂಪನ್ ಪತ್ತೆ",
      amountLabel: "ವಹಿವಾಟಿನ ಮೊತ್ತ (₹)",
      categoryLabel: "ವೆಚ್ಚದ ವರ್ಗ",
      merchantLabel: "ವರ್ತಕನ ಹೆಸರು (ಉದಾ: Swiggy, Amazon)",
      channelLabel: "ಪಾವತಿ ಮಾಧ್ಯಮ",
      onlineChannel: "ಆನ್‌ಲೈನ್",
      offlineChannel: "ಮಳಿಗೆಯಲ್ಲಿ (ಆಫ್‌ಲೈನ್)",
      calculate: "ಅತ್ಯುತ್ತಮ ಕಾರ್ಡ್ ಪರಿಶೀಲಿಸಿ",
      calculating: "ಲೆಕ್ಕಾಚಾರ ಪ್ರಗತಿಯಲ್ಲಿದೆ...",
      recommended: "ಶಿಫಾರಸು ಮಾಡಿದ ಕಾರ್ಡ್",
      topRecommendation: "ಅತ್ಯುತ್ತಮ ಶಿಫಾರಸು",
      expectedReward: "ನಿರೀಕ್ಷಿತ ರಿವಾರ್ಡ್ ಮೊತ್ತ",
      effectiveRate: "ಪರಿಣಾಮಕಾರಿ ರಿವಾರ್ಡ್ ದರ",
      yieldLabel: "ಲಾಭ ದರ",
      instantDiscount: "ತ್ವರಿತ ರಿಯಾಯಿತಿ",
      postRewardCashback: "ವಹಿವಾಟಿನ ನಂತರದ ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್",
      netBenefit: "ಒಟ್ಟು ನಿವ್ವಳ ಆರ್ಥಿಕ ಲಾಭ",
      breakdown: "ಗಣಿತ ಲೆಕ್ಕಾಚಾರದ ವಿವರ",
      calculationStepsTitle: "ಲೆಕ್ಕಾಚಾರದ ಹಂತಗಳು",
      alternatives: "ಇತರ ಕಾರ್ಡ್‌ಗಳ ಹೋಲಿಕೆ",
      ineligibleOffersTitle: "ಅರ್ಹವಲ್ಲದ ಆಫರ್‌ಗಳ ಪರಿಶೀಲನೆ",
      delta: "ಲಾಭದ ವ್ಯತ್ಯಾಸ",
      stepNumber: "ಹಂತ",
      ruleApplied: "ಅನ್ವಯಿಸಿದ ನಿಯಮ",
      ratePercentage: "ದರ",
      benefitValue: "ಲೆಕ್ಕ ಹಾಕಿದ ಲಾಭ",
      stepReason: "ಕಾರಣ / ತರ್ಕ",
      capStatus: "ಮಾಸಿಕ ಮಿತಿ ಸ್ಥಿತಿ",
      matchedCoupons: "ಹೊಂದಾಣಿಕೆಯಾದ ಪ್ರಚಾರ ಕೊಡುಗೆಗಳು",
    },

    transactions: {
      title: "ವಹಿವಾಟುಗಳು",
      subtitle: "ಹಿಂದಿನ ಖರೀದಿಗಳು ಮತ್ತು ರಿವಾರ್ಡ್ ದಕ್ಷತೆ",
      addNewTransaction: "ವಹಿವಾಟು ಸೇರಿಸಿ",
      addModalTitle: "ಹೊಸ ಖರೀದಿ ದಾಖಲಿಸಿ",
      merchantLabel: "ವರ್ತಕ / ಮಳಿಗೆಯ ಹೆಸರು",
      amountLabel: "ವಹಿವಾಟಿನ ಮೊತ್ತ (₹)",
      categoryLabel: "ವೆಚ್ಚದ ವರ್ಗ",
      cardLabel: "ಬಳಸಿದ ಕಾರ್ಡ್",
      recurringLabel: "ಮರುಕಳಿಸುವ ಮಾಸಿಕ ಚಂದಾದಾರಿಕೆ",
      recordTransactionButton: "ವಹಿವಾಟು ದಾಖಲಿಸಿ",
      recording: "ದಾಖಲಿಸಲಾಗುತ್ತಿದೆ...",
      tableDate: "ದಿನಾಂಕ",
      tableMerchant: "ವರ್ತಕ",
      tableCategory: "ವರ್ಗ",
      tableCard: "ಕಾರ್ಡ್",
      tableAmount: "ಮೊತ್ತ",
      tableReward: "ರಿವಾರ್ಡ್",
      tableActions: "ಕ್ರಮಗಳು",
      noTransactionsFound: "ಯಾವುದೇ ವಹಿವಾಟುಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
      recordFirstPrompt: "ವೆಚ್ಚ ವಿಶ್ಲೇಷಣೆ ಪಡೆಯಲು ನಿಮ್ಮ ಮೊದಲ ವಹಿವಾಟನ್ನು ದಾಖಲಿಸಿ.",
      deletePrompt: "ಈ ವಹಿವಾಟು ದಾಖಲೆಯನ್ನು ಅಳಿಸಲು ನೀವು ಬಯಸುವಿರಾ?",
      deleteFailed: "ವಹಿವಾಟು ಅಳಿಸಲು ವಿಫಲವಾಗಿದೆ",
    },

    analytics: {
      title: "ವೆಚ್ಚ ಮತ್ತು ರಿವಾರ್ಡ್ ವಿಶ್ಲೇಷಣೆ",
      subtitle: "ವೆಚ್ಚದ ವರ್ಗಗಳು, ಮಾಸಿಕ ಗತಿ ಮತ್ತು ಗಳಿಸಿದ ರಿವಾರ್ಡ್‌ಗಳ ವಿವರವಾದ ಮಾಹಿತಿ.",
      spendByCategory: "ವರ್ಗವಾರು ವೆಚ್ಚ ಹಂಚಿಕೆ",
      monthlyVelocity: "ಮಾಸಿಕ ವೆಚ್ಚ ಮತ್ತು ರಿವಾರ್ಡ್",
      rewardsRealized: "ಗಳಿಸಿದ ರಿವಾರ್ಡ್ ದರ",
      leakage: "ತಪ್ಪಿಹೋದ ಸಂಭವನೀಯ ಲಾಭ",
      totalSpendingTracked: "ಒಟ್ಟು ಟ್ರ್ಯಾಕ್ ಮಾಡಿದ ವೆಚ್ಚ",
      acrossPurchases: "ಒಟ್ಟು ಖರೀದಿಗಳಲ್ಲಿ",
      efficiencyRate: "ಉಳಿತಾಯ ದಕ್ಷತೆ",
      avoidableLeakage: "ತಪ್ಪಿಹೋದ ಸಂಭವನೀಯ ಲಾಭ",
      computingAnalytics: "ವಿಶ್ಲೇಷಣೆ ಪ್ರಕ್ರಿಯೆ ನಡೆಯುತ್ತಿದೆ...",
      categoryAllocation: "ವರ್ಗವಾರು ಹಂಚಿಕೆ",
      monthlyVelocityChart: "ಮಾಸಿಕ ವೆಚ್ಚ ಮತ್ತು ರಿವಾರ್ಡ್ ವೇಗ",
    },

    health: {
      title: "ಆರ್ಥಿಕ ಆರೋಗ್ಯ ಮತ್ತು ಚಂದಾದಾರಿಕೆ ತಪಾಸಣೆ",
      subtitle: "ಮರುಕಳಿಸುವ ಚಂದಾದಾರಿಕೆಗಳು ಮತ್ತು ವಾರ್ಷಿಕ ಶುಲ್ಕದ ಸಮರ್ಥನೆ ಪರಿಶೀಲಿಸಿ.",
      score: "ಆರ್ಥಿಕ ಆರೋಗ್ಯ ಸ್ಕೋರ್",
      healthIndex: "ಆರೋಗ್ಯ ಸೂಚ್ಯಂಕ",
      efficiencyRate: "ದಕ್ಷತೆ ದರ",
      subscriptions: "ಗುರುತಿಸಲಾದ ಮರುಕಳಿಸುವ ವೆಚ್ಚಗಳು",
      feeAudit: "ವಾರ್ಷಿಕ ಶುಲ್ಕ ತಪಾಸಣೆ",
      recommendations: "ಉಪಯುಕ್ತ ಸಲಹೆಗಳು",
      forecast: "30-ದಿನಗಳ ಅಂದಾಜು",
      projectionsTitle: "ಮುಂದಿನ 30-ದಿನಗಳ ಅಂದಾಜು",
      projectedSpend: "ಅಂದಾಜು ವೆಚ್ಚ",
      projectedRewards: "ಅಂದಾಜು ರಿವಾರ್ಡ್‌ಗಳು",
      auditingMetrics: "ಆರ್ಥಿಕ ಮಾಹಿತಿ ತಪಾಸಣೆ ನಡೆಯುತ್ತಿದೆ...",
      justifiedCards: "ಶುಲ್ಕ ಸಮರ್ಥನೀಯ",
      atRiskCards: "ಶುಲ್ಕ ಅಪಾಯದಲ್ಲಿದೆ",
      annualFee: "ವಾರ್ಷಿಕ ಶುಲ್ಕ",
      earnedRewards: "ಗಳಿಸಿದ ರಿವಾರ್ಡ್‌ಗಳು",
      netRoi: "ವಾರ್ಷಿಕ ಶುಲ್ಕ ROI",
      feeWaiverStatus: "ಶುಲ್ಕ ಮನ್ನಾ ಪ್ರಗತಿ",
      actionableAdvice: "ಉಪಯುಕ್ತ ಆರ್ಥಿಕ ಸಲಹೆಗಳು",
    },

    assistant: {
      title: "ಬಹುಭಾಷಾ ಎಐ ಆರ್ಥಿಕ ಸಹಾಯಕ",
      subtitle: "ನಿಮ್ಮ ಕಾರ್ಡ್ ನಿಯಮಗಳನ್ನು ಆಧರಿಸಿದ ವಿಶ್ವಾಸಾರ್ಹ ಆರ್ಥಿಕ ಮಾರ್ಗದರ್ಶನ.",
      placeholder: "ನಿಮ್ಮ ಕಾರ್ಡ್ ಅಥವಾ ಖರೀದಿಯ ಬಗ್ಗೆ ಕೇಳಿ...",
      send: "ಕೇಳಿ",
      asking: "ದೃಢೀಕೃತ ಮಾಹಿತಿಯಿಂದ ಉತ್ತರಿಸಲಾಗುತ್ತಿದೆ...",
      suggestions: [
        "Swiggy ನಲ್ಲಿ ಯಾವ ಕಾರ್ಡ್ ಬಳಸಿದರೆ ಹೆಚ್ಚು ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್ ಸಿಗುತ್ತದೆ?",
        "ಇಂಧನ ಖರೀದಿಗೆ ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್ ಸಿಗುತ್ತದೆಯೇ?",
        "ವಿಮಾನ ನಿಲ್ದಾಣದ ಲೌಂಜ್‌ಗೆ ಯಾವ ಕಾರ್ಡ್ ಬಳಸಬಹುದು?",
        "Amazon ಶಾಪಿಂಗ್‌ಗೆ ಉತ್ತಮ ಕಾರ್ಡ್ ಯಾವುದು?",
      ],
      groundedIn: "ನೋಂದಾಯಿತ ಕಾರ್ಡ್ ಮಾಹಿತಿ ಆಧರಿತ",
      welcomeMessage: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ CLIQ ಆರ್ಥಿಕ ಸಹಾಯಕ. ಗೌಪ್ಯತೆ ನೀತಿಯಂತೆ, ನಿಮ್ಮ ಹಣಕಾಸಿನ ಮಾಹಿತಿಯನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಸುರಕ್ಷಿತವಾಗಿಡಲಾಗುತ್ತದೆ ಮತ್ತು ಕ್ಲೌಡ್‌ಗೆ ಕಳುಹಿಸುವುದಿಲ್ಲ.",
      privacyGatewayTitle: "ಗೌಪ್ಯತೆ ಮತ್ತು ಡೇಟಾ ಸಂರಕ್ಷಣಾ ಗೇಟ್‌ವೇ",
      privacyGatewaySubtitle: "ಬಾಹ್ಯ ಎಐ ಸಂಸ್ಕರಣೆ ಮತ್ತು ಡೇಟಾ ಕನಿಷ್ಠೀಕರಣದ ನಿಯಂತ್ರಣಗಳು",
      externalAiToggleLabel: "ಬಾಹ್ಯ ಎಐ (Google Gemini) ಸಕ್ರಿಯಗೊಳಿಸಿ",
      allowCardContextLabel: "ಕನಿಷ್ಠ ಕಾರ್ಡ್ ವಿವರ ಹಂಚಿಕೆಗೆ ಅನುಮತಿಸಿ",
      allowSpendingContextLabel: "ವರ್ಗವಾರು ವೆಚ್ಚ ಸಾರಾಂಶ ಹಂಚಿಕೆಗೆ ಅನುಮತಿಸಿ",
      saveConsentButton: "ಗೌಪ್ಯತೆ ಆದ್ಯತೆಗಳನ್ನು ಉಳಿಸಿ",
      activeProviderLabel: "ಸಕ್ರಿಯ ಪೂರೈಕೆದಾರ",
      dataClassificationLabel: "ಡೇಟಾ ವರ್ಗೀಕರಣ",
      auditIdLabel: "ಆಡಿಟ್ ವಿನಂತಿ ID",
      tokensRedactedLabel: "ತೆಗೆದುಹಾಕಲಾದ ಸೂಕ್ಷ್ಮ ಟೋಕನ್‌ಗಳು",
      localProtectedStatus: "ಸ್ಥಳೀಯ ಸಂಸ್ಕರಣೆ (ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತ)",
    },

    documents: {
      title: "ದಾಖಲೆ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ಪರಿಶೀಲನೆ",
      subtitle: "ಕಾರ್ಡ್ ಪಿಡಿಎಫ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್‌ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ಪರಿಶೀಲಿಸಿ ಸಕ್ರಿಯಗೊಳಿಸಿ.",
      dragDrop: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಪಿಡಿಎಫ್ ಅನ್ನು ಇಲ್ಲಿ ಎಳೆಯಿರಿ (ಗರಿಷ್ಠ 10MB)",
      uploadButton: "ಪಿಡಿಎಫ್ ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ",
      uploading: "ನಿಯಮಗಳನ್ನು ಹೊರತೆಗೆಯಲಾಗುತ್ತಿದೆ...",
      stagedRules: "ಹೊರತೆಗೆದ ನಿಯಮಗಳು (ಪರಿಶೀಲನೆ ಬಾಕಿ)",
      verifyButton: "ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸಕ್ರಿಯಗೊಳಿಸಿ",
      verifying: "ಸಕ್ರಿಯಗೊಳಿಸಲಾಗುತ್ತಿದೆ...",
      verified: "ಕಾರ್ಡ್ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ",
      pdfOnlyError: "ಕೇವಲ ಪಿಡಿಎಫ್ (.pdf) ದಾಖಲೆಗಳು ಮಾತ್ರ ಬೆಂಬಲಿತವಾಗಿವೆ.",
      fileSizeError: "ಫೈಲ್ ಗಾತ್ರವು 10MB ಮಿತಿಯನ್ನು ಮೀರಿದೆ.",
      uploadedDocumentsList: "ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ದಾಖಲೆಗಳು",
      extractedSpecTitle: "ಹೊರತೆಗೆದ ಕಾರ್ಡ್ ವಿವರಗಳು",
      processingDocument: "PyMuPDF ಮೂಲಕ ದಾಖಲೆ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...",
    },

    settings: {
      title: "ಸೆಟ್ಟಿಂಗ್ಸ್ ಮತ್ತು ಭದ್ರತೆ",
      subtitle: "ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ರಕ್ಷಣೆಗಳು, ಆಪ್ಟಿಮೈಸೇಶನ್ ನಿಯತಾಂಕಗಳು ಮತ್ತು ಡೇಟಾ ಸಾರ್ವಭೌಮತ್ವ",
      preferencesSavedMsg: "ಆಪ್ಟಿಮೈಸೇಶನ್ ಆದ್ಯತೆಗಳನ್ನು ಉಳಿಸಲಾಗಿದೆ.",
      securityArchitectureTitle: "ಭದ್ರತಾ ವಾಸ್ತುಶಿಲ್ಪ ಮತ್ತು ಬಳಕೆದಾರ ಪ್ರತ್ಯೇಕತೆ",
      securityDesc: "CLIQ ಪ್ರತಿಯೊಂದು ವಿನಂತಿಯಲ್ಲೂ ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ಟೋಕನ್‌ಗಳು ಮತ್ತು ಕಟ್ಟುನಿಟ್ಟಾದ ಮಾಲೀಕತ್ವ ಪರಿಶೀಲನೆಗಳನ್ನು ಜಾರಿಗೊಳಿಸುತ್ತದೆ.",
      rlsTitle: "PostgreSQL ಸಾಲು ಮಟ್ಟದ ಭದ್ರತೆ (RLS)",
      rlsDesc: "ಎಲ್ಲಾ ಡೇಟಾಬೇಸ್ ಪ್ರಶ್ನೆಗಳು ಕೇವಲ ದೃಢೀಕರಿಸಿದ ಬಳಕೆದಾರರಿಗೆ ಮಾತ್ರ ಸೀಮಿತವಾಗಿರುತ್ತವೆ.",
      tokenEncryptionTitle: "AES-256 / SHA-256 ಡೇಟಾ ಸಮಗ್ರತೆ",
      tokenEncryptionDesc: "ಟೋಕನ್‌ಗಳನ್ನು HMAC-SHA256 ನೊಂದಿಗೆ ಸುರಕ್ಷಿತಗೊಳಿಸಲಾಗಿದೆ ಮತ್ತು ಆರ್ಥಿಕ ಮೊತ್ತಗಳನ್ನು ನಿಖರ ದಶಮಾಂಶ ರೂಪದಲ್ಲಿ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ.",
      optimizationPreferencesTitle: "ಆಪ್ಟಿಮೈಸೇಶನ್ ಆದ್ಯತೆಗಳು",
      prioritizeCashbackLabel: "ಪಾಯಿಂಟ್‌ಗಳಿಗಿಂತ ನೇರ ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್‌ಗೆ ಆದ್ಯತೆ ನೀಡಿ",
      prioritizeCashbackDesc: "ಲಾಭವು 0.25% ನಷ್ಟಿದ್ದರೆ ತ್ವರಿತ ಸ್ಟೇಟ್‌ಮೆಂಟ್ ಕ್ರೆಡಿಟ್‌ಗೆ ಆದ್ಯತೆ ನೀಡಲಾಗುತ್ತದೆ.",
      includeFeeNetLabel: "ನಿವ್ವಳ ಲಾಭದ ಲೆಕ್ಕಾಚಾರದಲ್ಲಿ ವಾರ್ಷಿಕ ಶುಲ್ಕವನ್ನು ಕಳೆಯಿರಿ",
      includeFeeNetDesc: "ನಿವ್ವಳ ಉಳಿತಾಯದಿಂದ ವಾರ್ಷಿಕ ಶುಲ್ಕದ ಹೊರೆಯನ್ನು ಕಳೆಯುತ್ತದೆ.",
      savePreferencesButton: "ಆದ್ಯತೆಗಳನ್ನು ಉಳಿಸಿ",
      dataSovereigntyTitle: "ಡೇಟಾ ಸಾರ್ವಭೌಮತ್ವ ಮತ್ತು ವರ್ಗಾವಣೆ",
      exportArchiveButton: "ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಿದ ಡೇಟಾ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
      deleteAccountButton: "ಖಾತೆ ಮತ್ತು ಡೇಟಾವನ್ನು ಅಳಿಸಿ",
      deleteAccountConfirm: "ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ? ಎಲ್ಲಾ ಕಾರ್ಡ್ ಮತ್ತು ವಹಿವಾಟು ದಾಖಲೆಗಳು ಅಳಿಸಲ್ಪಡುತ್ತವೆ.",
    },

    profile: {
      title: "ಬಳಕೆದಾರ ವಿವರ",
      subtitle: "ವೈಯಕ್ತಿಕ ವಿವರಗಳು, ಭಾಷಾ ಆದ್ಯತೆ ಮತ್ತು ಮೂಲ ಕರೆನ್ಸಿ",
      fullNameLabel: "ಪೂರ್ಣ ಹೆಸರು",
      emailLabel: "ಇಮೇಲ್ ವಿಳಾಸ",
      preferredLanguageLabel: "ಆದ್ಯತೆಯ ಭಾಷೆ",
      currencyLabel: "ಮೂಲ ಕರೆನ್ಸಿ",
      saveProfileButton: "ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ",
      saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
      savedSuccess: "ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.",
    },

    auth: {
      signInTitle: "CLIQ ಗೆ ಲಾಗಿನ್ ಮಾಡಿ",
      signInSubtitle: "ಆರ್ಥಿಕ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ಸಂಪೂರ್ಣ ಡೇಟಾ ರಕ್ಷಣೆ",
      createAccountTitle: "ನಿಮ್ಮ CLIQ ಖಾತೆ ತೆರೆಯಿರಿ",
      createAccountSubtitle: "ಸ್ಮಾರ್ಟ್ ಕಾರ್ಡ್ ರಿವಾರ್ಡ್‌ಗಳು. ನಿಮ್ಮದೇ ಭಾಷೆಯಲ್ಲಿ.",
      emailLabel: "ಇಮೇಲ್ ವಿಳಾಸ",
      passwordLabel: "ಪಾಸ್‌ವರ್ಡ್",
      fullNameLabel: "ಪೂರ್ಣ ಹೆಸರು",
      preferredLanguageLabel: "ಆದ್ಯತೆಯ ಭಾಷೆ",
      signInButton: "ಲಾಗಿನ್",
      createAccountButton: "ಖಾತೆ ತೆರೆಯಿರಿ",
      signingIn: "ದೃಢೀಕರಣ ಪ್ರಕ್ರಿಯೆ...",
      creatingAccount: "ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...",
      quickDemoCredentials: "ಡೆಮೊ ಮಾಹಿತಿಯನ್ನು ತುಂಬಿ",
      noAccountPrompt: "ಖಾತೆ ಇಲ್ಲವೇ?",
      haveAccountPrompt: "ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?",
      registeredSuccessBanner: "ಖಾತೆ ಯಶಸ್ವಿಯಾಗಿ ಸೃಷ್ಟಿಯಾಗಿದೆ! ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ.",
    },

    onboarding: {
      stepLangTitle: "ಭಾಷೆ ಮತ್ತು ಪ್ರದೇಶ",
      stepPortfolioTitle: "ಪೋರ್ಟ್‌ಫೋಲಿಯೊ",
      stepCompleteTitle: "ಪೂರ್ಣ",
      selectLanguageHeading: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      selectLanguageSub: "ಎಲ್ಲಾ ಶಿಫಾರಸುಗಳು, ಸಹಾಯಕರು ಮತ್ತು ವಿಶ್ಲೇಷಣೆಗಳು ನಿಮ್ಮ ಭಾಷೆಗೆ ಹೊಂದಿಕೊಳ್ಳುತ್ತವೆ.",
      continueButton: "ಪೋರ್ಟ್‌ಫೋಲಿಯೊಗೆ ಮುಂದುವರಿಯಿರಿ",
      seedDemoButton: "ಮಾದರಿ ಕಾರ್ಡ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಿ",
      finishButton: "ಕಮಾಂಡ್ ಸೆಂಟರ್‌ಗೆ ಹೋಗಿ",
      seedingText: "ಪೋರ್ಟ್‌ಫೋಲಿಯೊ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
      portfolioHeading: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಪೋರ್ಟ್‌ಫೋಲಿಯೊ",
      portfolioSub: "ದೃಢೀಕರಿಸಿದ ಭಾರತೀಯ ಕಾರ್ಡ್‌ಗಳನ್ನು ಸೇರಿಸಿ ಅಥವಾ ಮಾದರಿ ಡೇಟಾದೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸಿ.",
      readyHeading: "ಎಲ್ಲವೂ ಸಿದ್ಧವಾಗಿದೆ!",
      readySub: "ನಿಮ್ಮ ಖಾತೆಯು ಸ್ಥಳೀಯ ಭದ್ರತೆ ಮತ್ತು ನಿಖರ ಗಣಿತ ಎಂಜಿನ್‌ಗಳಿಂದ ಸುರಕ್ಷಿತವಾಗಿದೆ.",
    },

    adminOffers: {
      title: "ಆಫರ್ ಪರಿಶೀಲನಾ ಡೆಸ್ಕ್",
      subtitle: "ಹಸ್ತಚಾಲಿತ ಪರಿಶೀಲನೆ, ಮೂಲಗಳ ಆರೋಗ್ಯ ಮೇಲ್ವಿಚಾರಣೆ ಮತ್ತು ಬ್ಯಾಂಕ್ ಸುತ್ತೋಲೆ ಪ್ರಕ್ರಿಯೆ",
      tabReview: "ಪರಿಶೀಲನಾ ಸರತಿ",
      tabSources: "ಮೂಲಗಳ ಸ್ಥಿತಿ",
      tabUpload: "ಸುತ್ತೋಲೆ ಅಪ್‌ಲೋಡ್",
      tabManual: "ಹೊಸ ಆಫರ್ ರಚನೆ",
      tabFailures: "ದೋಷ ಲಾಗ್‌ಗಳು",
      pendingFilter: "ಪರಿಶೀಲನೆ ಬಾಕಿ",
      approvedFilter: "ಅನುಮೋದಿಸಲಾಗಿದೆ",
      rejectedFilter: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
      syncButton: "ಎಲ್ಲಾ ಮೂಲಗಳನ್ನು ಸಿಂಕ್ ಮಾಡಿ",
      syncing: "ಸಿಂಕ್ ಆಗುತ್ತಿದೆ...",
      approveCta: "ಆಫರ್ ಅನುಮೋದಿಸಿ",
      rejectCta: "ಆಫರ್ ತಿರಸ್ಕರಿಸಿ",
      editCta: "ವಿವರ ತಿದ್ದಿ",
      sourceHealthTitle: "ಆಫರ್ ಮೂಲಗಳು",
      circularUploadTitle: "ಬ್ಯಾಂಕ್ ಪಿಡಿಎಫ್ ಸುತ್ತೋಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
      manualCreateTitle: "ಹೊಸ ಆಫರ್ ಅನ್ನು ಹಸ್ತಚಾಲಿತವಾಗಿ ಸೇರಿಸಿ",
    },

    categories: {
      all: "ಎಲ್ಲಾ ವರ್ಗಗಳು",
      dining: "ಊಟ ಮತ್ತು ರೆಸ್ಟೋರೆಂಟ್‌ಗಳು",
      food_delivery: "ಆಹಾರ ವಿತರಣೆ (Swiggy, Zomato)",
      shopping: "ಶಾಪಿಂಗ್ ಮತ್ತು ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರ",
      grocery: "ದಿನಸಿ ಮತ್ತು ಮಾರ್ಟ್",
      travel: "ಪ್ರಯಾಣ ಮತ್ತು ಹೋಟೆಲ್‌ಗಳು",
      entertainment: "ಮನರಂಜನೆ ಮತ್ತು ಸಿನೆಮಾ",
      utility: "ಬಿಲ್ ಮತ್ತು ಉಪಯುಕ್ತತೆಗಳು",
      fuel: "ಇಂಧನ ಮತ್ತು ಪೆಟ್ರೋಲ್",
      international: "ಅಂತಾರಾಷ್ಟ್ರೀಯ ವೆಚ್ಚಗಳು",
      other: "ಸಾಮಾನ್ಯ ಖರ್ಚುಗಳು",
    },

    channels: {
      online: "ಆನ್‌ಲೈನ್",
      offline: "ಮಳಿಗೆಯಲ್ಲಿ (ಆಫ್‌ಲೈನ್)",
      both: "ಎಲ್ಲಾ ಮಾಧ್ಯಮಗಳು",
    },

    common: {
      rupee: "₹",
      loading: "ಪ್ರಕ್ರಿಯೆ ಪ್ರಗತಿಯಲ್ಲಿದೆ...",
      processing: "ಲೆಕ್ಕಾಚಾರ ನಡೆಯುತ್ತಿದೆ...",
      save: "ಉಳಿಸಿ",
      cancel: "ರದ್ದುಮಾಡಿ",
      delete: "ಅಳಿಸಿ",
      edit: "ತಿದ್ದುಪಡಿ",
      success: "ಯಶಸ್ವಿಯಾಗಿದೆ",
      error: "ದೋಷ ಸಂಭವಿಸಿದೆ",
      verified: "ದೃಢೀಕರಿಸಲಾಗಿದೆ",
      active: "ಸಕ್ರಿಯ",
      inactive: "ನಿಷ್ಕ್ರಿಯ",
      status: "ಸ್ಥಿತಿ",
      actions: "ಕ್ರಮಗಳು",
      samplePortfolio: "ಮಾದರಿ ಪೋರ್ಟ್‌ಫೋಲಿಯೊ",
      provisioningPortfolio: "ಪೋರ್ಟ್‌ಫೋಲಿಯೊ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
      samplePortfolioInitialized: "ಮಾದರಿ ಪೋರ್ಟ್‌ಫೋಲಿಯೊ ಲೋಡ್ ಆಗಿದೆ",
    },
  },
};
