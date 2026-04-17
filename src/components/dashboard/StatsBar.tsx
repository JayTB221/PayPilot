import { formatCurrency } from '@/lib/utils'
import type { DashboardStats } from '@/lib/types'

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

export function StatsBar({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Invoices Being Chased" value={String(stats.totalInvoices)} />
      <StatCard label="Total Outstanding"     value={formatCurrency(stats.totalOutstanding)} />
      <StatCard label="Recovered This Month"  value={formatCurrency(stats.totalRecoveredThisMonth)} />
      <StatCard
        label="Recovery Rate"
        value={stats.recoveryRate > 0 ? `${stats.recoveryRate.toFixed(0)}%` : '—'}
      />
    </div>
  )
}
