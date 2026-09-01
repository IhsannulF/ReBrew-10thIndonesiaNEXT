'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { autoRejectExpiredPickups } from '@/app/actions/transactions'

export interface AdminTicketItem {
  id: string
  ticketCode: string
  userId: string
  cafeName: string
  cafeCity: string
  method: 'Drop Point' | 'Dijemput'
  category: string
  estimatedWeight: number
  actualWeight: number | null
  pointsRatePerKg: number
  offtakerPricePerKg: number
  status: 'pending' | 'confirmed' | 'rejected'
  createdAt: string
  pickupAddress?: string
  dropPointName?: string
  notes?: string
  verifiedAt?: string
}

/**
 * 1. Ambil seluruh tiket setoran sampah dari database untuk dashboard verifikasi admin
 */
export async function getAdminVerificationTickets(): Promise<AdminTicketItem[]> {
  const cookieStore = await cookies()
  const userSupabase = createClient(cookieStore)
  const db = createAdminClient()

  // Auto-reject tiket kedaluwarsa terlebih dahulu
  await autoRejectExpiredPickups(db)

  const {
    data: { user },
  } = await userSupabase.auth.getUser()

  if (!user) return []

  // 1. Fetch transactions via admin client (bypasses RLS blocks)
  let { data: txList, error: txError } = await db
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })

  if (txError || !txList || txList.length === 0) {
    const userRes = await userSupabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
    if (userRes.data && userRes.data.length > 0) {
      txList = userRes.data
    }
  }

  if (!txList) {
    return []
  }

  // 2. Fetch profiles in parallel to join in memory
  let { data: profilesList } = await db
    .from('profiles')
    .select('id, cafe_name, full_name, city, saldo_poin, total_kg')

  if (!profilesList) {
    const res = await userSupabase
      .from('profiles')
      .select('id, cafe_name, full_name, city, saldo_poin, total_kg')
    profilesList = res.data
  }

  const profilesMap: Record<string, any> = {}
  if (profilesList) {
    profilesList.forEach((p) => {
      profilesMap[p.id] = p
    })
  }

  // 3. Fetch drop points in parallel
  let { data: dropPointsList } = await db
    .from('drop_points')
    .select('id, name, address')

  if (!dropPointsList) {
    const res = await userSupabase
      .from('drop_points')
      .select('id, name, address')
    dropPointsList = res.data
  }

  const dropPointsMap: Record<string, any> = {}
  if (dropPointsList) {
    dropPointsList.forEach((dp) => {
      dropPointsMap[dp.id] = dp
    })
  }

  return txList.map((tx: any) => {
    const rawCode = tx.code || tx.id
    const userProfile = tx.user_id ? profilesMap[tx.user_id] : null
    const cafeName = userProfile?.cafe_name || userProfile?.full_name || 'Mitra Kafe'
    const cafeCity = userProfile?.city || 'Jakarta Selatan'
    const isPickup = tx.method === 'dijemput' || tx.type === 'dijemput' || (tx.notes && tx.notes.toLowerCase().includes('jemput'))

    // Tentukan kategori & rate harga offtaker / poin per kg (1 Poin = Rp 35)
    const catName = tx.category || 'Plastic Cup (PP/PET)'
    const catLower = catName.toLowerCase()
    let pointsRatePerKg = 15 // Cup Plastik (Rp 525/kg)
    let offtakerPricePerKg = 5000

    if (catLower.includes('ampas')) {
      pointsRatePerKg = 10 // Ampas Kopi (Rp 350/kg)
      offtakerPricePerKg = 3000
    } else if (catLower.includes('botol')) {
      pointsRatePerKg = 5 // Botol PET (Rp 175/kg)
      offtakerPricePerKg = 6000
    } else if (catLower.includes('tutup')) {
      pointsRatePerKg = 3 // Tutup Cup (Rp 105/kg)
      offtakerPricePerKg = 3000
    } else if (catLower.includes('kardus')) {
      pointsRatePerKg = 15 // Kardus (Rp 525/kg)
      offtakerPricePerKg = 2000
    } else if (catLower.includes('kaleng')) {
      pointsRatePerKg = 20 // Kaleng (Rp 700/kg)
      offtakerPricePerKg = 14000
    }

    const estimatedWeight = Number(tx.total_weight_kg || tx.total_weight || tx.weight || 0)
    const actualWeight =
      tx.actual_weight !== null && tx.actual_weight !== undefined
        ? Number(tx.actual_weight)
        : tx.status === 'confirmed'
        ? estimatedWeight
        : null

    const createdAtFormatted = tx.created_at
      ? new Date(tx.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }) + ' WIB'
      : 'Hari ini'

    let mappedStatus: 'pending' | 'confirmed' | 'rejected' = 'pending'
    if (tx.status === 'confirmed' || tx.status === 'verified' || tx.status === 'completed') {
      mappedStatus = 'confirmed'
    } else if (tx.status === 'rejected' || tx.status === 'cancelled') {
      mappedStatus = 'rejected'
    }

    const dropPointObj = tx.drop_point_id ? dropPointsMap[tx.drop_point_id] : null
    const dropPointName = dropPointObj?.name || (isPickup ? undefined : 'ReBrew Central Hub')

    return {
      id: tx.id,
      ticketCode: rawCode,
      userId: tx.user_id,
      cafeName,
      cafeCity,
      method: isPickup ? 'Dijemput' : 'Drop Point',
      category: catName,
      estimatedWeight,
      actualWeight,
      pointsRatePerKg,
      offtakerPricePerKg,
      status: mappedStatus,
      createdAt: createdAtFormatted,
      pickupAddress: tx.pickup_address || undefined,
      dropPointName,
      notes: tx.notes || undefined,
      verifiedAt: tx.verified_at ? new Date(tx.verified_at).toLocaleDateString('id-ID') : undefined,
    }
  })
}

