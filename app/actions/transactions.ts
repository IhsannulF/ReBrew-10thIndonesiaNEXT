'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
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
 * Otomatis menolak penjemputan yang telah melewati batas jadwal waktu yang ditentukan
 */
export async function autoRejectExpiredPickups(supabase: any) {
  try {
    const now = new Date()

    // 1. Ambil transaksi berstatus pending dengan metode penjemputan
    const { data: pendingPickups, error } = await supabase
      .from('transactions')
      .select('id, created_at, notes, type, status')
      .eq('status', 'pending')

    if (error || !pendingPickups || pendingPickups.length === 0) return

    const expiredIds: string[] = []

    for (const tx of pendingPickups) {
      const isPickup = tx.type === 'dijemput' || (tx.notes && tx.notes.includes('Dijemput'))
      if (!isPickup) continue

      // Cek apakah ada jadwal spesifik di notes atau created_at
      let isExpired = false
      const notes = tx.notes || ''

      // Cek apakah ada format [JADWAL_EXP: timestamp]
      const expMatch = notes.match(/\[JADWAL_EXP:([^\]]+)\]/)
      if (expMatch && expMatch[1]) {
        const expTime = new Date(expMatch[1])
        if (!isNaN(expTime.getTime()) && now.getTime() > expTime.getTime()) {
          isExpired = true
        }
      } else {
        // Fallback: Jika penjemputan sudah lebih dari 24 jam sejak dibuat dan belum diproses
        const createdAt = new Date(tx.created_at || 0)
        const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
        if (diffHours >= 24) {
          isExpired = true
        }
      }

      if (isExpired) {
        expiredIds.push(tx.id)
      }
    }

    // 2. Update seluruh transaksi penjemputan yang kedaluwarsa menjadi 'rejected'
    if (expiredIds.length > 0) {
      for (const id of expiredIds) {
        await supabase
          .from('transactions')
          .update({
            status: 'rejected',
            notes: `Otomatis Ditolak: Melewati batas waktu jadwal penjemputan armada tanpa konfirmasi penyerahan sampah.`,
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

  // Generate random 6-character uppercase ticket code: RB-XXXXXX
  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  const ticketCode = `RB-${randomCode}`
  const txId = `tx-${Date.now()}-${randomCode}`

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

  // Insert ke tabel transactions
  const { data: txData, error: txError } = await supabase
    .from('transactions')
    .insert({
      id: txId,
      user_id: user.id,
      type: input.method,
      total_weight: input.totalWeight,
      total_points: input.finalPoints,
      co2_saved: input.totalCo2,
      status: 'pending',
      code: ticketCode,
      pickup_address: input.method === 'dijemput' ? input.pickupAddress : null,
      drop_point_id: input.method === 'drop_point' ? input.selectedDropPoint : null,
      notes: notesPayload || null,
      category: primaryCatObj?.name || 'Plastic Cup (PP/PET)',
    })
    .select()
    .single()

  if (txError) {
    const { error: fallbackError } = await supabase.from('transactions').insert({
      id: txId,
      user_id: user.id,
      status: 'pending',
      total_weight: input.totalWeight,
      total_points: input.finalPoints,
      notes: notesPayload || null,
    })

    if (fallbackError) {
      console.error('Error creating transaction in Supabase:', txError)
    }
  }

  // Insert item ke transaction_items jika ada
  if (activeCategories.length > 0) {
    const itemsToInsert = activeCategories.map(([catId, weight]) => {
      const cat = WASTE_CATEGORIES.find((c) => c.id === catId)
      return {
        id: `txi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        transaction_id: txId,
        category_id: catId,
        category_name: cat?.name || catId,
        weight: weight,
        points: Math.round(weight * (cat?.pointPerKg || 1750)),
      }
    })

    try {
      await supabase.from('transaction_items').insert(itemsToInsert)
    } catch {
      // Ignored if transaction_items table is optional
    }
  }

  revalidatePath('/riwayat')
  revalidatePath('/dashboard/riwayat')
  revalidatePath('/dashboard')
  revalidatePath('/admin')
  revalidatePath('/admin/verifikasi')

  return { success: true, ticketCode, transactionId: txId }
}

// 2. Server Action: Ambil Riwayat Transaksi Milik User dari Supabase
export async function getUserTransactionHistory(): Promise<TransactionDetail[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Jalankan auto-reject untuk mengupdate status kadaluwarsa secara live
  await autoRejectExpiredPickups(supabase)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('transactions')
    .select('*, drop_points(name, address), transaction_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error || !data || data.length === 0) {
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

    // Map status
    let status: TransactionStatus = 'pending'
    if (row.status === 'confirmed' || row.status === 'verified' || row.status === 'completed') {
      status = 'confirmed'
    } else if (row.status === 'rejected' || row.status === 'cancelled') {
      status = 'rejected'
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
      row.drop_points?.name || dropPointObj?.name || (row.type === 'drop_point' ? 'ReBrew Central Hub' : undefined)

    // Deteksi apakah penolakan karena batas jadwal lewat
    const isExpired = (row.notes || '').toLowerCase().includes('melewati batas waktu jadwal')

    return {
      id: row.code || row.id,
      categoryKey,
      material: row.category || 'Plastic Cup (PP/PET)',
      date: dateStr,
      time: `${timeStr} WIB`,
      fullDate: `${dateStr}, ${timeStr} WIB`,
      weightKg: Number(row.actual_weight || row.total_weight || row.weight || 0),
      pointsEarned: Number(row.total_points || row.points_earned || row.coins_earned || 0),
      co2SavedKg: Number(row.co2_saved || (Number(row.total_weight || 0) * 1.2).toFixed(1)),
      status,
      method: (row.type === 'dijemput' ? 'dijemput' : 'drop_point') as 'drop_point' | 'dijemput',
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
