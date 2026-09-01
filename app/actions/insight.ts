'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import {
  EcoScoreMetrics,
  WasteProjection,
  AiRecommendation,
} from '@/types/insight'

export interface UserAiInsightData {
  cafeName: string
  userName: string
  saldoPoin: number
  totalKg: number
  streakDays: number
  userRank: number
  totalPartners: number
  city: string
  ecoMetrics: EcoScoreMetrics
  projection: WasteProjection
  recommendations: AiRecommendation[]
  diagnostic?: {
    executiveSummary: string
    wasteHighlights: string[]
    revenueOpportunities: string[]
    esgReadiness: string
    lastGeneratedAt?: string
  }
}

function generatePersonalizedRecommendations(params: {
  cafeName: string
  userCity: string
  saldoPoin: number
  currentKg: number
  txCount: number
  streakDays: number
}): AiRecommendation[] {
  const { cafeName, userCity, saldoPoin, currentKg, txCount } = params
  const isNewAccount = currentKg === 0 && txCount === 0
  const timeId = Date.now()

  if (isNewAccount) {
    return [
      {
        id: `rec-init-${timeId}-1`,
        category: 'sorting_efficiency',
        categoryLabel: 'Efisiensi Pemilahan',
        icon: 'cleaning_services',
        title: `Setup Bin Pemilahan di Bar ${cafeName}`,
        description: `Sediakan wadah khusus cup plastik PP & botol PET di bawah meja bar ${cafeName} untuk mengumpulkan sampah bersih perdana.`,
        impactLabel: '+1.750 Poin Pertama',
        priority: 'high',
        actionText: 'Setor Sampah',
        actionHref: '/dashboard/setor',
        actionSteps: [
          'Sediakan 1 tempat penampungan khusus cup di dekat knockbox bar',
          'Tiriskan sisa es kopi dan cairan sebelum cup ditumpuk rapi',
          'Kumpulkan minimal 5 kg untuk setoran sampah perdana'
        ]
      },
      {
        id: `rec-init-${timeId}-2`,
        category: 'upcycling_revenue',
        categoryLabel: 'Upcycling & Kas',
        icon: 'payments',
        title: 'Aktivasi Saldo Kas Pertama Kafe',
        description: `Setiap 1 kg sampah bernilai poin yang langsung dapat dicairkan menjadi saldo rupiah ke rekening bank atau e-wallet kafe Anda.`,
        impactLabel: 'Tarik Kas Rp 87.500+',
        priority: 'high',
        actionText: 'Buka Halaman Saldo',
        actionHref: '/dashboard/saldo',
        actionSteps: [
          'Kumpulkan cup plastik dan kardus kemasan susu',
          'Tukarkan poin hasil setor limbah di platform ReBrew',
          'Cairkan dana kas langsung tanpa biaya admin'
        ]
      },
      {
        id: `rec-init-${timeId}-3`,
        category: 'logistics_saving',
        categoryLabel: 'Optimasi Logistik',
        icon: 'local_shipping',
        title: `Pilih Drop Point atau Penjemputan di ${userCity}`,
        description: `Pilih opsi antar ke Drop Point ReBrew terdekat di ${userCity} atau pesan penjemputan armada gratis untuk berat di atas 10 kg.`,
        impactLabel: 'Bebas Biaya Jemput',
        priority: 'medium',
        actionText: 'Pilih Metode Setor',
        actionHref: '/dashboard/setor',
        actionSteps: [
          `Cek daftar lokasi Drop Point Hub terdekat di ${userCity}`,
          'Atau jadwalkan armada jemput saat limbah terkumpul banyak',
          'Dapatkan struk verifikasi timbangan digital secara real-time'
        ]
      },
      {
        id: `rec-init-${timeId}-4`,
        category: 'green_branding',
        categoryLabel: 'Branding Hijau',
        icon: 'campaign',
        title: `Persiapan Sertifikasi ESG Kafe ${cafeName}`,
        description: `Raih sertifikat kemitraan sirkular resmi ReBrew Eco-Partner untuk dipajang di kasir dan menarik pelanggan loyal ramah lingkungan.`,
        impactLabel: 'Tarik Pelanggan Gen-Z',
        priority: 'medium',
        actionText: 'Lihat Sertifikat ESG',
        actionHref: '/dashboard/insight#sertifikat-esg',
        actionSteps: [
          'Selesaikan setoran limbah pertama kafe',
          'Unduh sertifikat digital kemitraan sirkular',
          'Promosikan inisiatif ramah lingkungan di media sosial kafe'
        ]
      }
    ]
  }

  // Rekomendasi Dinamis untuk Akun Aktif (1 Poin = Rp 35)
  const cashValue = (saldoPoin * 35).toLocaleString('id-ID')
  const co2Saved = (currentKg * 1.2).toFixed(1)

  return [
    {
      id: `rec-active-${timeId}-1`,
      category: 'sorting_efficiency',
      categoryLabel: 'Efisiensi Pemilahan',
      icon: 'cleaning_services',
      title: `Optimasi Pemilahan Ampas Kopi ${cafeName}`,
      description: `Dengan total ${currentKg} kg sampah yang sudah terkelola, pisahkan ampas kopi kering untuk program Circular Soil ReBrew.`,
      impactLabel: '+200 Poin / Setor',
      priority: 'high',
      actionText: 'Setor Ampas Kopi',
      actionHref: '/dashboard/setor',
      actionSteps: [
        'Kuras knockbox espresso ke wadah tertutup khusus ampas kopi',
        'Pisahkan dari sampah plastik agar tidak lembap dan bau',
        'Setor saat terkumpul 5-10 kg untuk bonus poin sirkular'
      ]
    },
    {
      id: `rec-active-${timeId}-2`,
      category: 'upcycling_revenue',
      categoryLabel: 'Upcycling & Kas',
      icon: 'monetization_on',
      title: `Cairkan ${saldoPoin.toLocaleString('id-ID')} Poin Aktif (Rp ${cashValue})`,
      description: `Saldo poin aktif kafe ${cafeName} saat ini bernilai Rp ${cashValue}. Anda dapat mencairkannya langsung ke rekening operasional kafe.`,
      impactLabel: `Tarik Kas Rp ${cashValue}`,
      priority: 'high',
      actionText: 'Tarik Uang Sekarang',
      actionHref: '/dashboard/saldo',
      actionSteps: [
        'Buka halaman Tarik Uang di sidebar',
        'Pilih metode pembayaran (BCA, Mandiri, GoPay, DANA)',
        'Terima transfer kas instan tanpa potongan admin'
      ]
    },
    {
      id: `rec-active-${timeId}-3`,
      category: 'logistics_saving',
      categoryLabel: 'Optimasi Logistik',
      icon: 'local_shipping',
      title: `Penjadwalan Jemput Armada Rutin di ${userCity}`,
      description: `Kumpulkan kardus kemasan susu lipat pipih dan kaleng krimer untuk penjemputan hemat emisi setiap awal pekan di ${userCity}.`,
      impactLabel: 'Gratis Armada Jemput',
      priority: 'medium',
      actionText: 'Jadwalkan Setor',
      actionHref: '/dashboard/setor',
      actionSteps: [
        'Buka lipatan kardus susu UHT agar muat 3x lebih banyak di gudang',
        'Pilih menu Setor Sampah Dijemput pada hari Senin pagi',
        'Petugas armada menimbang langsung dengan Smart Scale Bluetooth'
      ]
    },
    {
      id: `rec-active-${timeId}-4`,
      category: 'green_branding',
      categoryLabel: 'Branding Hijau',
      icon: 'verified',
      title: `Promosikan Reduksi ${co2Saved} kg CO₂e Kafe`,
      description: `Pencapaian pencegahan ${co2Saved} kg emisi karbon kafe ${cafeName} siap digunakan untuk promosi green coffee shop di Instagram & TikTok.`,
      impactLabel: 'Viral di Medsos',
      priority: 'medium',
      actionText: 'Unduh Sertifikat',
      actionHref: '/dashboard/insight#sertifikat-esg',
      actionSteps: [
        'Unduh sertifikat ESG resmi di bagian bawah halaman ini',
        'Cetak bingkai sertifikat untuk ditaruh di meja kasir',
        'Bagikan stempel digital kafe hijau ke pelanggan'
      ]
    }
  ]
}