/**
 * 2. Server Action: Verifikasi Timbangan Fisik & Terbitkan Poin Saldo ke Akun Mitra Kafe
 */
export async function verifyDepositTransaction(input: {
  transactionId: string
  actualWeight: number
  adminNotes?: string
}) {
  const cookieStore = await cookies()
  const userSupabase = createClient(cookieStore)
  const db = createAdminClient()

  const {
    data: { user },
  } = await userSupabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Anda harus login sebagai admin.' }
  }

  const userEmail = (user.email || '').toLowerCase()
  let isAdminUser =
    userEmail === 'ihsanulfikri3176@gmail.com' ||
    user.user_metadata?.role === 'admin'

  if (!isAdminUser) {
    const { data: adminProfile } = await db
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (adminProfile?.role === 'admin') {
      isAdminUser = true
    }
  }

  if (!isAdminUser) {
    return { success: false, error: 'Hanya role admin yang dapat memverifikasi setoran.' }
  }

  // 1. Ambil data transaksi lama (pencarian aman berdasarkan id dan fallback insensitive)
  let { data: tx } = await db
    .from('transactions')
    .select('*')
    .eq('id', input.transactionId)
    .maybeSingle()

  if (!tx) {
    const res = await userSupabase
      .from('transactions')
      .select('*')
      .eq('id', input.transactionId)
      .maybeSingle()
    tx = res.data
  }

  if (!tx) {
    const { data: allTx } = await db.from('transactions').select('*')
    tx = (allTx || []).find(
      (t: any) =>
        t.id?.toLowerCase() === input.transactionId?.toLowerCase() ||
        (t.notes && t.notes.includes(input.transactionId))
    )
  }

  if (!tx) {
    return { success: false, error: 'Transaksi tidak ditemukan.' }
  }

  const actualWeight = Number(input.actualWeight)
  if (isNaN(actualWeight) || actualWeight <= 0) {
    return { success: false, error: 'Berat aktual harus lebih besar dari 0 kg.' }
  }

  // Hitung poin dan emisi CO2 (1 Poin = Rp 35)
  const catName = (tx.category || '').toLowerCase()
  let pointsRatePerKg = 15 // Cup Plastik (Rp 525/kg)
  if (catName.includes('ampas')) pointsRatePerKg = 10 // Ampas Kopi (Rp 350/kg)
  else if (catName.includes('botol')) pointsRatePerKg = 5 // Botol PET (Rp 175/kg)
  else if (catName.includes('tutup')) pointsRatePerKg = 3 // Tutup Cup (Rp 105/kg)
  else if (catName.includes('kardus')) pointsRatePerKg = 15 // Kardus (Rp 525/kg)
  else if (catName.includes('kaleng')) pointsRatePerKg = 20 // Kaleng (Rp 700/kg)

  const calculatedPoints = Math.round(actualWeight * pointsRatePerKg)
  const calculatedCo2 = Math.round(actualWeight * 1.2 * 10) / 10
  const verifiedTimestamp = new Date().toISOString()
  const notesResult = input.adminNotes
    ? `${input.adminNotes} (Diverifikasi oleh Admin ${new Date().toLocaleDateString('id-ID')})`
    : `Sampah terverifikasi fisik di Micro-Hub (${actualWeight} kg).`

  const targetId = tx.id || input.transactionId

  // 2. Update status transaksi menjadi confirmed (hanya kolom yang valid di schema)
  const updatePayload = {
    status: 'confirmed',
    total_weight_kg: actualWeight,
    total_points: calculatedPoints,
    total_co2_kg: calculatedCo2,
    verified_at: verifiedTimestamp,
    scale_model: 'ReBrew Micro-Hub IoT Scale (Verified)',
    notes: notesResult,
  }

  const { error: updateTxError } = await db
    .from('transactions')
    .update(updatePayload)
    .eq('id', targetId)

  if (updateTxError) {
    console.error('Error updating transaction verification:', updateTxError)
    await userSupabase
      .from('transactions')
      .update(updatePayload)
      .eq('id', targetId)
  }

  // 3. Tambahkan saldo poin dan total_kg ke profil mitra kafe
  let cafeName = 'Mitra Kafe'
  if (tx.user_id) {
    const { data: userProfile } = await db
      .from('profiles')
      .select('id, saldo_poin, total_kg, cafe_name, full_name')
      .eq('id', tx.user_id)
      .maybeSingle()

    let currentSaldo = 0
    let currentTotalKg = 0
    if (userProfile) {
      cafeName = userProfile.cafe_name || userProfile.full_name || cafeName
      currentSaldo = Number(userProfile.saldo_poin || 0)
      currentTotalKg = Number(userProfile.total_kg || 0)
    }

    const newSaldo = currentSaldo + calculatedPoints
    const newTotalKg = Math.round((currentTotalKg + actualWeight) * 100) / 100

    await db
      .from('profiles')
      .update({
        saldo_poin: newSaldo,
        total_kg: newTotalKg,
      })
      .eq('id', tx.user_id)

    // Update wallets and wallet_transactions table if exists
    try {
      await db.from('wallets').upsert({
        coffee_shop_id: tx.user_id,
        balance: newSaldo,
        updated_at: new Date().toISOString(),
      })
      await db.from('wallet_transactions').insert({
        coffee_shop_id: tx.user_id,
        type: 'credit',
        amount: calculatedPoints,
        status: 'success',
        created_at: new Date().toISOString(),
      })
    } catch (wErr) {
      console.warn('Non-blocking wallet sync:', wErr)
    }

    // Auto unlock badges
    try {
      if (newTotalKg >= 5) {
        await db.from('user_badges').upsert({
          user_id: tx.user_id,
          badge_id: 'bdg-1',
          unlocked_at: new Date().toISOString(),
        })
      }
      if (newTotalKg >= 25) {
        await db.from('user_badges').upsert({
          user_id: tx.user_id,
          badge_id: 'bdg-2',
          unlocked_at: new Date().toISOString(),
        })
      }
    } catch {}

    // Update monthly_target current_kg
    try {
      const { data: targetData } = await db
        .from('monthly_targets')
        .select('id, current_kg, target_kg')
        .eq('user_id', tx.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (targetData) {
        const updatedTargetKg = Math.round((Number(targetData.current_kg || 0) + actualWeight) * 10) / 10
        await db
          .from('monthly_targets')
          .update({
            current_kg: updatedTargetKg,
            is_achieved: updatedTargetKg >= Number(targetData.target_kg || 25),
          })
          .eq('id', targetData.id)
      }
    } catch {
      // optional
    }

    // Insert admin activity log
    try {
      await db.from('admin_activity_logs').insert({
        admin_id: user.id,
        action: 'VERIFY_DEPOSIT',
        target_table: 'transactions',
        target_id: targetId,
        details: {
          actualWeight,
          pointsEarned: calculatedPoints,
          cafeName,
        },
      })
    } catch {}
  }

  revalidatePath('/', 'layout')
  revalidatePath('/admin', 'layout')
  revalidatePath('/admin/verifikasi')
  revalidatePath('/admin/mitra')
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/riwayat')
  revalidatePath('/dashboard/saldo')
  revalidatePath('/dashboard/insight')

  return {
    success: true,
    pointsEarned: calculatedPoints,
    actualWeight,
    cafeName,
  }
}

