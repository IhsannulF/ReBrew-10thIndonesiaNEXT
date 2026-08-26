'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  
  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent('Email dan password wajib diisi.')}`)
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    let friendlyError = error.message
    if (error.message.includes('Invalid login credentials')) {
      friendlyError = 'Email atau kata sandi salah. Silakan periksa kembali.'
    } else if (error.message.includes('Email not confirmed')) {
      friendlyError = 'Email belum dikonfirmasi. Silakan periksa inbox email Anda.'
    }
    redirect(`/login?error=${encodeURIComponent(friendlyError)}`)
  }

  // Check role from profiles table
  let targetPath = '/dashboard'
  if (authData?.user?.id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .maybeSingle()

    if (profile?.role === 'admin') {
      targetPath = '/admin'
    }
  }

  revalidatePath('/', 'layout')
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/admin', 'layout')
  redirect(targetPath)
}


export async function signup(formData: FormData) {
  const fullName = ((formData.get('fullName') as string) || '').trim()
  const cafeName = ((formData.get('cafeName') as string) || '').trim()
  const city = ((formData.get('city') as string) || 'Surabaya').trim()
  const phone = ((formData.get('phone') as string) || '').trim()
  const email = ((formData.get('email') as string) || '').trim()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!email || !password || !fullName || !cafeName) {
    redirect(`/daftar?error=${encodeURIComponent('Nama lengkap, nama kafe, email, dan kata sandi wajib diisi.')}`)
  }

  if (password.length < 6) {
    redirect(`/daftar?error=${encodeURIComponent('Password minimal 6 karakter.')}`)
  }

  if (confirmPassword && password !== confirmPassword) {
    redirect(`/daftar?error=${encodeURIComponent('Konfirmasi kata sandi tidak cocok.')}`)
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Register to Supabase Auth with rich metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        cafe_name: cafeName,
        city: city,
        phone: phone,
        tier: 'starter',
        role: 'mitra',
      },
    },
  })

  if (error) {
    let friendlyError = error.message
    if (error.message.includes('User already registered')) {
      friendlyError = 'Email sudah terdaftar. Silakan gunakan menu Masuk.'
    } else if (error.message.includes('email rate limit exceeded') || error.message.includes('over_email_send_rate_limit')) {
      friendlyError = 'Supabase Email Rate Limit tercapai. Solusi: Di Supabase Dashboard, buka Authentication > Providers > Email, lalu matikan "Confirm email" agar pendaftaran langsung aktif.'
    }
    redirect(`/daftar?error=${encodeURIComponent(friendlyError)}`)
  }

  // 2. Insert or upsert profile into public.profiles if user was created
  if (data?.user?.id) {
    try {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        cafe_name: cafeName,
        city: city,
        role: 'mitra',
        tier: 'starter',
        saldo_poin: 0,
        total_kg: 0.00,
        active_streak_days: 0,
      })

      // Create default monthly target for new cafe
      const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      await supabase.from('monthly_targets').insert({
        user_id: data.user.id,
        month_name: currentMonth,
        target_kg: 25.00,
        current_kg: 0.00,
        reward_coins: 150,
        reward_badge_name: '1 Ton Club Contender',
      })
    } catch {
      // Ignored if table doesn't exist yet or handled by trigger
    }
  }

  revalidatePath('/', 'layout')
  revalidatePath('/dashboard', 'layout')

  if (data?.session) {
    redirect('/dashboard')
  } else {
    redirect(`/login?message=${encodeURIComponent('Pendaftaran mitra berhasil! Akun Anda telah siap, silakan masuk.')}`)
  }
}

export async function signout() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  revalidatePath('/dashboard', 'layout')
  redirect('/')
}