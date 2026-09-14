'use client'

import { useState, useTransition } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  MessageSquare,
  Trash2,
  LogOut,
  Shield,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createConversation, deleteConversation } from '@/app/chat/actions'
import { logout } from '@/app/auth/actions'

type Conversation = { id: string; title: string; updated_at: string }
type Profile = {
  email: string
  role: string
  usedChats: number
  maxChats: number
}

export function ChatSidebar({
  conversations,
  profile,
}: {
  conversations: Conversation[]
  profile: Profile
}) {
  const router = useRouter()
  const params = useParams<{ id?: string }>()
  const activeId = params?.id
  const [isPending, startTransition] = useTransition()
  const [creating, setCreating] = useState(false)

  const remaining = Math.max(profile.maxChats - profile.usedChats, 0)
  const pct = profile.maxChats > 0 ? (profile.usedChats / profile.maxChats) * 100 : 0

  async function handleNew() {
    setCreating(true)
    try {
      const id = await createConversation()
      router.push(`/chat/${id}`)
      router.refresh()
    } finally {
      setCreating(false)
    }
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteConversation(id)
      if (activeId === id) router.push('/chat')
      router.refresh()
    })
  }

  return (
    <aside className="flex h-dvh w-72 shrink-0 flex-col border-r border-border/60 bg-sidebar">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
          <Sparkles className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-none">Nova AI</p>
          <p className="mt-1 text-xs text-muted-foreground">Trợ lý thông minh</p>
        </div>
      </div>

      <div className="px-3">
        <Button
          onClick={handleNew}
          disabled={creating}
          className="w-full justify-start gap-2"
        >
          {creating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Cuộc trò chuyện mới
        </Button>
      </div>

      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Lịch sử
        </p>
        {conversations.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            Chưa có cuộc trò chuyện nào.
          </p>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            className={cn(
              'group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors',
              activeId === c.id
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground',
            )}
          >
            <Link
              href={`/chat/${c.id}`}
              className="flex min-w-0 flex-1 items-center gap-2"
            >
              <MessageSquare className="size-4 shrink-0" />
              <span className="truncate">{c.title}</span>
            </Link>
            <button
              onClick={() => handleDelete(c.id)}
              disabled={isPending}
              aria-label="Xóa cuộc trò chuyện"
              className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </nav>

      <div className="border-t border-border/60 p-3">
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Lượt chat còn lại</span>
            <span className="font-semibold text-foreground">
              {remaining}/{profile.maxChats}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                pct >= 100 ? 'bg-destructive' : 'bg-primary',
              )}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>

        {profile.role === 'admin' && (
          <Link href="/admin" className="mt-2 block">
            <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
              <Shield className="size-4" />
              Trang quản trị
            </Button>
          </Link>
        )}

        <div className="mt-2 flex items-center gap-2 px-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold uppercase text-primary">
            {profile.email.charAt(0)}
          </div>
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {profile.email}
          </span>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Đăng xuất"
              className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
