import { notFound, redirect } from 'next/navigation'
import type { UIMessage } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { ChatWindow } from '@/components/chat/chat-window'

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: conversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', id)
    .single()
  if (!conversation) notFound()

  const { data: rows } = await supabase
    .from('messages')
    .select('id, role, content')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  const { data: profile } = await supabase
    .from('profiles')
    .select('used_chats, max_chats')
    .eq('id', user.id)
    .single()

  const initialMessages: UIMessage[] = (rows ?? []).map((m) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    parts: [{ type: 'text', text: m.content }],
  }))

  return (
    <ChatWindow
      conversationId={id}
      initialMessages={initialMessages}
      quota={{
        usedChats: profile?.used_chats ?? 0,
        maxChats: profile?.max_chats ?? 0,
      }}
    />
  )
}
