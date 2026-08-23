# PRD — ReBrew

**Tagline:** Pilah Sampah, Ciptakan Dampak.
**One-liner:** From Used Cups to New Value.

---

## 1. Ringkasan Eksekutif

ReBrew adalah platform **Waste Management-as-a-Service (WMaaS)** berbasis micro-hub dan model B2B F&B, yang menghubungkan tiga pihak dalam satu ekosistem: **Coffee Shop** (sumber sampah plastic cup), **Collector/Pengepul** (pengumpul & penimbang), dan **Recycling Partner / Pabrik Daur Ulang** (off-taker bahan baku plastik). Aplikasi consumer-nya bernama **PilahCash**.

Model intinya: kafe menukar sampah plastik (cup, tutup cup, sedotan, dll) secara gratis untuk mendapatkan layanan branding, sertifikasi Eco-Partner, dan promosi di aplikasi ReBrew — bukan model jemput sampah rumah-ke-rumah (B2C house-to-house), melainkan konsolidasi di titik kumpul komunal (micro-hub & kafe).

## 2. Latar Belakang & Masalah

### 2.1 Skala Masalah
- Indonesia adalah **#2 pencemar laut dunia**.
- Estimasi **90% dari 300.000+ ton** sampah plastik cup dari industri F&B nasional tidak terkelola.
- Indonesia memiliki **461.991 kedai kopi/coffee shop**, terkonsentrasi di **Jawa Timur** (105.397 kedai — terbanyak nasional) dan **Jabodetabek**.

### 2.2 Dilema Coffee Shop (Sisi Supply)
- Biaya operasional yang lumayan besar untuk cup plastik sekali pakai.
- Perubahan tren & preferensi konsumen membuat stok cup menumpuk.
- Kesulitan pengelolaan limbah cup, biaya pengangkutan meningkat — owner baru sadar masalahnya setelah tempat sampah meluap.

### 2.3 Dua Dorongan Pasar
- **Sisi konsumen (Gen-Z):** 77% Gen-Z Indonesia mengonsumsi kopi; **82% Gen-Z menuntut brand/kafe yang mereka beli punya kepedulian lingkungan** (eco-conscious consumer) — meski tetap gemar membeli kopi takeaway.
- **Sisi regulasi:** Pemerintah (KLHK, Permen LHK No. 75/2019 — Peta Jalan Pengurangan Sampah oleh Produsen) mewajibkan sektor F&B, manufaktur, dan ritel mengurangi sampah **30% pada 2029**. Kafe tidak lagi bisa sekadar buang ke TPA tanpa pencatatan — butuh bukti daur ulang terintegrasi (traceability).

## 3. Solusi

ReBrew mengonsolidasi sampah di titik kumpul komunal (Micro-Hub & Kafe) alih-alih model jemput eceran rumah-ke-rumah, dengan tiga alasan:

1. **Efisiensi logistik** — mengeliminasi pemborosan BBM dari penjemputan eceran rumah ke rumah.
2. **CAPEX rendah, mudah direplikasi** — pakai timbangan manual yang terhubung ke Dashboard SaaS (bukan IoT mahal di awal), sehingga mudah discale ke ribuan kafe.
3. **Insentif ESG** — mengubah sampah plastic cup yang nilainya receh menjadi Sertifikat ESG & Laporan Dampak Lingkungan, materi marketing yang relevan untuk Gen-Z.

## 4. Target Pengguna / Customer Segments

**Catatan cakupan:** untuk build project ini, pengguna sistem (yang login ke aplikasi) hanya dua — **Admin** dan **Mitra (Coffee Shop)**. Tidak ada role/app terpisah untuk pengepul — fungsi verifikasi & penimbangan yang di deck digambarkan dilakukan pengepul, di sistem ini dilakukan oleh **Admin**.

### Pengguna Sistem (App Roles)

| Role | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Admin** | Pengelola platform (internal ReBrew) | Kelola kategori sampah, kelola data mitra, verifikasi & konfirmasi transaksi setor sampah (termasuk penimbangan aktual) |
| **Mitra (Coffee Shop)** | Kedai kopi independen & chain cafe yang ingin menaikkan pamor green branding | Setor sampah, pantau saldo poin & riwayat, dashboard monitoring real-time, organic green branding, Sertifikat Eco-Partner, laporan dampak |

### Pihak Terkait (bukan pengguna sistem — konteks bisnis dari deck)

| Pihak | Deskripsi | Catatan |
|---|---|---|
| Off-Taker | Industri / Pabrik Daur Ulang Plastik (Recosistem, Paste Lab, Bank Sampah, dll) | Data referensi yang dikelola Admin (misalnya sebagai tujuan penjualan bulk), bukan role login |
| Customer/Gen-Z (visi deck) | Wadah "green flexing" ala Strava untuk end-consumer kafe | Bagian dari visi bisnis jangka panjang di pitch deck (§5, §8 asli), **di luar cakupan build saat ini** |

## 5. Value Proposition per Segmen

