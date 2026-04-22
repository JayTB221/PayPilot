'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AriaAvatar } from '@/components/AriaAvatar'
import type { InvoiceStatus } from '@/lib/types'

interface Props {
  invoiceId: string
  status: InvoiceStatus
}

const ARIA_STATES: Record<string, string> = {
  'chase-now':        'Aria is writing a follow-up…',
  'mark-paid':        'Aria is updating the record…',
  'mark-written-off': 'Aria is archiving this invoice…',
}

export function InvoiceActions({ invoiceId, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function callAction(action: string) {
    setLoading(action)
    setError('')
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/${action}`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong')
      } else {
        router.refresh()
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(null)
    }
  }

  const isTerminal = status === 'paid' || status === 'written_off'

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Aria loading state */}
      {loading && (
        <div className="flex items-center gap-2 rounded-xl border border-purple-100 bg-purple-50 px-4 py-2">
          <AriaAvatar size="xs" />
          <span className="text-xs text-purple-700 font-medium">{ARIA_STATES[loading]}</span>
          <svg className="h-3.5 w-3.5 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 text-right">{error}</p>
      )}

      <div className="flex gap-2 flex-wrap justify-end">
        {!isTerminal && (
          <>
            <button
              onClick={() => callAction('chase-now')}
              disabled={!!loading}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white
                         hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Ask Aria to chase
            </button>
            <button
              onClick={() => callAction('mark-paid')}
              disabled={!!loading}
              className="rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-semibold
                         text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Mark as paid
            </button>
            <button
              onClick={() => callAction('mark-written-off')}
              disabled={!!loading}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500
                         hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Write off
            </button>
          </>
        )}
        {isTerminal && (
          <p className="text-sm text-gray-400 italic">
            {status === 'paid' ? 'Aria has marked this invoice as paid.' : 'This invoice has been written off.'}
          </p>
        )}
      </div>
    </div>
  )
}
