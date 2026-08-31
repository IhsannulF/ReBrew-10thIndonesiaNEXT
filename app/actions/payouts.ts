'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { PayoutFormData, PayoutTransaction, PayoutStatus } from '@/types/payout'
import { PAYMENT_CHANNELS, COIN_RATE, MIN_WITHDRAW_POINTS } from '@/constants/payoutData'

export interface UserPayoutDataResult {
  userId: string | null
  userName: string
  cafeName: string
  saldoPoints: number
  payouts: PayoutTransaction[]
}

// Helper formatting row to PayoutTransaction
function formatPayoutRow(row: any): PayoutTransaction {
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

  let status: PayoutStatus = 'processing'
  if (row.status === 'completed' || row.status === 'success' || row.status === 'verified') {
    status = 'completed'
  } else if (row.status === 'failed' || row.status === 'rejected') {
    status = 'failed'
  } else {
    status = 'processing'
  }

  return {
    id: row.id,
    date: dateStr,
    time: `${timeStr} WIB`,
    fullDate: `${dateStr}, ${timeStr} WIB`,
    channelName: row.channel_name || 'Bank Transfer',
    channelType: (row.channel_type === 'ewallet' ? 'ewallet' : 'bank'),
    accountNumber: row.account_number || '',
    accountHolderName: row.account_holder_name || '',
    pointsDeducted: Number(row.points_deducted || 0),
    amountIdr: Number(row.amount_idr || 0),
    adminFeeIdr: Number(row.admin_fee_idr || 0),
    netAmountIdr: Number(row.net_amount_idr || row.amount_idr || 0),
    status: status,
    estimatedArrival: row.estimated_arrival || (status === 'completed' ? 'Selesai Ditransfer' : 'Hari ini, dalam 1-15 menit (Maks. 1x24 jam)'),
    completedAt: row.completed_at
      ? new Date(row.completed_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }) + ' WIB'
      : undefined,
  }
}

// 1. Ambil Data User, Saldo Poin, dan Riwayat Pencairan (Real DB)
export async function getUserPayoutData(): Promise<UserPayoutDataResult> {
  const cookieStore = await cookies()
  const userSupabase = createClient(cookieStore)
  const db = createAdminClient()

  const {
    data: { user },
  } = await userSupabase.auth.getUser()

  if (!user) {
    return {
      userId: null,
      userName: 'Mitra ReBrew',
      cafeName: 'Kedai Kopi Mitra',
      saldoPoints: 0,
      payouts: [],
    }
  }

  // 1. Fetch Profile
  let { data: profile } = await db
    .from('profiles')
    .select('id, full_name, cafe_name, saldo_poin')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    const res = await userSupabase
      .from('profiles')
      .select('id, full_name, cafe_name, saldo_poin')
      .eq('id', user.id)
      .maybeSingle()
    profile = res.data
  }

  const userName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Mitra ReBrew'
  const cafeName =
    profile?.cafe_name ||
    user?.user_metadata?.cafe_name ||
    'Kedai Kopi Mitra'
  const saldoPoints = Number(profile?.saldo_poin ?? 0)

  // 2. Fetch Payouts History
  let { data: payoutRows, error } = await db
    .from('payouts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error || !payoutRows || payoutRows.length === 0) {
    const res = await userSupabase
      .from('payouts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (res.data) payoutRows = res.data
  }

  let payouts: PayoutTransaction[] = []
  if (payoutRows && payoutRows.length > 0) {
    payouts = payoutRows.map(formatPayoutRow)
  }

  return {
    userId: user.id,
    userName,
    cafeName,
    saldoPoints,
    payouts,
  }
}