- **Customer (Gen-Z):** gamified social engagement — leaderboard, tantangan bulanan (eco-challenges), streaks, badge, reward voucher kopi.
- **Coffee Shop (B2B):** branding hijau organik gratis, Sertifikat Eco-Partner, laporan dampak lingkungan bulanan, dashboard monitoring real-time.
- **Pabrik Daur Ulang:** pasokan bahan baku plastik yang sudah terpilah & konsisten dalam volume besar, siap untuk kebutuhan EPR (Extended Producer Responsibility) korporat.

## 6. Fitur Produk

### 6.1 Aplikasi Consumer (PilahCash) — Mobile
Berdasarkan alur di mockup aplikasi:

1. **Home** — sapaan personal, saldo poin, ringkasan dampak bulan ini (sampah terkumpul kg, CO₂ terselamatkan kg, poin didapat).
2. **Setor Sampah** — pilih jenis sampah (Botol Plastik, Cup Plastik, Tutup Cup, Kardus, Kaleng, Lainnya), lalu pilih metode: **Drop Point** (harga penuh) atau **Dijemput** (diskon 15–20%, minimum 2kg).
3. **Drop Point Terdekat** — pencarian & peta lokasi drop point (mis. "ReBrew Point - Coffee Green"), jam operasional, jarak.
4. **Konfirmasi Transaksi** — ringkasan berat & poin yang didapat, total poin terkini, akses ke riwayat.
5. **Riwayat** — log transaksi setor sampah.
6. **Saldo** — saldo poin & (di roadmap) fitur otomatisasi payout.
7. **Akun** — profil pengguna.

### 6.2 SaaS Partner Dashboard — untuk Coffee Shop
1. **Monitor Real-Time** — sampah terkumpul hari ini (kg), progres target bulanan (kg / %), CO₂ terselamatkan, poin terkumpul.
2. **Leaderboard / Analyzer** — peringkat kafe (bulan ini / semua waktu) berdasarkan sampah terkumpul & poin; filter "Top Coffee Shop".
3. **Gamifikasi & Campaign** — insight dari AI terhadap progres target, peringkat lokal (mis. "#2 di Makassar"), badge, misi harian, streak, reward.
4. **Share & Inspirasi** — kartu shareable pencapaian dampak kafe ke Instagram/WhatsApp/TikTok/Facebook untuk UGC marketing.

### 6.3 Admin Panel
Mengelola: **kategori** sampah & poin/kg, **mitra** (kafe, drop point, off-taker), **transaksi** setor sampah lintas pengguna.

### 6.4 Sistem Poin (Reward)
Nilai poin per kg per kategori sampah (indikatif dari deck — perlu dikonfirmasi/dikunci sebagai final):

| Kategori | Poin/kg |
|---|---|
| Botol Plastik | 10 |
| Kaleng | 20 |
| Cup Plastik | 5 |
| Kardus | 15 |
| Tutup Cup | 3 |
| Lainnya | TBD |

## 7. Model Bisnis: Freemium Barter & Upcycling Revenue

### 7.1 Cara Jual
Kafe menukar sampah plastik (cup/tutup/sedotan) **secara gratis** untuk mendapatkan layanan branding, sertifikasi Eco-Partner, dan promosi di aplikasi ReBrew.

### 7.2 Tingkatan Harga (Tier)

| Tier | Harga | Target |
|---|---|---|
| Starter | Gratis | < 1 ton sampah/tahun |
| 1 Ton Club | Rp 200.000/tahun | > 1 ton sampah/tahun — akses laporan ESG & fasilitas gold |
| Enterprise | Custom | Chain cafe |

### 7.3 Revenue Tambahan
- Mengolah sampah plastik jadi merchandise, furnitur, & figur unik bermargin tinggi (upcycling).
- Brand besar membayar slot logo di aplikasi & fisik tong sampah demi poin ESG (brand sponsorship).

### 7.4 Revenue Stream (ringkasan dari Business Model Canvas)
- **B2B Cafe Subscriptions / Listing Fee** — biaya kemitraan dari kafe untuk masuk peta lokasi Eco-Cafe & laporan branding.
- **Waste Arbitrage Margin** — selisih harga dari penjualan bulk plastic cup teragregasi ke pabrik daur ulang.
- **Brand Sponsorship** — iklan/kampanye brand ramah lingkungan di dalam aplikasi.

### 7.5 Alasan Keberlanjutan
- Kafe terikat pada citra brand ramah lingkungan yang disukai konsumen Gen-Z (retensi mitra).
- Penjemputan B2B di kawasan coffee shop yang padat menekan biaya operasional armada dibanding model rumah-ke-rumah.

## 8. Business Model Canvas (ringkasan)

