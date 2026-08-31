'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { WASTE_CATEGORIES, DROP_POINTS } from '@/constants/wasteData'
import { TransactionDetail, TransactionStatus, WasteCategoryKey } from '@/types/transaction'

export interface CreateDepositInput {
  weights: Record<string, number>
  method: 'drop_point' | 'dijemput'
  selectedDropPoint: string
  pickupAddress: string
  pickupNotes?: string
  pickupDate?: string // Format: YYYY-MM-DD
  pickupTimeSlot?: string // e.g. "09:00 - 12:00 WIB"
  totalWeight: number
  finalPoints: number
  totalCo2: number
}

/**
 * Otomatis menolak penjemputan yang telah melewati batas jadwal toleransi wajar (hanya setelah 48 jam)
 * dan memulihkan transaksi baru yang sempat tertolak otomatis karena perbedaan zona waktu/slot
 */
export async function autoRejectExpiredPickups(supabase: any) {
  try {
    const now = new Date()

    // 1. Pulihkan tiket penjemputan yang dibuat dalam 48 jam terakhir yang sempat tertolak otomatis
    try {
      const { data: falselyRejected } = await supabase
        .from('transactions')
        .select('id, created_at, notes, method')
        .eq('status', 'rejected')
        .ilike('notes', '%Otomatis Ditolak%')

      if (falselyRejected && falselyRejected.length > 0) {
        for (const tx of falselyRejected) {
          const createdAt = new Date(tx.created_at || Date.now())
          const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
          // Jika baru dibuat kurang dari 48 jam lalu, kembalikan ke status 'pending'
          if (diffHours < 48) {
            const cleanedNotes = (tx.notes || '').replace(/Otomatis Ditolak:[^|\]]+/g, '').trim()
            await supabase
              .from('transactions')
              .update({
                status: 'pending',
                notes: cleanedNotes || 'Jadwal Penjemputan Armada Menunggu Konfirmasi',
              })
              .eq('id', tx.id)
          }
        }
      }
    } catch (recoverErr) {
      console.warn('Recovery of rejected pickups non-blocking warning:', recoverErr)
    }

    // 2. Ambil transaksi berstatus pending dengan metode penjemputan
    const { data: pendingPickups, error } = await supabase
      .from('transactions')
      .select('id, created_at, notes, method, status')
      .eq('status', 'pending')

    if (error || !pendingPickups || pendingPickups.length === 0) return

    const expiredIds: string[] = []

    for (const tx of pendingPickups) {
      const isPickup = tx.method === 'dijemput' || (tx.notes && tx.notes.toLowerCase().includes('jemput'))
      if (!isPickup) continue

      const createdAt = new Date(tx.created_at || Date.now())
      const diffHoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

      // Transaksi yang baru dibuat kurang dari 48 jam TIDAK BOLEH ditolak otomatis
      if (diffHoursSinceCreation < 48) {
        continue
      }

      expiredIds.push(tx.id)
    }

    // 3. Update transaksi yang benar-benar kedaluwarsa (> 48 jam tanpa penanganan)
    if (expiredIds.length > 0) {
      for (const id of expiredIds) {
        await supabase
          .from('transactions')
          .update({
            status: 'rejected',
            notes: `Otomatis Ditolak: Melewati batas waktu 48 jam penjemputan armada tanpa konfirmasi penyerahan sampah.`,
          })
          .eq('id', id)
      }
    }
  } catch (err) {
    console.warn('Auto reject expired pickups warning:', err)
  }
}

