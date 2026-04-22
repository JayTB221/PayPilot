import { AriaAvatar } from '@/components/AriaAvatar'
import { formatDate } from '@/lib/utils'
import type { ChaseLog } from '@/lib/types'

function toPlainEnglish(log: ChaseLog, debtorName: string): string {
  if (log.delivery_status === 'failed') {
    return `My ${log.channel === 'sms' ? 'SMS' : 'email'} to ${debtorName} couldn't be delivered — I'll try again.`
  }
  if (log.response_received) {
    return `${debtorName} replied to my follow-up.`
  }
  if (log.action_type === 'escalation_flag') {
    return `I've flagged this invoice for escalation — ${debtorName} hasn't responded after multiple attempts.`
  }
  if (log.channel === 'sms') {
    return `I sent an SMS reminder to ${debtorName}.`
  }
  return `I sent a follow-up email to ${debtorName}.`
}

function channelLabel(log: ChaseLog) {
  if (log.action_type === 'escalation_flag') {
    return { label: 'Escalated', cls: 'bg-red-100 text-red-700' }
  }
  if (log.response_received) {
    return { label: 'Response', cls: 'bg-green-100 text-green-700' }
  }
  if (log.delivery_status === 'failed') {
    return { label: 'Failed', cls: 'bg-red-100 text-red-700' }
  }
  if (log.channel === 'sms') {
    return { label: 'SMS', cls: 'bg-purple-100 text-purple-700' }
  }
  return { label: 'Email', cls: 'bg-blue-100 text-blue-700' }
}

interface Props {
  logs: ChaseLog[]
  debtorName: string
}

export function ActivityFeed({ logs, debtorName }: Props) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 gap-3">
        <AriaAvatar size="lg" />
        <p className="text-sm text-gray-500 font-medium">Aria hasn&apos;t taken action yet</p>
        <p className="text-xs text-gray-400">Use &ldquo;Ask Aria to chase&rdquo; to trigger the first follow-up.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {logs.map((log, i) => {
        const tag = channelLabel(log)
        return (
          <div key={log.id} className="flex items-start gap-3">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <AriaAvatar size="sm" />
              {i < logs.length - 1 && (
                <div className="w-px flex-1 bg-purple-100 mt-2 min-h-[20px]" />
              )}
            </div>

            {/* Message bubble */}
            <div className="flex-1 min-w-0 pb-4">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-semibold text-purple-700">Aria</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tag.cls}`}>
                  {tag.label}
                </span>
                <span className="text-xs text-gray-400">{formatDate(log.sent_at)}</span>
              </div>

              <div className="rounded-xl rounded-tl-sm bg-purple-50 border border-purple-100 px-4 py-3">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {toPlainEnglish(log, debtorName)}
                </p>
                {log.message_sent && log.message_sent.length > 60 && (
                  <details className="mt-2">
                    <summary className="text-xs text-purple-600 cursor-pointer hover:text-purple-800 select-none">
                      View full message
                    </summary>
                    <p className="mt-2 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap border-t border-purple-100 pt-2">
                      {log.message_sent}
                    </p>
                  </details>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
