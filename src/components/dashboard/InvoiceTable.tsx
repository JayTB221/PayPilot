'use client'

import Link from 'next/link'
import { useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'
import type { Invoice, InvoiceStatus } from '@/lib/types'

const FILTERS: { label: string; value: InvoiceStatus | 'all' }[] = [
  { label: 'All',       value: 'all' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Escalated', value: 'escalated' },
  { label: 'Paid',      value: 'paid' },
]

function overdueCls(d: number) {
  if (d > 45) return 'text-red-600'
  if (d > 21) return 'text-orange-500'
  if (d > 7)  return 'text-yellow-600'
  return 'text-gray-700'
}

interface Confidence { label: string; cls: string }

function getConfidence(daysOverdue: number, timesChased: number, status: InvoiceStatus): Confidence | null {
  if (status === 'paid' || status === 'written_off') return null
  if (status === 'escalated' || daysOverdue > 45 || timesChased >= 5) {
    return { label: 'Escalate', cls: 'bg-red-100 text-red-700 border border-red-200' }
  }
  if (daysOverdue > 14 || timesChased >= 3) {
    return { label: 'At risk', cls: 'bg-amber-100 text-amber-700 border border-amber-200' }
  }
  return { label: 'High chance', cls: 'bg-green-100 text-green-700 border border-green-200' }
}

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all')

  const filtered = filter === 'all' ? invoices : invoices.filter(inv => inv.status === filter)

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Filter bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
              <th className="px-4 py-3">Debtor</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Overdue</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aria&apos;s view</th>
              <th className="px-4 py-3">Last chased</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">No invoices found</td>
              </tr>
            ) : (
              filtered.map(inv => {
                const confidence = getConfidence(inv.days_overdue, inv.times_chased, inv.status)
                return (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{inv.debtor_name}</p>
                      {inv.debtor_company && (
                        <p className="text-xs text-gray-400 mt-0.5">{inv.debtor_company}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(inv.amount_owed, inv.currency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${overdueCls(inv.days_overdue)}`}>{inv.days_overdue}d</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                    <td className="px-4 py-3">
                      {confidence ? (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${confidence.cls}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                          {confidence.label}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {inv.last_chased_at ? formatDate(inv.last_chased_at) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/invoice/${inv.id}`} className="text-blue-600 hover:underline text-xs font-medium">
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <p className="px-4 py-12 text-center text-gray-400 text-sm">No invoices found</p>
        ) : (
          filtered.map(inv => {
            const confidence = getConfidence(inv.days_overdue, inv.times_chased, inv.status)
            return (
              <Link
                key={inv.id}
                href={`/dashboard/invoice/${inv.id}`}
                className="block px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-sm truncate">{inv.debtor_name}</p>
                    {inv.debtor_company && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{inv.debtor_company}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <StatusBadge status={inv.status} />
                      <span className={`text-xs font-medium ${overdueCls(inv.days_overdue)}`}>
                        {inv.days_overdue}d overdue
                      </span>
                      {confidence && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${confidence.cls}`}>
                          {confidence.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 text-sm">
                      {formatCurrency(inv.amount_owed, inv.currency)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {inv.last_chased_at ? formatDate(inv.last_chased_at) : 'Not chased'}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">View →</p>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
