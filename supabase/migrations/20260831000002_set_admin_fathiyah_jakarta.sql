-- ==============================================================================
-- MIGRATION: Set Admin Account Fathiyah Nurul Izzah (Jakarta Selatan - Melawai)
-- ==============================================================================

-- 1. Insert / Update Drop Point Utama: Jakarta Selatan (Melawai)
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

-- 2. Sync / Update User Admin: Fathiyah Nurul Izzah (ihsanulfikri3176@gmail.com)
DO $$
DECLARE
  v_user_id UUID;
  target_email TEXT := 'ihsanulfikri3176@gmail.com';
BEGIN
  -- 2a. Cari ID User dari auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = LOWER(target_email) LIMIT 1;

  -- Jika user ada di auth.users, update metadata menjadi admin
  IF v_user_id IS NOT NULL THEN
    UPDATE auth.users
    SET
      raw_user_meta_data = jsonb_build_object(
        'full_name', 'Fathiyah Nurul Izzah',
        'cafe_name', 'ReBrew Central Hub - Jakarta Selatan (Melawai)',
        'city', 'Jakarta Selatan',
        'role', 'admin'
      ),
      updated_at = NOW()
    WHERE id = v_user_id;

    -- Upsert ke public.profiles
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role,
      cafe_name,
      city,
      tier,
      saldo_poin,
      total_kg,
      active_streak_days,
      updated_at
    )
    VALUES (
      v_user_id,
      target_email,
      'Fathiyah Nurul Izzah',
      'admin',
      'ReBrew Central Hub - Jakarta Selatan (Melawai)',
      'Jakarta Selatan',
      'enterprise',
      5000,
      120.00,
      14,
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = 'Fathiyah Nurul Izzah',
      role = 'admin',
      city = 'Jakarta Selatan',
      cafe_name = 'ReBrew Central Hub - Jakarta Selatan (Melawai)',
      updated_at = NOW();
  END IF;
END $$;
