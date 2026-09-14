'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { ArrowUp, Loader2, Sparkles, Square, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MarkdownMessage } from '@/components/chat/markdown-message'
import { cn } from '@/lib/utils'

type Quota = { usedChats: number; maxChats: number }

export function ChatWindow({
  conversationId,
  initialMessages,
  quota,
}: {
  conversationId: string
  initialMessages: UIMessage[]
  quota: Quota
}) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, stop } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { conversationId },
    }),
    onError: async (error) => {
      // The route returns a plain-text reason for quota/lock errors.
      setErrorMsg(error.message || 'Đã xảy ra lỗi, vui lòng thử lại.')
    },
    onFinish: () => {
      router.refresh()
    },
  })

  const busy = status === 'submitted' || status === 'streaming'
  const outOfQuota = quota.usedChats >= quota.maxChats

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  function submit() {
    const text = input.trim()
    if (!text || busy || outOfQuota) return
    setErrorMsg(null)
    sendMessage({ text })
    setInput('')
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 border-b border-border/60 px-6 py-3">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Sparkles className="size-4" />
        </div>
        <h1 className="text-sm font-medium">Nova AI</h1>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                <Sparkles className="size-6" />
              </div>
              <h2 className="text-lg font-semibold">Bắt đầu cuộc trò chuyện</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Hỏi bất cứ điều gì — Nova có thể giải thích khái niệm, viết mã và hỗ trợ
                công việc của bạn.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((m) => (
              <MessageRow key={m.id} message={m} />
            ))}
            {status === 'submitted' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Nova đang soạn câu trả lời…
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 bg-background/80 px-4 py-4 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl">
          {errorMsg && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {errorMsg}
            </div>
          )}
          {outOfQuota && !errorMsg && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              Bạn đã dùng hết lượt chat. Vui lòng liên hệ quản trị viên.
            </div>
          )}
          <div
            className={cn(
              'flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm transition-colors focus-within:border-primary/50',
              (outOfQuota || busy) && 'opacity-90',
            )}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing &&
                  e.keyCode !== 229
                ) {
                  e.preventDefault()
                  submit()
                }
              }}
              rows={1}
              disabled={outOfQuota}
              placeholder={outOfQuota ? 'Đã hết lượt chat' : 'Nhắn tin cho Nova…'}
              className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
            />
            {busy ? (
              <Button size="icon" variant="secondary" onClick={() => stop()} aria-label="Dừng">
                <Square className="size-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={submit}
                disabled={!input.trim() || outOfQuota}
                aria-label="Gửi"
              >
                <ArrowUp className="size-4" />
              </Button>
            )}
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Nova có thể mắc lỗi. Hãy kiểm tra các thông tin quan trọng.
          </p>
        </div>
      </div>
    </div>
  )
}

function MessageRow({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user'
  const text = message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')

  return (
    <div className={cn('flex gap-3', isUser && 'justify-end')}>
      {!isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
          <Sparkles className="size-4" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card text-card-foreground ring-1 ring-border/60',
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
        ) : (
          <MarkdownMessage content={text} />
        )}
      </div>
    </div>
  )
}
