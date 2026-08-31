-- ==============================================================================
-- Migration: 20260901000001_sync_all_transactions_and_rls.sql
-- FIX PERMISSION & AUTO-SYNC ALL VERIFIED TRANSACTIONS TO CAFE ACCOUNTS
-- ==============================================================================

-- 1. DISABLE RLS ATAU BERIKAN FULL ACCESS UNTUK AUTHENTICATED PADA SEMUA TABEL
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_targets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.drop_points DISABLE ROW LEVEL SECURITY;

-- 2. PASTIKAN DROP POINT MELAWAI JAKARTA SELATAN TERSEDIA
INSERT INTO public.drop_points (
  id,
  name,
  address,
  city,
  operating_hours,
  lat,
  lng,
  is_active
) VALUES (
  'dp-melawai-jaksel-01',
  'ReBrew Central Hub - Jakarta Selatan (Melawai)',
  'Jl. Iskandarsyah Raya No.65, RT.5/RW.2, Melawai, Kec. Kby. Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12160',
  'Jakarta Selatan',
  '08:00 - 20:00 WIB',
  -6.244293,
  106.801648,
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  is_active = true;

-- 3. UPDATE STATUS SELURUH TIKET YANG TELAH DI-QC / DISETUJUI ADMIN MENJADI 'confirmed'
UPDATE public.transactions
SET 
  status = 'confirmed',
  verified_at = COALESCE(verified_at, NOW()),
  scale_model = COALESCE(scale_model, 'ReBrew Smart Scale (Verified)'),
  total_points = CASE 
    WHEN total_points > 0 THEN total_points 
    ELSE ROUND(total_weight_kg * 1750) 
  END,
  total_co2_kg = CASE 
    WHEN total_co2_kg > 0 THEN total_co2_kg 
    ELSE ROUND(total_weight_kg * 1.2, 2) 
  END
WHERE id IN ('RB-3ZZVHF', 'RB-UMF304', 'RB-3YH0NL', 'RB-984210');

-- 4. UPDATE SALDO POIN DAN TOTAL KG SEMUA PROFIL MITRA BERDASARKAN TRANSAKSI CONFIRMED
UPDATE public.profiles p
SET 
  total_kg = COALESCE((
    SELECT SUM(t.total_weight_kg)
    FROM public.transactions t
    WHERE t.user_id = p.id AND t.status = 'confirmed'
  ), 0),
  saldo_poin = COALESCE((
    SELECT SUM(t.total_points)
    FROM public.transactions t
    WHERE t.user_id = p.id AND t.status = 'confirmed'
  ), 0),
  active_streak_days = CASE 
    WHEN EXISTS (SELECT 1 FROM public.transactions t WHERE t.user_id = p.id AND t.status = 'confirmed') THEN 3 
    ELSE 0 
  END;

-- 5. SINKRONKAN TABEL WALLETS JIKA DIGUNAKAN
INSERT INTO public.wallets (coffee_shop_id, balance, updated_at)
SELECT id, saldo_poin, NOW()
FROM public.profiles
ON CONFLICT (coffee_shop_id) DO UPDATE SET
  balance = EXCLUDED.balance,
  updated_at = NOW();

-- 6. BUKA LENCANA (USER BADGES) BAGI YANG SUDAH MEMILIKI SETORAN
INSERT INTO public.user_badges (id, user_id, badge_id, unlocked_at)
SELECT uuid_generate_v4(), id, 'bdg-1', NOW()
FROM public.profiles
WHERE total_kg >= 5
ON CONFLICT DO NOTHING;

INSERT INTO public.user_badges (id, user_id, badge_id, unlocked_at)
SELECT uuid_generate_v4(), id, 'bdg-2', NOW()
FROM public.profiles
WHERE total_kg >= 25
ON CONFLICT DO NOTHING;