// 1. Server Action: Simpan Tiket Setor Sampah ke Supabase Database
export async function createDepositTransaction(input: CreateDepositInput) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Jalankan auto-reject terlebih dahulu
  await autoRejectExpiredPickups(supabase)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Anda harus login untuk menyetor sampah.' }
  }

  // Generate random 6-digit uppercase ticket code: RB-XXXXXX
  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  const ticketCode = `RB-${randomCode}`

  // Cari nama kategori utama atau gabungan
  const activeCategories = Object.entries(input.weights).filter(([_, w]) => w > 0)
  const primaryCatId = activeCategories[0]?.[0] || 'cup-plastik'
  const primaryCatObj = WASTE_CATEGORIES.find((c) => c.id === primaryCatId)

  // Hitung jadwal kedaluwarsa jika metode dijemput
  let scheduledExpIso = ''
  let notesPayload = input.pickupNotes || ''

  if (input.method === 'dijemput') {
    const pickupDateStr = input.pickupDate || new Date().toISOString().split('T')[0]
    const timeSlot = input.pickupTimeSlot || '09:00 - 12:00 WIB'

    // Tentukan jam batas akhir slot (12:00, 15:00, atau 18:00 WIB)
    let endHour = 18
    if (timeSlot.includes('12:00')) endHour = 12
    else if (timeSlot.includes('15:00')) endHour = 15
    else if (timeSlot.includes('18:00')) endHour = 18

    // Parse waktu kedaluwarsa (WIB = UTC+7)
    const expDate = new Date(`${pickupDateStr}T${String(endHour).padStart(2, '0')}:00:00+07:00`)
    scheduledExpIso = expDate.toISOString()

    const scheduleLabel = `Jadwal Jemput: ${pickupDateStr} (${timeSlot})`
    notesPayload = notesPayload
      ? `${scheduleLabel} | ${notesPayload} [JADWAL_EXP:${scheduledExpIso}]`
      : `${scheduleLabel} [JADWAL_EXP:${scheduledExpIso}]`
  }

  // Resolusi drop point ID aman
  let targetDropPointId: string | null = null
  if (input.method === 'drop_point') {
    targetDropPointId = input.selectedDropPoint || 'dp-central-hub-01'
  }

  // Payload utama sesuai skema PostgreSQL
  const baseTxPayload: any = {
    id: ticketCode,
    user_id: user.id,
    method: input.method,
    total_weight_kg: input.totalWeight,
    total_points: input.finalPoints,
    total_co2_kg: input.totalCo2,
    status: 'pending',
    pickup_address: input.method === 'dijemput' ? input.pickupAddress : null,
    drop_point_id: targetDropPointId,
    notes: notesPayload || null,
    category: primaryCatObj?.name || 'Plastic Cup (PP/PET)',
    created_at: new Date().toISOString(),
  }

  // 1. Eksekusi insert transaksi
  let { error: txError } = await supabase.from('transactions').insert(baseTxPayload)

  // Fallback 1: Jika gagal karena foreign key drop_point_id
  if (txError && txError.message?.includes('drop_point_id')) {
    baseTxPayload.drop_point_id = null
    const res = await supabase.from('transactions').insert(baseTxPayload)
    txError = res.error
  }

  // Fallback 2: Jika gagal karena kolom category atau penamaan legacy
  if (txError) {
    console.warn('First insert attempt failed, trying fallback schema...', txError.message)
    const fallbackPayload: any = {
      id: ticketCode,
      user_id: user.id,
      method: input.method,
      total_weight_kg: input.totalWeight,
      total_points: input.finalPoints,
      total_co2_kg: input.totalCo2,
      status: 'pending',
      notes: notesPayload || null,
    }
    const res2 = await supabase.from('transactions').insert(fallbackPayload)
    if (res2.error) {
      console.error('Fatal error creating transaction in Supabase:', res2.error)
      return { success: false, error: res2.error.message || 'Gagal menyimpan transaksi ke database.' }
    }
  }

  // 2. Insert item ke transaction_items jika ada
  if (activeCategories.length > 0) {
    const itemsToInsert = activeCategories.map(([catId, weight]) => {
      const cat = WASTE_CATEGORIES.find((c) => c.id === catId)
      return {
        transaction_id: ticketCode,
        category_id: catId,
        weight_kg: weight,
        point_per_kg: cat?.pointPerKg || 1750,
        points_earned: Math.round(weight * (cat?.pointPerKg || 1750)),
        co2_saved_kg: Math.round(weight * (cat?.co2Factor || 1.2) * 10) / 10,
      }
    })

    try {
      await supabase.from('transaction_items').insert(itemsToInsert)
    } catch (itemErr) {
      console.warn('Non-blocking: could not insert into transaction_items:', itemErr)
    }
  }

  revalidatePath('/riwayat')
  revalidatePath('/dashboard/riwayat')
  revalidatePath('/dashboard')
  revalidatePath('/admin')
  revalidatePath('/admin/verifikasi')
  revalidatePath('/admin/logistik')

  return { success: true, ticketCode, transactionId: ticketCode }
}

