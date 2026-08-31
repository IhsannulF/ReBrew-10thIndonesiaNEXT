-- ==============================================================================
-- MIGRATION: Sync Ihsanul Fikri & Kopi Selamat Cafe in Jakarta Selatan (Melawai)
-- ==============================================================================

-- 1. Pastikan Drop Point Central Hub Jakarta Selatan (Melawai) Terdaftar Lengkap
INSERT INTO public.drop_points (id, name, address, city, distance_hint, operating_hours, lat, lng, is_active)
VALUES
  (
    'dp-melawai-jaksel-01',
    'ReBrew Central Hub - Jakarta Selatan (Melawai)',
    'Jl. Iskandarsyah Raya No.65, RT.5/RW.2, Melawai, Kec. Kby. Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12160',
    'Jakarta Selatan',
    '0.5 km',
    '08:00 - 20:00 WIB',
    -6.244293,
    106.801648,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  is_active = true;

-- 2. Update Profil Mitra Kafe: Ihsanul Fikri (Kopi Selamat Cafe - Melawai Jakarta Selatan)
DO $$
DECLARE
  v_user_id UUID;
  target_email TEXT := 'mfajrin117@gmail.com';
BEGIN
  -- Cari ID User dari auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = LOWER(target_email) LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Update metadata di auth.users
    UPDATE auth.users
    SET
      raw_user_meta_data = jsonb_build_object(
        'full_name', 'Ihsanul Fikri',
        'cafe_name', 'Kopi Selamat Cafe',
        'city', 'Jakarta Selatan',
        'address', 'Jl. Sultan Hasanuddin Dalam No.4, RT.3/RW.1, Kuningan, Melawai, Kec. Kby. Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12160',
        'tier', 'starter',
        'role', 'mitra'
      ),
      updated_at = NOW()
    WHERE id = v_user_id;

    -- Upsert public.profiles
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
      updated_at
    )
    VALUES (
      v_user_id,
      target_email,
      'Ihsanul Fikri',
      'mitra',
      'Kopi Selamat Cafe',
      'starter',
      'Jakarta Selatan',
      1480,
      14.60,
      6,
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = 'Ihsanul Fikri',
      cafe_name = 'Kopi Selamat Cafe',
      city = 'Jakarta Selatan',
      updated_at = NOW();
  END IF;
END $$;

-- 3. Update Kafe Mitra untuk Leaderboard Kompetitif di Jakarta Selatan
INSERT INTO public.profiles (id, email, full_name, role, cafe_name, tier, city, saldo_poin, total_kg, active_streak_days)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'anomali.senopati@gmail.com', 'Andi Wijaya', 'mitra', 'Anomali Coffee Senopati', '1_ton_club', 'Jakarta Selatan', 4820, 48.20, 18),
  ('c0000000-0000-0000-0000-000000000002', 'commongrounds.mbloc@gmail.com', 'Devi Anggraini', 'mitra', 'Common Grounds M Bloc Space', '1_ton_club', 'Jakarta Selatan', 3650, 36.50, 14),
  ('c0000000-0000-0000-0000-000000000003', 'filosofikopi.melawai@gmail.com', 'Rian Hidayat', 'mitra', 'Filosofi Kopi Melawai', 'starter', 'Jakarta Selatan', 1280, 12.80, 8),
  ('c0000000-0000-0000-0000-000000000004', 'titiktemu.mbloc@gmail.com', 'Siti Maryam', 'mitra', 'Titik Temu M Bloc Melawai', 'starter', 'Jakarta Selatan', 940, 9.40, 5),
  ('c0000000-0000-0000-0000-000000000005', 'tanamera.kemang@gmail.com', 'Farhan Kurnia', 'mitra', 'Tanamera Coffee Kemang', 'starter', 'Jakarta Selatan', 750, 7.50, 4),
  ('c0000000-0000-0000-0000-000000000006', 'djournal.senayan@gmail.com', 'Jessica Tan', 'mitra', 'Djournal Coffee Senayan', 'starter', 'Jakarta Selatan', 580, 5.80, 3)
ON CONFLICT (id) DO UPDATE SET
  cafe_name = EXCLUDED.cafe_name,
  city = EXCLUDED.city,
  total_kg = EXCLUDED.total_kg,
  saldo_poin = EXCLUDED.saldo_poin,
  tier = EXCLUDED.tier;
