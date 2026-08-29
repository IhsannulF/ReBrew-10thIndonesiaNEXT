-- ==============================================================================
-- FIX AUTH PROFILES & REGISTRATION TRIGGER
-- Menangani "Database error saving new user" saat pendaftaran akun mitra
-- ==============================================================================

-- 1. Pastikan Enums Tersedia
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'mitra', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE cafe_tier AS ENUM ('starter', '1_ton_club', 'enterprise');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Pastikan Tabel profiles Memiliki Struktur Lengkap
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- Pastikan Kolom-Kolom Pendukung Tersedia jika Tabel Dibuat Sebelumnya
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cafe_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Surabaya';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS saldo_poin INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_kg NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_streak_days INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Enable RLS dan Pastikan Kebijakan Aman
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read profiles for leaderboard" ON public.profiles;
CREATE POLICY "Public read profiles for leaderboard" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);

-- 4. Fungsi Trigger Otomatis Pembuatan Profil Baru (Resilient & Anti-Fail)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_role user_role := 'mitra';
  v_tier cafe_tier := 'starter';
BEGIN
  -- Safe parsing role
  BEGIN
    IF new.raw_user_meta_data->>'role' IS NOT NULL THEN
      v_role := (new.raw_user_meta_data->>'role')::user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'mitra';
  END;

  -- Safe parsing tier
  BEGIN
    IF new.raw_user_meta_data->>'tier' IS NOT NULL THEN
      v_tier := (new.raw_user_meta_data->>'tier')::cafe_tier;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_tier := 'starter';
  END;

  -- Insert profile baru dengan fallback aman
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    cafe_name,
    tier,
    city,
    saldo_poin,
    total_kg,
    active_streak_days,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    COALESCE(new.email, ''),
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    v_role,
    COALESCE(new.raw_user_meta_data->>'cafe_name', 'Kedai Kopi Mitra'),
    v_tier,
    COALESCE(new.raw_user_meta_data->>'city', 'Surabaya'),
    0,
    0.00,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    cafe_name = CASE WHEN EXCLUDED.cafe_name <> '' THEN EXCLUDED.cafe_name ELSE public.profiles.cafe_name END,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Exception Handler: Jangan gagalkan auth user creation jika terjadi issue sekunder
  RAISE WARNING 'handle_new_user failed gracefully: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- 5. Pasang Trigger ke auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
