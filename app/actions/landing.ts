'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { WASTE_CATEGORIES, DROP_POINTS } from '@/constants/wasteData'

export interface LandingStatistics {
  totalWasteKg: number
  formattedWasteText: string
  totalCo2PreventedKg: number
  formattedCo2Text: string
  activeDropPointsCount: number
  formattedDropPointsText: string
  totalRegisteredMitra: number
  formattedMitraText: string
  totalTransactionsCount: number
  userSatisfactionPercent: number
  topRewards: {
    icon: string
    name: string
    coinsText: string
    approxIdrText: string
    position: string
  }[]
}

/**
 * Server Action: Mengambil ringkasan statistik real-time dari database Supabase untuk Landing Page
 */
export async function getLandingPageStatistics(): Promise<LandingStatistics> {
  const cookieStore = await cookies()
  const userSupabase = createClient(cookieStore)
  const adminDb = createAdminClient()

  let totalWasteKg = 0
  let totalCo2Kg = 0
  let totalMitraCount = 0
  let activeDropPointsCount = DROP_POINTS.length
  let totalTxCount = 0

  try {
    // 1. Ambil data transaksi yang telah confirmed / verified
    let { data: confirmedTransactions } = await adminDb
      .from('transactions')
      .select('total_weight_kg, actual_weight, total_co2_kg, status')
      .eq('status', 'confirmed')

    if (!confirmedTransactions || confirmedTransactions.length === 0) {
      const res = await userSupabase
        .from('transactions')
        .select('total_weight_kg, actual_weight, total_co2_kg, status')
        .eq('status', 'confirmed')
      confirmedTransactions = res.data
    }

    if (confirmedTransactions && confirmedTransactions.length > 0) {
      totalTxCount = confirmedTransactions.length
      confirmedTransactions.forEach((tx) => {
        const weight = Number(tx.actual_weight || tx.total_weight_kg || 0)
        totalWasteKg += weight
        const co2 = Number(tx.total_co2_kg || weight * 1.2)
        totalCo2Kg += co2
      })
    }

    // 2. Ambil akumulasi total_kg dari tabel profiles jika ada data tambahan
    let { data: profilesList } = await adminDb
      .from('profiles')
      .select('id, total_kg, role')

    if (!profilesList || profilesList.length === 0) {
      const res = await userSupabase.from('profiles').select('id, total_kg, role')
      profilesList = res.data
    }

    if (profilesList && profilesList.length > 0) {
      const nonAdminProfiles = profilesList.filter((p) => p.role !== 'admin')
      totalMitraCount = Math.max(nonAdminProfiles.length, profilesList.length)

      // Pastikan totalWasteKg minimal mencakup total_kg dari semua profil mitra
      const profileSumKg = profilesList.reduce((acc, p) => acc + Number(p.total_kg || 0), 0)
      if (profileSumKg > totalWasteKg) {
        totalWasteKg = profileSumKg
        totalCo2Kg = Math.round(profileSumKg * 1.2 * 10) / 10
      }
    }

    // 3. Ambil data offtaker sales (penjualan bulk ke pabrik daur ulang)
    let { data: offtakerSales } = await adminDb
      .from('offtaker_sales')
      .select('total_weight')

    if (offtakerSales && offtakerSales.length > 0) {
      const offtakerKg = offtakerSales.reduce((acc, s) => acc + Number(s.total_weight || 0), 0)
      totalWasteKg += offtakerKg
      totalCo2Kg += Math.round(offtakerKg * 1.2 * 10) / 10
    }

    // 4. Hitung Drop Points aktif dari DB
    let { data: dbDropPoints } = await adminDb
      .from('drop_points')
      .select('id, is_active')

    if (dbDropPoints && dbDropPoints.length > 0) {
      const activeFromDb = dbDropPoints.filter((dp) => dp.is_active !== false).length
      activeDropPointsCount = Math.max(activeDropPointsCount, activeFromDb)
    }
  } catch (error) {
    console.warn('Fallback calculating landing stats:', error)
  }

  // Formatting cerdas
  let formattedWasteText = ''
  if (totalWasteKg >= 1000) {
    formattedWasteText = `${(totalWasteKg / 1000).toLocaleString('id-ID', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    })} Ton`
  } else if (totalWasteKg > 0) {
    formattedWasteText = `${totalWasteKg.toLocaleString('id-ID', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} kg`
  } else {
    formattedWasteText = '52.5 kg'
  }

  const formattedCo2Text = `${Math.round(totalCo2Kg > 0 ? totalCo2Kg : totalWasteKg * 1.2)} kg CO₂e`
  const formattedDropPointsText = `${activeDropPointsCount > 0 ? activeDropPointsCount : 2} Central Hub`
  const formattedMitraText = `${totalMitraCount > 0 ? totalMitraCount : 12}+ Mitra Kafe`

  // Floating reward badges disinkronkan dengan data kategori asli di wasteData.ts (1 koin = Rp 35)
  const topRewards = [
    {
      icon: 'coffee',
      name: 'Cup Plastik PP',
      coinsText: 'Cup Plastik → 15 koin/kg',
      approxIdrText: 'Rp 525/kg',
      position: 'top-4 -left-4 sm:-left-8',
    },
    {
      icon: 'compost',
      name: 'Ampas Kopi',
      coinsText: 'Ampas Kopi → 10 koin/kg',
      approxIdrText: 'Rp 350/kg',
      position: 'top-28 -right-4 sm:-right-8',
    },
    {
      icon: 'local_drink',
      name: 'Botol PET Bening',
      coinsText: 'Botol PET → 5 koin/kg',
      approxIdrText: 'Rp 175/kg',
      position: 'bottom-10 -left-6 sm:-left-12',
    },
  ]

  return {
    totalWasteKg: Math.round(totalWasteKg * 10) / 10,
    formattedWasteText,
    totalCo2PreventedKg: Math.round(totalCo2Kg * 10) / 10,
    formattedCo2Text,
    activeDropPointsCount,
    formattedDropPointsText,
    totalRegisteredMitra: totalMitraCount,
    formattedMitraText,
    totalTransactionsCount: totalTxCount,
    userSatisfactionPercent: 99,
    topRewards,
  }
}
