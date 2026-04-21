'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  hasXero: boolean
  hasInvoices: boolean
  hasSettings: boolean
  onboardingCompleted: boolean
}

const steps = [
  {
    id: 1,
    title: 'Connect your Xero account',
    description: 'Sync overdue invoices automatically — no manual entry.',
    action: <a href="/api/xero/auth" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors">Connect Xero →</a>,
  },
  {
    id: 2,
    title: 'Import your first invoices',
    description: 'Upload a CSV or let Xero sync pull them in automatically.',
    action: null,
  },
  {
    id: 3,
    title: 'Set your chase preferences',
    description: 'Choose when to start chasing and how firm to be.',
    action: <Link href="/dashboard/settings" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Open settings →</Link>,
  },
  {
    id: 4,
    title: 'Your agent starts tonight',
    description: 'PayPilot runs every morning and chases invoices automatically.',
    action: null,
  },
]

async function markOnboardingComplete() {
  await fetch('/api/onboarding/complete', { method: 'POST' })
}

export function OnboardingChecklist({ hasXero, hasInvoices, hasSettings, onboardingCompleted }: Props) {
  const [dismissed, setDismissed] = useState(onboardingCompleted)

  const completed = [hasXero, hasInvoices, hasSettings, hasXero && hasInvoices && hasSettings]
  const allDone = completed.every(Boolean)
  const doneCount = completed.filter(Boolean).length

  if (dismissed) return null

  async function handleDismiss() {
    await markOnboardingComplete()
    setDismissed(true)
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            {allDone ? '🎉' : '🚀'} Get started with PayPilot
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {doneCount} of {steps.length} steps complete
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
          title="Dismiss"
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-gray-200 mb-6 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-700"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>

      <div className="space-y-4">
        {steps.map((step, i) => {
          const done = completed[i]
          return (
            <div key={step.id} className={`flex items-start gap-4 rounded-xl p-4 transition-all ${done ? 'bg-green-50 border border-green-100' : 'bg-white border border-gray-100'}`}>
              <div className={`mt-0.5 flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                done
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {done ? '✓' : step.id}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${done ? 'text-green-800 line-through decoration-green-400' : 'text-gray-900'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.description}</p>
                {!done && step.action && (
                  <div className="mt-2">{step.action}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {allDone && (
        <div className="mt-5 rounded-xl bg-green-500 px-5 py-3 text-center">
          <p className="text-sm font-semibold text-white">🎉 You&apos;re all set! PayPilot is now running on autopilot.</p>
          <button onClick={handleDismiss} className="mt-1 text-xs text-green-100 hover:text-white transition-colors underline">
            Dismiss this checklist
          </button>
        </div>
      )}
    </div>
  )
}