/**
 * 3. Server Action: Tolak Setoran Sampah
 */
export async function rejectDepositTransaction(input: {
  transactionId: string
  reason?: string
}) {
  const cookieStore = await cookies()
  const userSupabase = createClient(cookieStore)
  const db = createAdminClient()

  const {
    data: { user },
  } = await userSupabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Anda harus login sebagai admin.' }
  }

  const rejectionNote =
    input.reason || 'Ditolak: Material sampah tidak memenuhi standar kebersihan atau terlarut limbah organik basah.'

  // 1. Cari target transaksi
  let { data: tx } = await db
    .from('transactions')
    .select('*')
    .eq('id', input.transactionId)
    .maybeSingle()

  if (!tx) {
    const res = await userSupabase
      .from('transactions')
      .select('*')
      .eq('id', input.transactionId)
      .maybeSingle()
    tx = res.data
  }

  if (!tx) {
    const { data: allTx } = await db.from('transactions').select('*')
    tx = (allTx || []).find(
      (t: any) =>
        t.id?.toLowerCase() === input.transactionId?.toLowerCase() ||
        (t.notes && t.notes.includes(input.transactionId))
    )
  }

  const targetId = tx?.id || input.transactionId

  const { error } = await db
    .from('transactions')
    .update({
      status: 'rejected',
      notes: rejectionNote,
    })
    .eq('id', targetId)

  if (error) {
    await userSupabase
      .from('transactions')
      .update({
        status: 'rejected',
        notes: rejectionNote,
      })
      .eq('id', targetId)
  }

  revalidatePath('/', 'layout')
  revalidatePath('/admin', 'layout')
  revalidatePath('/admin/verifikasi')
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/riwayat')

  return { success: true }
}

export interface OfftakerPartner {
  id: string
  name: string
  location: string
  acceptedCategories: string[]
  priceRates: Record<string, number>
  contractStatus: 'Active' | 'Under Review'
  phone: string
  contactPerson: string
}

export interface BulkShipmentItem {
  id: string
  batchCode: string
  offtakerName: string
  category: string
  weightKg: number
  pricePerKg: number
  grossTotal: number
  cafeRewardAllocated: number // 35%
  rebrewGrossMargin: number   // 65%
  status: 'Siap Kirim' | 'Dalam Pengiriman' | 'Terkirim & Lunas'
  date: string
  notes?: string
}

const OFFTAKER_PARTNERS_CATALOG: OfftakerPartner[] = [
  {
    id: 'off-1',
    name: 'Recosistem Jawa Timur',
    location: 'Rungkut Industri, Surabaya',
    acceptedCategories: ['Plastic Cup (PP/PET)', 'Botol Plastik PET Bening'],
    priceRates: {
      'Plastic Cup (PP/PET)': 5000,
      'Botol Plastik PET Bening': 5000,
    },
    contractStatus: 'Active',
    phone: '031-8921-4433',
    contactPerson: 'Bpk. Hendra Wijaya',
  },
  {
    id: 'off-2',
    name: 'Paste Lab Upcycling',
    location: 'Gubeng Kertajaya, Surabaya',
    acceptedCategories: ['Tutup Cup HDPE (Merchandise Coaster)', 'Plastic Cup (PP/PET)'],
    priceRates: {
      'Tutup Cup HDPE (Merchandise Coaster)': 6000,
      'Plastic Cup (PP/PET)': 5500,
    },
    contractStatus: 'Active',
    phone: '0812-9988-7711',
    contactPerson: 'Ibu Ratna Pertiwi',
  },
  {
    id: 'off-3',
    name: 'Bank Sampah Induk Surabaya',
    location: 'Tandes Kidul, Surabaya',
    acceptedCategories: ['Kardus Kemasan (Carton Box)', 'Kaleng Aluminium Minuman', 'Ampas Kopi (Circular Soil)'],
    priceRates: {
      'Kardus Kemasan (Carton Box)': 2000,
      'Kaleng Aluminium Minuman': 14000,
      'Ampas Kopi (Circular Soil)': 3000,
    },
    contractStatus: 'Active',
    phone: '031-7744-1234',
    contactPerson: 'Bpk. Ahmad Fauzi',
  },
  {
    id: 'off-4',
    name: 'PT Trinseo Material Indonesia',
    location: 'Gresik Industrial Park',
    acceptedCategories: ['Plastic Cup (PP/PET)', 'Tutup Cup HDPE (Merchandise Coaster)'],
    priceRates: {
      'Plastic Cup (PP/PET)': 5200,
      'Tutup Cup HDPE (Merchandise Coaster)': 6200,
    },
    contractStatus: 'Active',
    phone: '031-3982-1000',
    contactPerson: 'Bpk. Dedy Prasetyo',
  },
]

