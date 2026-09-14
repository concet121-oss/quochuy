import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatSidebar } from '@/components/chat/chat-sidebar'

export default async function ChatLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, role, used_chats, max_chats, is_locked')
    .eq('id', user.id)
    .single()

  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, title, updated_at')
    .order('updated_at', { ascending: false })

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <ChatSidebar
        conversations={conversations ?? []}
        profile={{
          email: profile?.email ?? user.email ?? '',
          role: profile?.role ?? 'user',
          usedChats: profile?.used_chats ?? 0,
          maxChats: profile?.max_chats ?? 0,
        }}
      />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  )
}
