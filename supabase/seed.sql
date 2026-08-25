-- ==============================================================================
-- REBREW SEED DATA (SUPABASE CLI / SQL)
-- Seed data configured for user: Ihsanul Fikri (mfajrin117@gmail.com)
-- UID: e4ea8d6e-99ce-494c-8176-88ffdc1099d5
-- ==============================================================================

-- 1. SEED: waste_categories (PRD §6.4 & SPEC §4)
INSERT INTO public.waste_categories (id, name, category_group, point_per_kg, co2_factor, icon, description)
VALUES
  ('botol-plastik', 'Botol Plastik (PET)', 'Plastik', 10, 1.40, 'local_drink', 'Botol air mineral, botol sirup bening / bersih'),
  ('cup-plastik', 'Plastic Cup (PP/PET)', 'Plastik', 5, 1.20, 'coffee', 'Cup kopi takeaway, cup boba (bersih tanpa cairan)'),
  ('tutup-cup', 'Tutup Cup & Sedotan', 'Plastik', 3, 0.80, 'takeout_dining', 'Lid plastik, seal cup, dan sedotan plastik'),
  ('kaleng', 'Kaleng Minuman (Aluminium)', 'Logam', 20, 2.50, 'inventory_2', 'Kaleng soda, susu, dan minuman penyegar'),
  ('kardus', 'Kardus & Karton', 'Kertas & Kardus', 15, 0.90, 'package_2', 'Kardus kemasan susu, karton box sirup kering'),
  ('ampas-kopi', 'Ampas Kopi (Spent Grounds)', 'Organik', 5, 0.60, 'compost', 'Ampas espresso & manual brew untuk pupuk/briket')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  point_per_kg = EXCLUDED.point_per_kg,
  co2_factor = EXCLUDED.co2_factor,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

