import {
  AiRecommendation,
  WasteProjection,
  EcoScoreMetrics,
} from "@/types/insight";

export const DEFAULT_ECO_METRICS: EcoScoreMetrics = {
  overallScore: 0,
  scoreLabel: "Memulai Daur Ulang",
  rankingCityText: "Peringkat #1 Mitra ReBrew",
  sortedRatioPercent: 0,
  cleanlinessScore: 0,
  pickupEfficiencyScore: 0,
};

export const DEFAULT_PROJECTION: WasteProjection = {
  currentKg: 0,
  projectedKg: 0,
  targetKg: 25.0,
  projectedPoints: 0,
  co2SavedKg: 0,
  peakDays: "Belum Ada Data",
  peakHours: "Menunggu Setoran Pertama",
  trendPercentage: 0,
};

export const AI_RECOMMENDATIONS: AiRecommendation[] = [
  {
    id: "rec-default-1",
    category: "sorting_efficiency",
    categoryLabel: "Efisiensi Pemilahan",
    icon: "cleaning_services",
    title: "Setup Bin Pemilahan Cup Plastik di Bar",
    description:
      "Sediakan tempat penampungan terpisah untuk cup plastik PP & botol PET di bawah meja bar untuk memulai pengumpulan limbah bersih perdana.",
    impactLabel: "+1.750 Poin Pertama",
    priority: "high",
    actionText: "Setor Sampah",
    actionHref: "/dashboard/setor",
    actionSteps: [
      "Sediakan 1 bin khusus cup di dekat knockbox bar",
      "Tiriskan sisa es kopi dan cairan sebelum cup ditumpuk",
      "Kumpulkan minimal 5 kg untuk setoran perdana"
    ]
  },
  {
    id: "rec-default-2",
    category: "upcycling_revenue",
    categoryLabel: "Upcycling & Kas",
    icon: "payments",
    title: "Aktivasi Saldo Kas Pertama Kafe",
    description:
      "Setiap 1 kg sampah bernilai poin yang langsung dapat dicairkan menjadi saldo rupiah ke rekening bank atau e-wallet kafe Anda.",
    impactLabel: "Tarik Kas Rp 87.500+",
    priority: "high",
    actionText: "Buka Halaman Saldo",
    actionHref: "/dashboard/saldo",
    actionSteps: [
      "Kumpulkan cup plastik dan kardus kemasan susu",
      "Tukarkan poin hasil setor limbah di platform ReBrew",
      "Cairkan dana kas langsung tanpa biaya admin"
    ]
  },
  {
    id: "rec-default-3",
    category: "logistics_saving",
    categoryLabel: "Optimasi Logistik",
    icon: "local_shipping",
    title: "Pilih Drop Point atau Penjemputan Armada",
    description:
      "Pilih opsi antar ke Drop Point ReBrew terdekat atau pesan penjemputan armada gratis untuk berat di atas 10 kg.",
    impactLabel: "Bebas Biaya Jemput",
    priority: "medium",
    actionText: "Pilih Metode Setor",
    actionHref: "/dashboard/setor",
    actionSteps: [
      "Cek daftar lokasi Drop Point Hub terdekat",
      "Atau jadwalkan armada jemput saat limbah terkumpul banyak",
      "Dapatkan struk verifikasi timbangan digital secara real-time"
    ]
  },
  {
    id: "rec-default-4",
    category: "green_branding",
    categoryLabel: "Branding Hijau",
    icon: "campaign",
    title: "Persiapan Sertifikasi ESG Kafe",
    description:
      "Raih sertifikat kemitraan sirkular resmi ReBrew Eco-Partner untuk dipajang di kasir dan menarik pelanggan loyal ramah lingkungan.",
    impactLabel: "Tarik Pelanggan Gen-Z",
    priority: "medium",
    actionText: "Lihat Sertifikat ESG",
    actionHref: "/dashboard/insight#sertifikat-esg",
    actionSteps: [
      "Selesaikan setoran limbah pertama kafe",
      "Unduh sertifikat digital kemitraan sirkular",
      "Promosikan inisiatif ramah lingkungan di media sosial kafe"
    ]
  },
];
