import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TriangleAlert } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <TriangleAlert className="size-6" />
        </div>
        <h1 className="text-lg font-semibold">Đã xảy ra lỗi xác thực</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Liên kết đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng thử đăng
          nhập lại.
        </p>
        <Button className="mt-6 w-full" size="lg" render={<Link href="/auth/login" />}>
          Quay lại đăng nhập
        </Button>
      </div>
    </main>
  )
}
