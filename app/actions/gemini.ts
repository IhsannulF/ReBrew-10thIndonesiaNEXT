'use server'

import { GoogleGenAI } from '@google/genai'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { AiRecommendation, AiDiagnosticAnalysis } from '@/types/insight'
import { AI_RECOMMENDATIONS } from '@/constants/aiInsightData'

export interface GeminiAdvisorContext {
  cafeName?: string
  totalKg?: number
  saldoPoin?: number
  topCategory?: string
  streakDays?: number
  iteration?: number
}

// 5 Varied Strategic Angles to explore on each generation
const STRATEGY_ANGLES = [
  'Fokus: Monetisasi Ampas Kopi, Upcycling Limbah Organik & Produk Turunan (Scrub/Pupuk)',
  'Fokus: Gamifikasi Tim Barista & Standardisasi Meja Bar untuk Pemilahan Cup PP Cepat',
  'Fokus: Green Loyalty Marketing, Kampanye Bawa Tumbler & Diskon Ramah Lingkungan untuk Pelanggan',
  'Fokus: Efisiensi Logistik, Bundling Kardus Susu/Kaleng Krimer & Penjadwalan Jemput Hemat Emisi',
  'Fokus: Kesiapan Audit ESG Kafe, Branding Zero-Waste & Kemitraan Sirkular B2B'
]

