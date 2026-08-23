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

  const { error } = await supabase.auth.signInWithPassword({
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

  revalidatePath('/', 'layout')
  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const fullName = ((formData.get('fullName') as string) || '').trim()
  const email = ((formData.get('email') as string) || '').trim()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!email || !password) {
    redirect(`/daftar?error=${encodeURIComponent('Email dan password wajib diisi.')}`)
  }

  if (password.length < 6) {
    redirect(`/daftar?error=${encodeURIComponent('Password minimal 6 karakter.')}`)
  }

  if (confirmPassword && password !== confirmPassword) {
    redirect(`/daftar?error=${encodeURIComponent('Konfirmasi kata sandi tidak cocok.')}`)
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    let friendlyError = error.message
    if (error.message.includes('User already registered')) {
      friendlyError = 'Email sudah terdaftar. Silakan gunakan menu Masuk.'
    } else if (error.message.includes('email rate limit exceeded') || error.message.includes('over_email_send_rate_limit')) {
      friendlyError = 'Supabase Email Rate Limit tercapai. Solusi: Di Supabase Dashboard, buka Authentication > Providers > Email, lalu matikan (Uncheck) "Confirm email" agar pendaftaran langsung aktif tanpa limit email.'
    }
    redirect(`/daftar?error=${encodeURIComponent(friendlyError)}`)
  }

  revalidatePath('/', 'layout')
  revalidatePath('/dashboard', 'layout')

  if (data?.session) {
    redirect('/dashboard')
  } else {
    redirect(`/login?message=${encodeURIComponent('Pendaftaran berhasil! Akun Anda telah siap, silakan masuk.')}`)
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