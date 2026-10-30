-- ==============================================================================
-- CLIQ Production Supabase PostgreSQL Migration (001_initial_schema.sql)
-- Enforces Row Level Security (RLS) and Tenant Isolation
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    preferred_language VARCHAR(10) DEFAULT 'en' NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Credit Cards Table
CREATE TABLE IF NOT EXISTS public.credit_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    card_name VARCHAR(128) NOT NULL,
    bank_name VARCHAR(128) NOT NULL,
    network VARCHAR(32) DEFAULT 'VISA' NOT NULL,
    card_type VARCHAR(32) DEFAULT 'CREDIT' NOT NULL,
    last_four_digits VARCHAR(4),
    annual_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    renewal_waiver_spend NUMERIC(12, 2),
    billing_cycle_day INTEGER,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Card Reward Rules Table
CREATE TABLE IF NOT EXISTS public.card_reward_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES public.credit_cards(id) ON DELETE CASCADE,
    category_id VARCHAR(64),
    merchant_pattern VARCHAR(128),
    reward_type VARCHAR(32) DEFAULT 'CASHBACK' NOT NULL,
    reward_rate_percentage NUMERIC(5, 2) NOT NULL,
    point_monetary_value NUMERIC(6, 4) DEFAULT 1.0000 NOT NULL,
    min_transaction_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    max_reward_per_transaction NUMERIC(10, 2),
    monthly_cap_amount NUMERIC(10, 2),
    is_excluded BOOLEAN DEFAULT FALSE NOT NULL,
    exclusion_reason VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Card Benefits Table
CREATE TABLE IF NOT EXISTS public.card_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES public.credit_cards(id) ON DELETE CASCADE,
    benefit_type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    annual_value_estimate NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Spending Categories Table
CREATE TABLE IF NOT EXISTS public.spending_categories (
    id VARCHAR(64) PRIMARY KEY,
    display_name_en VARCHAR(128) NOT NULL,
    display_name_hi VARCHAR(128) NOT NULL,
    display_name_kn VARCHAR(128) NOT NULL,
    icon_name VARCHAR(64) DEFAULT 'Tag' NOT NULL,
    description VARCHAR(255)
);

-- 6. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    card_id UUID REFERENCES public.credit_cards(id) ON DELETE SET NULL,
    category_id VARCHAR(64) NOT NULL REFERENCES public.spending_categories(id),
    merchant_name VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    transaction_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE NOT NULL,
    reward_earned_monetary NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    potential_optimal_reward NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    optimal_card_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Uploaded Documents Table
CREATE TABLE IF NOT EXISTS public.uploaded_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    mime_type VARCHAR(64) NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    processing_status VARCHAR(32) DEFAULT 'PENDING' NOT NULL,
    error_message TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Extracted Card Data (Staging Table)
CREATE TABLE IF NOT EXISTS public.extracted_card_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID UNIQUE NOT NULL REFERENCES public.uploaded_documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    extracted_card_name VARCHAR(128),
    extracted_bank_name VARCHAR(128),
    extracted_network VARCHAR(32),
    extracted_annual_fee NUMERIC(10, 2),
    extracted_rules_json TEXT DEFAULT '[]' NOT NULL,
    extracted_benefits_json TEXT DEFAULT '[]',
    confidence_score NUMERIC(4, 2) DEFAULT 0.85 NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Reward Analysis Table
CREATE TABLE IF NOT EXISTS public.reward_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    transaction_amount NUMERIC(12, 2) NOT NULL,
    category_id VARCHAR(64) NOT NULL,
    merchant_name VARCHAR(255),
    recommended_card_id UUID,
    recommended_card_name VARCHAR(128) NOT NULL,
    expected_monetary_reward NUMERIC(10, 2) NOT NULL,
    effective_reward_rate NUMERIC(5, 2) NOT NULL,
    calculation_breakdown_json TEXT NOT NULL,
    alternatives_json TEXT DEFAULT '[]' NOT NULL,
    queried_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    prioritize_cashback BOOLEAN DEFAULT TRUE NOT NULL,
    prioritize_miles BOOLEAN DEFAULT FALSE NOT NULL,
    include_annual_fee_in_net BOOLEAN DEFAULT FALSE NOT NULL,
    monthly_spend_target NUMERIC(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(128) NOT NULL,
    ip_address VARCHAR(64),
    user_agent VARCHAR(255),
    status VARCHAR(32) DEFAULT 'SUCCESS' NOT NULL,
    details_json TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_reward_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_card_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policy
CREATE POLICY "Users can view and update their own profile"
    ON public.profiles FOR ALL
    USING (auth.uid() = id);

-- Credit Cards Policy
CREATE POLICY "Users can only access their own credit cards"
    ON public.credit_cards FOR ALL
    USING (auth.uid() = user_id);

-- Transactions Policy
CREATE POLICY "Users can only access their own transactions"
    ON public.transactions FOR ALL
    USING (auth.uid() = user_id);

-- Uploaded Documents Policy
CREATE POLICY "Users can only access their own documents"
    ON public.uploaded_documents FOR ALL
    USING (auth.uid() = user_id);

-- Extracted Card Data Policy
CREATE POLICY "Users can only access their own staged card data"
    ON public.extracted_card_data FOR ALL
    USING (auth.uid() = user_id);

-- Reward Analysis Policy
CREATE POLICY "Users can only view their own optimization history"
    ON public.reward_analysis FOR ALL
    USING (auth.uid() = user_id);

-- User Preferences Policy
CREATE POLICY "Users can only access their own preferences"
    ON public.user_preferences FOR ALL
    USING (auth.uid() = user_id);
