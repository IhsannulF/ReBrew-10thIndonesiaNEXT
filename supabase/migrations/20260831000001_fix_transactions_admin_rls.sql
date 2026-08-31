-- ==============================================================================
-- MIGRATION: Fix Transactions Schema, Drop Points, & Admin RLS Policies
-- ==============================================================================

-- 1. Pastikan Drop Point Central Hub Terdaftar (Mencegah FK Constraint Failure)
INSERT INTO public.drop_points (id, name, address, city, distance_hint, operating_hours, lat, lng, is_active)
VALUES
  ('dp-central-hub-01', 'ReBrew Central Hub - Surabaya Timur', 'Jl. Raya Gn. Anyar Sawah No.15, RT.2, Gn. Anyar, Surabaya', 'Surabaya', '1.2 km', '08:00 - 20:00 WIB', -7.336184, 112.784428, true),
  ('dp-1', 'ReBrew Micro-Hub Surabaya Timur', 'Jl. Manyar Kertoarjo No. 45, Surabaya', 'Surabaya', '1.2 km', '08:00 - 18:00 WIB', -7.275443, 112.768402, true),
  ('dp-2', 'ReBrew Point - Kopi Selamat Cafe', 'Jl. Dharmawangsa No. 12, Surabaya', 'Surabaya', '2.8 km', '09:00 - 21:00 WIB', -7.268912, 112.756201, true),
  ('dp-3', 'Bank Sampah Induk Surabaya', 'Jl. Ngagel Jaya Selatan No. 88, Surabaya', 'Surabaya', '4.5 km', '08:00 - 16:00 WIB', -7.291244, 112.748112, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  is_active = true;

-- 2. Pastikan Kategori Sampah Lengkap
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
  co2_factor = EXCLUDED.co2_factor;

-- 3. Pastikan Kolom Pendukung Tabel transactions Lengkap
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS method deposit_method DEFAULT 'drop_point';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS pickup_address TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS total_weight_kg NUMERIC(8, 2) DEFAULT 0.00;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS total_co2_kg NUMERIC(8, 2) DEFAULT 0.00;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS actual_weight NUMERIC(8, 2);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS scale_model TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS collector_name TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS notes TEXT;

-- 4. Fungsi Cek Admin Helper (Security Definer)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Row Level Security Policies untuk Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can read all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins or owners can read transactions" ON public.transactions;
CREATE POLICY "Admins or owners can read transactions" ON public.transactions
  FOR SELECT TO authenticated
  USING (public.is_admin() OR (SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create transactions" ON public.transactions;
CREATE POLICY "Users can create transactions" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins or owners can update transactions" ON public.transactions;
CREATE POLICY "Admins or owners can update transactions" ON public.transactions
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR (SELECT auth.uid()) = user_id)
  WITH CHECK (public.is_admin() OR (SELECT auth.uid()) = user_id);

-- 6. Row Level Security Policies untuk Transaction Items
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own transaction_items" ON public.transaction_items;
DROP POLICY IF EXISTS "Admins or owners can read transaction_items" ON public.transaction_items;
CREATE POLICY "Admins or owners can read transaction_items" ON public.transaction_items
  FOR SELECT TO authenticated
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.transactions
      WHERE transactions.id = transaction_items.transaction_id
      AND transactions.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert transaction_items" ON public.transaction_items;
CREATE POLICY "Users can insert transaction_items" ON public.transaction_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions
      WHERE transactions.id = transaction_items.transaction_id
      AND transactions.user_id = (SELECT auth.uid())
    )
  );

-- 7. Row Level Security Policies untuk Profiles Update (Admin Update Saldo/Total Kg)
DROP POLICY IF EXISTS "Admins or owners can update profile" ON public.profiles;
CREATE POLICY "Admins or owners can update profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR (SELECT auth.uid()) = id)
  WITH CHECK (public.is_admin() OR (SELECT auth.uid()) = id);

-- 8. Row Level Security Policies untuk Payouts
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own payouts" ON public.payouts;
DROP POLICY IF EXISTS "Admins or owners can read payouts" ON public.payouts;
CREATE POLICY "Admins or owners can read payouts" ON public.payouts
  FOR SELECT TO authenticated
  USING (public.is_admin() OR (SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can update payouts" ON public.payouts;
CREATE POLICY "Admins can update payouts" ON public.payouts
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
