'use client'

import { useState } from 'react'
import { AriaAvatar } from '@/components/AriaAvatar'
import { OnboardingChecklist } from '@/components/OnboardingChecklist'
import { CsvUploadModal } from '@/components/dashboard/CsvUploadModal'

interface Props {
  ownerName: string | null
  isXeroConnected: boolean
  hasInvoices: boolean
  hasSettings: boolean
  onboardingCompleted: boolean
}

export function WelcomeState({
  ownerName,
  isXeroConnected,
  hasInvoices,
  hasSettings,
  onboardingCompleted,
}: Props) {
  const [showCsv, setShowCsv] = useState(false)
  const firstName = ownerName?.split(' ')[0] ?? 'there'

  return (
    <div className="space-y-6">
      {/* Welcome hero card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-8 py-12 flex flex-col items-center text-center">
        {/* Oversized Aria avatar */}
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 ring-4 ring-purple-500/15">
          <span className="text-3xl font-bold text-white">A</span>
        </div>

        <h2 className="mt-5 text-2xl font-bold text-gray-900">
          Welcome to Aria, {firstName}
        </h2>
        <p className="mt-2 text-gray-500 max-w-md leading-relaxed">
          Your 14-day free trial has started. Connect Xero or upload your invoices
          and Aria will start chasing tonight.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
          <a
            href="/api/xero/auth"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            Connect Xero
          </a>
          <button
            onClick={() => setShowCsv(true)}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-7 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Upload invoices manually
          </button>
        </div>
      </div>

      {/* Onboarding checklist */}
      <OnboardingChecklist
        hasXero={isXeroConnected}
        hasInvoices={hasInvoices}
        hasSettings={hasSettings}
        onboardingCompleted={onboardingCompleted}
      />

      {showCsv && <CsvUploadModal onClose={() => setShowCsv(false)} />}
    </div>
  )
}
