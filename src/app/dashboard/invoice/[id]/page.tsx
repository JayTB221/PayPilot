import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { logOut } from '@/app/actions/auth'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { InvoiceActions } from '@/components/dashboard/InvoiceActions'
import { formatCurrency, formatDate, calcDaysOverdue } from '@/lib/utils'
import type { Invoice, ChaseLog } from '@/lib/types'
import Link from 'next/link'

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
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

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {invoice.invoice_number ?? `Invoice ${id.slice(0, 8)}`}
              </h1>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {invoice.debtor_name}
              {invoice.debtor_company ? ` · ${invoice.debtor_company}` : ''}
            </p>
          </div>
          {/* Action buttons — client component */}
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
              <dt className="text-gray-400">Times chased</dt>
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
                <dt className="text-gray-400">Last chased</dt>
                <dd className="mt-0.5 font-medium text-gray-900">{formatDate(invoice.last_chased_at)}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-400">Invoice created</dt>
              <dd className="mt-0.5 font-medium text-gray-900">{formatDate(invoice.created_at)}</dd>
            </div>
          </dl>
        </div>

        {/* Chase history timeline */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Chase history
            {chaseLogs.length > 0 && (
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-500">
                {chaseLogs.length}
              </span>
            )}
          </h2>

          {chaseLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No chase activity yet.</p>
              <p className="text-gray-400 text-xs mt-1">
                Use &ldquo;Chase now&rdquo; to trigger the first follow-up.
              </p>
            </div>
          ) : (
            <ol className="relative border-l border-gray-200 space-y-6 ml-3">
              {chaseLogs.map(log => (
                <li key={log.id} className="ml-6">
                  <span className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white
                    ${log.delivery_status === 'failed' ? 'bg-red-400' : log.response_received ? 'bg-green-400' : 'bg-blue-400'}`}>
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                    <time className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(log.sent_at)}
                    </time>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium
                        ${log.channel === 'sms' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {log.channel.toUpperCase()}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium
                        ${log.delivery_status === 'failed' ? 'bg-red-100 text-red-700'
                          : log.delivery_status === 'delivered' ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'}`}>
                        {log.delivery_status}
                      </span>
                      {log.response_received && (
                        <span className="rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-medium text-green-700">
                          Response received
                        </span>
                      )}
                    </div>
                  </div>
                  {log.message_sent && (
                    <div className="mt-2 rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap">
                      {log.message_sent}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </main>
    </div>
  )
}
