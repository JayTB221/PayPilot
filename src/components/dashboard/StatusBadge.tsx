import { cn } from '@/lib/utils'
import type { InvoiceStatus } from '@/lib/types'

const config: Record<InvoiceStatus, { label: string; classes: string }> = {
  pending:     { label: 'Pending',     classes: 'bg-gray-100 text-gray-600' },
  contacted:   { label: 'Contacted',   classes: 'bg-blue-100 text-blue-700' },
  responded:   { label: 'Responded',   classes: 'bg-yellow-100 text-yellow-700' },
  paid:        { label: 'Paid',        classes: 'bg-green-100 text-green-700' },
  escalated:   { label: 'Escalated',   classes: 'bg-red-100 text-red-700' },
  written_off: { label: 'Written Off', classes: 'bg-gray-100 text-gray-400' },
}

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const { label, classes } = config[status]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', classes)}>
      {label}
    </span>
  )
}
