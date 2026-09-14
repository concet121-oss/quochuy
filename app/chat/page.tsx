import { Sparkles } from 'lucide-react'
import { NewChatButton } from '@/components/chat/new-chat-button'

export default function ChatIndexPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
        <Sparkles className="size-7" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Chào mừng đến với Nova AI</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Chọn một cuộc trò chuyện ở thanh bên hoặc bắt đầu một cuộc trò chuyện mới để
          trải nghiệm trợ lý AI.
        </p>
      </div>
      <NewChatButton />
    </div>
  )
}
