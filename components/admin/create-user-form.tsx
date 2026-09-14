'use client'

import { useActionState } from 'react'
import { createUser, type AdminActionState } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, TriangleAlert, UserPlus } from 'lucide-react'

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(
    createUser,
    null,
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="off"
            placeholder="user@congty.com"
            className="h-10 rounded-lg border border-input bg-background/60 px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Mật khẩu
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Tối thiểu 6 ký tự"
            className="h-10 rounded-lg border border-input bg-background/60 px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="max_chats" className="text-sm font-medium">
            Lượt chat
          </label>
          <input
            id="max_chats"
            name="max_chats"
            type="number"
            required
            min={0}
            defaultValue={20}
            className="h-10 rounded-lg border border-input bg-background/60 px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>
      </div>

      {state?.error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      {state?.success && (
        <div className="flex items-start gap-2 rounded-lg border border-chart-3/30 bg-chart-3/10 px-3 py-2 text-sm text-chart-3">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <span>{state.success}</span>
        </div>
      )}

      <Button type="submit" className="w-fit gap-2" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        {pending ? 'Đang tạo...' : 'Tạo tài khoản'}
      </Button>
    </form>
  )
}
