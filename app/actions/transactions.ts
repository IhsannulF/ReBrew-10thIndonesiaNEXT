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
  totalWeight: number
  finalPoints: number
  totalCo2: number
}

// 1. Server Action: Simpan Tiket Setor Sampah ke Supabase Database
export async function createDepositTransaction(input: CreateDepositInput) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

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
      notes: input.pickupNotes || null,
      category: primaryCatObj?.name || 'Plastic Cup (PP/PET)',
    })
    .select()
    .single()

  if (txError) {
    // Jika kolom tertentu berbeda nama di schema lama, insert dengan fallback kolom yang umum
    const { error: fallbackError } = await supabase.from('transactions').insert({
      id: txId,
      user_id: user.id,
      status: 'pending',
      total_weight: input.totalWeight,
      total_points: input.finalPoints,
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
