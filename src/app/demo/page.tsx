import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

const DEMO_INVOICES = [
  {
    id: 'd1', debtor_name: 'Sarah Mitchell', debtor_company: 'Mitchell Design Co',
    invoice_number: 'INV-1042', amount_owed: 3200, currency: 'USD',
    due_date: '2026-03-01', days_overdue: 47, status: 'escalated',
    last_chased_at: '2026-04-10T09:00:00Z', times_chased: 5,
  },
  {
    id: 'd2', debtor_name: 'James Thornton', debtor_company: 'Thornton Builders LLC',
    invoice_number: 'INV-1038', amount_owed: 8750, currency: 'USD',
    due_date: '2026-03-15', days_overdue: 33, status: 'contacted',
    last_chased_at: '2026-04-12T10:30:00Z', times_chased: 3,
  },
  {
    id: 'd3', debtor_name: 'Aria Nguyen', debtor_company: null,
    invoice_number: 'INV-1051', amount_owed: 1500, currency: 'USD',
    due_date: '2026-04-05', days_overdue: 12, status: 'contacted',
    last_chased_at: '2026-04-15T08:00:00Z', times_chased: 1,
  },
  {
    id: 'd4', debtor_name: 'Chen Industries', debtor_company: 'Chen Industries Inc',
    invoice_number: 'INV-1029', amount_owed: 12400, currency: 'USD',
    due_date: '2026-04-10', days_overdue: 7, status: 'pending',
    last_chased_at: null, times_chased: 0,
  },
  {
    id: 'd5', debtor_name: 'Pacific Events Co', debtor_company: 'Pacific Events Group',
    invoice_number: 'INV-1019', amount_owed: 5600, currency: 'USD',
    due_date: '2026-02-20', days_overdue: 56, status: 'paid',
    last_chased_at: '2026-03-15T14:00:00Z', times_chased: 4,
  },
]

const DEMO_CHASE_EMAILS = [
  {
    debtor: 'Sarah Mitchell',
    invoice: 'INV-1042',
    subject: 'Following up on invoice INV-1042 — $3,200 overdue',
    preview: 'Hi Sarah, I hope you\'re doing well. I\'m reaching out regarding invoice INV-1042 for $3,200 which was due on March 1st. I wanted to follow up as it\'s now 47 days overdue...',
    tone: 'Firm',
    sentAt: 'Apr 10 · 9:00am',
  },
  {
    debtor: 'James Thornton',
    invoice: 'INV-1038',
    subject: 'Friendly reminder — invoice INV-1038 outstanding',
    preview: 'Hi James, just a quick reminder that invoice INV-1038 for $8,750 is now 33 days past due. We\'d really appreciate if you could arrange payment at your earliest convenience...',
    tone: 'Friendly',
    sentAt: 'Apr 12 · 10:30am',
  },
]

const STATUS_STYLES: Record<string, string> = {
  escalated: 'bg-red-100 text-red-700',
  contacted: 'bg-blue-100 text-blue-700',
  pending:   'bg-gray-100 text-gray-600',
  paid:      'bg-green-100 text-green-700',
}

const totalOutstanding = DEMO_INVOICES
  .filter(i => i.status !== 'paid')
  .reduce((s, i) => s + i.amount_owed, 0)

const totalRecovered = DEMO_INVOICES
  .filter(i => i.status === 'paid')
  .reduce((s, i) => s + i.amount_owed, 0)

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-center">
        <p className="text-sm font-medium text-white">
          👋 This is a live demo — no login required.{' '}
          <Link href="/signup" className="underline font-semibold hover:no-underline">
            Start your free trial →
          </Link>
        </p>
      </div>

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <Link href="/" className="text-xl font-bold text-gray-900 flex-shrink-0">
              Pay<span className="text-blue-600">Pilot</span>
            </Link>
            <span className="hidden sm:inline text-sm text-gray-400">Demo Account</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 flex-shrink-0">
              Read-only demo
            </span>
          </div>
          <Link
            href="/signup"
            className="flex-shrink-0 rounded-lg bg-blue-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            Start free trial
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Hi Alex — here&apos;s what&apos;s outstanding</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Invoices Being Chased', value: '4' },
            { label: 'Total Outstanding',     value: formatCurrency(totalOutstanding) },
            { label: 'Recovered This Month',  value: formatCurrency(totalRecovered) },
            { label: 'Recovery Rate',         value: '20%' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 sm:px-6 py-4 sm:py-5">
              <p className="text-xs sm:text-sm text-gray-500">{s.label}</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Invoice table */}
          <div className="lg:col-span-2">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Invoices</h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                      <th className="px-4 py-3">Debtor</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-right">Overdue</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {DEMO_INVOICES.map(inv => (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{inv.debtor_name}</p>
                          {inv.debtor_company && <p className="text-xs text-gray-400">{inv.debtor_company}</p>}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(inv.amount_owed, inv.currency)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-medium text-sm ${
                            inv.days_overdue > 45 ? 'text-red-600' :
                            inv.days_overdue > 21 ? 'text-orange-500' :
                            inv.days_overdue > 7  ? 'text-yellow-600' : 'text-gray-500'
                          }`}>{inv.days_overdue}d</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gray-100">
                {DEMO_INVOICES.map(inv => (
                  <div key={inv.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm truncate">{inv.debtor_name}</p>
                        {inv.debtor_company && <p className="text-xs text-gray-400 truncate">{inv.debtor_company}</p>}
                        <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[inv.status] ?? ''}`}>{inv.status}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-900 text-sm">{formatCurrency(inv.amount_owed, inv.currency)}</p>
                        <p className="text-xs text-orange-500 mt-0.5">{inv.days_overdue}d overdue</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-400 text-center">
                  Actions disabled in demo — <Link href="/signup" className="text-blue-600 hover:underline">sign up to chase invoices</Link>
                </p>
              </div>
            </div>
          </div>

          {/* Chase email previews */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">AI Chase Emails</h2>
            <div className="space-y-3">
              {DEMO_CHASE_EMAILS.map((email, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900 truncate">To: {email.debtor}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{email.sentAt}</p>
                    </div>
                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${email.tone === 'Firm' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                      {email.tone}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-700 mb-1">{email.subject}</p>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{email.preview}</p>
                </div>
              ))}

              {/* Recovery timeline */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3">Recovery timeline</p>
                <div className="space-y-2">
                  {[
                    { label: 'Day 1 — Friendly email', done: true },
                    { label: 'Day 7 — Follow-up SMS', done: true },
                    { label: 'Day 21 — Firm reminder', done: true },
                    { label: 'Day 45 — Escalation flag', done: false },
                  ].map(step => (
                    <div key={step.label} className="flex items-center gap-2">
                      <div className={`flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold ${step.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        {step.done ? '✓' : '○'}
                      </div>
                      <p className={`text-xs ${step.done ? 'text-gray-700' : 'text-gray-400'}`}>{step.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/signup"
              className="mt-4 block w-full rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
            >
              Start recovering invoices →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
