'use client'

import { useState } from 'react'

interface Props {
  isXeroConnected: boolean
  hasInvoices: boolean
}

export function OnboardingModal({ isXeroConnected, hasInvoices }: Props) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || (isXeroConnected && hasInvoices)) return null

  const step = !isXeroConnected ? 1 : !hasInvoices ? 2 : 3

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-8 shadow-2xl">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-lg leading-none"
          aria-label="Dismiss"
        >
          ✕
        </button>

        {/* Step progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-blue-500' : 'bg-white/10'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="text-4xl mb-4">🔗</div>
            <h2 className="text-xl font-bold text-white mb-2">Connect your Xero account</h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              PayPilot syncs your overdue invoices directly from Xero — no manual entry needed. Connect once and we handle the rest.
            </p>
            <a
              href="/api/xero/auth"
              className="block w-full rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
            >
              Connect Xero →
            </a>
            <p className="mt-4 text-center text-xs text-gray-600">
              Don&apos;t use Xero?{' '}
              <button onClick={() => setDismissed(true)} className="underline hover:text-gray-400 transition-colors">
                Skip — I&apos;ll upload a CSV
              </button>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-4xl mb-4">📥</div>
            <h2 className="text-xl font-bold text-white mb-2">Xero connected!</h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              We&apos;re importing your overdue invoices now. This usually takes under a minute.
            </p>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
              <div className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <span className="text-sm text-gray-300">Importing invoices from Xero…</span>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="mt-4 block w-full text-center text-sm text-gray-600 hover:text-gray-400 transition-colors"
            >
              Continue to dashboard
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-xl font-bold text-white mb-2">You&apos;re all set!</h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              PayPilot is chasing your overdue invoices. Check back soon — you&apos;ll start seeing recoveries appear in your dashboard.
            </p>
            <button
              onClick={() => setDismissed(true)}
              className="block w-full rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white hover:bg-blue-500 transition-all"
            >
              Go to dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}