- **Key Partners:** owner coffee shop/kafe lokal, mitra pengepul/armada pengangkut, pabrik daur ulang (off-taker PET/PP), komunitas mahasiswa & eco-influencer.
- **Key Activities:** pengembangan & maintenance aplikasi (gamifikasi, scan QR, social feed), campaign & co-branding dengan kafe mitra untuk UGC.
- **Key Resources:** aplikasi consumer PilahCash, basis data aktivitas untuk leaderboard, jaringan mitra kafe & off-taker.
- **Channels:** aplikasi PilahCash (mobile, modul utama customer), media sosial organik (postingan "flexing" pengguna di IG/TikTok).
- **Cost Structure:** tech & infrastructure (dev, cloud, maintenance), marketing & user acquisition (promosi, voucher, co-branding), operational & logistics (pengumpulan & transportasi limbah kafe → off-taker).

## 9. Strategi Masuk Pasar & Roadmap

### Tahun 1 — Pilot & Proof of Concept (Validasi & MVP, Kemitraan Strategis & Komunitas)
- Launching MVP **non-IoT** di 15–20 coffee shop lokal, episentrum **Surabaya/Malang**, + 2 micro-hub area kos untuk kemudahan validasi.
- Peluncuran modul aplikasi (User app, SaaS Partner dashboard, Collector app).
- Target: 50 coffee shop & 10 micro-hub komunitas.
- Validasi penghematan biaya logistik hingga 70% (target).
- Kolaborasi dengan asosiasi kafe/F&B lokal, konsolidasi jaringan pengepul.
- Menggunakan Sertifikat Eco-Partner & Laporan ESG bulanan sebagai hook penjualan paket langganan SaaS ke owner coffee shop.

### Tahun 2 — Regional Expansion & B2B Scaling (Penetrasi Green Branding B2B)
- Ekspansi ke **500+ coffee shop** di wilayah Jawa Timur & Jabodetabek.
- Peluncuran fitur otomatisasi payout dan rekap laporan ESG bulanan otomatis di SaaS Partner.
- Kontrak eksklusif pasokan bulk dengan 3 pabrik daur ulang (off-taker).

### Tahun 3 — National Scale & EPR Monetization (Off-Taker Contract & Data Traceability)
- Penetrasi ke **2.000+ jaringan F&B** dan micro-hub di seluruh Indonesia.
- Komersialisasi penuh platform data traceability daur ulang untuk pemenuhan kewajiban EPR brand FMCG skala besar.
- Pelaksanaan modul IoT tempat sampah guna membangun branding.
- Penandatanganan kontrak pasokan bulk (tonase) langsung ke pabrik daur ulang, serta monetisasi data rantai pasok untuk corporate EPR.

## 10. Rencana Anggaran & Proyeksi Keuangan

**Belum diisi.** Slide kosong ("Kebutuhan Dana Awal 1 Tahun", "Total Pendapatan per Bulan", "Analisis Keuntungan/Kerugian", BEP/Margin/ROI) adalah template asli yang belum diisi. Ada juga satu slide dengan angka terisi (Rp276jt kebutuhan dana, Rp90jt pendapatan/bulan, BEP 7 bulan, dst) — tapi itu konfirmasi **dummy/placeholder** (kontennya menyebut hal tak relevan seperti regulasi OJK soal judi online dan kepatuhan KYC/AML fintech), jadi sengaja tidak dipakai di sini. Isi bagian ini dengan angka riil ReBrew begitu tersedia.

## 11. Branding

- **Nama aplikasi:** ReBrew
- **Tagline:** "Pilah Sampah, Ciptakan Dampak."
- **Makna logo:** tangan (kolaborasi & aksi nyata untuk lingkungan), daun (sampah bernilai jika dipilah dengan benar / melambangkan alam, keberlanjutan, kehidupan), koin "Rp" (nilai ekonomi & reward dari setiap kontribusi).
- **Warna brand:**
  - Hijau Tua `#2E7D32` — kepercayaan, stabilitas, keberlanjutan
  - Hijau Muda `#66BB6A` — segar, ramah, pertumbuhan
  - Kuning `#FFC107` — energi, optimis, insentif
  - Abu Tua `#212121` — profesional, modern

## 12. Metrik Keberhasilan (indikatif, perlu dikonfirmasi target angka)

- Jumlah coffee shop mitra aktif per tahun (target roadmap: 50 → 500+ → 2.000+).
- Volume sampah plastik cup terkumpul (kg/bulan) per kafe & agregat platform.
- CO₂ terselamatkan (kg).
- Retensi mitra kafe (upgrade Starter → 1 Ton Club → Enterprise).
- Engagement gamifikasi: streak, misi harian, klaim reward.
- Penghematan biaya logistik vs model rumah-ke-rumah (target 70%).

## 13. Risiko & Pertanyaan Terbuka

- Detail keuangan (kebutuhan dana, proyeksi pendapatan, BEP, ROI) belum final — lihat §10.
- Poin/kg untuk kategori "Lainnya" belum ditentukan.
- Mekanisme pencairan poin ke rupiah (payout) — disebut sebagai fitur roadmap Tahun 2, belum dispesifikasi detail flow-nya.
- Definisi teknis "Micro-Hub" (lokasi, kepemilikan, siapa yang mengoperasikan) belum dirinci di deck.