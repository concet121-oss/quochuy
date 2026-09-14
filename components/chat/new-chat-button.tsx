'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createConversation } from '@/app/chat/actions'

export function NewChatButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    try {
      const id = await createConversation()
      router.push(`/chat/${id}`)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handle} disabled={loading} className="gap-2">
      {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
      Cuộc trò chuyện mới
    </Button>
  )
}
