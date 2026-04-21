import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function calcDaysOverdue(dueDateStr: string): number {
  const due = new Date(dueDateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export type PlanTier = 'starter' | 'professional' | 'enterprise'

export const PLAN_LIMITS: Record<PlanTier, { invoices: number; sms: boolean; label: string }> = {
  starter:      { invoices: 50,        sms: false, label: 'Starter' },
  professional: { invoices: 200,       sms: true,  label: 'Professional' },
  enterprise:   { invoices: Infinity,  sms: true,  label: 'Enterprise' },
}
