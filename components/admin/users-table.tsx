'use client'

import { useActionState } from 'react'
import {
  resetPassword,
  toggleLock,
  updateChatCredits,
  type AdminActionState,
} from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, Lock, LockOpen, TriangleAlert } from 'lucide-react'

export type AdminUser = {
  id: string
  email: string
  role: string
  used_chats: number
  max_chats: number
  is_locked: boolean
}

function ActionBanner({ state }: { state: AdminActionState }) {
  if (!state?.error && !state?.success) return null
  if (state.error) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        <span>{state.error}</span>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-2 rounded-lg border border-chart-3/30 bg-chart-3/10 px-3 py-2 text-sm text-chart-3">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      <span>{state.success}</span>
    </div>
  )
}

function UserRow({ user, currentUserId }: { user: AdminUser; currentUserId: string }) {
  const [resetState, resetAction, resetPending] = useActionState<AdminActionState, FormData>(
    resetPassword,
    null,
  )
  const [creditState, creditAction, creditPending] = useActionState<AdminActionState, FormData>(
    updateChatCredits,
    null,
  )
  const [lockState, lockAction, lockPending] = useActionState<AdminActionState, FormData>(
    toggleLock,
    null,
  )

  const isSelf = user.id === currentUserId

  return (
    <tr className="border-t border-border/60 align-top">
      <td className="px-4 py-3">
        <p className="truncate text-sm font-medium">{user.email}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
          {isSelf ? ' · bạn' : ''}
        </p>
        <div className="mt-2 space-y-1">
          <ActionBanner state={resetState} />
          <ActionBanner state={creditState} />
          <ActionBanner state={lockState} />
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={
            user.is_locked
              ? 'inline-flex rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive'
              : 'inline-flex rounded-full bg-chart-3/15 px-2 py-0.5 text-xs font-medium text-chart-3'
          }
        >
          {user.is_locked ? 'Đã khóa' : 'Hoạt động'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm tabular-nums text-muted-foreground">
        {user.used_chats}/{user.max_chats}
      </td>
      <td className="px-4 py-3">
        <form action={creditAction} className="flex items-center gap-2">
          <input type="hidden" name="user_id" value={user.id} />
          <input
            name="max_chats"
            type="number"
            min={0}
            defaultValue={user.max_chats}
            aria-label={`Lượt chat của ${user.email}`}
            className="h-8 w-20 rounded-lg border border-input bg-background/60 px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          <Button type="submit" size="sm" variant="outline" disabled={creditPending}>
            {creditPending && <Loader2 className="size-3.5 animate-spin" />}
            Lưu
          </Button>
        </form>
      </td>
      <td className="px-4 py-3">
        <form action={resetAction} className="flex items-center gap-2">
          <input type="hidden" name="user_id" value={user.id} />
          <input
            name="password"
            type="password"
            minLength={6}
            required
            placeholder="Mật khẩu mới"
            autoComplete="new-password"
            aria-label={`Mật khẩu mới cho ${user.email}`}
            className="h-8 w-36 rounded-lg border border-input bg-background/60 px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          <Button type="submit" size="sm" variant="secondary" disabled={resetPending}>
            {resetPending && <Loader2 className="size-3.5 animate-spin" />}
            Reset
          </Button>
        </form>
      </td>
      <td className="px-4 py-3">
        <form action={lockAction}>
          <input type="hidden" name="user_id" value={user.id} />
          <input type="hidden" name="is_locked" value={user.is_locked ? 'false' : 'true'} />
          <Button
            type="submit"
            size="sm"
            variant={user.is_locked ? 'outline' : 'destructive'}
            disabled={lockPending || isSelf}
            className="gap-1.5"
          >
            {lockPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : user.is_locked ? (
              <LockOpen className="size-3.5" />
            ) : (
              <Lock className="size-3.5" />
            )}
            {user.is_locked ? 'Mở khóa' : 'Khóa'}
          </Button>
        </form>
      </td>
    </tr>
  )
}

export function UsersTable({
  users,
  currentUserId,
}: {
  users: AdminUser[]
  currentUserId: string
}) {
  if (users.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-muted-foreground">
        Chưa có người dùng nào.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[52rem] text-left">
        <thead>
          <tr className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3">Người dùng</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Đã dùng</th>
            <th className="px-4 py-3">Lượt chat</th>
            <th className="px-4 py-3">Đặt lại mật khẩu</th>
            <th className="px-4 py-3">Tài khoản</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow key={user.id} user={user} currentUserId={currentUserId} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
