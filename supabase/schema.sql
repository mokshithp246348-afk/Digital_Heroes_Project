-- ==============================================================================
-- DIGITAL HEROES - SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- Edition 2026 (PRD Level 1)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'subscriber' CHECK (role IN ('visitor', 'subscriber', 'admin')),
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'lapsed')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  subscription_renewal_date TIMESTAMPTZ,
  charity_id UUID,
  charity_contribution_pct INTEGER NOT NULL DEFAULT 10 CHECK (charity_contribution_pct >= 10 AND charity_contribution_pct <= 100),
  handicap NUMERIC(4,1) DEFAULT 14.5,
  home_club TEXT DEFAULT 'St. Andrews Links',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CHARITIES TABLE (§ 08)
CREATE TABLE IF NOT EXISTS public.charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Health & Medical', 'Youth & Children', 'Veterans & Heroes', 'Environment', 'Community Impact')),
  description TEXT NOT NULL,
  impact_story TEXT NOT NULL,
  image_url TEXT NOT NULL,
  website_url TEXT NOT NULL,
  is_spotlight BOOLEAN DEFAULT FALSE,
  total_raised NUMERIC(12,2) DEFAULT 0.00,
  supporter_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CHARITY EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.charity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  charity_id UUID REFERENCES public.charities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  ticket_price NUMERIC(10,2) DEFAULT 0.00,
  spots_left INTEGER DEFAULT 36,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. GOLF SCORES TABLE (§ 05 - Stableford 1-45, 1 score per date per user)
CREATE TABLE IF NOT EXISTS public.golf_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  score_date DATE NOT NULL,
  course_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Constraint: Only one score entry is permitted per date per user
  CONSTRAINT unique_user_score_date UNIQUE (user_id, score_date)
);

-- Index for retrieving rolling scores efficiently
CREATE INDEX IF NOT EXISTS idx_golf_scores_user_date ON public.golf_scores (user_id, score_date DESC);

-- 6. DRAWS TABLE (§ 06 & § 07)
CREATE TABLE IF NOT EXISTS public.draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  month_year TEXT NOT NULL UNIQUE, -- 'YYYY-MM'
  draw_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'simulated', 'published')),
  draw_logic TEXT NOT NULL DEFAULT 'random' CHECK (draw_logic IN ('random', 'algorithmic')),
  winning_numbers INTEGER[] DEFAULT '{}',
  total_prize_pool NUMERIC(12,2) DEFAULT 0.00,
  jackpot_pool NUMERIC(12,2) DEFAULT 0.00, -- 40% + rollover
  tier4_pool NUMERIC(12,2) DEFAULT 0.00,   -- 35%
  tier3_pool NUMERIC(12,2) DEFAULT 0.00,   -- 25%
  rollover_from_previous NUMERIC(12,2) DEFAULT 0.00,
  rollover_to_next NUMERIC(12,2) DEFAULT 0.00,
  total_subscribers_entered INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. WINNERS TABLE (§ 09 - Winner Verification System)
CREATE TABLE IF NOT EXISTS public.winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN ('5_match', '4_match', '3_match')),
  matched_numbers INTEGER[] NOT NULL,
  user_scores_at_draw INTEGER[] NOT NULL,
  prize_amount NUMERIC(12,2) NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  proof_image_url TEXT,
  proof_uploaded_at TIMESTAMPTZ,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  paid_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DIRECT DONATIONS TABLE (§ 08.1)
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  charity_id UUID REFERENCES public.charities(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  is_independent BOOLEAN DEFAULT TRUE,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.golf_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Charities & Events: Publicly readable by all
CREATE POLICY "Charities viewable by everyone" ON public.charities FOR SELECT USING (true);
CREATE POLICY "Charity events viewable by everyone" ON public.charity_events FOR SELECT USING (true);

-- Draws: Viewable by everyone
CREATE POLICY "Draws viewable by everyone" ON public.draws FOR SELECT USING (true);

-- Scores: Users can read and modify their own scores
CREATE POLICY "Users can manage own scores" ON public.golf_scores 
  FOR ALL USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = golf_scores.user_id));

-- Winners: Viewable by all (transparency), update proof by owner, verification by admin
CREATE POLICY "Winners viewable by all" ON public.winners FOR SELECT USING (true);
CREATE POLICY "Users can upload proof for won prize" ON public.winners 
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = winners.user_id));

-- Admin full access policy
CREATE POLICY "Admins have full access" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);
