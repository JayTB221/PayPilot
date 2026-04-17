'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { InvoiceStatus } from '@/lib/types'

interface Props {
  invoiceId: string
  status: InvoiceStatus
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
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <div className="flex gap-2 flex-wrap justify-end">
        {!isTerminal && (
          <>
            <button
              onClick={() => callAction('chase-now')}
              disabled={!!loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white
                         hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading === 'chase-now' ? 'Sending…' : 'Chase now'}
            </button>
            <button
              onClick={() => callAction('mark-paid')}
              disabled={!!loading}
              className="rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-semibold
                         text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading === 'mark-paid' ? 'Saving…' : 'Mark as paid'}
            </button>
            <button
              onClick={() => callAction('mark-written-off')}
              disabled={!!loading}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500
                         hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading === 'mark-written-off' ? 'Saving…' : 'Write off'}
            </button>
          </>
        )}
        {isTerminal && (
          <p className="text-sm text-gray-400 italic">
            {status === 'paid' ? 'This invoice has been paid.' : 'This invoice has been written off.'}
          </p>
        )}
      </div>
    </div>
  )
}