// 2. Request / Ajukan Pencairan Saldo Baru
export async function requestPayout(formData: PayoutFormData): Promise<{
  success: boolean
  error?: string
  payout?: PayoutTransaction
  newBalance?: number
}> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Silakan login terlebih dahulu untuk mencairkan saldo.' }
  }

  // 1. Ambil profil user untuk validasi saldo
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('saldo_poin, full_name, cafe_name')
    .eq('id', user.id)
    .maybeSingle()

  const currentPoints = Number(profile?.saldo_poin ?? 0)

  if (formData.pointsToWithdraw < MIN_WITHDRAW_POINTS) {
    return {
      success: false,
      error: `Minimal penarikan adalah ${MIN_WITHDRAW_POINTS} poin (Rp ${(MIN_WITHDRAW_POINTS * COIN_RATE).toLocaleString('id-ID')}).`,
    }
  }

  if (formData.pointsToWithdraw > currentPoints) {
    return {
      success: false,
      error: `Saldo poin tidak mencukupi. Saldo aktif Anda saat ini: ${currentPoints.toLocaleString('id-ID')} poin.`,
    }
  }

  if (!formData.accountNumber || formData.accountNumber.trim().length < 5) {
    return {
      success: false,
      error: 'Nomor rekening atau nomor e-wallet tidak valid (min. 5 digit).',
    }
  }

  if (!formData.accountHolderName || !formData.accountHolderName.trim()) {
    return {
      success: false,
      error: 'Nama pemilik rekening / e-wallet wajib diisi.',
    }
  }

  // 2. Temukan Channel Pembayaran
  const channel = PAYMENT_CHANNELS.find((c) => c.id === formData.channelId) || PAYMENT_CHANNELS[0]
  const calculatedAmountIdr = formData.pointsToWithdraw * COIN_RATE
  const adminFeeIdr = 0
  const netAmountIdr = calculatedAmountIdr - adminFeeIdr

  // 3. Generate ID Pencairan: WD-XXXXXX
  const randomCode = Math.floor(100000 + Math.random() * 900000)
  const payoutId = `WD-${randomCode}`
  const estimatedArrival = 'Hari ini, dalam 1-15 menit (Maks. 1x24 jam kerja)'

  // 4. Insert ke tabel payouts
  const { error: insertError } = await supabase.from('payouts').insert({
    id: payoutId,
    user_id: user.id,
    channel_code: channel.code,
    channel_name: channel.name,
    channel_type: channel.type,
    account_number: formData.accountNumber.trim(),
    account_holder_name: formData.accountHolderName.trim(),
    points_deducted: formData.pointsToWithdraw,
    amount_idr: calculatedAmountIdr,
    admin_fee_idr: adminFeeIdr,
    net_amount_idr: netAmountIdr,
    status: 'processing',
    estimated_arrival: estimatedArrival,
  })

  if (insertError) {
    console.error('Error inserting payout to Supabase:', insertError)
    // Fallback jika kolom tertentu opsional
    const { error: fallbackError } = await supabase.from('payouts').insert({
      id: payoutId,
      user_id: user.id,
      channel_code: channel.code,
      channel_name: channel.name,
      channel_type: channel.type,
      account_number: formData.accountNumber.trim(),
      account_holder_name: formData.accountHolderName.trim(),
      points_deducted: formData.pointsToWithdraw,
      amount_idr: calculatedAmountIdr,
      net_amount_idr: netAmountIdr,
    })

    if (fallbackError) {
      console.error('Fallback payout error:', fallbackError)
      return { success: false, error: 'Gagal mengajukan penarikan dana ke database.' }
    }
  }

  // 5. Potong saldo_poin di tabel profiles
  const updatedPoints = Math.max(0, currentPoints - formData.pointsToWithdraw)
  const { error: updateProfileError } = await supabase
    .from('profiles')
    .update({
      saldo_poin: updatedPoints,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (updateProfileError) {
    console.error('Error updating user balance points:', updateProfileError)
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const newPayoutObj: PayoutTransaction = {
    id: payoutId,
    date: dateStr,
    time: `${timeStr} WIB`,
    fullDate: `${dateStr}, ${timeStr} WIB`,
    channelName: channel.name,
    channelType: channel.type,
    accountNumber: formData.accountNumber.trim(),
    accountHolderName: formData.accountHolderName.trim(),
    pointsDeducted: formData.pointsToWithdraw,
    amountIdr: calculatedAmountIdr,
    adminFeeIdr,
    netAmountIdr,
    status: 'processing',
    estimatedArrival,
  }

  revalidatePath('/dashboard/saldo')
  revalidatePath('/dashboard')
  revalidatePath('/saldo')
  revalidatePath('/admin/payout')

  return {
    success: true,
    payout: newPayoutObj,
    newBalance: updatedPoints,
  }
}

// 3. Admin: Ambil Seluruh Data Payout dari database
export async function getAdminPayoutsAction() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: rows, error } = await supabase
    .from('payouts')
    .select('*, profiles(full_name, cafe_name, email)')
    .order('created_at', { ascending: false })

  if (error || !rows) {
    return []
  }

  return rows.map((r: any) => {
    const createdAt = new Date(r.created_at || Date.now())
    return {
      id: r.id,
      code: r.id,
      cafeName: r.profiles?.cafe_name || r.profiles?.full_name || 'Mitra Kafe',
      userEmail: r.profiles?.email || '',
      amountRupiah: Number(r.net_amount_idr || r.amount_idr || 0),
      pointsDeducted: Number(r.points_deducted || 0),
      bankName: r.channel_name || r.channel_code || 'Bank Transfer',
      accountNumber: r.account_number,
      accountHolder: r.account_holder_name,
      status: (r.status || 'processing') as PayoutStatus,
      requestedAt: createdAt.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB',
    }
  })
}

