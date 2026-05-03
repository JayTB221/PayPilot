import Link from 'next/link'
import { PLAN_LIMITS } from '@/lib/utils'
import type { PlanTier } from '@/lib/types'

interface Props {
  usageThisMonth: number
  planTier: PlanTier
}

export function UsageBar({ usageThisMonth, planTier }: Props) {
  const limits = PLAN_LIMITS[planTier]

  if (limits.invoices === Infinity) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-white border border-gray-100 shadow-sm px-5 py-3">
        <p className="text-sm text-gray-600">
          Aria has chased{' '}
          <span className="font-semibold text-gray-900">{usageThisMonth} invoice{usageThisMonth !== 1 ? 's' : ''}</span>
          {' '}this month
        </p>
        <span className="rounded-full bg-purple-100 border border-purple-200 px-3 py-1 text-xs font-semibold text-purple-700">
          Unlimited
        </span>
      </div>
    )
  }

  const pct     = Math.min(100, (usageThisMonth / limits.invoices) * 100)
  const isRed   = pct >= 96
  const isAmber = pct >= 80 && !isRed

  const barColor  = isRed ? 'bg-red-500'   : isAmber ? 'bg-amber-500' : 'bg-green-500'
  const textColor = isRed ? 'text-red-700'  : isAmber ? 'text-amber-700' : 'text-gray-900'

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-sm px-5 py-4">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-sm text-gray-600">
          Aria has chased{' '}
          <span className={`font-semibold ${textColor}`}>
            {usageThisMonth} of {limits.invoices}
          </span>
          {' '}invoices this month
        </p>
        {isRed && (
          <Link
            href="/subscribe"
            className="text-xs font-semibold text-red-600 hover:text-red-800 underline flex-shrink-0 ml-4"
          >
            Upgrade for unlimited →
          </Link>
        )}
        {isAmber && (
          <Link
            href="/subscribe"
            className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline flex-shrink-0 ml-4"
          >
            Approaching limit — upgrade
          </Link>
        )}
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-gray-400">{limits.label} plan · {limits.invoices} invoices/month</span>
        <span className="text-xs text-gray-400">{Math.round(pct)}% used</span>
      </div>
    </div>
  )
}
