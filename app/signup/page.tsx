'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert('Lỗi đăng ký: ' + error.message)
    } else {
      alert('Đăng ký thành công! Hãy vào Supabase đổi role thành admin nhé.')
      window.location.href = '/'
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
      <form onSubmit={handleSignUp} className="p-8 bg-gray-900 rounded-xl border border-gray-800 w-96 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">Đăng Ký Tài Khoản</h2>
        
        <label className="block mb-2 text-sm text-gray-300">Email của bạn</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
          placeholder="name@example.com"
          required
        />

        <label className="block mb-2 text-sm text-gray-300">Mật khẩu</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
          placeholder="••••••••"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 p-3 rounded-lg font-bold hover:bg-blue-500 transition duration-200"
        >
          {loading ? 'Đang xử lý...' : 'Đăng Ký Ngay'}
        </button>
      </form>
    </div>
  )
}
