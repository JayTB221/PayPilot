'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import Link from 'next/link'

function XeroCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const xero = searchParams.get('xero')

  // This page is only shown if the callback somehow lands here.
  // The actual OAuth callback is handled server-side at /api/xero/callback
  // which redirects to /dashboard?xero=connected|error.
  // This page handles the dashboard redirect case.
  useEffect(() => {
    if (xero === 'connected' || xero === 'error') {
      router.replace(`/dashboard?xero=${xero}`)
    }
  }, [xero, router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="text-3xl font-bold text-gray-900">
          Pay<span className="text-blue-600">Pilot</span>
        </Link>

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {!xero && (
            <>
              <div className="flex justify-center mb-4">
                <svg className="h-8 w-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Connecting your Xero account…</p>
              <p className="mt-1 text-sm text-gray-400">This will only take a moment.</p>
            </>
          )}
          {xero === 'connected' && (
            <>
              <div className="text-4xl mb-3">✅</div>
              <p className="font-semibold text-gray-900">Xero connected!</p>
              <p className="text-sm text-gray-500 mt-1">Redirecting to dashboard…</p>
            </>
          )}
          {xero === 'error' && (
            <>
              <div className="text-4xl mb-3">❌</div>
              <p className="font-semibold text-gray-900">Connection failed</p>
              <p className="text-sm text-gray-500 mt-1">
                Something went wrong. Please try again from the dashboard.
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-block text-sm text-blue-600 hover:underline"
              >
                Back to dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default function XeroCallbackPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Processing…</p>
      </main>
    }>
      <XeroCallbackContent />
    </Suspense>
  )
}
