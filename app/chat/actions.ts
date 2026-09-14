'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createConversation() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Chưa đăng nhập')

  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: user.id })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/chat')
  return data.id as string
}

export async function renameConversation(id: string, title: string) {
  const supabase = await createClient()
  const clean = title.trim().slice(0, 80) || 'Cuộc trò chuyện mới'
  const { error } = await supabase
    .from('conversations')
    .update({ title: clean })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/chat')
}

export async function deleteConversation(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('conversations').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/chat')
}
