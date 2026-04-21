'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { logOut } from '@/app/actions/auth'
import type { PlanTier } from '@/lib/types'

const PLANS: {
  tier: PlanTier
  name: string
  monthlyPrice: number
  annualPrice: number
  description: string
  features: string[]
  highlight: boolean
  badge?: string
}[] = [
  {
    tier: 'starter',
    name: 'Starter',
    monthlyPrice: 99,
    annualPrice: 82,
    description: 'Perfect for freelancers and small businesses getting started.',
    features: [
      'Up to 50 invoices chased/month',
      'Email chasing',
      'Xero integration',
      'Dashboard & chase history',
      'Email support',
    ],
    highlight: false,
  },
  {
    tier: 'professional',
    name: 'Professional',
    monthlyPrice: 249,
    annualPrice: 207,
    description: 'For growing businesses that need email and SMS recovery.',
    features: [
      'Up to 200 invoices chased/month',
      'Email + SMS chasing',
      'Xero integration',
      'Full dashboard with analytics',
      'Custom email signature',
      'Payment link in emails',
      'Priority email support',
    ],
    highlight: true,
    badge: 'Most popular',
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 499,
    annualPrice: 415,
    description: 'For agencies and larger teams with high invoice volumes.',
    features: [
      'Unlimited invoices',
      'Email + SMS + escalation',
      'Xero + QuickBooks integration',
      'Advanced analytics',
      'Custom sending domain',
      'White label option',
      'API access',
      'Dedicated support',
    ],
    highlight: false,
  },
]

function SubscribeContent() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState<PlanTier | null>(null)
  const [error, setError] = useState('')

  async function handleSelect(tier: PlanTier) {
    setLoading(tier)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planTier: tier, billing }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Could not start checkout. Please try again.')
        setLoading(null)
      }
    } catch {
      setError('Network error — please try again.')
      setLoading(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white px-4 py-16">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/10 blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-bold text-white">
            Pay<span className="text-blue-400">Pilot</span>
          </Link>
          <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold">Choose your plan</h1>
          <p className="mt-3 text-gray-400">Start recovering invoices today. Cancel anytime.</p>

          {/* Billing toggle */}
          <div className="mt-6 inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                billing === 'monthly'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
                billing === 'annual'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Annual
              <span className="rounded-full bg-green-500/20 border border-green-500/30 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                2 months free
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid sm:grid-cols-3 gap-5">
          {PLANS.map(plan => {
            const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice
            const isLoading = loading === plan.tier

            return (
              <div
                key={plan.tier}
                className={`relative rounded-2xl border p-7 flex flex-col transition-all duration-300 ${
                  plan.highlight
                    ? 'border-blue-500/50 bg-blue-950/30 shadow-2xl shadow-blue-500/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                }`}
              >
                {/* Glow for highlighted plan */}
                {plan.highlight && (
                  <div className="absolute inset-0 rounded-2xl opacity-30"
                    style={{ background: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.2), transparent 60%)' }} />
                )}

                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-blue-600/30">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="relative">
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{plan.name}</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">${price}</span>
                    <span className="text-gray-500 text-sm">/mo</span>
                  </div>
                  {billing === 'annual' && (
                    <p className="mt-1 text-xs text-green-400">
                      ${price * 12}/yr · save ${(plan.monthlyPrice - price) * 12}/yr
                    </p>
                  )}
                  <p className="mt-3 text-sm text-gray-500 leading-relaxed">{plan.description}</p>

                  <ul className="mt-5 space-y-2.5">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <span className={`mt-0.5 flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold
                          ${plan.highlight ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-gray-400'}`}>
                          ✓
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelect(plan.tier)}
                    disabled={!!loading}
                    className={`mt-7 w-full rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      plan.highlight
                        ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                        : 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {isLoading ? 'Redirecting…' : `Get started with ${plan.name}`}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {error && (
          <p className="mt-6 text-center rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="mt-8 text-center">
          <form action={logOut}>
            <button type="submit" className="text-sm text-gray-600 hover:text-gray-400 underline">
              Log out
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default function SubscribePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#030712]">
        <p className="text-gray-500">Loading…</p>
      </div>
    }>
      <SubscribeContent />
    </Suspense>
  )
}
