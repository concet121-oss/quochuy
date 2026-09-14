import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MessageSquare, Shield, Sparkles } from 'lucide-react'
import { CreateUserForm } from '@/components/admin/create-user-form'
import { UsersTable } from '@/components/admin/users-table'
import { Button } from '@/components/ui/button'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: me } = await supabase
    .from('profiles')
    .select('email, role')
    .eq('id', user.id)
    .single()

  if (me?.role !== 'admin') redirect('/chat')

  const admin = createAdminClient()
  const { data: users, error } = await admin
    .from('profiles')
    .select('id, email, role, used_chats, max_chats, is_locked')
    .order('email', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border/60 bg-sidebar">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Nova AI</p>
              <p className="mt-1 text-xs text-muted-foreground">Trang quản trị</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/chat">
              <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
                <MessageSquare className="size-3.5" />
                Chat
              </Button>
            </Link>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm">
                Đăng xuất
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
            <Shield className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Quản lý người dùng</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Đăng nhập với {me?.email ?? user.email}. Chỉ quản trị viên mới truy cập được khu vực này.
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm">
          <h2 className="text-sm font-semibold">Tạo tài khoản mới</h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            Người dùng không tự đăng ký. Cấp email, mật khẩu và số lượt chat ban đầu.
          </p>
          <CreateUserForm />
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
          <div className="border-b border-border/60 px-6 py-4">
            <h2 className="text-sm font-semibold">Danh sách tài khoản</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {users?.length ?? 0} người dùng · reset mật khẩu, cập nhật lượt chat, khóa hoặc mở
              khóa.
            </p>
          </div>
          <UsersTable users={users ?? []} currentUserId={user.id} />
        </section>
      </main>
    </div>
  )
}
