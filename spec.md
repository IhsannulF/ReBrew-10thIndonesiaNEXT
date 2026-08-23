# SPEC — ReBrew (Aplikasi PilahCash)

Dokumen ini turunan teknis dari `PRD.md`. Referensi struktur folder mengikuti project yang sudah berjalan (lihat struktur `app/` & `components/` di bawah).

## 1. Tech Stack

- **Framework:** Next.js 14+ (App Router), TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend/DB:** Supabase (Postgres, Auth, Storage, Realtime)
- **Deploy:** Vercel
- **Desain:** token warna & tipografi mengikuti `DESIGN.md` project

## 2. Struktur Proyek

```
app/
├── admin/
│   ├── kategori/          # CRUD kategori sampah & poin/kg
│   ├── mitra/             # CRUD mitra (coffee shop, drop point, off-taker)
│   └── transaksi/         # Monitoring semua transaksi setor sampah
├── dashboard/
│   └── page.tsx           # SaaS Partner Dashboard (coffee shop)
├── login/
│   └── page.tsx
├── register/
├── riwayat/                # Riwayat transaksi user
├── saldo/                  # Saldo poin & payout
├── setor/                  # Alur Setor Sampah (customer)
├── favicon.ico
├── globals.css
├── icon.png
├── layout.tsx
├── page.tsx                # Landing page
└── _components/            # Komponen privat khusus landing (tidak ikut routing)
    ├── hero.tsx
    ├── balance-card.tsx
    └── stat-badge.tsx

components/
├── dashboard/               # Komponen khusus SaaS Partner Dashboard
├── forms/                   # Form-form input (setor sampah, registrasi mitra, dll)
└── shared/
    ├── navbar.tsx
    ├── qr-display.tsx
    ├── role-switcher.tsx
    ├── status-badge.tsx
    └── transaction-ticket-card.tsx
```

## 3. Peran & Akses (Role-Based)

| Role | Akses |
|---|---|
| `customer` | app `setor`, `riwayat`, `saldo`, akun — mobile-first flow |
| `mitra` (coffee shop) | `dashboard` (monitor real-time, leaderboard, gamifikasi, share) |
| `admin` | penuh ke `admin/kategori`, `admin/mitra`, `admin/transaksi` |

`role-switcher.tsx` mengindikasikan satu akun bisa punya lebih dari satu role tampilan (mis. demo/testing lintas peran), atau UI switching untuk mitra dengan multi-outlet — perlu dikonfirmasi cakupannya.

## 4. Data Model (Supabase / Postgres)

### `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | dari Supabase Auth |
| name | text | |
| role | enum(`customer`,`mitra`,`admin`) | |
| saldo_poin | integer | denormalized, di-update via trigger dari `transactions` |
| created_at | timestamptz | |

### `waste_categories`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| name | text | Botol Plastik, Cup Plastik, Tutup Cup, Kardus, Kaleng, Lainnya |
| point_per_kg | integer | lihat PRD §6.4 |
| icon | text | |

### `partners` (mitra)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| type | enum(`coffee_shop`,`drop_point`,`off_taker`) | |
| name | text | |
| tier | enum(`starter`,`1_ton_club`,`enterprise`) | default `starter` |
| location_lat / location_lng | numeric | untuk pencarian drop point terdekat |
| opening_hours | text | |
| created_at | timestamptz | |

### `drop_points`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| partner_id | uuid (FK → partners) | |
| address | text | |
| lat / lng | numeric | |

### `transactions` (setor sampah)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| method | enum(`drop_point`,`dijemput`) | dijemput = diskon 15–20%, minimum 2kg |
| drop_point_id | uuid (FK, nullable) | null jika method = dijemput |
| status | enum(`pending`,`confirmed`,`rejected`) | |
| created_at | timestamptz | |

### `transaction_items`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| transaction_id | uuid (FK → transactions) | |
| category_id | uuid (FK → waste_categories) | |
| weight_kg | numeric | |
| points_earned | integer | = weight_kg × point_per_kg (± diskon/bonus metode) |

### `impact_summary` (agregat, materialized view atau tabel ter-cache)
Per user & per partner per bulan: `total_kg`, `co2_saved_kg`, `points_total` — dipakai untuk Home screen customer dan Monitor Real-Time di SaaS Dashboard.

### `leaderboard` (view)
Ranking `partners` berdasarkan `total_kg` / `points_total`, filter by periode (`bulan_ini` / `semua_waktu`), sesuai UI "Leaderboard – Analyzer".

### `badges`, `daily_missions`, `streaks`, `rewards`
Struktur pendukung modul Gamifikasi & Campaign — CRUD dasar, relasi many-to-many ke `users`/`partners` via tabel junction (`user_badges`, dst).

### `esg_reports`
Laporan dampak lingkungan bulanan per mitra, sumber untuk fitur "Kafe menerima Laporan Dampak Lingkungan bulanan & Sertifikat Eco-Partner". Generate otomatis dari `impact_summary`.

