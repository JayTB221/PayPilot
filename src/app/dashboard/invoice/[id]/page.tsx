import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { logOut } from '@/app/actions/auth'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { InvoiceActions } from '@/components/dashboard/InvoiceActions'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { AriaAvatar } from '@/components/AriaAvatar'
import { formatCurrency, formatDate, calcDaysOverdue } from '@/lib/utils'
import type { Invoice, ChaseLog } from '@/lib/types'
import Link from 'next/link'

function getConfidence(daysOverdue: number, timesChased: number) {
  if (daysOverdue > 45 || timesChased >= 5) {
    return { label: 'Escalate', cls: 'bg-red-100 text-red-700 border border-red-200' }
  }
  if (daysOverdue > 14 || timesChased >= 3) {
    return { label: 'At risk', cls: 'bg-amber-100 text-amber-700 border border-amber-200' }
  }
  return { label: 'High chance', cls: 'bg-green-100 text-green-700 border border-green-200' }
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: invoiceRow } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', user.id)
    .single()

  if (!invoiceRow) notFound()

  const invoice = invoiceRow as Invoice

  const { data: logs } = await supabase
    .from('chase_log')
    .select('*')
    .eq('invoice_id', id)
    .order('sent_at', { ascending: false })

  const chaseLogs = (logs ?? []) as ChaseLog[]
  const daysOverdue = calcDaysOverdue(invoice.due_date)
  const confidence = invoice.status !== 'paid' && invoice.status !== 'written_off'
    ? getConfidence(daysOverdue, invoice.times_chased)
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</Link>
            <span className="text-xl font-bold text-gray-900">
              Pay<span className="text-blue-600">Pilot</span>
            </span>
          </div>
          <form action={logOut}>
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">Log out</button>
          </form>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {invoice.invoice_number ?? `Invoice ${id.slice(0, 8)}`}
              </h1>
              <StatusBadge status={invoice.status} />
              {confidence && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${confidence.cls}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                  {confidence.label}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {invoice.debtor_name}
              {invoice.debtor_company ? ` · ${invoice.debtor_company}` : ''}
            </p>
          </div>
          <InvoiceActions invoiceId={id} status={invoice.status} />
        </div>

        {/* Details card */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Invoice details</h2>
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <dt className="text-gray-400">Amount owed</dt>
              <dd className="mt-0.5 text-xl font-bold text-gray-900">
                {formatCurrency(invoice.amount_owed)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Days overdue</dt>
              <dd className={`mt-0.5 text-xl font-bold
                ${daysOverdue > 45 ? 'text-red-600' : daysOverdue > 21 ? 'text-orange-500' : daysOverdue > 7 ? 'text-yellow-600' : 'text-gray-900'}`}>
                {daysOverdue} days
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Due date</dt>
              <dd className="mt-0.5 font-medium text-gray-900">{formatDate(invoice.due_date)}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Times chased by Aria</dt>
              <dd className="mt-0.5 font-medium text-gray-900">{invoice.times_chased}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Email</dt>
              <dd className="mt-0.5 font-medium text-gray-900">
                <a href={`mailto:${invoice.debtor_email}`} className="text-blue-600 hover:underline">
                  {invoice.debtor_email}
                </a>
              </dd>
            </div>
            {invoice.debtor_phone && (
              <div>
                <dt className="text-gray-400">Phone</dt>
                <dd className="mt-0.5 font-medium text-gray-900">{invoice.debtor_phone}</dd>
              </div>
            )}
            {invoice.last_chased_at && (
              <div>
                <dt className="text-gray-400">Last chased by Aria</dt>
                <dd className="mt-0.5 font-medium text-gray-900">{formatDate(invoice.last_chased_at)}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-400">Invoice created</dt>
              <dd className="mt-0.5 font-medium text-gray-900">{formatDate(invoice.created_at)}</dd>
            </div>
          </dl>
        </div>

        {/* Activity Feed */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <AriaAvatar size="sm" />
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Aria&apos;s activity
              </h2>
              {chaseLogs.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">{chaseLogs.length} action{chaseLogs.length !== 1 ? 's' : ''} taken</p>
              )}
            </div>
          </div>
          <ActivityFeed logs={chaseLogs} debtorName={invoice.debtor_name} />
        </div>
      </main>
    </div>
  )
}