-- 2. SEED: partners
INSERT INTO public.partners (id, name, type, tier, city, contact_person, phone)
VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Kopi Selamat Cafe', 'coffee_shop', 'starter', 'Surabaya', 'Ihsanul Fikri', '081234567890'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'ReBrew Micro-Hub Surabaya Timur', 'micro_hub', 'enterprise', 'Surabaya', 'Deni Prasetyo', '081298765432'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Bank Sampah Induk Surabaya', 'drop_point', '1_ton_club', 'Surabaya', 'Ibu Rahmawati', '081345678901'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'PT Reco Waste Upcycle Indonesia', 'off_taker', 'enterprise', 'Surabaya', 'Bambang Sudiro', '081122334455')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED: drop_points
INSERT INTO public.drop_points (id, partner_id, name, address, city, distance_hint, operating_hours, lat, lng, is_active)
VALUES
  ('dp-1', 'a1b2c3d4-0002-4000-8000-000000000002', 'ReBrew Micro-Hub Surabaya Timur', 'Jl. Manyar Kertoarjo No. 45, Surabaya', 'Surabaya', '1.2 km', '08:00 - 18:00 WIB', -7.275443, 112.768402, true),
  ('dp-2', 'a1b2c3d4-0001-4000-8000-000000000001', 'ReBrew Point - Kopi Selamat Cafe', 'Jl. Dharmawangsa No. 12, Surabaya', 'Surabaya', '2.8 km', '09:00 - 21:00 WIB', -7.268912, 112.756201, true),
  ('dp-3', 'a1b2c3d4-0003-4000-8000-000000000003', 'Bank Sampah Induk Surabaya', 'Jl. Ngagel Jaya Selatan No. 88, Surabaya', 'Surabaya', '4.5 km', '08:00 - 16:00 WIB', -7.291244, 112.748112, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  distance_hint = EXCLUDED.distance_hint,
  operating_hours = EXCLUDED.operating_hours;

-- 4. SEED: eco_badges
INSERT INTO public.eco_badges (id, name, description, icon, rarity)
VALUES
  ('bdg-1', 'Eco Partner ⭐', 'Kemitraan resmi kafe dalam pemilahan sirkular sampah cup plastik.', 'workspace_premium', 'common'),
  ('bdg-2', '1 Ton Club Contender', 'Mengumpulkan lebih dari 25 kg sampah cup dalam satu bulan.', 'military_tech', 'rare'),
  ('bdg-3', 'Plastic Warrior', 'Mencegah lebih dari 50 kg sampah plastik masuk ke TPA dan laut.', 'shield', 'epic'),
  ('bdg-4', 'Zero Waste Hero', 'Mencapai skor circularity di atas 90 poin selama 3 bulan berturut-turut.', 'emoji_events', 'legendary')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  rarity = EXCLUDED.rarity;

-- 5. SEED: daily_missions
INSERT INTO public.daily_missions (id, title, description, target_kg, reward_coins, category_id)
VALUES
  ('ms-1', 'Pilah 5 kg Cup Plastik', 'Kumpulkan dan pilah cup plastik takeaway bersih hari ini.', 5.00, 25, 'cup-plastik'),
  ('ms-2', 'Setor Tutup Cup & Sedotan', 'Pisahkan lid plastik dan kumpulkan minimal 1.5 kg.', 1.50, 10, 'tutup-cup'),
  ('ms-3', 'Keringkan 3 kg Ampas Kopi', 'Kumpulkan ampas espresso kering untuk program briket arang.', 3.00, 15, 'ampas-kopi')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  target_kg = EXCLUDED.target_kg,
  reward_coins = EXCLUDED.reward_coins;

-- 6. SEED & SYNC USER DATA: Ihsanul Fikri (mfajrin117@gmail.com)
DO $$
DECLARE
  v_user_id UUID;
  target_email TEXT := 'mfajrin117@gmail.com';
BEGIN
  -- 6a. Cari ID User dari auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = target_email LIMIT 1;

  -- Jika belum ada (misal di local dev), gunakan default UID
  IF v_user_id IS NULL THEN
    v_user_id := 'e4ea8d6e-99ce-494c-8176-88ffdc1099d5';
  END IF;

  -- 6b. Update metadata user di auth.users
  UPDATE auth.users
  SET
    raw_user_meta_data = jsonb_build_object(
      'full_name', 'Ihsanul Fikri',
      'cafe_name', 'Kopi Selamat Cafe',
      'city', 'Surabaya',
      'tier', 'starter',
      'role', 'mitra'
    ),
    raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'::jsonb,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- 6c. Insert / Update public.profiles (Akun Anda)
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
    avatar_url
  )
  VALUES (
    v_user_id,
    target_email,
    'Ihsanul Fikri',
    'mitra',
    'Kopi Selamat Cafe',
    'starter',
    'Surabaya',
    1480,
    14.60,
    6,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = target_email,
    full_name = 'Ihsanul Fikri',
    cafe_name = 'Kopi Selamat Cafe',
    saldo_poin = 1480,
    total_kg = 14.60,
    active_streak_days = 6;

  -- 6c2. Insert / Update Kafe Mitra Lain di Surabaya untuk Leaderboard Kompetitif
  INSERT INTO public.profiles (id, email, full_name, role, cafe_name, tier, city, saldo_poin, total_kg, active_streak_days)
  VALUES
    ('c0000000-0000-0000-0000-000000000001', 'titiktemu.sby@gmail.com', 'Andi Wijaya', 'mitra', 'Titik Temu Coffee Surabaya', '1_ton_club', 'Surabaya', 4820, 48.20, 18),
    ('c0000000-0000-0000-0000-000000000002', 'koffiebranderij@gmail.com', 'Devi Anggraini', 'mitra', 'Koffiebranderij Surabaya', '1_ton_club', 'Surabaya', 3650, 36.50, 14),
    ('c0000000-0000-0000-0000-000000000003', 'calibre.coffee@gmail.com', 'Rian Hidayat', 'mitra', 'Calibre Coffee Roasters', 'starter', 'Surabaya', 1280, 12.80, 8),
    ('c0000000-0000-0000-0000-000000000004', 'kopikina.sby@gmail.com', 'Siti Maryam', 'mitra', 'Kopikina Surabaya Timur', 'starter', 'Surabaya', 940, 9.40, 5),
    ('c0000000-0000-0000-0000-000000000005', 'volks.gubeng@gmail.com', 'Farhan Kurnia', 'mitra', 'Volks Coffee Gubeng', 'starter', 'Surabaya', 750, 7.50, 4),
    ('c0000000-0000-0000-0000-000000000006', 'monopole.lab@gmail.com', 'Jessica Tan', 'mitra', 'Monopole Coffee Lab', 'starter', 'Surabaya', 580, 5.80, 3)
  ON CONFLICT (id) DO UPDATE SET
    cafe_name = EXCLUDED.cafe_name,
    total_kg = EXCLUDED.total_kg,
    saldo_poin = EXCLUDED.saldo_poin,
    tier = EXCLUDED.tier;

  -- 6d. Insert monthly_targets
  INSERT INTO public.monthly_targets (user_id, month_name, target_kg, current_kg, reward_coins, reward_badge_name, is_achieved)
  VALUES (
    v_user_id,
    'Agustus 2026',
    25.00,
    14.60,
    150,
    '1 Ton Club Contender',
    false
  )
  ON CONFLICT DO NOTHING;

  -- 6e. Insert user_badges
  INSERT INTO public.user_badges (user_id, badge_id, unlocked_at)
  VALUES
    (v_user_id, 'bdg-1', NOW() - INTERVAL '30 days'),
    (v_user_id, 'bdg-2', NOW() - INTERVAL '15 days')
  ON CONFLICT (user_id, badge_id) DO NOTHING;

  -- 6f. Insert / Update transactions
  DELETE FROM public.transaction_items WHERE transaction_id IN (
    'RB-984210', 'RB-983192', 'RB-978104', 'RB-972418', 'RB-968921', 'RB-965412', 'RB-959102', 'RB-954318'
  );
  DELETE FROM public.transactions WHERE id IN (
    'RB-984210', 'RB-983192', 'RB-978104', 'RB-972418', 'RB-968921', 'RB-965412', 'RB-959102', 'RB-954318'
  );

  INSERT INTO public.transactions (
    id,
    user_id,
    drop_point_id,
    method,
    pickup_address,
    total_weight_kg,
    total_points,
    total_co2_kg,
    status,
    scale_model,
    collector_name,
    verified_at,
    notes,
    created_at
  )
  VALUES
    (
      'RB-984210',
      v_user_id,
      'dp-1',
      'drop_point',
      NULL,
      3.20,
      16,
      3.84,
      'confirmed',
      'IoT Smart Scale v2.4',
      NULL,
      NOW() - INTERVAL '10 minutes',
      'Cup dicuci bersih dan ditumpuk rapi.',
      NOW() - INTERVAL '20 minutes'
    ),
    (
      'RB-983192',
      v_user_id,
      'dp-1',
      'drop_point',
      NULL,
      1.50,
      5,
      1.20,
      'confirmed',
      'IoT Smart Scale v2.4',
      NULL,
      NOW() - INTERVAL '10 minutes',
      'Lid PET & PP bening.',
      NOW() - INTERVAL '20 minutes'
    ),
    (
      'RB-978104',
      v_user_id,
      'dp-2',
      'drop_point',
      NULL,
      4.80,
      48,
      6.72,
      'confirmed',
      'ReBrew Calibrated Scale #02',
      NULL,
      NOW() - INTERVAL '1 day',
      'Botol dipipihkan dan tanpa tutup.',
      NOW() - INTERVAL '1 day' - INTERVAL '10 minutes'
    ),
    (
      'RB-972418',
      v_user_id,
      NULL,
      'dijemput',
      'Kopi Selamat Cafe, Jl. Raya Gubeng No. 18, Surabaya',
      6.50,
      83,
      5.85,
      'confirmed',
      'Portable Bluetooth Scale 100kg',
      'ReBrew Driver #04 (Deni)',
      NOW() - INTERVAL '2 days',
      'Kardus kering dan dilipat rapi dalam ikatan.',
      NOW() - INTERVAL '2 days' - INTERVAL '30 minutes'
    ),
    (
      'RB-968921',
      v_user_id,
      'dp-3',
      'drop_point',
      NULL,
      2.10,
      42,
      5.25,
      'confirmed',
      'Digital Precision Scale 50kg',
      NULL,
      NOW() - INTERVAL '4 days',
      'Kaleng dibilas bersih.',
      NOW() - INTERVAL '4 days' - INTERVAL '15 minutes'
    ),
    (
      'RB-965412',
      v_user_id,
      'dp-1',
      'drop_point',
      NULL,
      5.00,
      25,
      3.00,
      'confirmed',
      'IoT Smart Scale v2.4',
      NULL,
      NOW() - INTERVAL '6 days',
      'Ampas kopi dikeringkan untuk briket arang.',
      NOW() - INTERVAL '6 days' - INTERVAL '15 minutes'
    ),
    (
      'RB-959102',
      v_user_id,
      'dp-2',
      'drop_point',
      NULL,
      2.00,
      10,
      2.40,
      'pending',
      NULL,
      NULL,
      NULL,
      'Menunggu penimbangan fisik oleh petugas drop point.',
      NOW() - INTERVAL '7 days'
    ),
    (
      'RB-954318',
      v_user_id,
      'dp-1',
      'drop_point',
      NULL,
      1.00,
      0,
      0.00,
      'rejected',
      NULL,
      NULL,
      NULL,
      'Ditolak: Mengandung residu B3 berbahaya yang tidak dapat didaur ulang.',
      NOW() - INTERVAL '10 days'
    );

  -- 6g. Insert transaction_items
  INSERT INTO public.transaction_items (transaction_id, category_id, weight_kg, point_per_kg, points_earned, co2_saved_kg)
  VALUES
    ('RB-984210', 'cup-plastik', 3.20, 5, 16, 3.84),
    ('RB-983192', 'tutup-cup', 1.50, 3, 5, 1.20),
    ('RB-978104', 'botol-plastik', 4.80, 10, 48, 6.72),
    ('RB-972418', 'kardus', 6.50, 15, 83, 5.85),
    ('RB-968921', 'kaleng', 2.10, 20, 42, 5.25),
    ('RB-965412', 'ampas-kopi', 5.00, 5, 25, 3.00),
    ('RB-959102', 'cup-plastik', 2.00, 5, 10, 2.40),
    ('RB-954318', 'botol-plastik', 1.00, 10, 0, 0.00)
  ON CONFLICT DO NOTHING;

  -- 6h. Insert payouts (Riwayat Penarikan Saldo)
  DELETE FROM public.payouts WHERE id IN ('WD-849201', 'WD-819034', 'WD-791022');
  
  INSERT INTO public.payouts (
    id,
    user_id,
    channel_code,
    channel_name,
    channel_type,
    account_number,
    account_holder_name,
    points_deducted,
    amount_idr,
    admin_fee_idr,
    net_amount_idr,
    status,
    estimated_arrival,
    completed_at,
    created_at
  )
  VALUES
    (
      'WD-849201',
      v_user_id,
      'BCA',
      'Bank Central Asia (BCA)',
      'bank',
      '8730192841',
      'Ihsanul Fikri',
      600,
      30000,
      0,
      30000,
      'processing',
      'Hari ini, dalam 1-15 menit (Maks. 1x24 jam kerja)',
      NULL,
      NOW() - INTERVAL '1 hour'
    ),
    (
      'WD-819034',
      v_user_id,
      'GOPAY',
      'GoPay',
      'ewallet',
      '081298765432',
      'Ihsanul Fikri',
      500,
      25000,
      0,
      25000,
      'completed',
      'Selesai',
      NOW() - INTERVAL '5 days' + INTERVAL '3 minutes',
      NOW() - INTERVAL '5 days'
    ),
    (
      'WD-791022',
      v_user_id,
      'MANDIRI',
      'Bank Mandiri',
      'bank',
      '1400019283741',
      'Ihsanul Fikri',
      1000,
      50000,
      0,
      50000,
      'completed',
      'Selesai',
      NOW() - INTERVAL '13 days' + INTERVAL '5 minutes',
      NOW() - INTERVAL '13 days'
    );
END $$;
