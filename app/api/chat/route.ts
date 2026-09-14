import { createClient } from '@/lib/supabase/server'
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from 'ai'

export const maxDuration = 60

const MODEL = 'google/gemini-2.5-flash'
const SYSTEM_PROMPT =
  'Bạn là Nova, một trợ lý AI thông minh, thân thiện và chuyên nghiệp. ' +
  'Trả lời rõ ràng, chính xác bằng ngôn ngữ của người dùng (mặc định tiếng Việt). ' +
  'Khi đưa ra mã nguồn, luôn dùng khối code có chú thích ngôn ngữ.'

function textOf(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

export async function POST(req: Request) {
  const { messages, conversationId }: { messages: UIMessage[]; conversationId?: string } =
    await req.json()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  // Validate the conversation belongs to this user (RLS also enforces this).
  if (!conversationId) return new Response('Thiếu conversationId', { status: 400 })
  const { data: convo } = await supabase
    .from('conversations')
    .select('id, title')
    .eq('id', conversationId)
    .eq('user_id', user.id)
    .single()
  if (!convo) return new Response('Không tìm thấy cuộc trò chuyện', { status: 404 })

  // Quota + lock enforcement.
  const { data: profile } = await supabase
    .from('profiles')
    .select('used_chats, max_chats, is_locked')
    .eq('id', user.id)
    .single()

  if (!profile) return new Response('Không tìm thấy hồ sơ', { status: 403 })
  if (profile.is_locked)
    return new Response('Tài khoản đã bị khóa.', { status: 403 })
  if (profile.used_chats >= profile.max_chats)
    return new Response('Bạn đã dùng hết lượt chat khả dụng.', { status: 402 })

  const lastUser = messages[messages.length - 1]
  const userText = lastUser ? textOf(lastUser) : ''

  // Persist the user's message right away.
  await supabase.from('messages').insert({
    conversation_id: conversationId,
    role: 'user',
    content: userText,
  })

  // Auto-title the conversation from the first message.
  if (convo.title === 'Cuộc trò chuyện mới' && userText) {
    await supabase
      .from('conversations')
      .update({ title: userText.slice(0, 60), updated_at: new Date().toISOString() })
      .eq('id', conversationId)
  } else {
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)
  }

  const result = streamText({
    model: MODEL,
    system: SYSTEM_PROMPT,
    messages: convertToModelMessages(messages),
    onFinish: async ({ text }) => {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: text,
      })
      // Count one successful exchange against the quota.
      await supabase.rpc('increment_used_chats', { p_user_id: user.id })
    },
  })

  return result.toUIMessageStreamResponse()
}
