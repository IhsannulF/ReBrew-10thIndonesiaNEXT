-- ==============================================================================
-- MIGRATION: offtaker_sales & offtaker partners
-- ==============================================================================

-- 1. Table offtaker_sales
CREATE TABLE IF NOT EXISTS public.offtaker_sales (
  id TEXT PRIMARY KEY,
  batch_code TEXT NOT NULL,
  partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  offtaker_name TEXT NOT NULL,
  category TEXT NOT NULL,
  weight_kg NUMERIC(10, 2) NOT NULL CHECK (weight_kg > 0),
  price_per_kg NUMERIC(10, 2) NOT NULL CHECK (price_per_kg > 0),
  gross_total NUMERIC(12, 2) NOT NULL,
  cafe_reward_allocated NUMERIC(12, 2) NOT NULL,
  rebrew_gross_margin NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Siap Kirim',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_offtaker_sales_created ON public.offtaker_sales (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offtaker_sales_status ON public.offtaker_sales (status);

-- 3. Seed offtaker partners in public.partners
INSERT INTO public.partners (name, type, city, contact_person, phone)
VALUES 
  ('Recosistem Jawa Timur', 'off_taker', 'Surabaya', 'Bpk. Hendra Wijaya', '031-8921-4433'),
  ('Paste Lab Upcycling', 'off_taker', 'Surabaya', 'Ibu Ratna Pertiwi', '0812-9988-7711'),
  ('Bank Sampah Induk Surabaya', 'off_taker', 'Surabaya', 'Bpk. Ahmad Fauzi', '031-7744-1234'),
  ('PT Trinseo Material Indonesia', 'off_taker', 'Gresik', 'Bpk. Dedy Prasetyo', '031-3982-1000')
ON CONFLICT DO NOTHING;

-- 4. Seed initial offtaker sales batch
INSERT INTO public.offtaker_sales (
  id, batch_code, offtaker_name, category, weight_kg, price_per_kg, gross_total, cafe_reward_allocated, rebrew_gross_margin, status, notes, created_at
)
VALUES
  ('bulk-1', 'BULK-2026-001', 'Recosistem Jawa Timur', 'Plastic Cup (PP/PET)', 500, 5000, 2500000, 875000, 1625000, 'Terkirim & Lunas', 'Truk Box L300 (L-8821-QR), Muatan Bersih Pabrik', NOW() - INTERVAL '4 days'),
  ('bulk-2', 'BULK-2026-002', 'Paste Lab Upcycling', 'Tutup Cup HDPE (Merchandise Coaster)', 200, 6000, 1200000, 420000, 780000, 'Terkirim & Lunas', 'Pesanan pembuatan Eco-Coaster Kafe Batch 1', NOW() - INTERVAL '2 days'),
  ('bulk-3', 'BULK-2026-003', 'Bank Sampah Induk Surabaya', 'Botol Plastik PET Bening', 400, 6000, 2400000, 840000, 1560000, 'Siap Kirim', 'Jadwal Penjemputan Armada Kontainer Pabrik', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;
