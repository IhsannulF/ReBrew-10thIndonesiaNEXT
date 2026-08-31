-- ==============================================================================
-- Migration: Fix Admin RLS Policies for Transactions & Verification
-- Ensures Admin (Fathiyah Nurul Izzah) and platform control center can view
-- and verify all transactions submitted by partner cafes.
-- ==============================================================================

-- 1. Pastikan Drop Point Melawai Jakarta Selatan Aktif
INSERT INTO public.drop_points (
  id,
  name,
  address,
  city,
  distance_km,
  operating_hours,
  lat,
  lng,
  is_active
) VALUES (
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

-- 2. Kebijakan RLS SELECT pada tabel transactions
-- Mengizinkan Admin dan pengguna yang login untuk melihat transaksi
DROP POLICY IF EXISTS "Users can read own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Public read transactions for admin and users" ON public.transactions;
DROP POLICY IF EXISTS "Admin and users can read transactions" ON public.transactions;

CREATE POLICY "Admin and users can read transactions" ON public.transactions
FOR SELECT TO authenticated
USING (true);

-- 3. Kebijakan RLS UPDATE pada tabel transactions
-- Mengizinkan Admin untuk memverifikasi dan mengubah status transaksi
DROP POLICY IF EXISTS "Admin can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;

CREATE POLICY "Admin can update transactions" ON public.transactions
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Kebijakan RLS SELECT & INSERT pada transaction_items
DROP POLICY IF EXISTS "Users can read own transaction_items" ON public.transaction_items;
DROP POLICY IF EXISTS "Admin and users can read transaction_items" ON public.transaction_items;

CREATE POLICY "Admin and users can read transaction_items" ON public.transaction_items
FOR SELECT TO authenticated
USING (true);

-- 5. Pastikan profiles dapat diupdate saldo dan poinnya saat verifikasi
DROP POLICY IF EXISTS "Admin can update user profiles on verification" ON public.profiles;

CREATE POLICY "Admin can update user profiles on verification" ON public.profiles
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Set Akun Admin ihsanulfikri3176@gmail.com ke role 'admin'
UPDATE public.profiles
SET 
  role = 'admin',
  full_name = 'Fathiyah Nurul Izzah',
  city = 'Jakarta Selatan',
  address = 'Jl. Iskandarsyah Raya No.65, RT.5/RW.2, Melawai, Kec. Kby. Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12160',
  cafe_name = 'ReBrew Central Hub Melawai'
WHERE LOWER(email) = 'ihsanulfikri3176@gmail.com';
