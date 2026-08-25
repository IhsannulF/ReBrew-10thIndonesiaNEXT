-- ==============================================================================
-- REBREW DATABASE SCHEMA (SUPABASE POSTGRES)
-- Waste Management-as-a-Service (WMaaS) & Circular Economy Platform
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean up existing tables to avoid type mismatch conflicts
DROP TABLE IF EXISTS public.user_badges CASCADE;
DROP TABLE IF EXISTS public.daily_missions CASCADE;
DROP TABLE IF EXISTS public.eco_badges CASCADE;
DROP TABLE IF EXISTS public.monthly_targets CASCADE;
DROP TABLE IF EXISTS public.payouts CASCADE;
DROP TABLE IF EXISTS public.transaction_items CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.drop_points CASCADE;
DROP TABLE IF EXISTS public.partners CASCADE;
DROP TABLE IF EXISTS public.waste_categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'mitra', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE cafe_tier AS ENUM ('starter', '1_ton_club', 'enterprise');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE deposit_method AS ENUM ('drop_point', 'dijemput');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payout_status AS ENUM ('processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE partner_type AS ENUM ('coffee_shop', 'drop_point', 'off_taker', 'micro_hub');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE badge_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABLE: profiles (Extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'mitra',
  cafe_name TEXT,
  tier cafe_tier DEFAULT 'starter',
  city TEXT DEFAULT 'Surabaya',
  saldo_poin INTEGER DEFAULT 0 CHECK (saldo_poin >= 0),
  total_kg NUMERIC(10, 2) DEFAULT 0.00 CHECK (total_kg >= 0),
  active_streak_days INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE: waste_categories
CREATE TABLE public.waste_categories (
  id TEXT PRIMARY KEY, -- e.g. 'cup-plastik', 'botol-plastik'
  name TEXT NOT NULL,
  category_group TEXT NOT NULL,
  point_per_kg INTEGER NOT NULL CHECK (point_per_kg > 0),
  co2_factor NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
  icon TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE: partners
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type partner_type NOT NULL,
  tier cafe_tier DEFAULT 'starter',
  city TEXT DEFAULT 'Surabaya',
  contact_person TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE: drop_points
CREATE TABLE public.drop_points (
  id TEXT PRIMARY KEY, -- e.g. 'dp-1'
  partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT DEFAULT 'Surabaya',
  distance_hint TEXT,
  operating_hours TEXT NOT NULL,
  lat NUMERIC(10, 6),
  lng NUMERIC(10, 6),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLE: transactions (Setor Sampah)
CREATE TABLE public.transactions (
  id TEXT PRIMARY KEY, -- e.g. 'RB-984210'
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  drop_point_id TEXT REFERENCES public.drop_points(id) ON DELETE SET NULL,
  method deposit_method NOT NULL DEFAULT 'drop_point',
  pickup_address TEXT,
  total_weight_kg NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
  total_points INTEGER NOT NULL DEFAULT 0,
  total_co2_kg NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
  status transaction_status NOT NULL DEFAULT 'pending',
  scale_model TEXT,
  collector_name TEXT,
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLE: transaction_items
CREATE TABLE public.transaction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id TEXT NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES public.waste_categories(id) ON DELETE RESTRICT,
  weight_kg NUMERIC(8, 2) NOT NULL CHECK (weight_kg >= 0),
  point_per_kg INTEGER NOT NULL,
  points_earned INTEGER NOT NULL,
  co2_saved_kg NUMERIC(8, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLE: payouts (Tarik Saldo)
CREATE TABLE public.payouts (
  id TEXT PRIMARY KEY, -- e.g. 'WD-849201'
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel_code TEXT NOT NULL, -- e.g. 'BCA', 'GOPAY'
  channel_name TEXT NOT NULL,
  channel_type TEXT NOT NULL, -- 'bank' or 'ewallet'
  account_number TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  points_deducted INTEGER NOT NULL CHECK (points_deducted > 0),
  amount_idr INTEGER NOT NULL CHECK (amount_idr > 0),
  admin_fee_idr INTEGER DEFAULT 0,
  net_amount_idr INTEGER NOT NULL,
  status payout_status NOT NULL DEFAULT 'processing',
  estimated_arrival TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLE: monthly_targets
CREATE TABLE public.monthly_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month_name TEXT NOT NULL, -- e.g. 'Agustus 2026'
  target_kg NUMERIC(8, 2) NOT NULL DEFAULT 25.00,
  current_kg NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
  reward_coins INTEGER DEFAULT 150,
  reward_badge_name TEXT DEFAULT '1 Ton Club Contender',
  is_achieved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABLE: daily_missions
CREATE TABLE public.daily_missions (
  id TEXT PRIMARY KEY, -- e.g. 'ms-1'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_kg NUMERIC(6, 2) NOT NULL,
  reward_coins INTEGER NOT NULL,
  category_id TEXT REFERENCES public.waste_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABLE: eco_badges
CREATE TABLE public.eco_badges (
  id TEXT PRIMARY KEY, -- e.g. 'bdg-1'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity badge_rarity NOT NULL DEFAULT 'common',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TABLE: user_badges
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES public.eco_badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 13. INDEXES FOR PERFORMANCE (Supabase Best Practices)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_items_tx_id ON public.transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON public.payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);

-- 14. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drop_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Public read for reference master data & leaderboard
CREATE POLICY "Public read profiles for leaderboard" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public read waste_categories" ON public.waste_categories FOR SELECT USING (true);
CREATE POLICY "Public read drop_points" ON public.drop_points FOR SELECT USING (true);
CREATE POLICY "Public read partners" ON public.partners FOR SELECT USING (true);
CREATE POLICY "Public read daily_missions" ON public.daily_missions FOR SELECT USING (true);
CREATE POLICY "Public read eco_badges" ON public.eco_badges FOR SELECT USING (true);

-- User-scoped update/insert policies
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can read own transactions" ON public.transactions FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can create transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can read own transaction_items" ON public.transaction_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.transactions WHERE transactions.id = transaction_items.transaction_id AND transactions.user_id = (SELECT auth.uid()))
);

CREATE POLICY "Users can read own payouts" ON public.payouts FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own payouts" ON public.payouts FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can read own targets" ON public.monthly_targets FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Public read user_badges for leaderboard" ON public.user_badges FOR SELECT USING (true);