// 4. Admin: Konfirmasi Approval Transfer Payout
export async function approvePayoutAction(payoutId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from('payouts')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      estimated_arrival: 'Selesai Ditransfer',
    })
    .eq('id', payoutId)

  if (error) {
    console.error('Error approving payout:', error)
    return { success: false, error: 'Gagal mengonfirmasi transfer payout di database.' }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/payout')
  revalidatePath('/dashboard/saldo')
  revalidatePath('/dashboard')
  revalidatePath('/saldo')

  return { success: true }
}

// 5. Admin: Tolak / Batalkan Permintaan Payout (Kembalikan Saldo Poin ke Akun Kafe)
export async function rejectPayoutAction(payoutId: string, reason?: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Ambil data payout untuk mendapatkan user_id dan points_deducted
  const { data: payout, error: fetchErr } = await supabase
    .from('payouts')
    .select('user_id, points_deducted, status')
    .eq('id', payoutId)
    .single()

  if (fetchErr || !payout) {
    return { success: false, error: 'Data pencairan tidak ditemukan.' }
  }

  if (payout.status === 'completed') {
    return { success: false, error: 'Pencairan yang sudah berstatus selesai tidak dapat dibatalkan.' }
  }

  // 2. Update status payout menjadi failed
  const { error: updateErr } = await supabase
    .from('payouts')
    .update({
      status: 'failed',
      estimated_arrival: reason ? `Ditolak: ${reason}` : 'Dibatalkan oleh Admin (Saldo Dikembalikan)',
    })
    .eq('id', payoutId)

  if (updateErr) {
    return { success: false, error: 'Gagal memperbarui status penolakan di database.' }
  }

  // 3. Kembalikan saldo poin ke profil mitra kafe
  const { data: profile } = await supabase
    .from('profiles')
    .select('saldo_poin')
    .eq('id', payout.user_id)
    .single()

  if (profile) {
    const currentSaldo = Number(profile.saldo_poin || 0)
    const refundedSaldo = currentSaldo + Number(payout.points_deducted || 0)
    await supabase
      .from('profiles')
      .update({ saldo_poin: refundedSaldo, updated_at: new Date().toISOString() })
      .eq('id', payout.user_id)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/payout')
  revalidatePath('/dashboard/saldo')
  revalidatePath('/dashboard')
  revalidatePath('/saldo')

  return { success: true }
}

