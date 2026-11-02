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
    learn: string;
    budget: string;
    pathwayLabel: string;
    modeLabel: string;
    modeCashSavings: string;
    modeCreditCards: string;
    switchToCardMode: string;
    switchToCashMode: string;
    switchToCardsShort: string;
    switchToCashShort: string;
    switching: string;
    myIncome: string;
    expenseLog: string;
    budgetPlanner: string;
    savingsGoals: string;
    emergencyFund: string;
    subscriptions: string;
    financialHealth: string;
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

  // Homepage (components/homepage/*)
  home: {
    hero: {
      badge: string;
      line1: string;
      line2: string;
      line3Lead: string;
      line3Tail: string;
      subtitle: string;
      ctaStart: string;
      ctaSignIn: string;
      cardSavings: string;
      cardRewards: string;
      cardPremium: string;
      chipsAccent: string;
      chipsRest: string;
      chipsLine2: string;
      chips: string[];
    };
    journeys: {
      eyebrow: string;
      titleLine1: string;
      titleAccent: string;
      subtitle: string;
      ccLabel: string;
      ccHeadline: string;
      ccDescription: string;
      ccFeatures: string[];
      noCardLabel: string;
      noCardHeadline: string;
      noCardDescription: string;
      noCardFeatures: string[];
      overview: string;
      income: string;
      expenses: string;
      savings: string;
      goals: string;
      emergencyFund: string;
      education: string;
    };
    universe: {
      eyebrow: string;
      titleLead: string;
      titleAccent: string;
      titleLine2: string;
      subtitle: string;
      nodes: {
        label: string;
        sub: string;
      }[];
      poweredBy: string;
      footnote: string;
    };
    ai: {
      eyebrow: string;
      line1: string;
      line2: string;
      line3: string;
      subtitle: string;
      trust: {
        label: string;
        desc: string;
      }[];
      assistantName: string;
      status: string;
      chatQuestion: string;
      chatIntro: string;
      chatIncome: string;
      chatExpenses: string;
      chatSurplus: string;
      chatVerdict: string;
      chatHint: string;
      inputPlaceholder: string;
    };
    features: {
      eyebrow: string;
      titleLine1: string;
      titleAccent: string;
      subtitle: string;
      subtitleStrong: string;
      badgeCard: string;
      badgeAll: string;
      badgeNoCard: string;
      items: {
        title: string;
        description: string;
      }[];
      privacyTitle: string;
      privacyDescription: string;
      privacyStats: string[];
    };
    privacy: {
      eyebrow: string;
      titleLine1: string;
      titleAccent: string;
      subtitle: string;
      steps: {
        title: string;
        body: string;
      }[];
      trust: string[];
    };
    closing: {
      stats: string[];
      eyebrow: string;
      titleAccent: string;
      titleRest: string;
      titleLine2: string;
      subtitle: string;
      ctaCreate: string;
      ctaSignIn: string;
      trust: string[];
      footerTagline: string;
      footerTags: string[];
      footerPlatform: string;
      footerSecurity: string;
      footerLinks: string[];
      footerSecurityItems: string[];
      footerCopyright: string;
      footerDisclaimer: string;
    };
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
    importCsvButton: string;
    importModalTitle: string;
    selectCsvFile: string;
    selectCardOptional: string;
    dropCsvPrompt: string;
    parsingStatement: string;
    statementPreviewTitle: string;
    detectedBankFormat: string;
    validRowsCount: string;
    duplicateRowsCount: string;
    ambiguousRowsCount: string;
    invalidRowsCount: string;
    confirmAndImport: string;
    importing: string;
    importSuccessMessage: string;
    statusNew: string;
    statusExactDuplicate: string;
    statusAmbiguous: string;
    statusInvalid: string;
    statusExcluded: string;
    categoryReviewNeeded: string;
    skipDuplicates: string;
    originalDescription: string;
    allRowsReady: string;
    backToFileSelect: string;
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
    stepPathTitle: string;
    pathwayHeading: string;
    pathwaySub: string;
    pathNoCardBadge: string;
    pathNoCardTitle: string;
    pathNoCardDesc: string;
    pathCardBadge: string;
    pathCardTitle: string;
    pathCardDesc: string;
    primaryGoal: string;
    goalBasicsTitle: string;
    goalBasicsDesc: string;
    goalCreditTitle: string;
    goalCreditDesc: string;
    goalOptimizeTitle: string;
    goalOptimizeDesc: string;
    backButton: string;
    activatingButton: string;
    readyNoCardSub: string;
    readyCardSub: string;
    goNoCardButton: string;
    goCardButton: string;
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
    health: string;
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

  learn: {
    title: string;
    subtitle: string;
    badge: string;
    tabCurriculum: string;
    tabCalculators: string;
    tabProgress: string;
    categoriesTitle: string;
    allCategories: string;
    readingTime: string;
    startLesson: string;
    completedBadge: string;
    readLesson: string;
    keyTakeawaysTitle: string;
    knowledgeCheckTitle: string;
    submitQuiz: string;
    quizPassed: string;
    quizTryAgain: string;
    nextLesson: string;
    prevLesson: string;
    backToLessons: string;
    // Calculators
    calcInterestTitle: string;
    calcInterestDesc: string;
    calcMinDueTitle: string;
    calcMinDueDesc: string;
    calcBudgetTitle: string;
    calcBudgetDesc: string;
    calcUtilizationTitle: string;
    calcUtilizationDesc: string;
    calcBreakEvenTitle: string;
    calcBreakEvenDesc: string;
    // Calculator Form Labels
    balanceLabel: string;
    aprLabel: string;
    monthlyPaymentLabel: string;
    newChargesLabel: string;
    calculateButton: string;
    calculating: string;
    totalInterestPaid: string;
    totalAmountPaid: string;
    monthsToPayoff: string;
    perpetualDebtWarning: string;
    amortizationSample: string;
    minPaymentNotice: string;
    scenarioInFull: string;
    scenarioMinOnly: string;
    scenarioFixed: string;
    monthlyIncomeLabel: string;
    allocatedTotal: string;
    needsLabel: string;
    wantsLabel: string;
    savingsLabel: string;
    totalLimitLabel: string;
    currentBalanceLabel: string;
    utilizationRateLabel: string;
    utilizationStatusIdeal: string;
    utilizationStatusHigh: string;
    targetBalance30: string;
    annualFeeLabel: string;
    monthlySpendLabel: string;
    rewardRateLabel: string;
    milestoneBenefitsLabel: string;
    breakEvenMonthlySpend: string;
    netBenefitLabel: string;
    disclaimerPrefix: string;
    // Progress & Onboarding
    overallProgressTitle: string;
    masteredTopics: string;
    averageScore: string;
    categoryProgress: string;
    pathTitle: string;
    pathDesc: string;
    pathNewToFinance: string;
    pathNewToFinanceDesc: string;
    pathUnderstandCredit: string;
    pathUnderstandCreditDesc: string;
    pathOptimizeExisting: string;
    pathOptimizeExistingDesc: string;
    switchPath: string;
    pathUpdatedSuccess: string;
  };

  incomes: {
    title: string;
    subtitle: string;
    addIncome: string;
    totalMonthlyInflow: string;
    activeStreams: string;
    rollingMedian: string;
    recordedOutflow: string;
    transactionsCount: string;
    nonCardAndCard: string;
    netCashFlow: string;
    surplusRetained: string;
    deficitAlert: string;
    monthlyNet: string;
    savingsRate: string;
    healthyRate: string;
    targetRate: string;
    rule503020: string;
    spendingDiscipline: string;
    targetMonthlyLimit: string;
    spent: string;
    updateLimit: string;
    savingLimit: string;
    budgetUpdatedSuccess: string;
    activeIncomeStreams: string;
    sourcesRegistered: string;
    noIncomeAdded: string;
    noIncomeDesc: string;
    addFirstIncome: string;
    irregularVariable: string;
    perCycle: string;
    oneTimeEntry: string;
    deleteConfirm: string;
    recordNewIncome: string;
    sourceName: string;
    sourcePlaceholder: string;
    amount: string;
    cadenceFrequency: string;
    monthly: string;
    biWeekly: string;
    weekly: string;
    irregular: string;
    oneTime: string;
    variableStream: string;
    notesOptional: string;
    notesPlaceholder: string;
    cancel: string;
    saveIncome: string;
    saving: string;
    recordQuickExpense: string;
    quickExpenseDesc: string;
    expenseLoggedSuccess: string;
    merchantDesc: string;
    merchantPlaceholder: string;
    method: string;
    category: string;
    recordExpense: string;
    paymentMethodBreakdown: string;
    loadingData: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    home: {
      hero: {
        badge: "Financial intelligence for every Indian",
        line1: "Money made",
        line2: "simple, in",
        line3Lead: "your",
        line3Tail: "language",
        subtitle: "Maximise every card reward, or build your first savings habit. Deterministic math, plain-language guidance, and your data stays yours.",
        ctaStart: "Start free",
        ctaSignIn: "Sign in",
        cardSavings: "Savings",
        cardRewards: "Rewards",
        cardPremium: "Premium",
        chipsAccent: "Everything",
        chipsRest: "your money",
        chipsLine2: "needs, in one place.",
        chips: [
          "Reward Optimizer",
          "Budget Planner",
          "Savings Goals",
          "Emergency Fund",
          "Statement Import",
          "AI Assistant",
          "Financial Health",
          "Live Card Offers",
          "EN · हिन्दी · ಕನ್ನಡ",
        ],
      },
      journeys: {
        eyebrow: "Two paths. One platform.",
        titleLine1: "Financial intelligence",
        titleAccent: "built for everyone.",
        subtitle: "CLIQ adapts to your financial reality — whether you hold premium cards or are just starting your journey.",
        ccLabel: "Credit card path",
        ccHeadline: "Maximize every rupee of rewards.",
        ccDescription: "Track your full card wallet, discover real-time offers, and let CLIQ's AI optimize which card to use for every purchase.",
        ccFeatures: [
          "Instant reward calculation for 50+ Indian cards",
          "Live offer discovery from 8 bank sources",
          "Card-vs-card comparison and fee waiver tracking",
          "Purchase intelligence — best card for every merchant",
        ],
        noCardLabel: "No card required",
        noCardHeadline: "Build wealth from your first paycheck.",
        noCardDescription: "Track income, plan budgets, grow your emergency fund, and learn financial skills — all without needing a credit card.",
        noCardFeatures: [
          "Income tracking — regular, irregular, freelance",
          "Budget planning with configurable category splits",
          "Emergency savings goals with progress tracking",
          "CLIQ Learn — 6 financial literacy modules",
        ],
        overview: "Monthly Overview",
        income: "Income",
        expenses: "Expenses",
        savings: "Savings",
        goals: "Savings Goals",
        emergencyFund: "Emergency Fund",
        education: "Education",
      },
      universe: {
        eyebrow: "The CLIQ ecosystem",
        titleLead: "See your",
        titleAccent: "money clearly,",
        titleLine2: "all in one place.",
        subtitle: "CLIQ connects every aspect of your financial life — intelligently, privately and in real time.",
        nodes: [
          {
            label: "Income",
            sub: "Track every rupee",
          },
          {
            label: "Cards",
            sub: "Optimize rewards",
          },
          {
            label: "Spending",
            sub: "Analyse patterns",
          },
          {
            label: "Savings",
            sub: "Build your cushion",
          },
          {
            label: "Education",
            sub: "Learn & grow",
          },
          {
            label: "Health Score",
            sub: "Know your number",
          },
        ],
        poweredBy: "Powered by",
        footnote: "Every piece of data stays encrypted and consent-gated. CLIQ's AI synthesises signals across all six domains to give you insights that no single tool can provide.",
      },
      ai: {
        eyebrow: "AI financial intelligence",
        line1: "Ask anything.",
        line2: "Get answers in",
        line3: "your language.",
        subtitle: "Plain-language answers in Hindi, English or Kannada. CLIQ's AI reads your real income and spending data, and never guesses a number.",
        trust: [
          {
            label: "Privacy Gateway",
            desc: "9-layer PII redaction before any AI call",
          },
          {
            label: "Consent-gated",
            desc: "You control what data the AI can access",
          },
          {
            label: "Explainable",
            desc: "Every answer cites your actual numbers",
          },
        ],
        assistantName: "CLIQ AI Assistant",
        status: "Active — 3 sources analysed",
        chatQuestion: "Can I afford to save ₹3,000 every month?",
        chatIntro: "Let's examine your recorded income and expenses to understand whether this savings target is sustainable.",
        chatIncome: "Monthly income (3-month median)",
        chatExpenses: "Recorded expenses",
        chatSurplus: "Available surplus",
        chatVerdict: "Yes — your current surplus comfortably covers ₹3,000 with a ₹3,520 safety buffer remaining.",
        chatHint: "Ask about your spending patterns, debt payoff, or investment readiness...",
        inputPlaceholder: "Ask about your finances...",
      },
      features: {
        eyebrow: "What's inside CLIQ",
        titleLine1: "Everything you need.",
        titleAccent: "Nothing you don't.",
        subtitle: "Built capabilities, not marketing promises.",
        subtitleStrong: "Every feature ships in the current release.",
        badgeCard: "Credit card users",
        badgeAll: "All users",
        badgeNoCard: "No-card path",
        items: [
          {
            title: "Reward Optimization",
            description: "Exact Decimal-precision reward calculations for 50+ Indian credit cards. Best card for every merchant, every time.",
          },
          {
            title: "Spending Intelligence",
            description: "Categorized transaction analytics with CSV statement import from HDFC, SBI, ICICI and Axis. SHA-256 deduplication.",
          },
          {
            title: "Financial Health Score",
            description: "Two-algorithm health engine — reward efficiency for cardholders, income-surplus path for everyone else. Real numbers.",
          },
          {
            title: "Income & Budget",
            description: "Rolling 90-day median for irregular income. Configurable category budgets. One-time windfall expiry protection.",
          },
          {
            title: "Document Intelligence",
            description: "Upload bank PDF circulars and card offer statements. CLIQ extracts merchants, discounts and promo codes automatically.",
          },
          {
            title: "CLIQ Learn",
            description: "6 financial literacy modules, 5 calculators — EMI, credit utilisation, compound interest. Progress tracked per user.",
          },
        ],
        privacyTitle: "Privacy Gateway",
        privacyDescription: "9 PII redaction rules run before any AI call. User-consent-gated. Every AI request audit-logged. Zero raw data egress.",
        privacyStats: ["PII rules", "Data egress", "Audit logged"],
      },
      privacy: {
        eyebrow: "Privacy by design",
        titleLine1: "Your data. Your control.",
        titleAccent: "Always.",
        subtitle: "CLIQ was built with privacy as a constraint, not an afterthought. Here is exactly what happens between you and the AI.",
        steps: [
          {
            title: "You input",
            body: "Your income, expenses and transactions. Only what you choose to enter — no account scraping, no bank integration, no automatic collection.",
          },
          {
            title: "9-layer PII redaction",
            body: "Before any AI call, CLIQ runs 9 compiled regex rules that strip card numbers, CVVs, OTPs, Aadhaar, PAN, bank accounts, email addresses and phone numbers.",
          },
          {
            title: "Consent-gated AI",
            body: "Your explicit consent is checked before every AI request. You can withdraw consent at any time. AI is used only for plain-language explanation — never for calculations.",
          },
          {
            title: "Immutable audit log",
            body: "Every AI request is logged in an append-only audit table. You can review every query made on your behalf. Logs are anonymized on account deletion.",
          },
        ],
        trust: [
          "Zero raw PAN or CVV stored",
          "Row-Level Security on all tables",
          "User-owned data — export or delete anytime",
          "Deterministic math, AI for explanations only",
        ],
      },
      closing: {
        stats: [
          "Indian credit cards supported",
          "Financial literacy modules",
          "PII redaction rules",
          "Privacy-first architecture",
        ],
        eyebrow: "Start your journey",
        titleAccent: "Your money",
        titleRest: "deserves",
        titleLine2: "better intelligence.",
        subtitle: "Join Indians who manage money smarter, whether they hold premium cards or are just beginning their financial journey.",
        ctaCreate: "Create free account",
        ctaSignIn: "Sign in to CLIQ",
        trust: ["256-bit encryption", "No card required to start", "EN · हिन्दी · ಕನ್ನಡ"],
        footerTagline: "Financial intelligence for every Indian, with or without a credit card.",
        footerTags: ["Privacy-first", "India-built", "Open platform"],
        footerPlatform: "Platform",
        footerSecurity: "Security",
        footerLinks: ["Dashboard", "Credit Cards", "Offers", "AI Assistant", "CLIQ Learn", "Budget", "Analytics", "Financial Health"],
        footerSecurityItems: ["Zero PAN / CVV storage", "Row-Level Security", "9-layer PII redaction", "Immutable AI audit log"],
        footerCopyright: "CLIQ. Built for India.",
        footerDisclaimer: "Deterministic financial math · AI for explanation only · Never for calculations.",
      },
    },

    tagline: "Money Made Simple. In Your Language.",
    supporting: "Smarter decisions, Brighter futures. For everyone.",

    nav: {
      pathwayLabel: "Pathway",
      modeLabel: "Mode",
      modeCashSavings: "Cash & Savings",
      modeCreditCards: "Credit Cards",
      switchToCardMode: "Switch to Credit Card Mode",
      switchToCashMode: "Switch to Cash & Savings Mode",
      switchToCardsShort: "Switch to Cards",
      switchToCashShort: "Switch to Cash & Savings",
      switching: "Switching...",
      myIncome: "My Income",
      expenseLog: "Expense Log",
      budgetPlanner: "Budget Planner",
      savingsGoals: "Savings Goals",
      emergencyFund: "Emergency Fund",
      subscriptions: "Subscriptions & Bills",
      financialHealth: "Financial Health",
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
      learn: "CLIQ Learn",
      budget: "Income & Budget",
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
      importCsvButton: "Import Statement (CSV)",
      importModalTitle: "Import Credit Card Statement",
      selectCsvFile: "Select CSV File",
      selectCardOptional: "Assign to Credit Card (Optional)",
      dropCsvPrompt: "Click or drag & drop bank CSV statement here",
      parsingStatement: "Analyzing statement and mapping columns...",
      statementPreviewTitle: "Statement Reconciliation Preview",
      detectedBankFormat: "Detected Bank Format",
      validRowsCount: "Ready to Import",
      duplicateRowsCount: "Duplicates (Skipped)",
      ambiguousRowsCount: "Ambiguous (Review)",
      invalidRowsCount: "Invalid Rows",
      confirmAndImport: "Confirm & Import",
      importing: "Importing Transactions...",
      importSuccessMessage: "Statement transactions successfully imported into your portfolio.",
      statusNew: "New Purchase",
      statusExactDuplicate: "Duplicate Found",
      statusAmbiguous: "Verify Purchase",
      statusInvalid: "Invalid Data",
      statusExcluded: "Payment / Credit",
      categoryReviewNeeded: "Low confidence category. Click to review.",
      skipDuplicates: "Skip existing duplicate transactions",
      originalDescription: "Original Statement Description",
      allRowsReady: "All transactions verified and ready for import.",
      backToFileSelect: "Upload Another File",
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
      continueButton: "Continue",
      seedDemoButton: "Provision Demo Portfolio",
      finishButton: "Launch Command Center",
      seedingText: "Provisioning Verified Portfolio...",
      portfolioHeading: "Credit Card Portfolio",
      portfolioSub: "Start with verified Indian credit cards or seed sample demo data.",
      readyHeading: "You're All Set!",
      readySub: "Your account is secured with local-first privacy and deterministic calculation engines.",
      stepPathTitle: "Learning Path",
      pathwayHeading: "Choose Your Financial Pathway",
      pathwaySub: "CLIQ adapts its features, calculators, and dashboard to match your actual payment habits.",
      pathNoCardBadge: "PATH B",
      pathNoCardTitle: "No-Credit-Card User",
      pathNoCardDesc: "I use UPI, Cash, Debit, or Bank Transfers. Help me track cash flow, manage irregular income, and build savings discipline.",
      pathCardBadge: "PATH A",
      pathCardTitle: "Credit Card User",
      pathCardDesc: "I own one or more credit cards. Help me maximize cashback and reward miles, audit annual fees, and explore merchant offers.",
      primaryGoal: "Primary Goal",
      goalBasicsTitle: "Understand Basics",
      goalBasicsDesc: "Budgeting, cash flow, debt risks",
      goalCreditTitle: "Learn Credit & Score",
      goalCreditDesc: "How credit scores & interest work",
      goalOptimizeTitle: "Optimize Spending",
      goalOptimizeDesc: "Smart rewards & expense tracking",
      backButton: "Back",
      activatingButton: "Activating Pathway...",
      readyNoCardSub: "Your Cash & Savings workspace is active. Track your cash flow, analyze non-card spending, and follow your 50/30/20 budget framework seamlessly.",
      readyCardSub: "Your Credit Card Command Center is ready. Connect your cards anytime, optimize rewards, and explore personalized merchant discounts.",
      goNoCardButton: "Go to Personal Finance Command Center",
      goCardButton: "Go to Command Center",
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
      health: "Healthcare & Pharmacy",
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

    learn: {
      title: "Financial Inclusion & CLIQ Learn",
      subtitle: "Empowering financial confidence, debt-free living, and informed money decisions for everyone.",
      badge: "Financial Inclusion Suite",
      tabCurriculum: "Curriculum & Lessons",
      tabCalculators: "Interactive Calculators",
      tabProgress: "My Learning Progress",
      categoriesTitle: "Learning Categories",
      allCategories: "All Categories",
      readingTime: "min read",
      startLesson: "Start Lesson",
      completedBadge: "Completed",
      readLesson: "Read Lesson",
      keyTakeawaysTitle: "Key Takeaways",
      knowledgeCheckTitle: "Knowledge Check",
      submitQuiz: "Submit Answers",
      quizPassed: "Great job! You passed the knowledge check.",
      quizTryAgain: "Some answers were incorrect. Review the lesson and try again.",
      nextLesson: "Next Lesson",
      prevLesson: "Previous Lesson",
      backToLessons: "Back to All Lessons",
      // Calculators
      calcInterestTitle: "Credit Card Interest Calculator",
      calcInterestDesc: "Calculate how APR and monthly finance charges compound on outstanding balances.",
      calcMinDueTitle: "Minimum Payment Trap Calculator",
      calcMinDueDesc: "See how paying only the 5% minimum due keeps you trapped in debt for years.",
      calcBudgetTitle: "50-30-20 Monthly Budget Planner",
      calcBudgetDesc: "Organize your income into Needs (50%), Wants (30%), and Savings (20%).",
      calcUtilizationTitle: "Credit Utilization Health Calculator",
      calcUtilizationDesc: "Check your utilization percentage and understand why the 30% rule protects your score.",
      calcBreakEvenTitle: "Card Fee Break-Even Evaluator",
      calcBreakEvenDesc: "Determine the monthly spend required to justify an annual credit card fee.",
      // Calculator Form Labels
      balanceLabel: "Outstanding Balance (₹)",
      aprLabel: "Annual Percentage Rate (APR %)",
      monthlyPaymentLabel: "Planned Monthly Payment (₹)",
      newChargesLabel: "New Purchases per Month (₹)",
      calculateButton: "Calculate",
      calculating: "Calculating...",
      totalInterestPaid: "Total Interest Paid",
      totalAmountPaid: "Total Amount Paid",
      monthsToPayoff: "Months to Pay Off",
      perpetualDebtWarning: "Perpetual Debt Alert: Your planned payment is less than monthly finance charges!",
      amortizationSample: "Payment Amortization Sample (First 12 Months)",
      minPaymentNotice: "Comparison of Payment Strategies",
      scenarioInFull: "Paying Full Balance",
      scenarioMinOnly: "Paying Minimum Due (5%)",
      scenarioFixed: "Paying Fixed Accelerated Amount",
      monthlyIncomeLabel: "Monthly In-Hand Income (₹)",
      allocatedTotal: "Total Allocated",
      needsLabel: "Essential Needs (50%)",
      wantsLabel: "Discretionary Wants (30%)",
      savingsLabel: "Savings & Investments (20%)",
      totalLimitLabel: "Total Credit Limit (₹)",
      currentBalanceLabel: "Current Total Balance (₹)",
      utilizationRateLabel: "Credit Utilization Rate",
      utilizationStatusIdeal: "Ideal Utilization (<30%)",
      utilizationStatusHigh: "High Utilization (>50%)",
      targetBalance30: "Target Balance for 30% Ideal",
      annualFeeLabel: "Card Annual Fee (₹)",
      monthlySpendLabel: "Expected Monthly Spend (₹)",
      rewardRateLabel: "Effective Reward Rate (%)",
      milestoneBenefitsLabel: "Annual Milestone Benefits Value (₹)",
      breakEvenMonthlySpend: "Monthly Spend Needed to Break Even",
      netBenefitLabel: "Net Annual Benefit",
      disclaimerPrefix: "Disclaimer: Calculations are illustrative and educational.",
      // Progress & Onboarding
      overallProgressTitle: "Overall Curriculum Mastery",
      masteredTopics: "Topics Completed",
      averageScore: "Average Quiz Score",
      categoryProgress: "Progress by Category",
      pathTitle: "Your Financial Learning Journey",
      pathDesc: "CLIQ tailors your experience based on your current financial background and goals.",
      pathNewToFinance: "New to Financial Management",
      pathNewToFinanceDesc: "Start with budgeting, emergency funds, savings habits, and fraud safety.",
      pathUnderstandCredit: "Want to Understand Credit Cards",
      pathUnderstandCreditDesc: "Learn billing cycles, grace periods, interest avoidance, and credit scores before getting a card.",
      pathOptimizeExisting: "Optimize Existing Products",
      pathOptimizeExistingDesc: "Maximize cashback, monitor reward caps, audit annual fees, and prevent leakage.",
      switchPath: "Change Learning Path",
      pathUpdatedSuccess: "Financial learning path updated successfully!",
    },

    incomes: {
      title: "Income & Budget Command",
      subtitle: "Cash flow tracking, regular & irregular earnings, and disciplined 50/30/20 budgeting",
      addIncome: "Add Income Stream",
      totalMonthlyInflow: "Total Monthly Inflow",
      activeStreams: "Active Stream(s)",
      rollingMedian: "90d Median",
      recordedOutflow: "Recorded Outflow",
      transactionsCount: "Transactions",
      nonCardAndCard: "Non-card & card",
      netCashFlow: "Net Cash Flow",
      surplusRetained: "Surplus retained",
      deficitAlert: "Deficit alert",
      monthlyNet: "Monthly net",
      savingsRate: "Savings Rate",
      healthyRate: "Healthy (>20%)",
      targetRate: "Target: 20%+",
      rule503020: "50/30/20 rule",
      spendingDiscipline: "Monthly Spending Discipline & Budget",
      targetMonthlyLimit: "Target Monthly Limit",
      spent: "Spent",
      updateLimit: "Update",
      savingLimit: "Saving...",
      budgetUpdatedSuccess: "Budget target updated successfully.",
      activeIncomeStreams: "Active Income Streams",
      sourcesRegistered: "source(s) registered",
      noIncomeAdded: "No Income Streams Added Yet",
      noIncomeDesc: "Add your salary, freelance gigs, business earnings, or stipends to enable cash flow resilience calculations.",
      addFirstIncome: "Add First Income",
      irregularVariable: "Irregular / Variable",
      perCycle: "Per cycle",
      oneTimeEntry: "One-time entry",
      deleteConfirm: "Are you sure you want to remove this income stream?",
      recordNewIncome: "Record New Income Stream",
      sourceName: "Source Name",
      sourcePlaceholder: "e.g. Primary Job, Consulting, Rental",
      amount: "Amount (₹)",
      cadenceFrequency: "Cadence / Frequency",
      monthly: "Monthly",
      biWeekly: "Bi-Weekly",
      weekly: "Weekly",
      irregular: "Irregular",
      oneTime: "One-Time",
      variableStream: "Variable / Irregular Stream (Freelance)",
      notesOptional: "Notes (Optional)",
      notesPlaceholder: "e.g. Q4 contract renewal",
      cancel: "Cancel",
      saveIncome: "Save Income",
      saving: "Saving...",
      recordQuickExpense: "Record Quick Expense (Non-Card)",
      quickExpenseDesc: "Log cash, UPI, or debit payments to update your budget and net cash flow in real time.",
      expenseLoggedSuccess: "Expense logged successfully.",
      merchantDesc: "Merchant / Description",
      merchantPlaceholder: "e.g. Local Kirana, Metro, Chai",
      method: "Method",
      category: "Category",
      recordExpense: "Record Expense",
      paymentMethodBreakdown: "Payment Method Breakdown",
      loadingData: "Loading cash flow and budget telemetry...",
    },
  },

  hi: {
    home: {
      hero: {
        badge: "हर भारतीय के लिए वित्तीय समझ",
        line1: "पैसा हुआ",
        line2: "आसान,",
        line3Lead: "आपकी",
        line3Tail: "भाषा में",
        subtitle: "हर कार्ड रिवॉर्ड का पूरा फ़ायदा उठाएँ, या बचत की पहली आदत डालें। सटीक गणित, सरल भाषा में मार्गदर्शन, और आपका डेटा सिर्फ़ आपका।",
        ctaStart: "मुफ़्त शुरू करें",
        ctaSignIn: "साइन इन करें",
        cardSavings: "बचत",
        cardRewards: "रिवॉर्ड",
        cardPremium: "प्रीमियम",
        chipsAccent: "आपके पैसे",
        chipsRest: "की हर ज़रूरत,",
        chipsLine2: "एक ही जगह।",
        chips: [
          "रिवॉर्ड ऑप्टिमाइज़र",
          "बजट प्लानर",
          "बचत लक्ष्य",
          "आपातकालीन निधि",
          "स्टेटमेंट इम्पोर्ट",
          "AI सहायक",
          "वित्तीय स्वास्थ्य",
          "लाइव कार्ड ऑफ़र",
          "EN · हिन्दी · ಕನ್ನಡ",
        ],
      },
      journeys: {
        eyebrow: "दो रास्ते। एक प्लेटफ़ॉर्म।",
        titleLine1: "वित्तीय समझ,",
        titleAccent: "सबके लिए।",
        subtitle: "CLIQ आपकी वित्तीय स्थिति के अनुसार ढल जाता है — चाहे आपके पास प्रीमियम कार्ड हों या आप अभी शुरुआत कर रहे हों।",
        ccLabel: "क्रेडिट कार्ड पथ",
        ccHeadline: "हर रुपये का पूरा रिवॉर्ड पाएँ।",
        ccDescription: "अपने सभी कार्ड एक जगह ट्रैक करें, रियल-टाइम ऑफ़र खोजें, और CLIQ के AI से जानें कि हर ख़रीदारी पर कौन-सा कार्ड इस्तेमाल करें।",
        ccFeatures: [
          "50+ भारतीय कार्डों के लिए तुरंत रिवॉर्ड गणना",
          "8 बैंक स्रोतों से लाइव ऑफ़र",
          "कार्ड-बनाम-कार्ड तुलना और शुल्क छूट ट्रैकिंग",
          "ख़रीदारी इंटेलिजेंस — हर मर्चेंट के लिए सबसे अच्छा कार्ड",
        ],
        noCardLabel: "कार्ड की ज़रूरत नहीं",
        noCardHeadline: "पहली तनख़्वाह से संपत्ति बनाएँ।",
        noCardDescription: "आय ट्रैक करें, बजट बनाएँ, आपातकालीन निधि बढ़ाएँ और वित्तीय कौशल सीखें — बिना किसी क्रेडिट कार्ड के।",
        noCardFeatures: [
          "आय ट्रैकिंग — नियमित, अनियमित, फ़्रीलांस",
          "कस्टम श्रेणियों के साथ बजट योजना",
          "प्रगति ट्रैकिंग के साथ आपातकालीन बचत लक्ष्य",
          "CLIQ Learn — 6 वित्तीय साक्षरता मॉड्यूल",
        ],
        overview: "मासिक सारांश",
        income: "आय",
        expenses: "ख़र्च",
        savings: "बचत",
        goals: "बचत लक्ष्य",
        emergencyFund: "आपातकालीन निधि",
        education: "शिक्षा",
      },
      universe: {
        eyebrow: "CLIQ इकोसिस्टम",
        titleLead: "अपने",
        titleAccent: "पैसे को साफ़ देखें,",
        titleLine2: "सब एक ही जगह।",
        subtitle: "CLIQ आपके वित्तीय जीवन के हर पहलू को जोड़ता है — समझदारी से, निजी तौर पर और रियल टाइम में।",
        nodes: [
          {
            label: "आय",
            sub: "हर रुपये का हिसाब",
          },
          {
            label: "कार्ड",
            sub: "रिवॉर्ड बढ़ाएँ",
          },
          {
            label: "ख़र्च",
            sub: "पैटर्न समझें",
          },
          {
            label: "बचत",
            sub: "सुरक्षा कवच बनाएँ",
          },
          {
            label: "शिक्षा",
            sub: "सीखें और बढ़ें",
          },
          {
            label: "हेल्थ स्कोर",
            sub: "अपना स्कोर जानें",
          },
        ],
        poweredBy: "संचालित",
        footnote: "आपका हर डेटा एन्क्रिप्टेड और आपकी सहमति से ही उपयोग होता है। CLIQ का AI छहों क्षेत्रों के संकेतों को जोड़कर ऐसी समझ देता है जो कोई एक टूल नहीं दे सकता।",
      },
      ai: {
        eyebrow: "AI वित्तीय इंटेलिजेंस",
        line1: "कुछ भी पूछें।",
        line2: "जवाब पाएँ",
        line3: "अपनी भाषा में।",
        subtitle: "हिंदी, अंग्रेज़ी या कन्नड़ में सरल जवाब। CLIQ का AI आपकी असली आय और ख़र्च पढ़ता है, और कभी कोई संख्या अनुमान से नहीं बताता।",
        trust: [
          {
            label: "प्राइवेसी गेटवे",
            desc: "हर AI कॉल से पहले 9-स्तरीय PII हटाना",
          },
          {
            label: "सहमति आधारित",
            desc: "AI किस डेटा तक पहुँचे, यह आप तय करते हैं",
          },
          {
            label: "स्पष्ट जवाब",
            desc: "हर जवाब आपकी असली संख्याओं पर आधारित",
          },
        ],
        assistantName: "CLIQ AI सहायक",
        status: "सक्रिय — 3 स्रोतों का विश्लेषण",
        chatQuestion: "क्या मैं हर महीने ₹3,000 बचा सकता हूँ?",
        chatIntro: "आइए आपकी दर्ज आय और ख़र्च देखें, ताकि पता चले कि यह बचत लक्ष्य टिकाऊ है या नहीं।",
        chatIncome: "मासिक आय (3 महीने का माध्यिका)",
        chatExpenses: "दर्ज ख़र्च",
        chatSurplus: "उपलब्ध अधिशेष",
        chatVerdict: "हाँ — आपका मौजूदा अधिशेष ₹3,000 आराम से कवर करता है, और ₹3,520 का सुरक्षा बफ़र बचता है।",
        chatHint: "अपने ख़र्च के पैटर्न, कर्ज़ चुकाने या निवेश की तैयारी के बारे में पूछें...",
        inputPlaceholder: "अपने पैसों के बारे में पूछें...",
      },
      features: {
        eyebrow: "CLIQ में क्या है",
        titleLine1: "जो चाहिए, सब है।",
        titleAccent: "जो नहीं चाहिए, कुछ नहीं।",
        subtitle: "बनी हुई सुविधाएँ, मार्केटिंग के वादे नहीं।",
        subtitleStrong: "हर सुविधा मौजूदा रिलीज़ में उपलब्ध है।",
        badgeCard: "क्रेडिट कार्ड उपयोगकर्ता",
        badgeAll: "सभी उपयोगकर्ता",
        badgeNoCard: "बिना कार्ड पथ",
        items: [
          {
            title: "रिवॉर्ड ऑप्टिमाइज़ेशन",
            description: "50+ भारतीय क्रेडिट कार्डों के लिए Decimal-सटीक रिवॉर्ड गणना। हर मर्चेंट के लिए हर बार सबसे अच्छा कार्ड।",
          },
          {
            title: "ख़र्च इंटेलिजेंस",
            description: "HDFC, SBI, ICICI और Axis के CSV स्टेटमेंट इम्पोर्ट के साथ श्रेणीवार लेन-देन विश्लेषण। SHA-256 डुप्लिकेट-रोधी।",
          },
          {
            title: "वित्तीय हेल्थ स्कोर",
            description: "दो-एल्गोरिदम हेल्थ इंजन — कार्डधारकों के लिए रिवॉर्ड दक्षता, बाकी सबके लिए आय-अधिशेष पथ। असली संख्याएँ।",
          },
          {
            title: "आय और बजट",
            description: "अनियमित आय के लिए 90 दिन की चलती माध्यिका। कस्टम श्रेणी बजट। एकमुश्त आय की समाप्ति से सुरक्षा।",
          },
          {
            title: "डॉक्यूमेंट इंटेलिजेंस",
            description: "बैंक PDF सर्कुलर और कार्ड ऑफ़र स्टेटमेंट अपलोड करें। CLIQ मर्चेंट, छूट और प्रोमो कोड अपने आप निकालता है।",
          },
          {
            title: "CLIQ Learn",
            description: "6 वित्तीय साक्षरता मॉड्यूल, 5 कैलकुलेटर — EMI, क्रेडिट उपयोग, चक्रवृद्धि ब्याज। हर उपयोगकर्ता की प्रगति दर्ज।",
          },
        ],
        privacyTitle: "प्राइवेसी गेटवे",
        privacyDescription: "हर AI कॉल से पहले 9 PII नियम चलते हैं। उपयोगकर्ता की सहमति ज़रूरी। हर AI अनुरोध ऑडिट लॉग में। कच्चा डेटा बाहर नहीं जाता।",
        privacyStats: ["PII नियम", "डेटा बाहर", "ऑडिट लॉग"],
      },
      privacy: {
        eyebrow: "डिज़ाइन से ही प्राइवेसी",
        titleLine1: "आपका डेटा। आपका नियंत्रण।",
        titleAccent: "हमेशा।",
        subtitle: "CLIQ में प्राइवेसी बाद में जोड़ी गई चीज़ नहीं, बल्कि बुनियादी शर्त है। आपके और AI के बीच ठीक यही होता है।",
        steps: [
          {
            title: "आप दर्ज करते हैं",
            body: "आपकी आय, ख़र्च और लेन-देन। सिर्फ़ वही जो आप दर्ज करना चुनें — न खाता स्क्रैपिंग, न बैंक इंटीग्रेशन, न अपने-आप डेटा संग्रह।",
          },
          {
            title: "9-स्तरीय PII हटाना",
            body: "हर AI कॉल से पहले CLIQ 9 नियम चलाता है जो कार्ड नंबर, CVV, OTP, आधार, PAN, बैंक खाते, ईमेल और फ़ोन नंबर हटा देते हैं।",
          },
          {
            title: "सहमति आधारित AI",
            body: "हर AI अनुरोध से पहले आपकी स्पष्ट सहमति जाँची जाती है। आप कभी भी सहमति वापस ले सकते हैं। AI सिर्फ़ सरल भाषा में समझाने के लिए है — गणना के लिए कभी नहीं।",
          },
          {
            title: "अपरिवर्तनीय ऑडिट लॉग",
            body: "हर AI अनुरोध एक केवल-जोड़ने-योग्य ऑडिट तालिका में दर्ज होता है। आप अपनी ओर से हुई हर क्वेरी देख सकते हैं। खाता हटाने पर लॉग गुमनाम कर दिए जाते हैं।",
          },
        ],
        trust: [
          "कोई कच्चा PAN या CVV संग्रहित नहीं",
          "हर तालिका पर Row-Level Security",
          "आपका डेटा आपका — कभी भी एक्सपोर्ट या डिलीट करें",
          "सटीक गणित, AI सिर्फ़ समझाने के लिए",
        ],
      },
      closing: {
        stats: [
          "समर्थित भारतीय क्रेडिट कार्ड",
          "वित्तीय साक्षरता मॉड्यूल",
          "PII हटाने के नियम",
          "प्राइवेसी-प्रथम आर्किटेक्चर",
        ],
        eyebrow: "अपनी यात्रा शुरू करें",
        titleAccent: "आपका पैसा",
        titleRest: "बेहतर समझ का",
        titleLine2: "हक़दार है।",
        subtitle: "उन भारतीयों से जुड़ें जो पैसा समझदारी से संभालते हैं — चाहे उनके पास प्रीमियम कार्ड हों या वे अभी शुरुआत कर रहे हों।",
        ctaCreate: "मुफ़्त खाता बनाएँ",
        ctaSignIn: "CLIQ में साइन इन करें",
        trust: ["256-बिट एन्क्रिप्शन", "शुरू करने के लिए कार्ड ज़रूरी नहीं", "EN · हिन्दी · ಕನ್ನಡ"],
        footerTagline: "हर भारतीय के लिए वित्तीय समझ, क्रेडिट कार्ड के साथ या उसके बिना।",
        footerTags: ["प्राइवेसी-प्रथम", "भारत में निर्मित", "ओपन प्लेटफ़ॉर्म"],
        footerPlatform: "प्लेटफ़ॉर्म",
        footerSecurity: "सुरक्षा",
        footerLinks: ["डैशबोर्ड", "क्रेडिट कार्ड", "ऑफ़र", "AI सहायक", "CLIQ Learn", "बजट", "एनालिटिक्स", "वित्तीय स्वास्थ्य"],
        footerSecurityItems: ["PAN / CVV संग्रह शून्य", "Row-Level Security", "9-स्तरीय PII हटाना", "अपरिवर्तनीय AI ऑडिट लॉग"],
        footerCopyright: "CLIQ. भारत के लिए निर्मित।",
        footerDisclaimer: "सटीक वित्तीय गणित · AI सिर्फ़ समझाने के लिए · गणना के लिए कभी नहीं।",
      },
    },

    tagline: "पैसे की समझ, अब सरल। आपकी अपनी भाषा में।",
    supporting: "सटीक निर्णय, उज्ज्वल भविष्य। हर किसी के लिए।",

    nav: {
      pathwayLabel: "पथ",
      modeLabel: "मोड",
      modeCashSavings: "नकद और बचत",
      modeCreditCards: "क्रेडिट कार्ड",
      switchToCardMode: "क्रेडिट कार्ड मोड पर जाएँ",
      switchToCashMode: "नकद और बचत मोड पर जाएँ",
      switchToCardsShort: "कार्ड मोड पर जाएँ",
      switchToCashShort: "नकद और बचत पर जाएँ",
      switching: "बदल रहा है...",
      myIncome: "मेरी आय",
      expenseLog: "ख़र्च लॉग",
      budgetPlanner: "बजट प्लानर",
      savingsGoals: "बचत लक्ष्य",
      emergencyFund: "आपातकालीन निधि",
      subscriptions: "सब्सक्रिप्शन और बिल",
      financialHealth: "वित्तीय स्वास्थ्य",
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
      learn: "सीखें (CLIQ Learn)",
      budget: "आय और बजट",
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
      importCsvButton: "स्टेटमेंट आयात करें (CSV)",
      importModalTitle: "क्रेडिट कार्ड स्टेटमेंट आयात करें",
      selectCsvFile: "CSV फ़ाइल चुनें",
      selectCardOptional: "क्रेडिट कार्ड से जोड़ें (वैकल्पिक)",
      dropCsvPrompt: "बैंक CSV स्टेटमेंट फ़ाइल यहाँ चुनें या खींचें",
      parsingStatement: "स्टेटमेंट का विश्लेषण और कॉलम मैपिंग हो रही है...",
      statementPreviewTitle: "स्टेटमेंट मिलान और पूर्वावलोकन",
      detectedBankFormat: "पहचाना गया बैंक प्रारूप",
      validRowsCount: "आयात के लिए तैयार",
      duplicateRowsCount: "डुप्लिकेट (छोड़े गए)",
      ambiguousRowsCount: "समीक्षा आवश्यक",
      invalidRowsCount: "अमान्य पंक्तियाँ",
      confirmAndImport: "पुष्टि करें और आयात करें",
      importing: "लेन-देन आयात हो रहे हैं...",
      importSuccessMessage: "स्टेटमेंट के लेन-देन सफलतापूर्वक आपके पोर्टफोलियो में आयात किए गए।",
      statusNew: "नई खरीदारी",
      statusExactDuplicate: "डुप्लिकेट मिला",
      statusAmbiguous: "खरीदारी सत्यापित करें",
      statusInvalid: "अमान्य डेटा",
      statusExcluded: "भुगतान / क्रेडिट",
      categoryReviewNeeded: "श्रेणी की पुष्टि करें। बदलने के लिए क्लिक करें।",
      skipDuplicates: "मौजूदा डुप्लिकेट लेन-देन छोड़ें",
      originalDescription: "मूल स्टेटमेंट विवरण",
      allRowsReady: "सभी लेन-देन सत्यापित और आयात के लिए तैयार हैं।",
      backToFileSelect: "दूसरी फ़ाइल अपलोड करें",
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
      continueButton: "जारी रखें",
      seedDemoButton: "डेमो पोर्टफोलियो जोड़ें",
      finishButton: "कमांड सेंटर शुरू करें",
      seedingText: "सत्यापित पोर्टफोलियो तैयार हो रहा है...",
      portfolioHeading: "क्रेडिट कार्ड पोर्टफोलियो",
      portfolioSub: "सत्यापित भारतीय कार्ड जोड़ें या डेमो डेटा के साथ शुरुआत करें।",
      readyHeading: "सब कुछ तैयार है!",
      readySub: "आपका खाता स्थानीय डेटा सुरक्षा और गणितीय इंजनों से सुरक्षित है।",
      stepPathTitle: "लर्निंग पाथ",
      pathwayHeading: "अपना वित्तीय पथ चुनें",
      pathwaySub: "CLIQ अपनी सुविधाएँ, कैलकुलेटर और डैशबोर्ड आपकी असली भुगतान आदतों के अनुसार ढालता है।",
      pathNoCardBadge: "पथ B",
      pathNoCardTitle: "बिना क्रेडिट कार्ड वाले उपयोगकर्ता",
      pathNoCardDesc: "मैं UPI, नकद, डेबिट या बैंक ट्रांसफ़र इस्तेमाल करता हूँ। नकदी प्रवाह ट्रैक करने, अनियमित आय संभालने और बचत का अनुशासन बनाने में मदद करें।",
      pathCardBadge: "पथ A",
      pathCardTitle: "क्रेडिट कार्ड उपयोगकर्ता",
      pathCardDesc: "मेरे पास एक या अधिक क्रेडिट कार्ड हैं। कैशबैक और रिवॉर्ड माइल्स बढ़ाने, वार्षिक शुल्क जाँचने और मर्चेंट ऑफ़र खोजने में मदद करें।",
      primaryGoal: "मुख्य लक्ष्य",
      goalBasicsTitle: "बुनियादी बातें समझें",
      goalBasicsDesc: "बजट, नकदी प्रवाह, कर्ज़ के जोखिम",
      goalCreditTitle: "क्रेडिट और स्कोर सीखें",
      goalCreditDesc: "क्रेडिट स्कोर और ब्याज कैसे काम करते हैं",
      goalOptimizeTitle: "ख़र्च बेहतर करें",
      goalOptimizeDesc: "स्मार्ट रिवॉर्ड और ख़र्च ट्रैकिंग",
      backButton: "वापस",
      activatingButton: "पथ सक्रिय हो रहा है...",
      readyNoCardSub: "आपका नकद और बचत वर्कस्पेस सक्रिय है। अपना नकदी प्रवाह ट्रैक करें, बिना कार्ड वाले ख़र्च का विश्लेषण करें और 50/30/20 बजट ढाँचे का आसानी से पालन करें।",
      readyCardSub: "आपका क्रेडिट कार्ड कमांड सेंटर तैयार है। कभी भी अपने कार्ड जोड़ें, रिवॉर्ड बढ़ाएँ और व्यक्तिगत मर्चेंट छूट देखें।",
      goNoCardButton: "व्यक्तिगत वित्त कमांड सेंटर पर जाएँ",
      goCardButton: "कमांड सेंटर पर जाएँ",
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
      health: "स्वास्थ्य और फ़ार्मेसी",
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

    learn: {
      title: "वित्तीय समावेशन और सीखें (CLIQ Learn)",
      subtitle: "कर्ज-मुक्त जीवन, वित्तीय आत्मविश्वास और सभी के लिए आसान वित्तीय निर्णय।",
      badge: "वित्तीय समावेशन मंच",
      tabCurriculum: "पाठ्यक्रम और अध्याय",
      tabCalculators: "इंटरैक्टिव कैलकुलेटर",
      tabProgress: "मेरी सीखने की प्रगति",
      categoriesTitle: "सीखने की श्रेणियां",
      allCategories: "सभी श्रेणियां",
      readingTime: "मिनट पठन",
      startLesson: "पाठ शुरू करें",
      completedBadge: "पूर्ण",
      readLesson: "पाठ पढ़ें",
      keyTakeawaysTitle: "मुख्य सीख",
      knowledgeCheckTitle: "ज्ञान की जांच (प्रश्नोत्तरी)",
      submitQuiz: "उत्तर जमा करें",
      quizPassed: "शानदार! आपने प्रश्नोत्तरी सफलतापूर्वक उत्तीर्ण कर ली।",
      quizTryAgain: "कुछ उत्तर गलत थे। पाठ को दोबारा पढ़ें और पुनः प्रयास करें।",
      nextLesson: "अगला पाठ",
      prevLesson: "पिछला पाठ",
      backToLessons: "सभी पाठों पर वापस जाएं",
      // Calculators
      calcInterestTitle: "क्रेडिट कार्ड ब्याज कैलकुलेटर",
      calcInterestDesc: "जानें कि बकाए पर वार्षिक ब्याज दर (APR) और शुल्क कैसे चक्रवृद्धि रूप से बढ़ते हैं।",
      calcMinDueTitle: "न्यूनतम भुगतान का जाल कैलकुलेटर",
      calcMinDueDesc: "देखें कि सिर्फ 5% न्यूनतम देय चुकाने से आप कैसे वर्षों तक कर्ज में फंसे रह सकते हैं।",
      calcBudgetTitle: "50-30-20 मासिक बजट नियोजक",
      calcBudgetDesc: "अपनी आय को अनिवार्य जरूरतें (50%), इच्छाएं (30%) और बचत (20%) में व्यवस्थित करें।",
      calcUtilizationTitle: "क्रेडिट उपयोग स्वास्थ्य कैलकुलेटर",
      calcUtilizationDesc: "अपना उपयोग प्रतिशत जांचें और जानें कि 30% का नियम आपके CIBIL स्कोर की रक्षा कैसे करता है।",
      calcBreakEvenTitle: "कार्ड वार्षिक शुल्क ब्रेक-ईवन मूल्यांकन",
      calcBreakEvenDesc: "पता लगाएं कि वार्षिक कार्ड शुल्क की भरपाई के लिए आपको प्रति माह कितना खर्च करना होगा।",
      // Calculator Form Labels
      balanceLabel: "बकाया राशि (₹)",
      aprLabel: "वार्षिक ब्याज दर (APR %)",
      monthlyPaymentLabel: "नियोजित मासिक भुगतान (₹)",
      newChargesLabel: "प्रति माह नए खर्च (₹)",
      calculateButton: "गणना करें",
      calculating: "गणना हो रही है...",
      totalInterestPaid: "कुल चुकाया गया ब्याज",
      totalAmountPaid: "कुल चुकाई गई राशि",
      monthsToPayoff: "कर्ज चुकाने में लगे महीने",
      perpetualDebtWarning: "सतत कर्ज चेतावनी: आपका मासिक भुगतान ब्याज से भी कम है, यह कर्ज कभी खत्म नहीं होगा!",
      amortizationSample: "भुगतान अनुसूची का नमूना (पहले 12 महीने)",
      minPaymentNotice: "भुगतान रणनीतियों की तुलना",
      scenarioInFull: "पूरी राशि का एक बार में भुगतान",
      scenarioMinOnly: "केवल न्यूनतम देय (5%) का भुगतान",
      scenarioFixed: "एक निश्चित त्वरित राशि का भुगतान",
      monthlyIncomeLabel: "मासिक शुद्ध आय (₹)",
      allocatedTotal: "कुल आवंटित राशि",
      needsLabel: "अनिवार्य जरूरतें (50%)",
      wantsLabel: "जीवनशैली व इच्छाएं (30%)",
      savingsLabel: "बचत व निवेश (20%)",
      totalLimitLabel: "कुल क्रेडिट सीमा (₹)",
      currentBalanceLabel: "वर्तमान कुल बकाया (₹)",
      utilizationRateLabel: "क्रेडिट उपयोग दर",
      utilizationStatusIdeal: "आदर्श उपयोग (<30%)",
      utilizationStatusHigh: "अधिक उपयोग (>50%)",
      targetBalance30: "30% आदर्श के लिए लक्ष्य बकाया",
      annualFeeLabel: "कार्ड वार्षिक शुल्क (₹)",
      monthlySpendLabel: "अपेक्षित मासिक खर्च (₹)",
      rewardRateLabel: "प्रभावी रिवॉर्ड दर (%)",
      milestoneBenefitsLabel: "वार्षिक माइलस्टोन लाभ मूल्य (₹)",
      breakEvenMonthlySpend: "शुल्क भरपाई के लिए न्यूनतम मासिक खर्च",
      netBenefitLabel: "शुद्ध वार्षिक लाभ",
      disclaimerPrefix: "अस्वीकरण: ये गणनाएं केवल शैक्षणिक और निर्देशात्मक उद्देश्यों के लिए हैं।",
      // Progress & Onboarding
      overallProgressTitle: "समग्र शिक्षण प्रगति",
      masteredTopics: "पूर्ण किए गए अध्याय",
      averageScore: "औसत प्रश्नोत्तरी स्कोर",
      categoryProgress: "श्रेणी अनुसार प्रगति",
      pathTitle: "आपकी वित्तीय शिक्षण यात्रा",
      pathDesc: "CLIQ आपकी वर्तमान वित्तीय स्थिति और लक्ष्यों के आधार पर अनुभव को अनुकूलित करता है।",
      pathNewToFinance: "वित्तीय प्रबंधन में नए हैं",
      pathNewToFinanceDesc: "बजट निर्माण, आपातकालीन निधि, बचत की आदतें और ऑनलाइन सुरक्षा से शुरुआत करें।",
      pathUnderstandCredit: "क्रेडिट कार्ड को समझना चाहते हैं",
      pathUnderstandCreditDesc: "कार्ड लेने से पहले बिलिंग चक्र, ग्रेस पीरियड, ब्याज से बचाव और CIBIL स्कोर समझें।",
      pathOptimizeExisting: "मौजूदा वित्तीय उत्पादों को बेहतर बनाएं",
      pathOptimizeExistingDesc: "कैशबैक को अधिकतम करें, रिवॉर्ड सीमा पर नजर रखें, वार्षिक शुल्क का ऑडिट करें और नुकसान रोकें।",
      switchPath: "सीखने का मार्ग बदलें",
      pathUpdatedSuccess: "वित्तीय शिक्षण मार्ग सफलतापूर्वक अपडेट किया गया!",
    },

    incomes: {
      title: "आय और बजट नियंत्रण",
      subtitle: "नकदी प्रवाह ट्रैकिंग, नियमित और अनियमित आय, और अनुशासित 50/30/20 बजट",
      addIncome: "आय स्रोत जोड़ें",
      totalMonthlyInflow: "कुल मासिक आमद",
      activeStreams: "सक्रिय स्रोत",
      rollingMedian: "90-दिवसीय माध्यिका",
      recordedOutflow: "दर्ज किया गया खर्च",
      transactionsCount: "लेन-देन",
      nonCardAndCard: "गैर-कार्ड और कार्ड",
      netCashFlow: "शुद्ध नकदी प्रवाह",
      surplusRetained: "बचत अधिशेष",
      deficitAlert: "घाटा चेतावनी",
      monthlyNet: "मासिक शुद्ध",
      savingsRate: "बचत दर",
      healthyRate: "स्वस्थ (>20%)",
      targetRate: "लक्ष्य: 20%+",
      rule503020: "50/30/20 नियम",
      spendingDiscipline: "मासिक खर्च अनुशासन और बजट",
      targetMonthlyLimit: "लक्षित मासिक सीमा",
      spent: "खर्च",
      updateLimit: "अपडेट करें",
      savingLimit: "सहेज रहा है...",
      budgetUpdatedSuccess: "बजट लक्ष्य सफलतापूर्वक अपडेट किया गया।",
      activeIncomeStreams: "सक्रिय आय स्रोत",
      sourcesRegistered: "स्रोत पंजीकृत",
      noIncomeAdded: "अभी तक कोई आय स्रोत नहीं जोड़ा गया",
      noIncomeDesc: "नकदी प्रवाह लचीलेपन की गणना सक्षम करने के लिए अपना वेतन, फ्रीलांस कार्य या व्यावसायिक आय जोड़ें।",
      addFirstIncome: "पहली आय जोड़ें",
      irregularVariable: "अनियमित / परिवर्तनीय",
      perCycle: "प्रति चक्र",
      oneTimeEntry: "एकमुश्त प्रविष्टि",
      deleteConfirm: "क्या आप वाकई इस आय स्रोत को हटाना चाहते हैं?",
      recordNewIncome: "नया आय स्रोत दर्ज करें",
      sourceName: "स्रोत का नाम",
      sourcePlaceholder: "उदा. मुख्य नौकरी, परामर्श, किराया",
      amount: "राशि (₹)",
      cadenceFrequency: "आवृत्ति / चक्र",
      monthly: "मासिक",
      biWeekly: "पाक्षिक",
      weekly: "साप्ताहिक",
      irregular: "अनियमित",
      oneTime: "एकमुश्त",
      variableStream: "परिवर्तनीय / अनियमित स्रोत (फ्रीलांस)",
      notesOptional: "टिप्पणियाँ (वैकल्पिक)",
      notesPlaceholder: "उदा. चौथी तिमाही अनुबंध नवीनीकरण",
      cancel: "रद्द करें",
      saveIncome: "आय सहेजें",
      saving: "सहेज रहा है...",
      recordQuickExpense: "त्वरित खर्च दर्ज करें (गैर-कार्ड)",
      quickExpenseDesc: "अपने बजट और शुद्ध नकदी प्रवाह को अपडेट करने के लिए नकद, यूपीआई या डेबिट खर्च दर्ज करें।",
      expenseLoggedSuccess: "खर्च सफलतापूर्वक दर्ज किया गया।",
      merchantDesc: "व्यापारी / विवरण",
      merchantPlaceholder: "उदा. स्थानीय किराना, मेट्रो, चाय",
      method: "भुगतान विधि",
      category: "श्रेणी",
      recordExpense: "खर्च दर्ज करें",
      paymentMethodBreakdown: "भुगतान विधि विवरण",
      loadingData: "नकदी प्रवाह और बजट डेटा लोड हो रहा है...",
    },
  },

  kn: {
    home: {
      hero: {
        badge: "ಪ್ರತಿಯೊಬ್ಬ ಭಾರತೀಯನಿಗೂ ಆರ್ಥಿಕ ಜಾಣ್ಮೆ",
        line1: "ಹಣ ಈಗ",
        line2: "ಸರಳ,",
        line3Lead: "ನಿಮ್ಮ",
        line3Tail: "ಭಾಷೆಯಲ್ಲಿ",
        subtitle: "ಪ್ರತಿ ಕಾರ್ಡ್ ರಿವಾರ್ಡ್‌ನ ಪೂರ್ಣ ಲಾಭ ಪಡೆಯಿರಿ, ಅಥವಾ ಉಳಿತಾಯದ ಮೊದಲ ಅಭ್ಯಾಸ ಬೆಳೆಸಿಕೊಳ್ಳಿ. ನಿಖರ ಗಣಿತ, ಸರಳ ಭಾಷೆಯ ಮಾರ್ಗದರ್ಶನ, ಮತ್ತು ನಿಮ್ಮ ಡೇಟಾ ನಿಮ್ಮದೇ.",
        ctaStart: "ಉಚಿತವಾಗಿ ಆರಂಭಿಸಿ",
        ctaSignIn: "ಸೈನ್ ಇನ್",
        cardSavings: "ಉಳಿತಾಯ",
        cardRewards: "ರಿವಾರ್ಡ್",
        cardPremium: "ಪ್ರೀಮಿಯಂ",
        chipsAccent: "ನಿಮ್ಮ ಹಣಕ್ಕೆ",
        chipsRest: "ಬೇಕಾದ ಎಲ್ಲವೂ,",
        chipsLine2: "ಒಂದೇ ಕಡೆ.",
        chips: [
          "ರಿವಾರ್ಡ್ ಆಪ್ಟಿಮೈಸರ್",
          "ಬಜೆಟ್ ಯೋಜಕ",
          "ಉಳಿತಾಯ ಗುರಿಗಳು",
          "ತುರ್ತು ನಿಧಿ",
          "ಸ್ಟೇಟ್‌ಮೆಂಟ್ ಆಮದು",
          "AI ಸಹಾಯಕ",
          "ಆರ್ಥಿಕ ಆರೋಗ್ಯ",
          "ಲೈವ್ ಕಾರ್ಡ್ ಆಫರ್‌ಗಳು",
          "EN · हिन्दी · ಕನ್ನಡ",
        ],
      },
      journeys: {
        eyebrow: "ಎರಡು ದಾರಿಗಳು. ಒಂದೇ ವೇದಿಕೆ.",
        titleLine1: "ಆರ್ಥಿಕ ಜಾಣ್ಮೆ,",
        titleAccent: "ಎಲ್ಲರಿಗಾಗಿ.",
        subtitle: "ನಿಮ್ಮ ಬಳಿ ಪ್ರೀಮಿಯಂ ಕಾರ್ಡ್‌ಗಳಿರಲಿ ಅಥವಾ ನೀವು ಈಗಷ್ಟೇ ಆರಂಭಿಸುತ್ತಿರಲಿ — CLIQ ನಿಮ್ಮ ಆರ್ಥಿಕ ಸ್ಥಿತಿಗೆ ತಕ್ಕಂತೆ ಹೊಂದಿಕೊಳ್ಳುತ್ತದೆ.",
        ccLabel: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ದಾರಿ",
        ccHeadline: "ಪ್ರತಿ ರೂಪಾಯಿಗೂ ಪೂರ್ಣ ರಿವಾರ್ಡ್.",
        ccDescription: "ನಿಮ್ಮ ಎಲ್ಲಾ ಕಾರ್ಡ್‌ಗಳನ್ನು ಒಂದೇ ಕಡೆ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ, ನೈಜ-ಸಮಯದ ಆಫರ್‌ಗಳನ್ನು ಹುಡುಕಿ, ಮತ್ತು ಪ್ರತಿ ಖರೀದಿಗೆ ಯಾವ ಕಾರ್ಡ್ ಬಳಸಬೇಕೆಂದು CLIQ AI ನಿರ್ಧರಿಸಲಿ.",
        ccFeatures: [
          "50+ ಭಾರತೀಯ ಕಾರ್ಡ್‌ಗಳಿಗೆ ತಕ್ಷಣದ ರಿವಾರ್ಡ್ ಲೆಕ್ಕಾಚಾರ",
          "8 ಬ್ಯಾಂಕ್ ಮೂಲಗಳಿಂದ ಲೈವ್ ಆಫರ್‌ಗಳು",
          "ಕಾರ್ಡ್-ವಿರುದ್ಧ-ಕಾರ್ಡ್ ಹೋಲಿಕೆ ಮತ್ತು ಶುಲ್ಕ ಮನ್ನಾ ಟ್ರ್ಯಾಕಿಂಗ್",
          "ಖರೀದಿ ಜಾಣ್ಮೆ — ಪ್ರತಿ ಮರ್ಚೆಂಟ್‌ಗೆ ಅತ್ಯುತ್ತಮ ಕಾರ್ಡ್",
        ],
        noCardLabel: "ಕಾರ್ಡ್ ಬೇಕಿಲ್ಲ",
        noCardHeadline: "ಮೊದಲ ಸಂಬಳದಿಂದಲೇ ಸಂಪತ್ತು ಕಟ್ಟಿ.",
        noCardDescription: "ಆದಾಯ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ, ಬಜೆಟ್ ಯೋಜಿಸಿ, ತುರ್ತು ನಿಧಿ ಬೆಳೆಸಿ ಮತ್ತು ಆರ್ಥಿಕ ಕೌಶಲ್ಯ ಕಲಿಯಿರಿ — ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಇಲ್ಲದೆಯೇ.",
        noCardFeatures: [
          "ಆದಾಯ ಟ್ರ್ಯಾಕಿಂಗ್ — ನಿಯಮಿತ, ಅನಿಯಮಿತ, ಫ್ರೀಲ್ಯಾನ್ಸ್",
          "ಹೊಂದಿಸಬಹುದಾದ ವರ್ಗಗಳೊಂದಿಗೆ ಬಜೆಟ್ ಯೋಜನೆ",
          "ಪ್ರಗತಿ ಟ್ರ್ಯಾಕಿಂಗ್‌ನೊಂದಿಗೆ ತುರ್ತು ಉಳಿತಾಯ ಗುರಿಗಳು",
          "CLIQ Learn — 6 ಆರ್ಥಿಕ ಸಾಕ್ಷರತಾ ಮಾಡ್ಯೂಲ್‌ಗಳು",
        ],
        overview: "ಮಾಸಿಕ ಸಾರಾಂಶ",
        income: "ಆದಾಯ",
        expenses: "ಖರ್ಚು",
        savings: "ಉಳಿತಾಯ",
        goals: "ಉಳಿತಾಯ ಗುರಿಗಳು",
        emergencyFund: "ತುರ್ತು ನಿಧಿ",
        education: "ಶಿಕ್ಷಣ",
      },
      universe: {
        eyebrow: "CLIQ ಪರಿಸರ ವ್ಯವಸ್ಥೆ",
        titleLead: "ನಿಮ್ಮ",
        titleAccent: "ಹಣವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ನೋಡಿ,",
        titleLine2: "ಎಲ್ಲವೂ ಒಂದೇ ಕಡೆ.",
        subtitle: "CLIQ ನಿಮ್ಮ ಆರ್ಥಿಕ ಜೀವನದ ಪ್ರತಿಯೊಂದು ಅಂಶವನ್ನೂ ಜೋಡಿಸುತ್ತದೆ — ಜಾಣ್ಮೆಯಿಂದ, ಖಾಸಗಿಯಾಗಿ ಮತ್ತು ನೈಜ ಸಮಯದಲ್ಲಿ.",
        nodes: [
          {
            label: "ಆದಾಯ",
            sub: "ಪ್ರತಿ ರೂಪಾಯಿಯ ಲೆಕ್ಕ",
          },
          {
            label: "ಕಾರ್ಡ್‌ಗಳು",
            sub: "ರಿವಾರ್ಡ್ ಹೆಚ್ಚಿಸಿ",
          },
          {
            label: "ಖರ್ಚು",
            sub: "ಮಾದರಿಗಳನ್ನು ಅರಿಯಿರಿ",
          },
          {
            label: "ಉಳಿತಾಯ",
            sub: "ಸುರಕ್ಷತಾ ನಿಧಿ ಕಟ್ಟಿ",
          },
          {
            label: "ಶಿಕ್ಷಣ",
            sub: "ಕಲಿಯಿರಿ, ಬೆಳೆಯಿರಿ",
          },
          {
            label: "ಆರೋಗ್ಯ ಸ್ಕೋರ್",
            sub: "ನಿಮ್ಮ ಅಂಕ ತಿಳಿಯಿರಿ",
          },
        ],
        poweredBy: "ಆಧಾರಿತ",
        footnote: "ನಿಮ್ಮ ಪ್ರತಿಯೊಂದು ಡೇಟಾ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಆಗಿರುತ್ತದೆ ಮತ್ತು ನಿಮ್ಮ ಒಪ್ಪಿಗೆಯಿಂದ ಮಾತ್ರ ಬಳಕೆಯಾಗುತ್ತದೆ. CLIQ AI ಆರೂ ಕ್ಷೇತ್ರಗಳ ಸಂಕೇತಗಳನ್ನು ಸೇರಿಸಿ, ಯಾವುದೇ ಒಂದು ಸಾಧನ ನೀಡಲಾಗದ ಒಳನೋಟಗಳನ್ನು ನೀಡುತ್ತದೆ.",
      },
      ai: {
        eyebrow: "AI ಆರ್ಥಿಕ ಜಾಣ್ಮೆ",
        line1: "ಏನು ಬೇಕಾದರೂ ಕೇಳಿ.",
        line2: "ಉತ್ತರ ಪಡೆಯಿರಿ",
        line3: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ.",
        subtitle: "ಹಿಂದಿ, ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಕನ್ನಡದಲ್ಲಿ ಸರಳ ಉತ್ತರಗಳು. CLIQ AI ನಿಮ್ಮ ನಿಜವಾದ ಆದಾಯ ಮತ್ತು ಖರ್ಚನ್ನು ಓದುತ್ತದೆ, ಯಾವ ಸಂಖ್ಯೆಯನ್ನೂ ಊಹಿಸುವುದಿಲ್ಲ.",
        trust: [
          {
            label: "ಪ್ರೈವಸಿ ಗೇಟ್‌ವೇ",
            desc: "ಪ್ರತಿ AI ಕರೆಗೂ ಮೊದಲು 9-ಹಂತದ PII ತೆಗೆದುಹಾಕುವಿಕೆ",
          },
          {
            label: "ಒಪ್ಪಿಗೆ ಆಧಾರಿತ",
            desc: "AI ಯಾವ ಡೇಟಾ ನೋಡಬಹುದು ಎಂಬುದು ನಿಮ್ಮ ನಿರ್ಧಾರ",
          },
          {
            label: "ಸ್ಪಷ್ಟ ವಿವರಣೆ",
            desc: "ಪ್ರತಿ ಉತ್ತರವೂ ನಿಮ್ಮ ನಿಜವಾದ ಸಂಖ್ಯೆಗಳನ್ನು ಉಲ್ಲೇಖಿಸುತ್ತದೆ",
          },
        ],
        assistantName: "CLIQ AI ಸಹಾಯಕ",
        status: "ಸಕ್ರಿಯ — 3 ಮೂಲಗಳ ವಿಶ್ಲೇಷಣೆ",
        chatQuestion: "ನಾನು ಪ್ರತಿ ತಿಂಗಳು ₹3,000 ಉಳಿಸಲು ಸಾಧ್ಯವೇ?",
        chatIntro: "ಈ ಉಳಿತಾಯ ಗುರಿ ಸಾಧ್ಯವೇ ಎಂದು ತಿಳಿಯಲು ನೀವು ದಾಖಲಿಸಿದ ಆದಾಯ ಮತ್ತು ಖರ್ಚನ್ನು ನೋಡೋಣ.",
        chatIncome: "ಮಾಸಿಕ ಆದಾಯ (3 ತಿಂಗಳ ಮಧ್ಯಮ ಮೌಲ್ಯ)",
        chatExpenses: "ದಾಖಲಾದ ಖರ್ಚು",
        chatSurplus: "ಲಭ್ಯವಿರುವ ಹೆಚ್ಚುವರಿ",
        chatVerdict: "ಹೌದು — ನಿಮ್ಮ ಈಗಿನ ಹೆಚ್ಚುವರಿ ಹಣ ₹3,000 ಅನ್ನು ಸುಲಭವಾಗಿ ಭರಿಸುತ್ತದೆ, ಜೊತೆಗೆ ₹3,520 ಸುರಕ್ಷತಾ ಮೊತ್ತ ಉಳಿಯುತ್ತದೆ.",
        chatHint: "ನಿಮ್ಮ ಖರ್ಚಿನ ಮಾದರಿ, ಸಾಲ ತೀರಿಸುವಿಕೆ ಅಥವಾ ಹೂಡಿಕೆ ಸಿದ್ಧತೆ ಬಗ್ಗೆ ಕೇಳಿ...",
        inputPlaceholder: "ನಿಮ್ಮ ಹಣಕಾಸಿನ ಬಗ್ಗೆ ಕೇಳಿ...",
      },
      features: {
        eyebrow: "CLIQ ಒಳಗೆ ಏನಿದೆ",
        titleLine1: "ಬೇಕಾದ ಎಲ್ಲವೂ ಇದೆ.",
        titleAccent: "ಬೇಡದ್ದು ಏನೂ ಇಲ್ಲ.",
        subtitle: "ನಿರ್ಮಿಸಿದ ಸೌಲಭ್ಯಗಳು, ಮಾರ್ಕೆಟಿಂಗ್ ಭರವಸೆಗಳಲ್ಲ.",
        subtitleStrong: "ಪ್ರತಿಯೊಂದು ಸೌಲಭ್ಯವೂ ಈಗಿನ ಬಿಡುಗಡೆಯಲ್ಲಿ ಲಭ್ಯ.",
        badgeCard: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಬಳಕೆದಾರರು",
        badgeAll: "ಎಲ್ಲಾ ಬಳಕೆದಾರರು",
        badgeNoCard: "ಕಾರ್ಡ್ ರಹಿತ ದಾರಿ",
        items: [
          {
            title: "ರಿವಾರ್ಡ್ ಆಪ್ಟಿಮೈಸೇಶನ್",
            description: "50+ ಭಾರತೀಯ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ಗಳಿಗೆ Decimal-ನಿಖರ ರಿವಾರ್ಡ್ ಲೆಕ್ಕಾಚಾರ. ಪ್ರತಿ ಮರ್ಚೆಂಟ್‌ಗೆ ಪ್ರತಿ ಬಾರಿಯೂ ಅತ್ಯುತ್ತಮ ಕಾರ್ಡ್.",
          },
          {
            title: "ಖರ್ಚಿನ ಒಳನೋಟ",
            description: "HDFC, SBI, ICICI ಮತ್ತು Axis CSV ಸ್ಟೇಟ್‌ಮೆಂಟ್ ಆಮದಿನೊಂದಿಗೆ ವರ್ಗವಾರು ವಹಿವಾಟು ವಿಶ್ಲೇಷಣೆ. SHA-256 ನಕಲು ತಡೆ.",
          },
          {
            title: "ಆರ್ಥಿಕ ಆರೋಗ್ಯ ಸ್ಕೋರ್",
            description: "ಎರಡು-ಅಲ್ಗಾರಿದಮ್ ಆರೋಗ್ಯ ಎಂಜಿನ್ — ಕಾರ್ಡ್‌ದಾರರಿಗೆ ರಿವಾರ್ಡ್ ದಕ್ಷತೆ, ಉಳಿದವರಿಗೆ ಆದಾಯ-ಹೆಚ್ಚುವರಿ ದಾರಿ. ನಿಜವಾದ ಸಂಖ್ಯೆಗಳು.",
          },
          {
            title: "ಆದಾಯ ಮತ್ತು ಬಜೆಟ್",
            description: "ಅನಿಯಮಿತ ಆದಾಯಕ್ಕೆ 90 ದಿನಗಳ ಚಲಿಸುವ ಮಧ್ಯಮ ಮೌಲ್ಯ. ಹೊಂದಿಸಬಹುದಾದ ವರ್ಗ ಬಜೆಟ್. ಒಮ್ಮೆಯ ಆದಾಯದ ಅವಧಿ ರಕ್ಷಣೆ.",
          },
          {
            title: "ಡಾಕ್ಯುಮೆಂಟ್ ಜಾಣ್ಮೆ",
            description: "ಬ್ಯಾಂಕ್ PDF ಸುತ್ತೋಲೆ ಮತ್ತು ಕಾರ್ಡ್ ಆಫರ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್‌ಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. CLIQ ಮರ್ಚೆಂಟ್, ರಿಯಾಯಿತಿ ಮತ್ತು ಪ್ರೋಮೋ ಕೋಡ್‌ಗಳನ್ನು ತಾನಾಗಿ ತೆಗೆಯುತ್ತದೆ.",
          },
          {
            title: "CLIQ Learn",
            description: "6 ಆರ್ಥಿಕ ಸಾಕ್ಷರತಾ ಮಾಡ್ಯೂಲ್‌ಗಳು, 5 ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು — EMI, ಕ್ರೆಡಿಟ್ ಬಳಕೆ, ಚಕ್ರಬಡ್ಡಿ. ಪ್ರತಿ ಬಳಕೆದಾರರ ಪ್ರಗತಿ ದಾಖಲು.",
          },
        ],
        privacyTitle: "ಪ್ರೈವಸಿ ಗೇಟ್‌ವೇ",
        privacyDescription: "ಪ್ರತಿ AI ಕರೆಗೂ ಮೊದಲು 9 PII ನಿಯಮಗಳು ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತವೆ. ಬಳಕೆದಾರರ ಒಪ್ಪಿಗೆ ಕಡ್ಡಾಯ. ಪ್ರತಿ AI ವಿನಂತಿ ಆಡಿಟ್ ಲಾಗ್‌ನಲ್ಲಿ. ಕಚ್ಚಾ ಡೇಟಾ ಹೊರಗೆ ಹೋಗುವುದಿಲ್ಲ.",
        privacyStats: ["PII ನಿಯಮಗಳು", "ಡೇಟಾ ಹೊರಹರಿವು", "ಆಡಿಟ್ ದಾಖಲು"],
      },
      privacy: {
        eyebrow: "ವಿನ್ಯಾಸದಲ್ಲೇ ಗೌಪ್ಯತೆ",
        titleLine1: "ನಿಮ್ಮ ಡೇಟಾ. ನಿಮ್ಮ ನಿಯಂತ್ರಣ.",
        titleAccent: "ಯಾವಾಗಲೂ.",
        subtitle: "CLIQ ನಲ್ಲಿ ಗೌಪ್ಯತೆ ನಂತರ ಸೇರಿಸಿದ್ದಲ್ಲ, ಮೂಲಭೂತ ಷರತ್ತು. ನಿಮ್ಮ ಮತ್ತು AI ನಡುವೆ ನಿಖರವಾಗಿ ಏನು ನಡೆಯುತ್ತದೆ ಎಂಬುದು ಇಲ್ಲಿದೆ.",
        steps: [
          {
            title: "ನೀವು ನಮೂದಿಸುತ್ತೀರಿ",
            body: "ನಿಮ್ಮ ಆದಾಯ, ಖರ್ಚು ಮತ್ತು ವಹಿವಾಟುಗಳು. ನೀವು ನಮೂದಿಸಲು ಆರಿಸಿದ್ದು ಮಾತ್ರ — ಖಾತೆ ಸ್ಕ್ರೇಪಿಂಗ್ ಇಲ್ಲ, ಬ್ಯಾಂಕ್ ಸಂಯೋಜನೆ ಇಲ್ಲ, ಸ್ವಯಂ ಸಂಗ್ರಹ ಇಲ್ಲ.",
          },
          {
            title: "9-ಹಂತದ PII ತೆಗೆದುಹಾಕುವಿಕೆ",
            body: "ಪ್ರತಿ AI ಕರೆಗೂ ಮೊದಲು CLIQ 9 ನಿಯಮಗಳನ್ನು ಚಲಾಯಿಸಿ ಕಾರ್ಡ್ ಸಂಖ್ಯೆ, CVV, OTP, ಆಧಾರ್, PAN, ಬ್ಯಾಂಕ್ ಖಾತೆ, ಇಮೇಲ್ ಮತ್ತು ಫೋನ್ ಸಂಖ್ಯೆಗಳನ್ನು ತೆಗೆದುಹಾಕುತ್ತದೆ.",
          },
          {
            title: "ಒಪ್ಪಿಗೆ ಆಧಾರಿತ AI",
            body: "ಪ್ರತಿ AI ವಿನಂತಿಗೂ ಮೊದಲು ನಿಮ್ಮ ಸ್ಪಷ್ಟ ಒಪ್ಪಿಗೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ. ಯಾವಾಗ ಬೇಕಾದರೂ ಒಪ್ಪಿಗೆ ಹಿಂಪಡೆಯಬಹುದು. AI ಕೇವಲ ಸರಳ ವಿವರಣೆಗೆ — ಲೆಕ್ಕಾಚಾರಕ್ಕೆ ಎಂದಿಗೂ ಅಲ್ಲ.",
          },
          {
            title: "ಬದಲಿಸಲಾಗದ ಆಡಿಟ್ ಲಾಗ್",
            body: "ಪ್ರತಿ AI ವಿನಂತಿಯೂ ಸೇರಿಸಲು-ಮಾತ್ರ ಆಡಿಟ್ ಕೋಷ್ಟಕದಲ್ಲಿ ದಾಖಲಾಗುತ್ತದೆ. ನಿಮ್ಮ ಪರವಾಗಿ ಮಾಡಿದ ಪ್ರತಿ ಪ್ರಶ್ನೆಯನ್ನೂ ನೀವು ನೋಡಬಹುದು. ಖಾತೆ ಅಳಿಸಿದಾಗ ಲಾಗ್‌ಗಳು ಅನಾಮಧೇಯಗೊಳ್ಳುತ್ತವೆ.",
          },
        ],
        trust: [
          "ಕಚ್ಚಾ PAN ಅಥವಾ CVV ಸಂಗ್ರಹವಿಲ್ಲ",
          "ಎಲ್ಲಾ ಕೋಷ್ಟಕಗಳಲ್ಲಿ Row-Level Security",
          "ನಿಮ್ಮ ಡೇಟಾ ನಿಮ್ಮದೇ — ಯಾವಾಗ ಬೇಕಾದರೂ ರಫ್ತು ಅಥವಾ ಅಳಿಸಿ",
          "ನಿಖರ ಗಣಿತ, AI ಕೇವಲ ವಿವರಣೆಗೆ",
        ],
      },
      closing: {
        stats: [
          "ಬೆಂಬಲಿತ ಭಾರತೀಯ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ಗಳು",
          "ಆರ್ಥಿಕ ಸಾಕ್ಷರತಾ ಮಾಡ್ಯೂಲ್‌ಗಳು",
          "PII ತೆಗೆದುಹಾಕುವ ನಿಯಮಗಳು",
          "ಗೌಪ್ಯತೆ-ಮೊದಲ ವಿನ್ಯಾಸ",
        ],
        eyebrow: "ನಿಮ್ಮ ಪಯಣ ಆರಂಭಿಸಿ",
        titleAccent: "ನಿಮ್ಮ ಹಣಕ್ಕೆ",
        titleRest: "ಉತ್ತಮ ಜಾಣ್ಮೆ",
        titleLine2: "ಸಿಗಬೇಕು.",
        subtitle: "ಪ್ರೀಮಿಯಂ ಕಾರ್ಡ್ ಇರಲಿ ಅಥವಾ ಆರ್ಥಿಕ ಪಯಣ ಈಗಷ್ಟೇ ಆರಂಭವಾಗಿರಲಿ — ಹಣವನ್ನು ಜಾಣ್ಮೆಯಿಂದ ನಿರ್ವಹಿಸುವ ಭಾರತೀಯರ ಜೊತೆ ಸೇರಿ.",
        ctaCreate: "ಉಚಿತ ಖಾತೆ ತೆರೆಯಿರಿ",
        ctaSignIn: "CLIQ ಗೆ ಸೈನ್ ಇನ್",
        trust: ["256-ಬಿಟ್ ಎನ್‌ಕ್ರಿಪ್ಶನ್", "ಆರಂಭಿಸಲು ಕಾರ್ಡ್ ಬೇಕಿಲ್ಲ", "EN · हिन्दी · ಕನ್ನಡ"],
        footerTagline: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಇರಲಿ ಇಲ್ಲದಿರಲಿ, ಪ್ರತಿಯೊಬ್ಬ ಭಾರತೀಯನಿಗೂ ಆರ್ಥಿಕ ಜಾಣ್ಮೆ.",
        footerTags: ["ಗೌಪ್ಯತೆ-ಮೊದಲು", "ಭಾರತದಲ್ಲಿ ನಿರ್ಮಿತ", "ಮುಕ್ತ ವೇದಿಕೆ"],
        footerPlatform: "ವೇದಿಕೆ",
        footerSecurity: "ಭದ್ರತೆ",
        footerLinks: ["ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ಗಳು", "ಆಫರ್‌ಗಳು", "AI ಸಹಾಯಕ", "CLIQ Learn", "ಬಜೆಟ್", "ವಿಶ್ಲೇಷಣೆ", "ಆರ್ಥಿಕ ಆರೋಗ್ಯ"],
        footerSecurityItems: ["PAN / CVV ಸಂಗ್ರಹ ಶೂನ್ಯ", "Row-Level Security", "9-ಹಂತದ PII ತೆಗೆದುಹಾಕುವಿಕೆ", "ಬದಲಿಸಲಾಗದ AI ಆಡಿಟ್ ಲಾಗ್"],
        footerCopyright: "CLIQ. ಭಾರತಕ್ಕಾಗಿ ನಿರ್ಮಿತ.",
        footerDisclaimer: "ನಿಖರ ಆರ್ಥಿಕ ಗಣಿತ · AI ಕೇವಲ ವಿವರಣೆಗೆ · ಲೆಕ್ಕಾಚಾರಕ್ಕೆ ಎಂದಿಗೂ ಅಲ್ಲ.",
      },
    },

    tagline: "ಹಣದ ನಿರ್ವಹಣೆ, ಈಗ ಸುಲಭ. ನಿಮ್ಮದೇ ಭಾಷೆಯಲ್ಲಿ.",
    supporting: "ಬುದ್ಧಿವಂತ ನಿರ್ಧಾರಗಳು, ಉಜ್ವಲ ಭವಿಷ್ಯ. ಪ್ರತಿಯೊಬ್ಬರಿಗೂ.",

    nav: {
      pathwayLabel: "ದಾರಿ",
      modeLabel: "ಮೋಡ್",
      modeCashSavings: "ನಗದು ಮತ್ತು ಉಳಿತಾಯ",
      modeCreditCards: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ಗಳು",
      switchToCardMode: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಮೋಡ್‌ಗೆ ಬದಲಿಸಿ",
      switchToCashMode: "ನಗದು ಮತ್ತು ಉಳಿತಾಯ ಮೋಡ್‌ಗೆ ಬದಲಿಸಿ",
      switchToCardsShort: "ಕಾರ್ಡ್ ಮೋಡ್‌ಗೆ ಬದಲಿಸಿ",
      switchToCashShort: "ನಗದು ಮತ್ತು ಉಳಿತಾಯಕ್ಕೆ ಬದಲಿಸಿ",
      switching: "ಬದಲಾಗುತ್ತಿದೆ...",
      myIncome: "ನನ್ನ ಆದಾಯ",
      expenseLog: "ಖರ್ಚು ದಾಖಲೆ",
      budgetPlanner: "ಬಜೆಟ್ ಯೋಜಕ",
      savingsGoals: "ಉಳಿತಾಯ ಗುರಿಗಳು",
      emergencyFund: "ತುರ್ತು ನಿಧಿ",
      subscriptions: "ಚಂದಾದಾರಿಕೆಗಳು ಮತ್ತು ಬಿಲ್‌ಗಳು",
      financialHealth: "ಆರ್ಥಿಕ ಆರೋಗ್ಯ",
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
      learn: "ಕಲಿಯಿರಿ (CLIQ Learn)",
      budget: "ಆದಾಯ ಮತ್ತು ಬಜೆಟ್",
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
      importCsvButton: "ಸ್ಟೇಟ್‌ಮೆಂಟ್ ಆಮದು ಮಾಡಿ (CSV)",
      importModalTitle: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್ ಆಮದು ಮಾಡಿ",
      selectCsvFile: "CSV ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ",
      selectCardOptional: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ಗೆ ನಿಯೋಜಿಸಿ (ಐಚ್ಛಿಕ)",
      dropCsvPrompt: "ಬ್ಯಾಂಕ್ CSV ಸ್ಟೇಟ್‌ಮೆಂಟ್ ಫೈಲ್ ಇಲ್ಲಿ ಆಯ್ಕೆಮಾಡಿ",
      parsingStatement: "ಸ್ಟೇಟ್‌ಮೆಂಟ್ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ ಮತ್ತು ಕಾಲಮ್ ಹೊಂದಿಸಲಾಗುತ್ತಿದೆ...",
      statementPreviewTitle: "ಸ್ಟೇಟ್‌ಮೆಂಟ್ ಮುನ್ನೋಟ ಮತ್ತು ಹೊಂದಾಣಿಕೆ",
      detectedBankFormat: "ಗುರುತಿಸಲಾದ ಬ್ಯಾಂಕ್ ಫಾರ್ಮ್ಯಾಟ್",
      validRowsCount: "ಆಮದಿಗೆ ಸಿದ್ಧವಾಗಿದೆ",
      duplicateRowsCount: "ನಕಲು (ಬಿಟ್ಟುಬಿಡಲಾಗಿದೆ)",
      ambiguousRowsCount: "ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ",
      invalidRowsCount: "ಅಮಾನ್ಯ ಸಾಲುಗಳು",
      confirmAndImport: "ಖಚಿತಪಡಿಸಿ ಮತ್ತು ಆಮದು ಮಾಡಿ",
      importing: "ವಹಿವಾಟುಗಳನ್ನು ಆಮದು ಮಾಡಲಾಗುತ್ತಿದೆ...",
      importSuccessMessage: "ಸ್ಟೇಟ್‌ಮೆಂಟ್ ವಹಿವಾಟುಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಆಮದು ಮಾಡಲಾಗಿದೆ.",
      statusNew: "ಹೊಸ ಖರೀದಿ",
      statusExactDuplicate: "ನಕಲು ಪತ್ತೆಯಾಗಿದೆ",
      statusAmbiguous: "ಖರೀದಿ ಪರಿಶೀಲಿಸಿ",
      statusInvalid: "ಅಮಾನ್ಯ ಮಾಹಿತಿ",
      statusExcluded: "ಪಾವತಿ / ಕ್ರೆಡಿಟ್",
      categoryReviewNeeded: "ವರ್ಗವನ್ನು ದೃಢೀಕರಿಸಿ. ಬದಲಾಯಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ.",
      skipDuplicates: "ಈಗಿರುವ ನಕಲಿ ವಹಿವಾಟುಗಳನ್ನು ಬಿಟ್ಟುಬಿಡಿ",
      originalDescription: "ಮೂಲ ಸ್ಟೇಟ್‌ಮೆಂಟ್ ವಿವರಣೆ",
      allRowsReady: "ಎಲ್ಲಾ ವಹಿವಾಟುಗಳು ಪರಿಶೀಲಿಸಲ್ಪಟ್ಟಿವೆ ಮತ್ತು ಆಮದಿಗೆ ಸಿದ್ಧವಾಗಿವೆ.",
      backToFileSelect: "ಮತ್ತೊಂದು ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
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
      continueButton: "ಮುಂದುವರಿಯಿರಿ",
      seedDemoButton: "ಮಾದರಿ ಕಾರ್ಡ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಿ",
      finishButton: "ಕಮಾಂಡ್ ಸೆಂಟರ್‌ಗೆ ಹೋಗಿ",
      seedingText: "ಪೋರ್ಟ್‌ಫೋಲಿಯೊ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
      portfolioHeading: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಪೋರ್ಟ್‌ಫೋಲಿಯೊ",
      portfolioSub: "ದೃಢೀಕರಿಸಿದ ಭಾರತೀಯ ಕಾರ್ಡ್‌ಗಳನ್ನು ಸೇರಿಸಿ ಅಥವಾ ಮಾದರಿ ಡೇಟಾದೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸಿ.",
      readyHeading: "ಎಲ್ಲವೂ ಸಿದ್ಧವಾಗಿದೆ!",
      readySub: "ನಿಮ್ಮ ಖಾತೆಯು ಸ್ಥಳೀಯ ಭದ್ರತೆ ಮತ್ತು ನಿಖರ ಗಣಿತ ಎಂಜಿನ್‌ಗಳಿಂದ ಸುರಕ್ಷಿತವಾಗಿದೆ.",
      stepPathTitle: "ಕಲಿಕೆಯ ದಾರಿ",
      pathwayHeading: "ನಿಮ್ಮ ಆರ್ಥಿಕ ದಾರಿಯನ್ನು ಆರಿಸಿ",
      pathwaySub: "CLIQ ತನ್ನ ಸೌಲಭ್ಯಗಳು, ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು ಮತ್ತು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಅನ್ನು ನಿಮ್ಮ ನಿಜವಾದ ಪಾವತಿ ಅಭ್ಯಾಸಗಳಿಗೆ ತಕ್ಕಂತೆ ಹೊಂದಿಸುತ್ತದೆ.",
      pathNoCardBadge: "ದಾರಿ B",
      pathNoCardTitle: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಇಲ್ಲದ ಬಳಕೆದಾರ",
      pathNoCardDesc: "ನಾನು UPI, ನಗದು, ಡೆಬಿಟ್ ಅಥವಾ ಬ್ಯಾಂಕ್ ವರ್ಗಾವಣೆ ಬಳಸುತ್ತೇನೆ. ನಗದು ಹರಿವು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು, ಅನಿಯಮಿತ ಆದಾಯ ನಿರ್ವಹಿಸಲು ಮತ್ತು ಉಳಿತಾಯದ ಶಿಸ್ತು ಬೆಳೆಸಲು ಸಹಾಯ ಮಾಡಿ.",
      pathCardBadge: "ದಾರಿ A",
      pathCardTitle: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಬಳಕೆದಾರ",
      pathCardDesc: "ನನ್ನ ಬಳಿ ಒಂದು ಅಥವಾ ಹೆಚ್ಚು ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ಗಳಿವೆ. ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್ ಮತ್ತು ರಿವಾರ್ಡ್ ಮೈಲ್ಸ್ ಹೆಚ್ಚಿಸಲು, ವಾರ್ಷಿಕ ಶುಲ್ಕ ಪರಿಶೀಲಿಸಲು ಮತ್ತು ಮರ್ಚೆಂಟ್ ಆಫರ್‌ಗಳನ್ನು ಹುಡುಕಲು ಸಹಾಯ ಮಾಡಿ.",
      primaryGoal: "ಮುಖ್ಯ ಗುರಿ",
      goalBasicsTitle: "ಮೂಲಭೂತ ಅಂಶಗಳನ್ನು ತಿಳಿಯಿರಿ",
      goalBasicsDesc: "ಬಜೆಟ್, ನಗದು ಹರಿವು, ಸಾಲದ ಅಪಾಯಗಳು",
      goalCreditTitle: "ಕ್ರೆಡಿಟ್ ಮತ್ತು ಸ್ಕೋರ್ ಕಲಿಯಿರಿ",
      goalCreditDesc: "ಕ್ರೆಡಿಟ್ ಸ್ಕೋರ್ ಮತ್ತು ಬಡ್ಡಿ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತವೆ",
      goalOptimizeTitle: "ಖರ್ಚನ್ನು ಸುಧಾರಿಸಿ",
      goalOptimizeDesc: "ಸ್ಮಾರ್ಟ್ ರಿವಾರ್ಡ್ ಮತ್ತು ಖರ್ಚು ಟ್ರ್ಯಾಕಿಂಗ್",
      backButton: "ಹಿಂದೆ",
      activatingButton: "ದಾರಿ ಸಕ್ರಿಯಗೊಳ್ಳುತ್ತಿದೆ...",
      readyNoCardSub: "ನಿಮ್ಮ ನಗದು ಮತ್ತು ಉಳಿತಾಯ ವರ್ಕ್‌ಸ್ಪೇಸ್ ಸಕ್ರಿಯವಾಗಿದೆ. ನಿಮ್ಮ ನಗದು ಹರಿವು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ, ಕಾರ್ಡ್ ರಹಿತ ಖರ್ಚನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು 50/30/20 ಬಜೆಟ್ ಚೌಕಟ್ಟನ್ನು ಸುಲಭವಾಗಿ ಅನುಸರಿಸಿ.",
      readyCardSub: "ನಿಮ್ಮ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಕಮಾಂಡ್ ಸೆಂಟರ್ ಸಿದ್ಧವಾಗಿದೆ. ಯಾವಾಗ ಬೇಕಾದರೂ ಕಾರ್ಡ್‌ಗಳನ್ನು ಸೇರಿಸಿ, ರಿವಾರ್ಡ್ ಹೆಚ್ಚಿಸಿ ಮತ್ತು ವೈಯಕ್ತಿಕ ಮರ್ಚೆಂಟ್ ರಿಯಾಯಿತಿಗಳನ್ನು ನೋಡಿ.",
      goNoCardButton: "ವೈಯಕ್ತಿಕ ಹಣಕಾಸು ಕಮಾಂಡ್ ಸೆಂಟರ್‌ಗೆ ಹೋಗಿ",
      goCardButton: "ಕಮಾಂಡ್ ಸೆಂಟರ್‌ಗೆ ಹೋಗಿ",
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
      health: "ಆರೋಗ್ಯ ಮತ್ತು ಔಷಧಾಲಯ",
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

    learn: {
      title: "ಹಣಕಾಸು ಒಳಗೊಳ್ಳುವಿಕೆ ಮತ್ತು CLIQ ಕಲಿಯಿರಿ",
      subtitle: "ಪ್ರತಿಯೊಬ್ಬರಿಗೂ ಸಾಲ-ಮುಕ್ತ ಜೀವನ, ಆರ್ಥಿಕ ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ತಿಳುವಳಿಕೆಯ ಹಣಕಾಸು ನಿರ್ಧಾರಗಳು.",
      badge: "ಹಣಕಾಸು ಒಳಗೊಳ್ಳುವಿಕೆ ವೇದಿಕೆ",
      tabCurriculum: "ಪಠ್ಯಕ್ರಮ ಮತ್ತು ಪಾಠಗಳು",
      tabCalculators: "ಸಂವಾದಾತ್ಮಕ ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು",
      tabProgress: "ನನ್ನ ಕಲಿಕೆಯ ಪ್ರಗತಿ",
      categoriesTitle: "ಕಲಿಕೆಯ ವಿಭಾಗಗಳು",
      allCategories: "ಎಲ್ಲಾ ವಿಭಾಗಗಳು",
      readingTime: "ನಿಮಿಷ ಓದು",
      startLesson: "ಪಾಠ ಪ್ರಾರಂಭಿಸಿ",
      completedBadge: "ಪೂರ್ಣಗೊಂಡಿದೆ",
      readLesson: "ಪಾಠ ಓದಿ",
      keyTakeawaysTitle: "ಮುಖ್ಯ ಕಲಿಕೆಗಳು",
      knowledgeCheckTitle: "ಜ್ಞಾನ ಪರೀಕ್ಷೆ (ರಸಪ್ರಶ್ನೆ)",
      submitQuiz: "ಉತ್ತರಗಳನ್ನು ಸಲ್ಲಿಸಿ",
      quizPassed: "ಅಭಿನಂದನೆಗಳು! ನೀವು ರಸಪ್ರಶ್ನೆಯಲ್ಲಿ ಯಶಸ್ವಿಯಾಗಿದ್ದೀರಿ.",
      quizTryAgain: "ಕೆಲವು ಉತ್ತರಗಳು ತಪ್ಪಾಗಿವೆ. ಪಾಠವನ್ನು ಮತ್ತೊಮ್ಮೆ ಓದಿ ಪ್ರಯತ್ನಿಸಿ.",
      nextLesson: "ಮುಂದಿನ ಪಾಠ",
      prevLesson: "ಹಿಂದಿನ ಪಾಠ",
      backToLessons: "ಎಲ್ಲಾ ಪಾಠಗಳಿಗೆ ಹಿಂತಿರುಗಿ",
      // Calculators
      calcInterestTitle: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಬಡ್ಡಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
      calcInterestDesc: "ಬಾಕಿ ಮೊತ್ತದ ಮೇಲೆ ವಾರ್ಷಿಕ ಬಡ್ಡಿದರ (APR) ಮತ್ತು ಮಾಸಿಕ ಶುಲ್ಕಗಳು ಹೇಗೆ ಬೆಳೆಯುತ್ತವೆ ಎಂಬುದನ್ನು ಲೆಕ್ಕಹಾಕಿ.",
      calcMinDueTitle: "ಕನಿಷ್ಠ ಪಾವತಿ ಅಪಾಯದ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
      calcMinDueDesc: "ಕೇವಲ 5% ಕನಿಷ್ಠ ಮೊತ್ತ ಪಾವತಿಸುವುದರಿಂದ ಹೇಗೆ ವರ್ಷಗಟ್ಟಲೆ ಸಾಲದಲ್ಲಿ ಸಿಲುಕಿಕೊಳ್ಳುತ್ತೀರಿ ಎಂದು ತಿಳಿಯಿರಿ.",
      calcBudgetTitle: "50-30-20 ಮಾಸಿಕ ಬಜೆಟ್ ಯೋಜಕ",
      calcBudgetDesc: "ನಿಮ್ಮ ಆದಾಯವನ್ನು ಅಗತ್ಯಗಳು (50%), ಇಷ್ಟಗಳು (30%) ಮತ್ತು ಉಳಿತಾಯ (20%) ಎಂದು ವಿಂಗಡಿಸಿ.",
      calcUtilizationTitle: "ಕ್ರೆಡಿಟ್ ಮಿತಿ ಬಳಕೆ ಆರೋಗ್ಯ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
      calcUtilizationDesc: "ನಿಮ್ಮ ಬಳಕೆಯ ಶೇಕಡಾವಾರು ಪರಿಶೀಲಿಸಿ ಮತ್ತು 30% ನಿಯಮವು CIBIL ಸ್ಕೋರ್ ಅನ್ನು ಹೇಗೆ ರಕ್ಷಿಸುತ್ತದೆ ಎಂಬುದನ್ನು ತಿಳಿಯಿರಿ.",
      calcBreakEvenTitle: "ಕಾರ್ಡ್ ವಾರ್ಷಿಕ ಶುಲ್ಕ ಬ್ರೇಕ್-ಈವನ್ ಮೌಲ್ಯಮಾಪನ",
      calcBreakEvenDesc: "ವಾರ್ಷಿಕ ಕಾರ್ಡ್ ಶುಲ್ಕವನ್ನು ಸಮರ್ಥಿಸಲು ತಿಂಗಳಿಗೆ ಎಷ್ಟು ಖರ್ಚು ಮಾಡಬೇಕೆಂದು ಲೆಕ್ಕಹಾಕಿ.",
      // Calculator Form Labels
      balanceLabel: "ಬಾಕಿ ಮೊತ್ತ (₹)",
      aprLabel: "ವಾರ್ಷಿಕ ಬಡ್ಡಿದರ (APR %)",
      monthlyPaymentLabel: "ಯೋಜಿತ ಮಾಸಿಕ ಪಾವತಿ (₹)",
      newChargesLabel: "ತಿಂಗಳ ಹೊಸ ಖರೀದಿಗಳು (₹)",
      calculateButton: "ಲೆಕ್ಕಹಾಕಿ",
      calculating: "ಲೆಕ್ಕಾಚಾರ ನಡೆಯುತ್ತಿದೆ...",
      totalInterestPaid: "ಒಟ್ಟು ಪಾವತಿಸಿದ ಬಡ್ಡಿ",
      totalAmountPaid: "ಒಟ್ಟು ಪಾವತಿಸಿದ ಮೊತ್ತ",
      monthsToPayoff: "ಸಾಲ ತೀರಿಸಲು ಬೇಕಾದ ತಿಂಗಳುಗಳು",
      perpetualDebtWarning: "ಶಾಶ್ವತ ಸಾಲದ ಎಚ್ಚರಿಕೆ: ನಿಮ್ಮ ಪಾವತಿ ಮಾಸಿಕ ಬಡ್ಡಿಗಿಂತ ಕಡಿಮೆಯಿದೆ, ಈ ಸಾಲ ಎಂದಿಗೂ ತೀರುವುದಿಲ್ಲ!",
      amortizationSample: "ಪಾವತಿ ವೇಳಾಪಟ್ಟಿ ಮಾದರಿ (ಮೊದಲ 12 ತಿಂಗಳುಗಳು)",
      minPaymentNotice: "ಪಾವತಿ ವಿಧಾನಗಳ ಹೋಲಿಕೆ",
      scenarioInFull: "ಸಂಪೂರ್ಣ ಮೊತ್ತವನ್ನು ಒಮ್ಮೆಲೇ ಪಾವತಿಸುವುದು",
      scenarioMinOnly: "ಕೇವಲ ಕನಿಷ್ಠ ಮೊತ್ತ (5%) ಪಾವತಿಸುವುದು",
      scenarioFixed: "ಸ್ಥಿರ ತ್ವರಿತ ಮೊತ್ತವನ್ನು ಪಾವತಿಸುವುದು",
      monthlyIncomeLabel: "ಮಾಸಿಕ ನಿವ್ವಳ ಆದಾಯ (₹)",
      allocatedTotal: "ಒಟ್ಟು ಹಂಚಿಕೆಯಾದ ಮೊತ್ತ",
      needsLabel: "ಅಗತ್ಯ ವೆಚ್ಚಗಳು (50%)",
      wantsLabel: "ಜೀವನಶೈಲಿ ವೆಚ್ಚಗಳು (30%)",
      savingsLabel: "ಉಳಿತಾಯ ಮತ್ತು ಹೂಡಿಕೆ (20%)",
      totalLimitLabel: "ಒಟ್ಟು ಕ್ರೆಡಿಟ್ ಮಿತಿ (₹)",
      currentBalanceLabel: "ಪ್ರಸ್ತುತ ಒಟ್ಟು ಬಾಕಿ (₹)",
      utilizationRateLabel: "ಕ್ರೆಡಿಟ್ ಮಿತಿ ಬಳಕೆಯ ದರ",
      utilizationStatusIdeal: "ಉತ್ತಮ ಬಳಕೆ (<30%)",
      utilizationStatusHigh: "ಅಧಿಕ ಬಳಕೆ (>50%)",
      targetBalance30: "30% ಗುರಿಗಾಗಿ ಗರಿಷ್ಠ ಬಾಕಿ",
      annualFeeLabel: "ಕಾರ್ಡ್ ವಾರ್ಷಿಕ ಶುಲ್ಕ (₹)",
      monthlySpendLabel: "ಅಂದಾಜು ಮಾಸಿಕ ಖರ್ಚು (₹)",
      rewardRateLabel: "ಪರಿಣಾಮಕಾರಿ ರಿವಾರ್ಡ್ ದರ (%)",
      milestoneBenefitsLabel: "ವಾರ್ಷಿಕ ಮೈಲಿಗಲ್ಲು ಪ್ರಯೋಜನಗಳ ಮೌಲ್ಯ (₹)",
      breakEvenMonthlySpend: "ಶುಲ್ಕ ಸಮರ್ಥನೆಗೆ ಬೇಕಾದ ಮಾಸಿಕ ಖರ್ಚು",
      netBenefitLabel: "ವಾರ್ಷಿಕ ನಿವ್ವಳ ಲಾಭ",
      disclaimerPrefix: "ಹಕ್ಕುತ್ಯಾಗ: ಈ ಲೆಕ್ಕಾಚಾರಗಳು ಕೇವಲ ಶೈಕ್ಷಣಿಕ ಮತ್ತು ತಿಳುವಳಿಕೆಯ ಉದ್ದೇಶಕ್ಕಾಗಿ ಮಾತ್ರ.",
      // Progress & Onboarding
      overallProgressTitle: "ಒಟ್ಟಾರೆ ಕಲಿಕೆಯ ಪ್ರಗತಿ",
      masteredTopics: "ಪೂರ್ಣಗೊಂಡ ಪಾಠಗಳು",
      averageScore: "ಸರಾಸರಿ ರಸಪ್ರಶ್ನೆ ಅಂಕ",
      categoryProgress: "ವಿಭಾಗವಾರು ಪ್ರಗತಿ",
      pathTitle: "ನಿಮ್ಮ ಹಣಕಾಸು ಕಲಿಕೆಯ ಪ್ರಯಾಣ",
      pathDesc: "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಹಣಕಾಸು ಸ್ಥಿತಿ ಮತ್ತು ಗುರಿಗಳಿಗೆ ಅನುಗುಣವಾಗಿ CLIQ ನಿಮ್ಮ ಅನುಭವವನ್ನು ರೂಪಿಸುತ್ತದೆ.",
      pathNewToFinance: "ಹಣಕಾಸು ನಿರ್ವಹಣೆಗೆ ಹೊಸಬರು",
      pathNewToFinanceDesc: "ಬಜೆಟ್ ತಯಾರಿ, ತುರ್ತು ನಿಧಿ, ಉಳಿತಾಯ ಅಭ್ಯಾಸಗಳು ಮತ್ತು ವಂಚನೆ ತಡೆಗಟ್ಟುವಿಕೆಯಿಂದ ಪ್ರಾರಂಭಿಸಿ.",
      pathUnderstandCredit: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಬಯಸುವವರು",
      pathUnderstandCreditDesc: "ಕಾರ್ಡ್ ಪಡೆಯುವ ಮುನ್ನ ಬಿಲ್ಲಿಂಗ್ ಚಕ್ರ, ರಿಯಾಯಿತಿ ಅವಧಿ, ಬಡ್ಡಿ ನಿಯಂತ್ರಣ ಮತ್ತು ಸಿಬಿಲ್ ಸ್ಕೋರ್ ತಿಳಿಯಿರಿ.",
      pathOptimizeExisting: "ಪ್ರಸ್ತುತ ಉತ್ಪನ್ನಗಳನ್ನು ಅತ್ಯುತ್ತಮವಾಗಿಸಲು",
      pathOptimizeExistingDesc: "ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್ ಹೆಚ್ಚಿಸಿಕೊಳ್ಳಿ, ರಿವಾರ್ಡ್ ಮಿತಿಗಳನ್ನು ಗಮನಿಸಿ ಮತ್ತು ವಾರ್ಷಿಕ ಶುಲ್ಕಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
      switchPath: "ಕಲಿಕೆಯ ಮಾರ್ಗ ಬದಲಾಯಿಸಿ",
      pathUpdatedSuccess: "ಹಣಕಾಸು ಕಲಿಕೆಯ ಮಾರ್ಗ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!",
    },

    incomes: {
      title: "ಆದಾಯ ಮತ್ತು ಬಜೆಟ್ ನಿಯಂತ್ರಣ",
      subtitle: "ಹಣದ ಹರಿವು ಟ್ರ್ಯಾಕಿಂಗ್, ನಿಯಮಿತ ಮತ್ತು ಅನಿಯಮಿತ ಗಳಿಕೆಗಳು ಮತ್ತು ಶಿಸ್ತಿನ 50/30/20 ಬಜೆಟ್",
      addIncome: "ಆದಾಯದ ಮೂಲ ಸೇರಿಸಿ",
      totalMonthlyInflow: "ಒಟ್ಟು ಮಾಸಿಕ ಒಳಹರಿವು",
      activeStreams: "ಸಕ್ರಿಯ ಮೂಲಗಳು",
      rollingMedian: "90-ದಿನಗಳ ಸರಾಸರಿ",
      recordedOutflow: "ದಾಖಲಾದ ಖರ್ಚು",
      transactionsCount: "ವಹಿವಾಟುಗಳು",
      nonCardAndCard: "ಕಾರ್ಡ್ ರಹಿತ ಮತ್ತು ಕಾರ್ಡ್",
      netCashFlow: "ನಿವ್ವಳ ನಗದು ಹರಿವು",
      surplusRetained: "ಉಳಿತಾಯ ಹೆಚ್ಚುವರಿ",
      deficitAlert: "ಕೊರತೆ ಎಚ್ಚರಿಕೆ",
      monthlyNet: "ಮಾಸಿಕ ನಿವ್ವಳ",
      savingsRate: "ಉಳಿತಾಯ ದರ",
      healthyRate: "ಆರೋಗ್ಯಕರ (>20%)",
      targetRate: "ಗುರಿ: 20%+",
      rule503020: "50/30/20 ನಿಯಮ",
      spendingDiscipline: "ಮಾಸಿಕ ಖರ್ಚು ಶಿಸ್ತು ಮತ್ತು ಬಜೆಟ್",
      targetMonthlyLimit: "ಗುರಿ ಮಾಸಿಕ ಮಿತಿ",
      spent: "ಖರ್ಚು",
      updateLimit: "ನವೀಕರಿಸಿ",
      savingLimit: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
      budgetUpdatedSuccess: "ಬಜೆಟ್ ಗುರಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.",
      activeIncomeStreams: "ಸಕ್ರಿಯ ಆದಾಯ ಮೂಲಗಳು",
      sourcesRegistered: "ಮೂಲಗಳು ನೋಂದಾಯಿಸಲಾಗಿದೆ",
      noIncomeAdded: "ಇನ್ನೂ ಯಾವುದೇ ಆದಾಯ ಮೂಲಗಳನ್ನು ಸೇರಿಸಲಾಗಿಲ್ಲ",
      noIncomeDesc: "ನಗದು ಹರಿವಿನ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ನಿಮ್ಮ ಸಂಬಳ, ಫ್ರೀಲ್ಯಾನ್ಸ್ ಗಳಿಕೆ ಅಥವಾ ವ್ಯವಹಾರದ ಆದಾಯವನ್ನು ಸೇರಿಸಿ.",
      addFirstIncome: "ಮೊದಲ ಆದಾಯ ಸೇರಿಸಿ",
      irregularVariable: "ಅನಿಯಮಿತ / ಬದಲಾಗುವ",
      perCycle: "ಪ್ರತಿ ಸೈಕಲ್",
      oneTimeEntry: "ಒಂದು ಬಾರಿಯ ನಮೂದು",
      deleteConfirm: "ನೀವು ಖಚಿತವಾಗಿ ಈ ಆದಾಯದ ಮೂಲವನ್ನು ತೆಗೆದುಹಾಕಲು ಬಯಸುವಿರಾ?",
      recordNewIncome: "ಹೊಸ ಆದಾಯ ಮೂಲ ದಾಖಲಿಸಿ",
      sourceName: "ಮೂಲದ ಹೆಸರು",
      sourcePlaceholder: "ಉದಾ. ಪ್ರಾಥಮಿಕ ಕೆಲಸ, ಸಲಹಾ, ಬಾಡಿಗೆ",
      amount: "ಮೊತ್ತ (₹)",
      cadenceFrequency: "ಆವರ್ತನ",
      monthly: "ಮಾಸಿಕ",
      biWeekly: "ದ್ವೈವಾರ್ಷಿಕ/ಪಾಕ್ಷಿಕ",
      weekly: "ವಾರಕ್ಕೊಮ್ಮೆ",
      irregular: "ಅನಿಯಮಿತ",
      oneTime: "ಒಂದು ಬಾರಿ",
      variableStream: "ಬದಲಾಗುವ / ಅನಿಯಮಿತ ಸ್ಟ್ರೀಮ್ (ಫ್ರೀಲ್ಯಾನ್ಸ್)",
      notesOptional: "ಟಿಪ್ಪಣಿಗಳು (ಐಚ್ಛಿಕ)",
      notesPlaceholder: "ಉದಾ. Q4 ಒಪ್ಪಂದ ನವೀಕರಣ",
      cancel: "ರದ್ದುಮಾಡಿ",
      saveIncome: "ಆದಾಯ ಉಳಿಸಿ",
      saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
      recordQuickExpense: "ತ್ವರಿತ ಖರ್ಚು ದಾಖಲಿಸಿ (ಕಾರ್ಡ್ ರಹಿತ)",
      quickExpenseDesc: "ನಿಮ್ಮ ಬಜೆಟ್ ಮತ್ತು ನಗದು ಹರಿವನ್ನು ನವೀಕರಿಸಲು ನಗದು, UPI ಅಥವಾ ಡೆಬಿಟ್ ಖರ್ಚುಗಳನ್ನು ನಮೂದಿಸಿ.",
      expenseLoggedSuccess: "ಖರ್ಚನ್ನು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ.",
      merchantDesc: "ವ್ಯಾಪಾರಿ / ವಿವರಣೆ",
      merchantPlaceholder: "ಉದಾ. ಸ್ಥಳೀಯ ಕಿರಾಣಿ, ಮೆಟ್ರೋ, ಚಹಾ",
      method: "ಪಾವತಿ ವಿಧಾನ",
      category: "ವರ್ಗ",
      recordExpense: "ಖರ್ಚು ದಾಖಲಿಸಿ",
      paymentMethodBreakdown: "ಪಾವತಿ ವಿಧಾನ ವಿವರಣೆ",
      loadingData: "ನಗದು ಹರಿವು ಮತ್ತು ಬಜೆಟ್ ಡೇಟಾ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    },
  },
};