// 2. Server Action: Ambil Riwayat Transaksi Milik User dari Supabase
export async function getUserTransactionHistory(): Promise<TransactionDetail[]> {
  const cookieStore = await cookies()
  const userSupabase = createClient(cookieStore)
  const db = createAdminClient()

  // Jalankan auto-reject untuk mengupdate status kadaluwarsa secara live
  await autoRejectExpiredPickups(db)

  const {
    data: { user },
  } = await userSupabase.auth.getUser()

  if (!user) return []

  let { data, error } = await db
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error || !data || data.length === 0) {
    const res = await userSupabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (res.data) data = res.data
  }

  if (!data || data.length === 0) {
    return []
  }

  // Format Supabase rows ke interface TransactionDetail
  return data.map((row: any) => {
    const createdAt = new Date(row.created_at || Date.now())
    const dateStr = createdAt.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    const timeStr = createdAt.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })

    // Map status (dengan deteksi komprehensif verifikasi admin)
    let status: TransactionStatus = 'pending'
    if (
      row.status === 'confirmed' ||
      row.status === 'verified' ||
      row.status === 'completed' ||
      Boolean(row.verified_at) ||
      (row.notes && row.notes.toLowerCase().includes('diverifikasi')) ||
      (row.scale_model && row.scale_model.toLowerCase().includes('verified'))
    ) {
      status = 'confirmed'
    } else if (row.status === 'rejected' || row.status === 'cancelled') {
      status = 'rejected'
    }

    // Auto-heal database record jika sudah diverifikasi tapi statusnya masih pending
    if (status === 'confirmed' && row.status !== 'confirmed') {
      db.from('transactions').update({ status: 'confirmed' }).eq('id', row.id).then(() => {})
    }

    // Map Category Key
    let categoryKey: Exclude<WasteCategoryKey, 'all'> = 'cup_plastik'
    const catNameLower = (row.category || '').toLowerCase()
    if (catNameLower.includes('botol')) categoryKey = 'botol_plastik'
    else if (catNameLower.includes('tutup') || catNameLower.includes('sedotan')) categoryKey = 'tutup_cup'
    else if (catNameLower.includes('kaleng')) categoryKey = 'kaleng'
    else if (catNameLower.includes('kardus')) categoryKey = 'kardus'
    else if (catNameLower.includes('ampas')) categoryKey = 'ampas_kopi'

    // Drop Point Name
    const dropPointObj = DROP_POINTS.find((dp) => dp.id === row.drop_point_id)
    const dropPointName =
      row.drop_points?.name || dropPointObj?.name || (row.method === 'drop_point' || row.type === 'drop_point' ? 'ReBrew Central Hub' : undefined)

    // Deteksi apakah penolakan karena batas jadwal lewat
    const isExpired = (row.notes || '').toLowerCase().includes('melewati batas waktu jadwal')

    const totalWeight = Number(row.total_weight_kg || row.actual_weight || row.total_weight || row.weight || 0)
    const totalPoints = Number(row.total_points || row.points_earned || row.coins_earned || 0)
    const totalCo2 = Number(row.total_co2_kg || row.co2_saved || (totalWeight * 1.2).toFixed(1))
    const txMethod = (row.method || row.type || 'drop_point') === 'dijemput' ? 'dijemput' : 'drop_point'

    return {
      id: row.id || row.code,
      categoryKey,
      material: row.category || 'Plastic Cup (PP/PET)',
      date: dateStr,
      time: `${timeStr} WIB`,
      fullDate: `${dateStr}, ${timeStr} WIB`,
      weightKg: totalWeight,
      pointsEarned: totalPoints,
      co2SavedKg: totalCo2,
      status,
      method: txMethod as 'drop_point' | 'dijemput',
      dropPointName,
      pickupAddress: row.pickup_address || undefined,
      notes: row.notes || undefined,
      isExpired,
      verifiedAt: row.verified_at
        ? new Date(row.verified_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })
        : undefined,
    }
  })
}
