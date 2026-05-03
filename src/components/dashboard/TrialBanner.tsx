import Link from 'next/link'

interface Props {
  trialEndsAt: string
}

export function TrialBanner({ trialEndsAt }: Props) {
  const daysLeft = Math.ceil(
    (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  if (daysLeft <= 0) return null

  const isRed   = daysLeft <= 2
  const isAmber = daysLeft <= 5 && !isRed

  const bg = isRed ? 'bg-red-600' : isAmber ? 'bg-amber-500' : 'bg-blue-600'

  return (
    <div className={`${bg} px-4 py-2.5`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-white">
          {isRed && <strong>Last chance — </strong>}
          Your free trial ends in{' '}
          <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>
          {' '}— upgrade to keep Aria working.
        </p>
        <Link
          href="/subscribe"
          className="flex-shrink-0 rounded-lg bg-white/20 hover:bg-white/30 px-3 py-1 text-xs font-semibold text-white transition-colors whitespace-nowrap"
        >
          Upgrade now →
        </Link>
      </div>
    </div>
  )
}
