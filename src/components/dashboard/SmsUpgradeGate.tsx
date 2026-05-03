'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { PlanTier } from '@/lib/types'

interface Props {
  planTier: PlanTier
  defaultChecked: boolean
}

export function SmsUpgradeGate({ planTier, defaultChecked }: Props) {
  const [showModal, setShowModal] = useState(false)

  if (planTier !== 'starter') {
    return (
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="sms_enabled"
          defaultChecked={defaultChecked}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Enable SMS follow-ups</span>
      </label>
    )
  }

  return (
    <>
      <label
        className="flex items-center gap-3 cursor-pointer"
        onClick={(e) => { e.preventDefault(); setShowModal(true) }}
      >
        <input
          type="checkbox"
          name="sms_enabled"
          defaultChecked={false}
          disabled
          className="h-4 w-4 rounded border-gray-300 text-gray-300 cursor-not-allowed"
          onClick={(e) => e.stopPropagation()}
        />
        <span className="text-sm text-gray-400">Enable SMS follow-ups</span>
        <span className="rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
          Professional+
        </span>
      </label>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Unlock SMS chasing</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              SMS chasing is available on <strong>Professional and above</strong>. Clients who ignore emails often respond to SMS — upgrade to unlock SMS and recover more invoices.
            </p>
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 mb-6">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Professional plan includes</p>
              <ul className="text-sm text-blue-900 space-y-1 mt-2">
                <li>✓ Email + SMS chasing</li>
                <li>✓ Up to 200 invoices/month</li>
                <li>✓ Payment links in every email</li>
                <li>✓ Custom email signature</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Link
                href="/subscribe"
                className="flex-1 rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Upgrade to Professional →
              </Link>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