export async function generateGeminiStrategicInsights(customContext?: GeminiAdvisorContext): Promise<{
  success: boolean
  diagnostic: AiDiagnosticAnalysis
  recommendations: AiRecommendation[]
  error?: string
  modelUsed?: string
}> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 1. Ambil Profil Lengkap User dari Database
  let userName = 'Mitra ReBrew'
  let cafeName = customContext?.cafeName || 'Mitra Kafe ReBrew'
  let userCity = 'Surabaya'
  let userTier = 'starter'
  let saldoPoin = Number(customContext?.saldoPoin ?? 0)
  let totalKg = Number(customContext?.totalKg ?? 0)
  let streakDays = Number(customContext?.streakDays ?? 0)

  if (user?.id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profile) {
      userName = profile.full_name || user?.user_metadata?.full_name || userName
      cafeName = profile.cafe_name || user?.user_metadata?.cafe_name || cafeName
      userCity = profile.city || user?.user_metadata?.city || userCity
      userTier = profile.tier || 'starter'
      saldoPoin = Number(profile.saldo_poin ?? saldoPoin)
      totalKg = Number(profile.total_kg ?? totalKg)
      streakDays = Number(profile.active_streak_days ?? streakDays)
    }
  }

  // 2. Ambil Riwayat Transaksi Nyata User dari Database
  let txCount = 0
  let confirmedTxCount = 0
  let depositedCategories: string[] = []
  let favoriteMethod = 'Drop Point Hub'

  if (user?.id) {
    const { data: txList } = await supabase
      .from('transactions')
      .select('id, method, total_weight_kg, total_points, status, category, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (txList && txList.length > 0) {
      txCount = txList.length
      confirmedTxCount = txList.filter((t) => t.status === 'confirmed' || t.status === 'completed').length
      
      const catSet = new Set<string>()
      txList.forEach((t) => {
        if (t.category) catSet.add(t.category)
      })
      depositedCategories = Array.from(catSet)

      const pickupCount = txList.filter((t) => t.method === 'dijemput').length
      favoriteMethod = pickupCount > txCount / 2 ? 'Armada Jemput ke Kafe' : 'Drop Point Central Hub'
    }
  }

  // 3. Ambil Target Bulanan & Progress
  let targetKg = 25.0
  let targetProgressPercent = 0
  let isTargetAchieved = false

  if (user?.id) {
    const { data: targetData } = await supabase
      .from('monthly_targets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (targetData) {
      targetKg = Number(targetData.target_kg || 25.0)
      isTargetAchieved = Boolean(targetData.is_achieved || totalKg >= targetKg)
    }
    targetProgressPercent = Math.min(100, Math.round((totalKg / targetKg) * 100))
  }

  // 4. Ambil Badge yang Sudah Terbuka
  let unlockedBadgeNames: string[] = []
  if (user?.id) {
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('badge_id, eco_badges(name)')
      .eq('user_id', user.id)

    if (userBadges && userBadges.length > 0) {
      unlockedBadgeNames = userBadges.map((b: any) => b.eco_badges?.name || b.badge_id)
    }
  }

  // 5. Ambil Riwayat Penarikan Dana Kas (Payouts)
  let payoutCount = 0
  let totalWithdrawnIdr = 0
  if (user?.id) {
    const { data: payoutList } = await supabase
      .from('payouts')
      .select('amount_idr, status')
      .eq('user_id', user.id)

    if (payoutList && payoutList.length > 0) {
      payoutCount = payoutList.length
      totalWithdrawnIdr = payoutList
        .filter((p) => p.status === 'completed')
        .reduce((sum, curr) => sum + Number(curr.amount_idr || 0), 0)
    }
  }

  const iteration = Math.abs(Number(customContext?.iteration ?? Date.now()))
  const selectedAngle = STRATEGY_ANGLES[iteration % STRATEGY_ANGLES.length]
  const isNewAccount = totalKg === 0 && txCount === 0

  const nowTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) + ' WIB'

  if (!apiKey) {
    return {
      success: true,
      diagnostic: {
        executiveSummary: isNewAccount
          ? `Selamat datang ${userName} di ${cafeName} (${userCity})! Akun Anda baru terdaftar dengan saldo 0 poin dan belum memiliki setoran limbah. Segera kumpulkan cup plastik PP dan botol PET pertama Anda untuk mengaktifkan AI Eco-Advisor dan mendapatkan uang kas.`
          : `Analisis Cerdas ${cafeName}: Pengelolaan ${totalKg} kg sampah (${(totalKg * 1.2).toFixed(1)} kg CO₂e dicegah) dengan saldo ${saldoPoin.toLocaleString('id-ID')} poin aktif menunjukkan tren keberlanjutan yang sangat baik di ${userCity}.`,
        wasteHighlights: isNewAccount
          ? [
              'Status: Pendaftaran Mitra Baru — Belum ada riwayat setoran limbah.',
              `Lokasi Kafe: ${userCity} — Drop Point Hub dan Armada Jemput siap melayani.`,
              'Setiap 1 kg cup plastik bernilai poin yang dapat ditukar uang kas kapan saja.'
            ]
          : [
              `Total setoran terverifikasi: ${confirmedTxCount} kali transaksi (${totalKg} kg total).`,
              `Kategori limbah terkelola: ${depositedCategories.join(', ') || 'Cup Plastik PP'}.`,
              `Pencapaian target bulanan: ${targetProgressPercent}% (${totalKg}/${targetKg} kg).`
            ],
        revenueOpportunities: isNewAccount
          ? [
              'Kumpulkan 5 kg cup plastik pertama untuk klaim hingga 75 Poin ReBrew.',
              'Tukarkan poin hasil setor sampah menjadi saldo rupiah gratis biaya admin.'
            ]
          : [
              `Tukarkan saldo ${saldoPoin} Poin menjadi Rp ${(saldoPoin * 35).toLocaleString('id-ID')} uang kas di menu Tarik Uang.`,
              `Tingkatkan frekuensi setor melalui ${favoriteMethod} untuk bonus poin sirkular.`
            ],
        esgReadiness: isNewAccount ? 'Tahap Onboarding: Menunggu Setoran Pertama' : 'Grade A+: Siap Verifikasi Kemitraan ESG 2026',
        lastGeneratedAt: nowTime,
      },
      recommendations: AI_RECOMMENDATIONS,
      error: 'GEMINI_API_KEY belum dikonfigurasi. Menampilkan analisis cerdas default.',
    }
  }

  // 6. Susun Prompt Komprehensif Berisi Seluruh Data User Nyata
  const prompt = `
Anda adalah "ReBrew AI Eco-Advisor", sistem pakar sirkularitas limbah kafe kopi dan Waste Management-as-a-Service (WMaaS).

DATA LENGKAP MITRA KAFE DARI DATABASE:
- Nama Kafe: "${cafeName}"
- Nama Barista / Pemilik: "${userName}"
- Kota Operasional: "${userCity}"
- Status Akun: ${isNewAccount ? 'Mitra Baru Terdaftar (0 kg sampah, belum pernah setor)' : 'Mitra Aktif'}
- Total Sampah Didaur Ulang: ${totalKg} kg (Estimasi Reduksi Emisi: ${(totalKg * 1.2).toFixed(1)} kg CO₂e)
- Saldo Poin Kas Aktif: ${saldoPoin} Poin (Nilai Tukar Kas Bersih: Rp ${(saldoPoin * 35).toLocaleString('id-ID')})
- Target Bulanan: ${targetKg} kg (Progres: ${targetProgressPercent}%, Status: ${isTargetAchieved ? 'Target Tercapai' : 'Sedang Berjalan'})
- Riwayat Setoran: Total ${txCount} transaksi (${confirmedTxCount} berhasil terverifikasi)
- Kategori Sampah yang Pernah Disetor: ${depositedCategories.length > 0 ? depositedCategories.join(', ') : 'Belum ada setoran'}
- Metode Favorit: ${favoriteMethod}
- Riwayat Tarik Uang: ${payoutCount} kali pengajuan (Total kas ditarik: Rp ${totalWithdrawnIdr.toLocaleString('id-ID')})
- Badge Eco Terbuka: ${unlockedBadgeNames.length > 0 ? unlockedBadgeNames.join(', ') : 'Belum ada badge'}
- Hari Streak Aktif: ${streakDays} hari berturut-turut

TEMA EKSPLORASI KHUSUS SESI INI:
"${selectedAngle}"
Timestamp Generasi: "${nowTime}" (Sesi Analisis #${iteration})

PETUNJUK ANALISIS & GAYA BAHASA (WAJIB DIIKUTI):
1. PERSONALISASI NYATA: Rujuk langsung nama kafe "${cafeName}", kota "${userCity}", total ${totalKg} kg, saldo ${saldoPoin} poin, dan data spesifik kafe di atas dalam kalimat ulasan Anda. Jangan gunakan kalimat template generik!
2. KALIMAT INSIGHT YANG UNIK & SEGAR: Hasilkan narasi diagnostik yang mendalam, inspiratif, solutif, dan mengeksplorasi sudut pandang "${selectedAngle}".
3. ${isNewAccount ? 'Karena kafe ini baru mendaftar (0 kg), berikan panduan onboarding taktis langkah pertama untuk memulai pemilahan di area bar kopi, potensi cuan pertama, dan cara menjadwalkan penjemputan/drop point.' : 'Berikan insight evaluasi performa, celah peningkatan volume daur ulang, dan strategi monetisasi kas.'}

KEMBALIKAN RESPON HANYA BERUPA FORMAT JSON MURNI VALID:
{
  "diagnostic": {
    "executiveSummary": "1-2 paragraf ringkasan eksekutif cerdas dan mendalam yang menyebutkan data ${cafeName} secara spesifik",
    "wasteHighlights": [
      "Highlight temuan spesifik 1",
      "Highlight temuan spesifik 2",
      "Highlight temuan spesifik 3"
    ],
    "revenueOpportunities": [
      "Peluang monetisasi poin kas nyata 1",
      "Peluang monetisasi poin kas nyata 2"
    ],
    "esgReadiness": "${isNewAccount ? 'Tahap Onboarding: Menunggu Setoran Pertama' : 'Grade A+: Siap Verifikasi Kemitraan ESG 2026'}"
  },
  "recommendations": [
    {
      "id": "rec-${Date.now()}-1",
      "category": "sorting_efficiency",
      "categoryLabel": "Efisiensi Pemilahan",
      "icon": "cleaning_services",
      "title": "Judul rekomendasi pemilahan yang spesifik untuk ${cafeName}",
      "description": "Deskripsi taktis operasional barista",
      "impactLabel": "+150 Poin / Minggu",
      "priority": "high",
      "actionText": "Terapkan di Bar",
      "actionSteps": ["Langkah 1", "Langkah 2", "Langkah 3"]
    },
    {
      "id": "rec-${Date.now()}-2",
      "category": "upcycling_revenue",
      "categoryLabel": "Upcycling & Kas",
      "icon": "payments",
      "title": "Judul rekomendasi monetisasi kas yang spesifik",
      "description": "Deskripsi potensi cuan",
      "impactLabel": "Tarik Kas Rp 150rb+",
      "priority": "high",
      "actionText": "Cairkan Saldo",
      "actionSteps": ["Langkah 1", "Langkah 2"]
    },
    {
      "id": "rec-${Date.now()}-3",
      "category": "green_branding",
      "categoryLabel": "Branding Hijau",
      "icon": "campaign",
      "title": "Judul rekomendasi branding yang spesifik untuk pelanggan di ${userCity}",
      "description": "Deskripsi kampanye pelanggan",
      "impactLabel": "Tarik Pelanggan Gen-Z",
      "priority": "medium",
      "actionText": "Klaim Sertifikat",
      "actionSteps": ["Langkah 1", "Langkah 2"]
    },
    {
      "id": "rec-${Date.now()}-4",
      "category": "logistics_saving",
      "categoryLabel": "Optimasi Logistik",
      "icon": "local_shipping",
      "title": "Judul rekomendasi logistik yang spesifik",
      "description": "Deskripsi jadwal & penyimpanan",
      "impactLabel": "Bebas Biaya Jemput",
      "priority": "medium",
      "actionText": "Jadwalkan Setor",
      "actionSteps": ["Langkah 1", "Langkah 2"]
    }
  ]
}
`

  const ai = new GoogleGenAI({ apiKey })
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature: 0.9, // High creativity for rich sentence diversity
          responseMimeType: 'application/json',
        },
      })

      if (response.text) {
        const parsed = JSON.parse(response.text)
        if (parsed.diagnostic && parsed.recommendations) {
          return {
            success: true,
            diagnostic: {
              ...parsed.diagnostic,
              lastGeneratedAt: nowTime,
            },
            recommendations: parsed.recommendations,
            modelUsed: `${modelName} (${selectedAngle})`,
          }
        }
      }
    } catch (err: any) {
      console.warn(`Model ${modelName} JSON analysis attempt failed:`, err?.message || err)
    }
  }

  // Fallback if AI server response is unavailable
  return {
    success: true,
    diagnostic: {
      executiveSummary: isNewAccount
        ? `Selamat datang ${userName} di ${cafeName} (${userCity})! Akun Anda baru terdaftar dengan saldo 0 poin dan belum memiliki setoran limbah. Segera kumpulkan cup plastik PP dan botol PET pertama Anda untuk mengaktifkan AI Eco-Advisor dan mendapatkan uang kas.`
        : `Analisis Cerdas ${cafeName}: Pengelolaan ${totalKg} kg sampah (${(totalKg * 1.2).toFixed(1)} kg CO₂e dicegah) dengan saldo ${saldoPoin.toLocaleString('id-ID')} poin aktif menunjukkan tren keberlanjutan yang sangat baik di ${userCity}.`,
      wasteHighlights: isNewAccount
        ? [
            'Status: Pendaftaran Mitra Baru — Belum ada riwayat setoran limbah.',
            `Lokasi Kafe: ${userCity} — Drop Point Hub dan Armada Jemput siap melayani.`,
            'Setiap 1 kg cup plastik bernilai poin yang dapat ditukar uang kas kapan saja.'
          ]
        : [
            `Total setoran terverifikasi: ${confirmedTxCount} kali transaksi (${totalKg} kg total).`,
            `Kategori limbah terkelola: ${depositedCategories.join(', ') || 'Cup Plastik PP'}.`,
            `Pencapaian target bulanan: ${targetProgressPercent}% (${totalKg}/${targetKg} kg).`
          ],
      revenueOpportunities: isNewAccount
        ? [
            'Kumpulkan 5 kg cup plastik pertama untuk klaim hingga 75 Poin ReBrew.',
            'Tukarkan poin hasil setor sampah menjadi saldo rupiah gratis biaya admin.'
          ]
        : [
            `Tukarkan saldo ${saldoPoin} Poin menjadi Rp ${(saldoPoin * 35).toLocaleString('id-ID')} uang kas di menu Tarik Uang.`,
            `Tingkatkan frekuensi setor melalui ${favoriteMethod} untuk bonus poin sirkular.`
          ],
      esgReadiness: isNewAccount ? 'Tahap Onboarding: Menunggu Setoran Pertama' : 'Grade A+: Siap Kemitraan Sirkular ESG 2026',
      lastGeneratedAt: nowTime,
    },
    recommendations: AI_RECOMMENDATIONS,
    modelUsed: `ReBrew Engine (${selectedAngle})`,
  }
}
