import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { InvoiceTable } from '@/components/dashboard/InvoiceTable'
import { DashboardActions } from '@/components/dashboard/DashboardActions'
import { NotificationBell } from '@/components/dashboard/NotificationBell'
import { AriaStatusCard } from '@/components/dashboard/AriaStatusCard'
import { UsageBar } from '@/components/dashboard/UsageBar'
import { WelcomeState } from '@/components/dashboard/WelcomeState'
import { OnboardingModal } from '@/components/OnboardingModal'
import { OnboardingChecklist } from '@/components/OnboardingChecklist'
import { logOut } from '@/app/actions/auth'
import { PLAN_LIMITS } from '@/lib/utils'
import type { Invoice, DashboardStats, PlanTier } from '@/lib/types'
import Link from 'next/link'

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
    .select('business_name, owner_name, xero_tenant_id, plan_tier, usage_this_month, onboarding_completed, subscription_status, trial_ends_at')
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

  const hasRealInvoices = (invoiceRows ?? []).length > 0
  const invoices: Invoice[] = hasRealInvoices ? (invoiceRows as Invoice[]) : []

  // Aria activity — today's chase log
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [{ data: todayLogs }, { data: lastRunRow }] = await Promise.all([
    supabase
      .from('chase_log')
      .select('id, response_received')
      .eq('tenant_id', user.id)
      .gte('sent_at', todayStart.toISOString()),
    supabase
      .from('chase_log')
      .select('sent_at')
      .eq('tenant_id', user.id)
      .order('sent_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  const todayChased    = todayLogs?.length ?? 0
  const todayResponses = todayLogs?.filter(l => l.response_received).length ?? 0
  const lastRunAt      = lastRunRow?.sent_at ?? null

  const isXeroConnected     = !!tenant?.xero_tenant_id
  const stats               = calcStats(invoices)
  const planTier            = (tenant?.plan_tier ?? 'starter') as PlanTier
  const planLimits          = PLAN_LIMITS[planTier]
  const usageThisMonth: number = tenant?.usage_this_month ?? 0
  const usagePct            = planLimits.invoices === Infinity
    ? 0
    : Math.min(100, (usageThisMonth / planLimits.invoices) * 100)
  const onboardingCompleted = tenant?.onboarding_completed ?? false
  const hasSettings         = !!tenantSettings
  const isSubscribed        = tenant?.subscription_status === 'active'
  const isAtLimit           = planLimits.invoices !== Infinity && usageThisMonth >= planLimits.invoices

  // Show welcome state for users with no real invoices yet
  const showWelcomeState = !hasRealInvoices

  return (
    <div className="min-h-screen bg-gray-50">
      {!showWelcomeState && (
        <OnboardingModal isXeroConnected={isXeroConnected} hasInvoices={hasRealInvoices} />
      )}

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
            {planLimits.invoices !== Infinity ? (
              <div className="hidden md:flex items-center gap-2">
                <div className={`w-20 h-1.5 rounded-full overflow-hidden ${usagePct >= 96 ? 'bg-red-100' : usagePct >= 80 ? 'bg-amber-100' : 'bg-gray-200'}`}>
                  <div
                    className={`h-full rounded-full transition-all ${usagePct >= 96 ? 'bg-red-500' : usagePct >= 80 ? 'bg-amber-500' : 'bg-blue-500'}`}
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {usageThisMonth}/{planLimits.invoices} invoices
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
          <DashboardActions isXeroConnected={isXeroConnected} />
        </div>

        {/* ── Welcome state: brand new users with no invoices ───────────── */}
        {showWelcomeState && (
          <WelcomeState
            ownerName={tenant?.owner_name ?? null}
            isXeroConnected={isXeroConnected}
            hasInvoices={hasRealInvoices}
            hasSettings={hasSettings}
            onboardingCompleted={onboardingCompleted}
          />
        )}

        {/* ── Full dashboard: users with real invoices ──────────────────── */}
        {!showWelcomeState && (
          <>
            <AriaStatusCard
              isXeroConnected={isXeroConnected}
              ownerName={tenant?.owner_name ?? null}
              lastRunAt={lastRunAt}
              todayChased={todayChased}
              todayResponses={todayResponses}
            />

            {!onboardingCompleted && (
              <OnboardingChecklist
                hasXero={isXeroConnected}
                hasInvoices={hasRealInvoices}
                hasSettings={hasSettings}
                onboardingCompleted={onboardingCompleted}
              />
            )}

            {/* Usage at 100% — hard lock banner */}
            {isAtLimit && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-red-800">Aria has reached your monthly limit</p>
                    <p className="text-sm text-red-700 mt-0.5">
                      She&apos;s paused chasing until you upgrade. You still have{' '}
                      <strong>{invoices.filter(i => !['paid','written_off'].includes(i.status)).length} invoices</strong> outstanding.
                    </p>
                  </div>
                  <Link
                    href="/subscribe"
                    className="flex-shrink-0 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                  >
                    Upgrade now →
                  </Link>
                </div>
              </div>
            )}

            {/* Usage at 80–99% — amber warning */}
            {usagePct >= 80 && !isAtLimit && planLimits.invoices !== Infinity && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 flex items-center justify-between gap-4">
                <span>
                  Aria is approaching your monthly limit ({usageThisMonth}/{planLimits.invoices} invoices).{' '}
                  <Link href="/subscribe" className="underline font-semibold">
                    Upgrade to {planTier === 'starter' ? 'Professional for 200 invoices/month' : 'Enterprise for unlimited'}
                  </Link>
                </span>
              </div>
            )}

            <StatsBar stats={stats} />
            <UsageBar usageThisMonth={usageThisMonth} planTier={planTier} />

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Invoices</h2>
              <InvoiceTable invoices={invoices} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
