import { LoginForm } from '@/components/auth/login-form'
import { Sparkles } from 'lucide-react'

export default function LoginPage() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 size-[32rem] rounded-full bg-chart-2/10 blur-[120px]"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Sparkles className="size-6" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Nova AI</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Đăng nhập để tiếp tục trò chuyện với trợ lý AI
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Tài khoản được cấp bởi quản trị viên. Không hỗ trợ tự đăng ký.
        </p>
      </div>
    </main>
  )
}
