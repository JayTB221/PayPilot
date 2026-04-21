import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { InvoiceTable } from '@/components/dashboard/InvoiceTable'
import { DashboardActions } from '@/components/dashboard/DashboardActions'
import { NotificationBell } from '@/components/dashboard/NotificationBell'
import { OnboardingModal } from '@/components/OnboardingModal'
import { OnboardingChecklist } from '@/components/OnboardingChecklist'
import { logOut } from '@/app/actions/auth'
import { PLAN_LIMITS } from '@/lib/utils'
import type { Invoice, DashboardStats, PlanTier } from '@/lib/types'
import Link from 'next/link'

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'mock-1', tenant_id: '', xero_invoice_id: null,
    debtor_name: 'Sarah Mitchell', debtor_company: 'Mitchell Design Co',
    debtor_email: 'sarah@mitchelldesign.com', debtor_phone: '+12025550001',
    invoice_number: 'INV-1042', amount_owed: 3200, currency: 'USD',
    due_date: '2026-03-01', days_overdue: 47, status: 'escalated',
    last_chased_at: '2026-04-10T09:00:00Z', times_chased: 5, created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'mock-2', tenant_id: '', xero_invoice_id: null,
    debtor_name: 'James Thornton', debtor_company: 'Thornton Builders LLC',
    debtor_email: 'james@thorntonbuilders.com', debtor_phone: null,
    invoice_number: 'INV-1038', amount_owed: 8750, currency: 'USD',
    due_date: '2026-03-15', days_overdue: 33, status: 'contacted',
    last_chased_at: '2026-04-12T10:30:00Z', times_chased: 3, created_at: '2026-03-15T00:00:00Z',
  },
  {
    id: 'mock-3', tenant_id: '', xero_invoice_id: null,
    debtor_name: 'Aria Nguyen', debtor_company: null,
    debtor_email: 'aria.nguyen@gmail.com', debtor_phone: '+12025550003',
    invoice_number: 'INV-1051', amount_owed: 1500, currency: 'USD',
    due_date: '2026-04-05', days_overdue: 12, status: 'contacted',
    last_chased_at: '2026-04-15T08:00:00Z', times_chased: 1, created_at: '2026-04-05T00:00:00Z',
  },
  {
    id: 'mock-4', tenant_id: '', xero_invoice_id: null,
    debtor_name: 'Chen Industries', debtor_company: 'Chen Industries Inc',
    debtor_email: 'accounts@chenindustries.com', debtor_phone: '+12025550004',
    invoice_number: 'INV-1029', amount_owed: 12400, currency: 'USD',
    due_date: '2026-04-10', days_overdue: 7, status: 'pending',
    last_chased_at: null, times_chased: 0, created_at: '2026-04-10T00:00:00Z',
  },
  {
    id: 'mock-5', tenant_id: '', xero_invoice_id: null,
    debtor_name: 'Pacific Events Co', debtor_company: 'Pacific Events Group',
    debtor_email: 'finance@pacificevents.com', debtor_phone: '+12025550005',
    invoice_number: 'INV-1019', amount_owed: 5600, currency: 'USD',
    due_date: '2026-02-20', days_overdue: 56, status: 'paid',
    last_chased_at: '2026-03-15T14:00:00Z', times_chased: 4, created_at: '2026-02-20T00:00:00Z',
  },
]

function calcStats(invoices: Invoice[]): DashboardStats {
  const active = invoices.filter(i => !['paid', 'written_off'].includes(i.status))
  const paid   = invoices.filter(i => i.status === 'paid')
  const totalOutstanding = active.reduce((sum, i) => sum + Number(i.amount_owed), 0)
  const totalRecoveredThisMonth = paid.reduce((sum, i) => sum + Number(i.amount_owed), 0)
  const recoveryRate = invoices.length > 0 ? (paid.length / invoices.length) * 100 : 0
  return { totalInvoices: active.length, totalOutstanding, totalRecoveredThisMonth, recoveryRate }
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('business_name, owner_name, xero_tenant_id, plan_tier, usage_this_month, onboarding_completed')
    .eq('id', user.id)
    .single()

  const { data: tenantSettings } = await supabase
    .from('tenant_settings')
    .select('id')
    .eq('tenant_id', user.id)
    .single()

  const { data: invoiceRows } = await supabase
    .from('invoices')
    .select('*')
    .eq('tenant_id', user.id)
    .order('days_overdue', { ascending: false })

  const invoices: Invoice[] = (invoiceRows ?? []).length > 0
    ? (invoiceRows as Invoice[])
    : MOCK_INVOICES

  const isMock = (invoiceRows ?? []).length === 0
  const isXeroConnected = !!tenant?.xero_tenant_id
  const stats = calcStats(invoices)
  const planTier = (tenant?.plan_tier ?? 'starter') as PlanTier
  const planLimits = PLAN_LIMITS[planTier]
  const usageThisMonth: number = tenant?.usage_this_month ?? 0
  const usagePct = planLimits.invoices === Infinity ? 0 : Math.min(100, (usageThisMonth / planLimits.invoices) * 100)
  const onboardingCompleted = tenant?.onboarding_completed ?? false
  const hasSettings = !!tenantSettings

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Onboarding modal for new users */}
      <OnboardingModal isXeroConnected={isXeroConnected} hasInvoices={!isMock} />

      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <span className="text-xl font-bold text-gray-900 flex-shrink-0">
              Pay<span className="text-blue-600">Pilot</span>
            </span>
            <span className="hidden sm:inline text-sm text-gray-400 truncate">
              {tenant?.business_name ?? 'Your Business'}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Plan usage — desktop only */}
            {planLimits.invoices !== Infinity ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${usagePct >= 90 ? 'bg-red-500' : usagePct >= 70 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {usageThisMonth}/{planLimits.invoices}
                </span>
              </div>
            ) : (
              <span className="hidden md:inline text-xs text-gray-400 capitalize">{planLimits.label}</span>
            )}
            <NotificationBell />
            <Link href="/dashboard/settings" className="hidden sm:inline text-sm text-gray-500 hover:text-gray-700">
              Settings
            </Link>
            <form action={logOut}>
              <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">
                Log out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Hi {tenant?.owner_name ?? 'there'} — here&apos;s what&apos;s outstanding
            </p>
          </div>

          {/* Client component handles modal state + Xero button */}
          <DashboardActions isXeroConnected={isXeroConnected} />
        </div>

        {/* Onboarding checklist for new users */}
        {!onboardingCompleted && (
          <OnboardingChecklist
            hasXero={isXeroConnected}
            hasInvoices={!isMock}
            hasSettings={hasSettings}
            onboardingCompleted={onboardingCompleted}
          />
        )}

        {isMock && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <strong>Demo data</strong> — these are sample invoices so you can see how PayPilot looks.
            Click <strong>+ Add Invoices</strong> to import your real invoices via CSV.
          </div>
        )}

        {usagePct >= 90 && planLimits.invoices !== Infinity && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            <strong>Usage limit approaching</strong> — you&apos;ve used {usageThisMonth} of {planLimits.invoices} invoice chases this month.{' '}
            <Link href="/subscribe" className="underline font-medium">Upgrade your plan</Link> to chase more.
          </div>
        )}

        <StatsBar stats={stats} />

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Invoices</h2>
          <InvoiceTable invoices={invoices} />
        </div>
      </main>
    </div>
  )
}