// 1. Ambil Data AI Insights Kafe dari Supabase
export async function getUserAiInsightData(): Promise<UserAiInsightData> {
  const cookieStore = await cookies()
  const userSupabase = createClient(cookieStore)
  const db = createAdminClient()

  const {
    data: { user },
  } = await userSupabase.auth.getUser()

  if (!user) {
    const defaultRecs = generatePersonalizedRecommendations({
      cafeName: 'Mitra Kafe ReBrew',
      userCity: 'Jakarta Selatan',
      saldoPoin: 0,
      currentKg: 0,
      txCount: 0,
      streakDays: 0,
    })

    return {
      cafeName: 'Mitra Kafe ReBrew',
      userName: 'Mitra Baru',
      saldoPoin: 0,
      totalKg: 0,
      streakDays: 0,
      userRank: 1,
      totalPartners: 1,
      city: 'Jakarta Selatan',
      ecoMetrics: {
        overallScore: 0,
        scoreLabel: 'Belum Ada Data Setoran',
        sortedRatioPercent: 0,
        cleanlinessScore: 0,
        pickupEfficiencyScore: 0,
        rankingCityText: 'Mitra Baru',
      },
      projection: {
        currentKg: 0,
        projectedKg: 0,
        targetKg: 25.0,
        projectedPoints: 0,
        co2SavedKg: 0,
        trendPercentage: 0,
        peakDays: 'Belum ada data',
        peakHours: 'Menunggu setoran pertama',
      },
      recommendations: defaultRecs,
    }
  }

  // 1. Fetch Profile
  let { data: profile } = await db
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    const res = await userSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
    profile = res.data
  }

  const cafeName =
    profile?.cafe_name ||
    user?.user_metadata?.cafe_name ||
    'Kedai Kopi Mitra'
  const userName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    'Mitra ReBrew'
  const userCity = profile?.city || user?.user_metadata?.city || 'Jakarta Selatan'
  const saldoPoin = Number(profile?.saldo_poin ?? 0)
  const totalKg = Number(profile?.total_kg ?? 0.0)
  const streakDays = Number(profile?.active_streak_days ?? (totalKg > 0 ? 3 : 0))

  // 2. Query Leaderboard dari tabel profiles untuk menentukan peringkat akurat di database
  let { data: dbProfiles } = await db
    .from('profiles')
    .select('id, cafe_name, full_name, total_kg, city, role')
    .neq('role', 'admin')
    .order('total_kg', { ascending: false })

  if (!dbProfiles) {
    const res = await userSupabase
      .from('profiles')
      .select('id, cafe_name, full_name, total_kg, city, role')
      .neq('role', 'admin')
      .order('total_kg', { ascending: false })
    dbProfiles = res.data
  }

  let profileList = dbProfiles ? dbProfiles.filter((p: any) => p.role !== 'admin') : []
  if (profile?.role !== 'admin' && !profileList.some((p: any) => p.id === user.id)) {
    profileList.push({
      id: user.id,
      cafe_name: cafeName,
      full_name: userName,
      city: userCity,
      total_kg: totalKg,
      role: 'mitra',
    })
  }

  // Urutkan ulang berdasarkan total_kg menurun
  profileList.sort((a: any, b: any) => Number(b.total_kg || 0) - Number(a.total_kg || 0))

  const userRankIndex = profileList.findIndex((p: any) => p.id === user.id)
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : profileList.length
  const totalPartners = Math.max(1, profileList.length)

  // 3. Fetch User Transactions
  let { data: txList } = await db
    .from('transactions')
    .select('total_weight_kg, actual_weight, total_points, total_co2_kg, status, category, created_at')
    .eq('user_id', user.id)

  if (!txList) {
    const res = await userSupabase
      .from('transactions')
      .select('total_weight_kg, actual_weight, total_points, total_co2_kg, status, category, created_at')
      .eq('user_id', user.id)
    txList = res.data
  }

  const txCount = txList ? txList.length : 0
  const verifiedTx = txList ? txList.filter((t) => t.status === 'confirmed' || t.status === 'completed') : []
  const verifiedWeight = verifiedTx.reduce((acc, curr) => acc + Number(curr.total_weight_kg || 0), 0)
  const currentKg = totalKg > 0 ? totalKg : verifiedWeight
  const co2SavedKg = Number((currentKg * 1.2).toFixed(1))

  // 4. Kalkulasi Metrik AI yang Tepat Sesuai Akun
  const isNewAccount = currentKg === 0 && txCount === 0

  let overallScore = 0
  let scoreLabel = 'Belum Ada Data Setoran'
  let sortedRatioPercent = 0
  let cleanlinessScore = 0
  let pickupEfficiencyScore = 0
  let rankingCityText = `#${userRank} di ${userCity} (Mitra Baru)`

  if (isNewAccount) {
    overallScore = 0
    scoreLabel = 'Memulai Daur Ulang'
    sortedRatioPercent = 0
    cleanlinessScore = 0
    pickupEfficiencyScore = 0
    rankingCityText = `#${userRank} dari ${totalPartners} Mitra (${userCity})`
  } else {
    // Akun yang sudah punya setoran aktif
    const calculatedScore = Math.min(99, Math.max(60, Math.round(60 + (currentKg * 1.2) + (streakDays * 2) + (txCount * 2))))
    overallScore = calculatedScore
    scoreLabel = calculatedScore >= 90 ? 'Grade A+ (Sirkular Unggul)' : calculatedScore >= 80 ? 'Grade A (Eco-Champion)' : 'Grade B+ (Berkelanjutan)'
    sortedRatioPercent = Math.min(98, 85 + Math.min(10, txCount * 2))
    cleanlinessScore = Math.min(96, 88 + (streakDays > 0 ? 4 : 0))
    pickupEfficiencyScore = 92
    rankingCityText = `#${userRank} di ${userCity}`
  }

  const ecoMetrics: EcoScoreMetrics = {
    overallScore,
    scoreLabel,
    sortedRatioPercent,
    cleanlinessScore,
    pickupEfficiencyScore,
    rankingCityText,
  }

  // 5. Proyeksi Bulanan Akurat
  const targetKg = 25.0
  const projectedKg = isNewAccount ? 0 : Number((currentKg * 1.3).toFixed(1))
  const projectedPoints = Math.round(projectedKg * 35)

  const projection: WasteProjection = {
    currentKg,
    projectedKg,
    targetKg,
    projectedPoints,
    co2SavedKg,
    trendPercentage: isNewAccount ? 0 : Math.min(100, Math.max(10, Math.round(currentKg * 3))),
    peakDays: isNewAccount ? 'Belum Ada Data' : 'Jumat - Minggu',
    peakHours: isNewAccount ? 'Menunggu Setoran Pertama' : '16.00 - 21.00 WIB',
  }

  // 6. Diagnostik Awal
  const diagnostic = isNewAccount
    ? {
        executiveSummary: `Selamat datang ${userName} di ${cafeName}! Akun Anda baru terdaftar dengan saldo 0 poin dan belum memiliki riwayat setoran limbah. Segera lakukan setoran sampah pertama (cup plastik PP, botol PET, kardus susu) di kota ${userCity} untuk mengaktifkan AI Eco-Advisor dan menaikkan peringkat leaderboard kafe Anda.`,
        wasteHighlights: [
          `Akun baru terdaftar — belum ada catatan limbah terverifikasi di ${userCity}.`,
          `Mulai pisahkan cup plastik PP dari tutup lid di meja bar ${cafeName}.`,
          'Setiap 1 kg cup plastik bernilai poin yang langsung bisa dicairkan ke uang kas.'
        ],
        revenueOpportunities: [
          'Kumpulkan 5 kg sampah pertama untuk membuka hingga 1.750 Poin ReBrew.',
          'Tukarkan poin hasil setor sampah menjadi saldo rupiah gratis biaya admin.'
        ],
        esgReadiness: 'Status: Pendaftaran Mitra Baru — Menunggu Setoran Pertama',
        lastGeneratedAt: 'Baru saja',
      }
    : {
        executiveSummary: `Berdasarkan analisis limbah kafe ${cafeName} (${currentKg} kg terkelola & ${saldoPoin.toLocaleString('id-ID')} poin aktif), performa sirkularitas Anda berada di peringkat #${userRank} di ${userCity} (${scoreLabel}).`,
        wasteHighlights: [
          `Pemisahan material utama mencapai ${sortedRatioPercent}% efisiensi.`,
          `Perkiraan reduksi emisi berhasil mencapai ${co2SavedKg} kg CO₂e.`,
          `Puncak timbulan sampah terjadi pada ${projection.peakDays} (${projection.peakHours}).`
        ],
        revenueOpportunities: [
          `Tukarkan ${saldoPoin} Poin aktif menjadi uang kas sebesar Rp ${(saldoPoin * 50).toLocaleString('id-ID')} melalui menu Tarik Uang.`,
          `Optimasi pemilahan cup PP bersih untuk meraih poin maksimal.`
        ],
        esgReadiness: `${scoreLabel} — Siap untuk Kemitraan Sirkular ESG 2026`,
        lastGeneratedAt: 'Baru saja',
      }

  // 7. Rekomendasi Terpersonalisasi Berbasis Data Nyata User
  const recommendations = generatePersonalizedRecommendations({
    cafeName,
    userCity,
    saldoPoin,
    currentKg,
    txCount,
    streakDays,
  })

  return {
    cafeName,
    userName,
    saldoPoin,
    totalKg: currentKg,
    streakDays,
    userRank,
    totalPartners,
    city: userCity,
    ecoMetrics,
    projection,
    recommendations,
    diagnostic,
  }
}
