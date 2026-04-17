'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { logOut } from '@/app/actions/auth'

function SubscribeContent() {
  const searchParams = useSearchParams()
  const isNew = searchParams.get('new') === '1'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCheckout() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Could not start checkout. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Network error — please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="text-3xl font-bold text-gray-900">
          Pay<span className="text-blue-600">Pilot</span>
        </Link>

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {isNew ? (
            <>
              <div className="text-4xl mb-4">🎉</div>
              <h1 className="text-xl font-semibold text-gray-900">Account created!</h1>
              <p className="mt-2 text-gray-500 text-sm">
                One last step — set up your subscription to start chasing invoices on autopilot.
              </p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">🔒</div>
              <h1 className="text-xl font-semibold text-gray-900">Subscription required</h1>
              <p className="mt-2 text-gray-500 text-sm">
                An active PayPilot subscription is needed to access the dashboard.
              </p>
            </>
          )}

          <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-5 text-left">
            <p className="text-sm font-semibold text-blue-900">PayPilot — $400 NZD/month</p>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>✓ Unlimited invoice chasing</li>
              <li>✓ AI-personalised emails &amp; SMS</li>
              <li>✓ Xero integration</li>
              <li>✓ Full chase history &amp; analytics</li>
            </ul>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold
                       text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Redirecting to Stripe…' : 'Start subscription — $400 NZD/mo'}
          </button>

          <form action={logOut} className="mt-4">
            <button
              type="submit"
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-gray-400">Loading…</p></div>}>
      <SubscribeContent />
    </Suspense>
  )
}
