import {
  AiRecommendation,
  WasteProjection,
  EcoScoreMetrics,
} from "@/types/insight";

export const DEFAULT_ECO_METRICS: EcoScoreMetrics = {
  overallScore: 92,
  scoreLabel: "Sangat Baik (Eco Champion)",
  rankingCityText: "#2 dari 48 Coffee Shop di Surabaya",
  sortedRatioPercent: 88,
  cleanlinessScore: 95,
  pickupEfficiencyScore: 90,
};

export const DEFAULT_PROJECTION: WasteProjection = {
  currentKg: 14.6,
  projectedKg: 31.8,
  targetKg: 25.0,
  projectedPoints: 318,
  co2SavedKg: 15.9,
  peakDays: "Jumat, Sabtu & Minggu",
  peakHours: "15:00 - 20:00 WIB",
  trendPercentage: 27, // +27% vs bulan lalu
};

export const AI_RECOMMENDATIONS: AiRecommendation[] = [
  {
    id: "rec-1",
    category: "sorting_efficiency",
    categoryLabel: "Optimasi Pemilahan",
    icon: "coffee",
    title: "Pisahkan Lid & Straw dari Plastic Cup",
    description:
      "Data IoT menunjukkan 25% cup masih disetor bersama tutup. Memisahkan tutup plastik (PP/PET) secara khusus dapat meningkatkan nilai bulk grading off-taker hingga +15%.",
    impactLabel: "+15% Potensi Poin Tambahan",
    potentialPointsBonus: 35,
    priority: "high",
    actionText: "Lihat Panduan Pemilahan",
  },
  {
    id: "rec-2",
    category: "green_branding",
    categoryLabel: "Marketing & UGC",
    icon: "campaign",
    title: "Publikasi Pencapaian Mencegah 15.9 kg CO₂ di Instagram",
    description:
      "82% konsumen Gen-Z kafe menyukai transparansi aksi lingkungan. Bagikan kartu pencapaian ESG kafe ke Instagram Story untuk meningkatkan loyalitas pelanggan takeaway.",
    impactLabel: "Menaikkan Organic Footfall",
    priority: "high",
    actionText: "Buat Kartu Shareable",
  },
  {
    id: "rec-3",
    category: "logistics_saving",
    categoryLabel: "Jadwal Penjemputan",
    icon: "local_shipping",
    title: "Jadwalkan Armada Setiap Kamis Pukul 10:00 WIB",
    description:
      "Prediksi AI mendeteksi tempat sampah kafe akan mencapai kapasitas 85% pada hari Kamis malam. Penjemputan terjadwal hari Kamis pagi mengeliminasi risiko sampah meluap di akhir pekan.",
    impactLabel: "Hemat Waktu & Anti-Meluap",
    priority: "medium",
    actionText: "Atur Jadwal Rutin",
  },
  {
    id: "rec-4",
    category: "upcycling_revenue",
    categoryLabel: "Nilai Tambah Limbah",
    icon: "compost",
    title: "Aktifkan Program Briket Ampas Kopi (Spent Coffee Grounds)",
    description:
      "Ampas kopi dari 40 cup espresso per hari dapat dikeringkan untuk diolah menjadi briket arang ramah lingkungan oleh mitra off-taker ReBrew.",
    impactLabel: "+5 Poin per kg Ampas Kering",
    potentialPointsBonus: 25,
    priority: "medium",
    actionText: "Pelajari Program Briket",
  },
];

export const QUICK_PROMPT_LIST = [
  "Bagaimana cara menaikkan peringkat kafe di Surabaya?",
  "Berapa proyeksi rupiah jika mengumpulkan 50kg cup plastik?",
  "Apa strategi efektif mengajak barista disiplin memilah?",
  "Bagaimana cara klaim Sertifikat Eco-Partner 2026?",
];

export const MOCK_AI_RESPONSES: Record<string, string> = {
  "peringkat":
    "Untuk naik ke Peringkat #1 di Surabaya (saat ini selisih 4.2 kg dengan Kopi Kenangan Gubeng), fokuskan pengumpulan pada jam sibuk akhir pekan (Jumat-Minggu 15:00-20:00). Anda juga bisa mengajak pelanggan membawa cup bekas mereka kembali ke kafe dengan reward diskon Rp 2.000!",
  "rupiah":
    "Untuk 50 kg cup plastik (PP/PET), Anda akan memperoleh 250 Poin ReBrew (5 Poin/kg). Melalui fitur Tarik Uang (kurs Rp 50/poin), ini setara dengan Rp 12.500 uang tunai bersih, plus menghemat 60 kg emisi CO₂e dan akses ke Laporan ESG Gold Tier!",
  "barista":
    "Gunakan metode 'Color-Coded Bins' di stasiun cuci bar: 1) Tong Hijau khusus cup ditumpuk, 2) Tong Ungu khusus lid & sedotan, 3) Wadah Kering khusus ampas kopi. Berikan insentif bagi tim barista dengan sistem bagi koin bulanan!",
  "sertifikat":
    "Sertifikat Eco-Partner ReBrew 2026 otomatis di-generate secara digital setelah kafe mendaur ulang minimal 10 kg sampah per bulan. Anda bisa mengunduh PDF resminya langsung di bagian bawah halaman ini untuk dipajang di kasir kafe!",
  "default":
    "Berdasarkan analisis data timbangan IoT dan pola transaksi kafe Anda, ReBrew AI merekomendasikan pemilahan intensif pada jenis Plastic Cup PP dan Tutup Cup untuk memaksimalkan poin bulanan dan skor circularity ESG!",
};