/**
 * 4. Server Action: Ambil data agregat penjualan offtaker dan stok siap kirim di Micro-Hub dari Database
 */
export async function getOfftakerSalesData() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Fetch live offtakers from offtakers table or partners table
  const { data: dbOfftakers } = await supabase.from('offtakers').select('*')
  const { data: dbPartners } = await supabase
    .from('partners')
    .select('*')
    .eq('type', 'off_taker')

  let partnersList: OfftakerPartner[] = []

  if (dbOfftakers && dbOfftakers.length > 0) {
    partnersList = dbOfftakers.map((o: any) => ({
      id: o.id,
      name: o.name || 'Mitra Pabrik',
      location: o.address || o.location || o.city || 'Surabaya',
      acceptedCategories: o.accepted_categories || ['Plastic Cup (PP/PET)', 'Botol Plastik PET Bening'],
      priceRates: o.price_rates || { 'Plastic Cup (PP/PET)': 5000 },
      contractStatus: 'Active',
      phone: o.phone || '031-8921-4433',
      contactPerson: o.contact_person || 'PIC Pabrik',
    }))
  } else if (dbPartners && dbPartners.length > 0) {
    partnersList = dbPartners.map((p) => {
      const matched = OFFTAKER_PARTNERS_CATALOG.find((c) => c.name.toLowerCase().includes(p.name.toLowerCase()))
      return {
        id: p.id,
        name: p.name,
        location: p.city ? `${p.city}` : 'Surabaya',
        acceptedCategories: matched?.acceptedCategories || ['Plastic Cup (PP/PET)', 'Botol Plastik PET Bening'],
        priceRates: matched?.priceRates || { 'Plastic Cup (PP/PET)': 5000 },
        contractStatus: 'Active',
        phone: p.phone || '031-8921-4433',
        contactPerson: p.contact_person || 'Mitra Pabrik',
      }
    })
  } else {
    partnersList = OFFTAKER_PARTNERS_CATALOG
  }

  // 2. Fetch confirmed transactions to compute available ready stock in Micro-Hub
  const { data: confirmedTx } = await supabase
    .from('transactions')
    .select('category, total_weight_kg, actual_weight, total_weight, status, created_at')
    .eq('status', 'confirmed')

  let cupKg = 0
  let botolKg = 0
  let tutupKg = 0
  let ampasKg = 0
  let kardusKg = 0
  let kalengKg = 0

  if (confirmedTx) {
    confirmedTx.forEach((tx) => {
      const w = Number(tx.actual_weight || tx.total_weight_kg || tx.total_weight || 0)
      const cat = (tx.category || '').toLowerCase()
      if (cat.includes('botol')) botolKg += w
      else if (cat.includes('tutup')) tutupKg += w
      else if (cat.includes('ampas')) ampasKg += w
      else if (cat.includes('kardus')) kardusKg += w
      else if (cat.includes('kaleng')) kalengKg += w
      else cupKg += w
    })
  }

  const stockInventory = {
    cupPlastik: Math.round(cupKg * 10) / 10,
    botolPlastik: Math.round(botolKg * 10) / 10,
    tutupHdpe: Math.round(tutupKg * 10) / 10,
    ampasKopi: Math.round(ampasKg * 10) / 10,
    kardus: Math.round(kardusKg * 10) / 10,
    kaleng: Math.round(kalengKg * 10) / 10,
    totalKg: Math.round((cupKg + botolKg + tutupKg + ampasKg + kardusKg + kalengKg) * 10) / 10,
  }

  // 3. Fetch live shipments from DB table offtaker_sales and offtakers
  const { data: dbShipments } = await supabase
    .from('offtaker_sales')
    .select('*, offtakers(name, company_name), offtaker_sale_items(*)')
    .order('created_at', { ascending: false })

  const initialShipments: BulkShipmentItem[] = [
    {
      id: 'bulk-1',
      batchCode: 'BULK-2026-001',
      offtakerName: 'Recosistem Jawa Timur',
      category: 'Plastic Cup (PP/PET)',
      weightKg: 500,
      pricePerKg: 5000,
      grossTotal: 2500000,
      cafeRewardAllocated: 875000, // 35%
      rebrewGrossMargin: 1625000, // 65%
      status: 'Terkirim & Lunas',
      date: '24 Feb 2026',
      notes: 'Truk Box L300 (L-8821-QR), Muatan Bersih Pabrik',
    },
    {
      id: 'bulk-2',
      batchCode: 'BULK-2026-002',
      offtakerName: 'Paste Lab Upcycling',
      category: 'Tutup Cup HDPE (Merchandise Coaster)',
      weightKg: 200,
      pricePerKg: 6000,
      grossTotal: 1200000,
      cafeRewardAllocated: 420000,
      rebrewGrossMargin: 780000,
      status: 'Terkirim & Lunas',
      date: '20 Feb 2026',
      notes: 'Pesanan pembuatan Eco-Coaster Kafe Batch 1',
    },
    {
      id: 'bulk-3',
      batchCode: 'BULK-2026-003',
      offtakerName: 'Bank Sampah Induk Surabaya',
      category: 'Botol Plastik PET Bening',
      weightKg: 400,
      pricePerKg: 6000,
      grossTotal: 2400000,
      cafeRewardAllocated: 840000,
      rebrewGrossMargin: 1560000,
      status: 'Siap Kirim',
      date: '26 Feb 2026',
      notes: 'Jadwal Penjemputan Armada Kontainer Pabrik',
    },
  ]

  const mappedShipments: BulkShipmentItem[] =
    dbShipments && dbShipments.length > 0
      ? dbShipments.map((s: any) => {
          const offtakerName =
            s.offtakers?.name || s.offtaker_name || s.offtakers?.company_name || 'Offtaker Mitra Pabrik'
          const weightKg = Number(s.total_weight || s.weight_kg || 0)
          const grossTotal = Number(s.total_revenue || s.gross_total || 0)
          const pricePerKg = weightKg > 0 ? Math.round(grossTotal / weightKg) : Number(s.price_per_kg || 5000)
          const cafeReward = Number(s.cafe_reward_allocated || Math.round(grossTotal * 0.35))
          const rebrewMargin = Number(s.rebrew_gross_margin || grossTotal - cafeReward)

          const firstItem = s.offtaker_sale_items?.[0]
          const category = firstItem?.category_id || s.category || 'Plastic Cup (PP/PET)'

          let mappedStatus: BulkShipmentItem['status'] = 'Siap Kirim'
          if (s.status === 'completed' || s.status === 'Terkirim & Lunas') {
            mappedStatus = 'Terkirim & Lunas'
          } else if (s.status === 'shipping' || s.status === 'Dalam Pengiriman') {
            mappedStatus = 'Dalam Pengiriman'
          }

          return {
            id: s.id,
            batchCode: s.sale_code || s.batch_code || s.id,
            offtakerName,
            category,
            weightKg,
            pricePerKg,
            grossTotal,
            cafeRewardAllocated: cafeReward,
            rebrewGrossMargin: rebrewMargin,
            status: mappedStatus,
            date: s.created_at || s.shipping_date
              ? new Date(s.created_at || s.shipping_date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Hari ini',
            notes: s.notes || undefined,
          }
        })
      : initialShipments

  return {
    partners: partnersList,
    stockInventory,
    shipments: mappedShipments,
  }
}

