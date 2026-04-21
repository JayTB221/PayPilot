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

      {/* Desktop table — hidden on mobile */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
              <th className="px-4 py-3">Debtor</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Days Overdue</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Chased</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">No invoices found</td>
              </tr>
            ) : (
              filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{inv.debtor_name}</td>
                  <td className="px-4 py-3 text-gray-500">{inv.debtor_company ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatCurrency(inv.amount_owed, inv.currency)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${overdueCls(inv.days_overdue)}`}>{inv.days_overdue}d</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3 text-gray-500">
                    {inv.last_chased_at ? formatDate(inv.last_chased_at) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/invoice/${inv.id}`} className="text-blue-600 hover:underline text-xs font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards — shown on small screens */}
      <div className="sm:hidden divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <p className="px-4 py-12 text-center text-gray-400 text-sm">No invoices found</p>
        ) : (
          filtered.map(inv => (
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
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={inv.status} />
                    <span className={`text-xs font-medium ${overdueCls(inv.days_overdue)}`}>
                      {inv.days_overdue}d overdue
                    </span>
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
          ))
        )}
      </div>
    </div>
  )
}