## 5. Alur Utama (User Flows)

### 5.1 Setor Sampah (customer)
1. `Home` → tap "Setor" → `setor/`
2. Pilih satu atau lebih **jenis sampah** (checkbox/qty per kategori) → hitung estimasi poin real-time di client
3. Pilih **metode**: Drop Point (harga penuh) atau Dijemput (diskon 15–20%, min. 2kg)
4. Jika Drop Point → tampilkan peta & daftar drop point terdekat (`drop_points`, sort by jarak) → user pilih lokasi
5. Submit → buat `transactions` (status `pending`) + `transaction_items`
6. Di lokasi, pengepul/mitra melakukan penimbangan aktual → update `weight_kg` & konfirmasi → status → `confirmed`, trigger update `saldo_poin` user
7. Tampilkan layar **Konfirmasi Transaksi**: kategori, berat × poin/kg, total poin, saldo terbaru

### 5.2 SaaS Partner Dashboard (mitra)
1. `dashboard/page.tsx` fetch `impact_summary` partner berjalan (hari ini vs target bulanan) → render **Monitor Real-Time**
2. Fetch `leaderboard` view (filter bulan ini/semua waktu) → render **Leaderboard/Analyzer**, top N + posisi partner sendiri
3. Fetch `badges`/`daily_missions`/`streaks` milik partner + progress terhadap target (mis. "720/1.000 kg") → render **Gamifikasi & Campaign**
4. Generate kartu shareable (nama, kg bulan ini, ikon) → tombol share ke IG/WhatsApp/TikTok/Facebook — **Share & Inspirasi**

### 5.3 Admin
- `admin/kategori`: CRUD `waste_categories` (nama, poin/kg, ikon)
- `admin/mitra`: CRUD `partners` + assign `tier`, kelola `drop_points`
- `admin/transaksi`: list semua `transactions`, filter status/tanggal/mitra, konfirmasi manual jika perlu override

## 6. Sistem Poin & Tier

- Poin dihitung per kategori: `points_earned = weight_kg × point_per_kg`.
- Metode `dijemput` memberi diskon 15–20% dari harga poin normal (aturan diskon final perlu dikonfirmasi — apakah mengurangi poin atau menambah biaya jasa jemput).
- Tier mitra (`starter` / `1_ton_club` / `enterprise`) ditentukan dari akumulasi `total_kg` tahunan mitra tsb — perlu job terjadwal (cron/Supabase Edge Function) untuk evaluasi & upgrade tier otomatis saat melewati ambang 1 ton.

## 7. Non-Functional Requirements

- **Mobile-first** untuk app customer (`setor`, `riwayat`, `saldo`) — sesuai mockup 4-layar (Home, Setor Sampah, Drop Point, Konfirmasi).
- **Realtime-ish** untuk Monitor Dashboard mitra — Supabase Realtime subscription pada `impact_summary`/`transactions` agar angka "hari ini" ter-update tanpa reload penuh.
- **Auth & RBAC**: Supabase Auth + Row Level Security per role (`customer` hanya baca/tulis data miliknya; `mitra` hanya baca data partner miliknya; `admin` penuh).
- **Traceability**: setiap `transaction_item` harus bisa ditelusuri dari customer → drop point/mitra → agregasi ke off-taker, untuk mendukung klaim ESG & kebutuhan EPR di roadmap Tahun 3.

## 8. Cakupan MVP (Tahun 1 — sesuai roadmap PRD §9)

Fitur wajib MVP non-IoT:
- [ ] Auth (login/register) — customer & mitra
- [ ] Home + saldo poin + ringkasan dampak
- [ ] Setor Sampah (drop point only dulu; "dijemput" bisa menyusul)
- [ ] Drop Point finder (peta sederhana + list)
- [ ] Konfirmasi transaksi + riwayat
- [ ] SaaS Dashboard mitra: Monitor Real-Time + Leaderboard dasar
- [ ] Admin: kategori, mitra, transaksi (CRUD dasar)

Di luar cakupan MVP (roadmap Tahun 2–3): otomatisasi payout, laporan ESG otomatis, modul IoT tempat sampah, kontrak off-taker & data traceability skala korporat.

## 9. Pertanyaan Terbuka untuk Tim

- Apakah "poin" dikonversi ke rupiah dengan rate tetap, atau hanya ditukar reward/voucher di dalam app? (mempengaruhi desain tabel `saldo_poin` & fitur `saldo/`)
- Definisi & operasional "Micro-Hub" — siapa yang memiliki/mengelola lokasi fisiknya?
- Rule diskon "dijemput" (15–20%) — dipotong dari poin atau ditambahkan sebagai biaya jasa terpisah?
- Kategori "Lainnya" — perlu daftar sub-kategori & poin/kg final.