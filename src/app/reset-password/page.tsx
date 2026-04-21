'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) { setReady(true); return }

    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(() => setReady(true))
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/login?message=Password+updated+successfully'), 2000)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-gray-900">
            Pay<span className="text-blue-600">Pilot</span>
          </Link>
          <p className="mt-2 text-gray-500 text-sm">Set a new password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {done ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 border border-green-100 text-3xl">
                ✅
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Password updated</h1>
              <p className="text-sm text-gray-500">Redirecting you to log in…</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-gray-900 mb-6">Choose a new password</h1>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    New password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    required
                    placeholder="Same password again"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !ready}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold
                             text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-400">Loading…</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
