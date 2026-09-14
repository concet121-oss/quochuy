'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(_prev: unknown, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Vui lòng nhập đầy đủ email và mật khẩu.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return { error: 'Email hoặc mật khẩu không đúng.' }
  }

  // Reject locked accounts immediately.
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_locked')
    .eq('id', data.user.id)
    .single()

  if (profile?.is_locked) {
    await supabase.auth.signOut()
    return { error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' }
  }

  redirect('/chat')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
