'use client'

import { useState } from 'react'
import { AriaAvatar } from '@/components/AriaAvatar'

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

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-purple-500' : 'bg-white/10'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="flex items-center gap-3 mb-5">
              <AriaAvatar size="lg" />
              <div>
                <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest">Meet your agent</p>
                <h2 className="text-xl font-bold text-white">Hi, I&apos;m Aria.</h2>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              I&apos;m your AI invoice recovery agent. Once you connect Xero, I&apos;ll pull in your overdue invoices and start sending personalised follow-ups — automatically, every morning.
            </p>
            <a
              href="/api/xero/auth"
              className="block w-full rounded-xl bg-purple-600 py-3 text-center text-sm font-semibold text-white hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20"
            >
              Connect Xero so I can get started →
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
            <div className="flex items-center gap-3 mb-5">
              <AriaAvatar size="lg" />
              <div>
                <h2 className="text-xl font-bold text-white">Xero connected!</h2>
                <p className="text-xs text-purple-400 mt-0.5">Aria is checking your account</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              I&apos;m importing your overdue invoices now. This usually takes under a minute — I&apos;ll have everything ready for my first run tonight.
            </p>
            <div className="rounded-xl bg-white/5 border border-purple-500/20 p-4 flex items-center gap-3">
              <AriaAvatar size="xs" />
              <span className="text-sm text-gray-300">Aria is checking Xero for overdue invoices…</span>
              <svg className="h-4 w-4 animate-spin text-purple-400 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
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
            <div className="flex items-center gap-3 mb-5">
              <AriaAvatar size="lg" />
              <div>
                <h2 className="text-xl font-bold text-white">I&apos;m ready.</h2>
                <p className="text-xs text-purple-400 mt-0.5">Aria is active</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              I&apos;ll start chasing your overdue invoices tonight. You&apos;ll receive a morning briefing from me after my first run — check back tomorrow.
            </p>
            <button
              onClick={() => setDismissed(true)}
              className="block w-full rounded-xl bg-purple-600 py-3 text-center text-sm font-semibold text-white hover:bg-purple-500 transition-all"
            >
              Let&apos;s go →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
