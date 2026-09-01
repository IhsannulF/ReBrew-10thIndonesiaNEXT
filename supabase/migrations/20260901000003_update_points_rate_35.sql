-- 1. UPDATE MASTER KATEGORI SAMPAH (Jika tabel waste_categories ada)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'waste_categories') THEN
    UPDATE public.waste_categories SET point_per_kg = 15 WHERE id IN ('cup-plastik', 'plastic-cup') OR LOWER(name) LIKE '%cup%';
    UPDATE public.waste_categories SET point_per_kg = 10 WHERE id = 'ampas-kopi' OR LOWER(name) LIKE '%ampas%';
    UPDATE public.waste_categories SET point_per_kg = 5 WHERE id = 'botol-plastik' OR LOWER(name) LIKE '%botol%';
    UPDATE public.waste_categories SET point_per_kg = 3 WHERE id = 'tutup-cup' OR LOWER(name) LIKE '%tutup%';
  END IF;
END $$;

-- 2. REKALKULASI ITEM DI TRANSACTION_ITEMS (Jika ada)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transaction_items') THEN
    UPDATE public.transaction_items
    SET 
      point_per_kg = CASE
        WHEN category_id LIKE '%ampas%' THEN 10
        WHEN category_id LIKE '%botol%' THEN 5
        WHEN category_id LIKE '%tutup%' THEN 3
        WHEN category_id LIKE '%kaleng%' THEN 20
        WHEN category_id LIKE '%kardus%' THEN 15
        ELSE 15
      END,
      points_earned = ROUND(weight_kg * (
        CASE
          WHEN category_id LIKE '%ampas%' THEN 10
          WHEN category_id LIKE '%botol%' THEN 5
          WHEN category_id LIKE '%tutup%' THEN 3
          WHEN category_id LIKE '%kaleng%' THEN 20
          WHEN category_id LIKE '%kardus%' THEN 15
          ELSE 15
        END
      ));
  END IF;
END $$;

-- 3. REKALKULASI SELURUH TOTAL_POINTS PADA TABEL TRANSACTIONS
UPDATE public.transactions
SET total_points = CASE
  WHEN LOWER(COALESCE(notes, '')) LIKE '%ampas%' THEN ROUND(total_weight_kg * 10)
  WHEN LOWER(COALESCE(notes, '')) LIKE '%botol%' THEN ROUND(total_weight_kg * 5)
  WHEN LOWER(COALESCE(notes, '')) LIKE '%tutup%' THEN ROUND(total_weight_kg * 3)
  WHEN LOWER(COALESCE(notes, '')) LIKE '%kaleng%' THEN ROUND(total_weight_kg * 20)
  WHEN LOWER(COALESCE(notes, '')) LIKE '%kardus%' THEN ROUND(total_weight_kg * 15)
  ELSE ROUND(total_weight_kg * 15)
END;

-- 4. REKALKULASI SALDO POIN DI TABEL PROFILES BERDASARKAN TRANSAKSI CONFIRMED
UPDATE public.profiles p
SET 
  saldo_poin = COALESCE((
    SELECT SUM(t.total_points)
    FROM public.transactions t
    WHERE t.user_id = p.id AND t.status = 'confirmed'
  ), 0),
  total_kg = COALESCE((
    SELECT SUM(t.total_weight_kg)
    FROM public.transactions t
    WHERE t.user_id = p.id AND t.status = 'confirmed'
  ), 0);

-- 5. UPDATE WALLETS (Jika tabel wallets ada)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallets') THEN
    UPDATE public.wallets w
    SET 
      balance = COALESCE((
        SELECT saldo_poin FROM public.profiles WHERE id = w.coffee_shop_id
      ), 0),
      updated_at = NOW();
  END IF;
END $$;
