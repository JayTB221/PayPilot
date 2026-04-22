'use client'

import { useEffect, useState } from 'react'
import { AriaAvatar } from '@/components/AriaAvatar'
import { formatDate } from '@/lib/utils'

interface Props {
  isXeroConnected: boolean
  ownerName: string | null
  lastRunAt: string | null
  todayChased: number
  todayResponses: number
}

function useNextRunCountdown() {
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    function calc() {
      const now = new Date()
      const next = new Date()
      next.setHours(8, 0, 0, 0)
      if (now >= next) next.setDate(next.getDate() + 1)
      const diff = next.getTime() - now.getTime()
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      setCountdown(`${h}h ${m}m`)
    }
    calc()
    const id = setInterval(calc, 60_000)
    return () => clearInterval(id)
  }, [])

  return countdown
}

export function AriaStatusCard({ isXeroConnected, ownerName, lastRunAt, todayChased, todayResponses }: Props) {
  const countdown = useNextRunCountdown()

  if (!isXeroConnected) {
    return (
      <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-violet-50 p-5">
        <div className="flex items-center gap-3">
          <AriaAvatar size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">Aria is setting up</span>
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Connect Xero and Aria will start monitoring your invoices tonight.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50/60 to-white p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Identity + status */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <AriaAvatar size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900">Aria is active</span>
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
              </span>
            </div>
            {lastRunAt ? (
              <p className="text-xs text-gray-500 mt-0.5">
                Last run {formatDate(lastRunAt)}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-0.5">Waiting for first run</p>
            )}
          </div>
        </div>

        {/* Today's brief */}
        {todayChased > 0 ? (
          <div className="rounded-xl bg-white border border-purple-100 px-4 py-2.5 text-sm flex-shrink-0">
            <p className="text-xs text-gray-400 mb-0.5">This morning</p>
            <p className="text-gray-800 font-medium">
              Chased <span className="text-purple-700 font-semibold">{todayChased}</span> invoice{todayChased !== 1 ? 's' : ''}
              {todayResponses > 0 && (
                <span className="text-gray-500"> · <span className="text-green-600 font-semibold">{todayResponses}</span> replied</span>
              )}
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-white border border-purple-100 px-4 py-2.5 text-sm flex-shrink-0">
            <p className="text-xs text-gray-400 mb-0.5">This morning</p>
            <p className="text-gray-500">No activity yet today</p>
          </div>
        )}

        {/* Next run */}
        <div className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm flex-shrink-0 text-center">
          <p className="text-xs text-purple-200 mb-0.5">Next run in</p>
          <p className="text-white font-bold font-mono">{countdown || '…'}</p>
        </div>
      </div>

      {/* Morning brief line */}
      {todayChased > 0 && (
        <p className="mt-3 text-xs text-gray-500 border-t border-purple-100 pt-3">
          <span className="text-purple-600 font-medium">Aria says:</span>{' '}
          &ldquo;Good morning, {ownerName ?? 'there'}. I chased {todayChased} invoice{todayChased !== 1 ? 's' : ''} this morning
          {todayResponses > 0 ? ` and received ${todayResponses} response${todayResponses !== 1 ? 's' : ''}` : ''}.
          I&apos;ll keep working on the outstanding ones.&rdquo;
        </p>
      )}
    </div>
  )
}