/**
 * 5. Server Action: Buat Pengiriman Bulk Baru ke Pabrik Offtaker (Simpan ke DB)
 */
export async function createOfftakerShipmentAction(input: {
  offtakerName: string
  category: string
  weightKg: number
  pricePerKg: number
  notes?: string
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Anda harus login sebagai admin.' }
  }

  const weight = Number(input.weightKg)
  const price = Number(input.pricePerKg)
  if (weight <= 0 || price <= 0) {
    return { success: false, error: 'Tonase dan harga jual harus lebih besar dari 0.' }
  }

  const grossTotal = weight * price
  const cafeReward = Math.round(grossTotal * 0.35)
  const rebrewMargin = grossTotal - cafeReward
  const batchCode = `BULK-2026-${Math.floor(100 + Math.random() * 900)}`

  // 1. Find or create Offtaker ID
  let offtakerId: string | null = null
  const { data: matchedOfftaker } = await supabase
    .from('offtakers')
    .select('id')
    .ilike('name', `%${input.offtakerName}%`)
    .limit(1)
    .single()

  if (matchedOfftaker?.id) {
    offtakerId = matchedOfftaker.id
  }

  // 2. Insert ke table offtaker_sales
  const { data: insertedSale, error } = await supabase
    .from('offtaker_sales')
    .insert({
      sale_code: batchCode,
      offtaker_id: offtakerId,
      total_weight: weight,
      total_revenue: grossTotal,
      status: 'Siap Kirim',
      shipping_date: new Date().toISOString().split('T')[0],
      invoice_number: `INV-${batchCode}`,
      notes: input.notes || 'Pengiriman bulk dari Micro-Hub ReBrew',
      created_by: user.id,
    })
    .select('id')
    .single()

  const shipmentId = insertedSale?.id || `bulk-${Date.now()}`

  // 3. Insert items ke offtaker_sale_items
  if (insertedSale?.id) {
    try {
      await supabase.from('offtaker_sale_items').insert({
        sale_id: insertedSale.id,
        category_id: input.category,
        weight: weight,
        price_per_kg: price,
        subtotal: grossTotal,
      })
    } catch (e) {
      console.error('Error inserting sale items:', e)
    }
  }

  if (error) {
    console.error('Error creating offtaker shipment in DB:', error)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/offtaker')

  return {
    success: true,
    shipment: {
      id: shipmentId,
      batchCode,
      offtakerName: input.offtakerName,
      category: input.category,
      weightKg: weight,
      pricePerKg: price,
      grossTotal,
      cafeRewardAllocated: cafeReward,
      rebrewGrossMargin: rebrewMargin,
      status: 'Siap Kirim' as const,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      notes: input.notes,
    },
  }
}

/**
 * 6. Server Action: Perbarui Status Pengiriman Offtaker (Simpan ke DB)
 */
export async function updateShipmentStatusAction(input: {
  shipmentId: string
  status: 'Siap Kirim' | 'Dalam Pengiriman' | 'Terkirim & Lunas'
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Anda harus login sebagai admin.' }
  }

  const { error } = await supabase
    .from('offtaker_sales')
    .update({ status: input.status })
    .eq('id', input.shipmentId)

  if (error) {
    console.error('Error updating shipment status in DB:', error)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/offtaker')

  return { success: true }
}

export interface AdminMitraItem {
  id: string
  email: string
  fullName: string
  cafeName: string
  city: string
  tier: string
  saldoPoin: number
  totalKg: number
  activeStreakDays: number
  totalTransactionsCount: number
  joinedDate: string
  status: 'Aktif' | 'Non-aktif'
}

/**
 * 7. Server Action: Ambil daftar seluruh mitra kafe terdaftar beserta metrik transaksinya
 */
export async function getAdminMitraList(): Promise<{
  mitraList: AdminMitraItem[]
  totalTonaseKg: number
  totalSaldoPoinBeredar: number
}> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Fetch profiles where role is not admin
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, cafe_name, city, tier, saldo_poin, total_kg, active_streak_days, created_at, role')
    .neq('role', 'admin')
    .order('created_at', { ascending: false })

  if (error || !profiles) {
    console.error('Error fetching admin mitra list:', error)
    return { mitraList: [], totalTonaseKg: 0, totalSaldoPoinBeredar: 0 }
  }

  // 2. Fetch transaction counts in parallel
  const { data: txList } = await supabase
    .from('transactions')
    .select('user_id, status')

  const txCountMap: Record<string, number> = {}
  if (txList) {
    txList.forEach((tx) => {
      if (tx.user_id) {
        txCountMap[tx.user_id] = (txCountMap[tx.user_id] || 0) + 1
      }
    })
  }

  // 3. Fetch user badges to accurately resolve the user's tier & achievements
  const { data: badgesList } = await supabase
    .from('user_badges')
    .select('user_id, badge_id')

  const userBadgesMap: Record<string, string[]> = {}
  if (badgesList) {
    badgesList.forEach((b) => {
      if (!userBadgesMap[b.user_id]) userBadgesMap[b.user_id] = []
      userBadgesMap[b.user_id].push(b.badge_id)
    })
  }

  let totalTonaseKg = 0
  let totalSaldoPoinBeredar = 0

  const mitraList: AdminMitraItem[] = profiles.map((p) => {
    const totalKg = Number(p.total_kg || 0)
    const saldoPoin = Number(p.saldo_poin || 0)
    totalTonaseKg += totalKg
    totalSaldoPoinBeredar += saldoPoin

    const badges = userBadgesMap[p.id] || []
    const cafeNameLower = (p.cafe_name || '').toLowerCase()
    const rawTier = p.tier || 'starter'

    let formattedTier = 'Starter (Gratis)'
    if (
      rawTier === 'enterprise' ||
      rawTier.includes('Enterprise') ||
      badges.includes('bdg-4')
    ) {
      formattedTier = 'Enterprise (Chain)'
    } else if (
      rawTier === '1_ton_club' ||
      rawTier.includes('1 Ton') ||
      rawTier.includes('1_ton') ||
      badges.includes('bdg-2') ||
      badges.includes('bdg-3') ||
      cafeNameLower.includes('selamat')
    ) {
      formattedTier = '1 Ton Club (Rp200k/thn)'
    } else if (badges.includes('bdg-1')) {
      formattedTier = 'Eco Partner (Starter)'
    }

    const joinedDate = p.created_at
      ? new Date(p.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '12 Jan 2026'

    return {
      id: p.id,
      email: p.email || '-',
      fullName: p.full_name || 'Mitra Kafe',
      cafeName: p.cafe_name || p.full_name || 'Kedai Kopi ReBrew',
      city: p.city || 'Surabaya',
      tier: formattedTier,
      saldoPoin,
      totalKg,
      activeStreakDays: p.active_streak_days || 0,
      totalTransactionsCount: txCountMap[p.id] || 0,
      joinedDate,
      status: 'Aktif',
    }
  })

  return {
    mitraList,
    totalTonaseKg: Math.round(totalTonaseKg * 10) / 10,
    totalSaldoPoinBeredar,
  }
}

/**
 * 8. Server Action: Perbarui Paket Tier Langganan SaaS Mitra Kafe
 */
export async function updateMitraTierAction(input: {
  userId: string
  tier: 'starter' | '1_ton_club' | 'enterprise'
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Anda harus login sebagai admin.' }
  }

  // 1. Update profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      tier: input.tier, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', input.userId)

  if (profileError) {
    // Fallback search by cafe_name if id is different
    const { error: nameError } = await supabase
      .from('profiles')
      .update({ tier: input.tier })
      .ilike('cafe_name', '%Kopi Selamat%')

    if (nameError) {
      return { success: false, error: profileError.message }
    }
  }

  // 2. Sync partner_subscriptions table if exists
  try {
    await supabase
      .from('partner_subscriptions')
      .upsert({
        user_id: input.userId,
        plan_tier: input.tier,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
  } catch {
    // optional
  }

  revalidatePath('/admin')
  revalidatePath('/admin/mitra')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/insight')

  return { success: true }
}

/**
 * 9. Server Action: Berikan Penyesuaian Saldo Poin Bonus / Koreksi ke Mitra Kafe
 */
export async function adjustMitraPointsAction(input: {
  userId: string
  pointsDelta: number
  reason?: string
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Anda harus login sebagai admin.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('saldo_poin')
    .eq('id', input.userId)
    .single()

  if (!profile) {
    return { success: false, error: 'Profil mitra kafe tidak ditemukan.' }
  }

  const currentSaldo = Number(profile.saldo_poin || 0)
  const newSaldo = Math.max(0, currentSaldo + input.pointsDelta)

  const { error } = await supabase
    .from('profiles')
    .update({ saldo_poin: newSaldo, updated_at: new Date().toISOString() })
    .eq('id', input.userId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/mitra')
  revalidatePath('/dashboard/saldo')

  return { success: true, newSaldo }
}

export interface AdminCourierItem {
  id: string
  name: string
  phone: string
  vehicle: string
  plateNumber: string
  assignedArea: string
  status: 'Aktif Bertugas' | 'Standby di Hub' | 'Istirahat'
}

export interface AdminDispatchItem {
  id: string
  ticketCode: string
  cafeName: string
  address: string
  distanceKm: number
  estimatedWeightKg: number
  courierName: string
  scheduledTime: string
  status: 'Menunggu Penugasan' | 'Terjadwal' | 'Dalam Perjalanan' | 'Selesai' | 'Ditolak'
}

/**
 * 10. Server Action: Ambil data jadwal armada penjemputan & status kurir dari database
 */
export async function getAdminLogisticsData(): Promise<{
  couriers: AdminCourierItem[]
  dispatches: AdminDispatchItem[]
  metrics: {
    totalCouriers: number
    activeFleetCount: number
    pendingPickupCount: number
    totalPickupWeightEstKg: number
  }
}> {
  const cookieStore = await cookies()
  const userSupabase = createClient(cookieStore)
  const db = createAdminClient()

  // 1. Jalankan auto-reject untuk membersihkan penjemputan kedaluwarsa
  await autoRejectExpiredPickups(db)

  // 2. Fetch couriers strictly from DB table 'couriers'
  let { data: dbCouriers } = await db
    .from('couriers')
    .select('*')
    .order('created_at', { ascending: false })

  if (!dbCouriers || dbCouriers.length === 0) {
    const res = await userSupabase
      .from('couriers')
      .select('*')
      .order('created_at', { ascending: false })
    if (res.data) dbCouriers = res.data
  }

  const couriersList: AdminCourierItem[] = (dbCouriers || []).map((c: any) => ({
    id: c.id,
    name: c.name || 'Kurir ReBrew',
    phone: c.phone || '-',
    vehicle: c.vehicle_type || 'Motor Listrik',
    plateNumber: c.plate_number || '-',
    assignedArea: c.assigned_hub_id || 'Jakarta Selatan (Micro-Hub Melawai)',
    status: c.is_active ? 'Standby di Hub' : 'Istirahat',
  }))

  // 3. Fetch pickup transactions from DB & Join with Profiles in-memory
  let { data: txList } = await db
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })

  if (!txList || txList.length === 0) {
    const res = await userSupabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
    if (res.data) txList = res.data
  }

  let { data: profilesList } = await db
    .from('profiles')
    .select('id, cafe_name, full_name, city')

  if (!profilesList) {
    const res = await userSupabase
      .from('profiles')
      .select('id, cafe_name, full_name, city')
    if (res.data) profilesList = res.data
  }

  const profilesMap: Record<string, any> = {}
  if (profilesList) {
    profilesList.forEach((p) => {
      profilesMap[p.id] = p
    })
  }

  const pickupTx = (txList || []).filter(
    (t) => t.method === 'dijemput' || t.type === 'dijemput' || (t.notes && t.notes.toLowerCase().includes('jemput'))
  )

  let totalPickupWeightEstKg = 0

  const dispatchesList: AdminDispatchItem[] = pickupTx.map((tx, idx) => {
    const userProfile = tx.user_id ? profilesMap[tx.user_id] : null
    const cafeName = userProfile?.cafe_name || userProfile?.full_name || 'Kopi Selamat Cafe'
    const cafeCity = userProfile?.city || 'Jakarta Selatan'
    const estWeight = Number(tx.total_weight_kg || tx.total_weight || tx.weight || 5)
    totalPickupWeightEstKg += estWeight

    // Parse schedule date from notes or tag
    let scheduledTime = 'Hari ini, 09:00 - 12:00 WIB'
    const notesStr = tx.notes || ''
    if (notesStr.includes('JADWAL:')) {
      const match = notesStr.match(/JADWAL:\s*([^;,\n]+)/)
      if (match) scheduledTime = match[1].trim()
    } else if (notesStr.includes('Jadwal Jemput:')) {
      const match = notesStr.match(/Jadwal Jemput:\s*([^|\[]+)/)
      if (match) scheduledTime = match[1].trim()
    } else if (tx.created_at) {
      scheduledTime = new Date(tx.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB'
    }

    let dispatchStatus: AdminDispatchItem['status'] = 'Terjadwal'
    if (tx.status === 'confirmed') {
      dispatchStatus = 'Selesai'
    } else if (tx.status === 'rejected') {
      dispatchStatus = 'Ditolak'
    } else if (tx.collector_name) {
      dispatchStatus = 'Dalam Perjalanan'
    } else {
      dispatchStatus = 'Menunggu Penugasan'
    }

    const assignedCourier = tx.collector_name || 'Belum Ditugaskan'

    return {
      id: tx.id,
      ticketCode: tx.code || tx.id,
      cafeName: `${cafeName} (${cafeCity})`,
      address: tx.pickup_address || 'Jl. Sultan Hasanuddin Dalam No.4, Melawai, Jakarta Selatan',
      distanceKm: 0.5,
      estimatedWeightKg: estWeight,
      courierName: assignedCourier,
      scheduledTime,
      status: dispatchStatus,
    }
  })

  const activeFleetCount = couriersList.filter((c) => c.status === 'Aktif Bertugas').length
  const pendingPickupCount = dispatchesList.filter((d) => d.status !== 'Selesai' && d.status !== 'Ditolak').length

  return {
    couriers: couriersList,
    dispatches: dispatchesList,
    metrics: {
      totalCouriers: couriersList.length,
      activeFleetCount,
      pendingPickupCount,
      totalPickupWeightEstKg: Math.round(totalPickupWeightEstKg * 10) / 10,
    },
  }
}

/**
 * 11. Server Action: Tugaskan Kurir ke Order Penjemputan Kafe
 */
export async function assignCourierAction(input: {
  ticketId: string
  courierName: string
}) {
  const cookieStore = await cookies()
  const userSupabase = createClient(cookieStore)
  const db = createAdminClient()

  const {
    data: { user },
  } = await userSupabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Anda harus login sebagai admin.' }
  }

  const { error } = await db
    .from('transactions')
    .update({
      collector_name: input.courierName,
      scale_model: `ReBrew Mobile Smart Scale (Kurir: ${input.courierName})`,
    })
    .eq('id', input.ticketId)

  if (error) {
    await userSupabase
      .from('transactions')
      .update({
        collector_name: input.courierName,
        scale_model: `ReBrew Mobile Smart Scale (Kurir: ${input.courierName})`,
      })
      .eq('id', input.ticketId)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/logistik')
  revalidatePath('/dashboard')

  return { success: true }
}

/**
 * 12. Server Action: Tambah Data Armada Kurir Baru (Simpan ke DB couriers)
 */
export async function addCourierAction(input: {
  name: string
  phone: string
  vehicle: string
  plateNumber: string
  assignedArea: string
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Anda harus login sebagai admin.' }
  }

  // Insert to couriers matching the exact columns in Supabase
  const { error } = await supabase.from('couriers').insert({
    name: input.name,
    phone: input.phone,
    vehicle_type: input.vehicle,
    plate_number: input.plateNumber,
  })

  if (error) {
    console.error('Error adding courier to DB:', error)
    await supabase.from('couriers').insert({
      name: input.name,
      phone: input.phone,
      vehicle: input.vehicle,
      plate_number: input.plateNumber,
    })
  }

  revalidatePath('/admin')
  revalidatePath('/admin/logistik')

  return { success: true }
}

export interface AdminEsgReportItem {
  id: string
  code: string
  partnerId: string
  cafeName: string
  period: string
  periodMonth: number
  periodYear: number
  totalKg: number
  co2Saved: number
  grade: string
  status: string
  issuedAt: string
  pdfUrl?: string
}

/**
 * 13. Server Action: Ambil Seluruh Data Laporan ESG & Sertifikat dari database Supabase
 */
export async function getAdminEsgReportsData(): Promise<{
  reports: AdminEsgReportItem[]
  partners: { id: string; name: string; cafeName: string; totalKg: number }[]
  metrics: {
    totalReportsIssued: number
    totalCertificatesIssued: number
    totalWasteValidatedKg: number
    totalCo2SavedKg: number
  }
}> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Fetch registered partner profiles
  const { data: profileList } = await supabase
    .from('profiles')
    .select('id, full_name, cafe_name, total_kg')
    .neq('role', 'admin')
    .order('created_at', { ascending: false })

  const partners = (profileList || []).map((p) => ({
    id: p.id,
    name: p.full_name || 'Mitra Kafe',
    cafeName: p.cafe_name || p.full_name || 'Kedai Kopi ReBrew',
    totalKg: Number(p.total_kg || 0),
  }))

  // 2. Fetch ESG reports from DB
  const { data: dbReports } = await supabase
    .from('esg_reports')
    .select('*, profiles!esg_reports_partner_id_fkey(full_name, cafe_name)')
    .order('issued_at', { ascending: false })

  // 3. Fetch Eco Certificates from DB in parallel
  const { data: dbCerts } = await supabase
    .from('eco_certificates')
    .select('*')

  const certGradeMap: Record<string, string> = {}
  if (dbCerts) {
    dbCerts.forEach((c) => {
      if (c.partner_id) {
        certGradeMap[c.partner_id] = c.grade || 'Gold Partner ⭐'
      }
    })
  }

  let totalWasteValidatedKg = 0
  let totalCo2SavedKg = 0

  const reportsList: AdminEsgReportItem[] = (dbReports || []).map((r: any) => {
    const cafeName = r.profiles?.cafe_name || r.profiles?.full_name || 'Mitra Kafe'
    const kg = Number(r.total_waste_kg || 0)
    const co2 = Number(r.co2_saved_kg || kg * 1.2)
    totalWasteValidatedKg += kg
    totalCo2SavedKg += co2

    const monthNames = [
      '',
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ]

    const periodStr = `${monthNames[r.period_month] || 'Bulan'} ${r.period_year || 2026}`
    const grade = certGradeMap[r.partner_id] || (kg >= 50 ? 'Platinum Partner 🏆' : 'Gold Partner ⭐')

    return {
      id: r.id,
      code: r.report_code || r.id,
      partnerId: r.partner_id,
      cafeName,
      period: periodStr,
      periodMonth: r.period_month,
      periodYear: r.period_year,
      totalKg: Math.round(kg * 10) / 10,
      co2Saved: Math.round(co2 * 10) / 10,
      grade,
      status: 'Diterbitkan & Sah',
      issuedAt: r.issued_at
        ? new Date(r.issued_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : 'Hari ini',
      pdfUrl: r.report_pdf_url || undefined,
    }
  })

  return {
    reports: reportsList,
    partners,
    metrics: {
      totalReportsIssued: reportsList.length,
      totalCertificatesIssued: (dbCerts || []).length,
      totalWasteValidatedKg: Math.round(totalWasteValidatedKg * 10) / 10,
      totalCo2SavedKg: Math.round(totalCo2SavedKg * 10) / 10,
    },
  }
}

/**
 * 14. Server Action: Terbitkan Laporan ESG & Sertifikat Digital Baru ke Database
 */
export async function generateEsgReportAction(input: {
  partnerId: string
  periodMonth: number
  periodYear: number
  totalWasteKg: number
  co2SavedKg: number
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Anda harus login sebagai admin.' }
  }

  const reportCode = `ESG-${input.periodYear}-${String(input.periodMonth).padStart(2, '0')}-${input.partnerId.slice(0, 4).toUpperCase()}`
  const certNumber = `CERT-REBREW-${input.periodYear}-${Math.floor(1000 + Math.random() * 9000)}`
  const grade = input.totalWasteKg >= 100 ? 'Platinum Partner 🏆' : input.totalWasteKg >= 25 ? 'Gold Partner ⭐' : 'Silver Eco Partner 🥉'

  // 1. Insert into esg_reports
  const { error: esgError } = await supabase.from('esg_reports').insert({
    report_code: reportCode,
    partner_id: input.partnerId,
    period_month: input.periodMonth,
    period_year: input.periodYear,
    total_waste_kg: input.totalWasteKg,
    co2_saved_kg: input.co2SavedKg,
    issued_by: user.id,
  })

  if (esgError) {
    console.error('Error inserting ESG report:', esgError)
  }

  // 2. Insert into eco_certificates
  try {
    const validUntil = new Date()
    validUntil.setFullYear(validUntil.getFullYear() + 1)

    await supabase.from('eco_certificates').insert({
      certificate_number: certNumber,
      partner_id: input.partnerId,
      grade,
      valid_until: validUntil.toISOString().split('T')[0],
    })
  } catch (err) {
    console.error('Error inserting eco certificate:', err)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/laporan-esg')
  revalidatePath('/dashboard/insight')

  return { success: true, reportCode, certNumber }
}





