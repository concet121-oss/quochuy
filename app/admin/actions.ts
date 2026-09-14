'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type AdminActionState = { error?: string; success?: string } | null

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/chat')

  return { user, admin: createAdminClient() }
}

export async function createUser(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { admin } = await requireAdmin()

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const creditsRaw = String(formData.get('max_chats') ?? '').trim()
  const maxChats = Number.parseInt(creditsRaw, 10)

  if (!email || !password) {
    return { error: 'Vui lòng nhập email và mật khẩu.' }
  }
  if (password.length < 6) {
    return { error: 'Mật khẩu phải có ít nhất 6 ký tự.' }
  }
  if (!Number.isFinite(maxChats) || maxChats < 0) {
    return { error: 'Lượt chat phải là số nguyên không âm.' }
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    return { error: error?.message ?? 'Không thể tạo tài khoản.' }
  }

  const { error: profileError } = await admin.from('profiles').upsert({
    id: data.user.id,
    email,
    role: 'user',
    max_chats: maxChats,
    used_chats: 0,
    is_locked: false,
  })

  if (profileError) {
    return {
      error: `Tài khoản đã tạo nhưng cập nhật hồ sơ thất bại: ${profileError.message}`,
    }
  }

  revalidatePath('/admin')
  return { success: `Đã tạo tài khoản ${email}.` }
}

export async function resetPassword(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { admin } = await requireAdmin()

  const userId = String(formData.get('user_id') ?? '')
  const password = String(formData.get('password') ?? '')

  if (!userId) return { error: 'Thiếu mã người dùng.' }
  if (password.length < 6) {
    return { error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' }
  }

  const { error } = await admin.auth.admin.updateUserById(userId, { password })
  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: 'Đã đặt lại mật khẩu.' }
}

export async function updateChatCredits(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { admin } = await requireAdmin()

  const userId = String(formData.get('user_id') ?? '')
  const maxChats = Number.parseInt(String(formData.get('max_chats') ?? ''), 10)

  if (!userId) return { error: 'Thiếu mã người dùng.' }
  if (!Number.isFinite(maxChats) || maxChats < 0) {
    return { error: 'Lượt chat phải là số nguyên không âm.' }
  }

  const { error } = await admin
    .from('profiles')
    .update({ max_chats: maxChats })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: 'Đã cập nhật lượt chat.' }
}

export async function toggleLock(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { user, admin } = await requireAdmin()

  const userId = String(formData.get('user_id') ?? '')
  const nextLocked = String(formData.get('is_locked') ?? '') === 'true'

  if (!userId) return { error: 'Thiếu mã người dùng.' }
  if (userId === user.id) {
    return { error: 'Không thể khóa tài khoản đang đăng nhập.' }
  }

  const { error } = await admin
    .from('profiles')
    .update({ is_locked: nextLocked })
    .eq('id', userId)

  if (error) return { error: error.message }

  if (nextLocked) {
    await admin.auth.admin.signOut(userId, 'global')
  }

  revalidatePath('/admin')
  return {
    success: nextLocked ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.',
  }
}
