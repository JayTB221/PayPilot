'use client'

import { motion, useInView, type Variants } from 'framer-motion'
import { useRef, useState } from 'react'
import Link from 'next/link'

// ── Animation variants ────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Dashboard preview mockup ──────────────────────────────────────────────────
function DashboardMockup() {
  const invoices = [
    { name: 'Mitchell Design Co', amount: '$3,200', days: '47d', status: 'Escalated', color: 'text-red-400' },
    { name: 'Thornton Builders Ltd', amount: '$8,750', days: '33d', status: 'Contacted', color: 'text-blue-400' },
    { name: 'Chen Industries', amount: '$12,400', days: '7d', status: 'Pending', color: 'text-gray-400' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
      style={{ perspective: 1200 }}
      className="relative w-full max-w-3xl mx-auto"
    >
      {/* Glow behind the card */}
      <div className="absolute inset-0 -z-10 rounded-2xl blur-3xl opacity-30 bg-gradient-to-br from-blue-600 via-violet-600 to-transparent scale-110" />

      {/* Browser chrome */}
      <div className="rounded-2xl border border-white/10 bg-gray-950/80 backdrop-blur-sm shadow-2xl overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-gray-900/60">
          <span className="h-3 w-3 rounded-full bg-red-400/70" />
          <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
          <span className="h-3 w-3 rounded-full bg-green-400/70" />
          <div className="flex-1 mx-4 h-5 rounded-md bg-white/5 text-[10px] text-white/20 px-3 flex items-center font-mono">
            paypilot.app/dashboard
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-4 space-y-3">
          {/* Nav */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white">Pay<span className="text-blue-400">Pilot</span></span>
            <div className="flex gap-2">
              <span className="rounded-full bg-green-500/20 border border-green-500/30 px-2 py-0.5 text-[9px] text-green-400 font-medium">● Xero connected</span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Chasing', value: '12' },
              { label: 'Outstanding', value: '$47k' },
              { label: 'Recovered', value: '$18k' },
              { label: 'Recovery rate', value: '73%' },
            ].map(s => (
              <div key={s.label} className="rounded-lg bg-white/5 border border-white/5 px-2 py-2">
                <p className="text-[9px] text-gray-500">{s.label}</p>
                <p className="text-sm font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Invoice table */}
          <div className="rounded-lg border border-white/5 overflow-hidden">
            <div className="grid grid-cols-4 gap-2 px-3 py-1.5 bg-white/5 text-[9px] text-gray-500 uppercase tracking-wide">
              <span>Debtor</span><span>Amount</span><span>Overdue</span><span>Status</span>
            </div>
            {invoices.map((inv, i) => (
              <motion.div
                key={inv.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="grid grid-cols-4 gap-2 px-3 py-2 border-t border-white/5 text-[10px] items-center"
              >
                <span className="text-gray-300 truncate">{inv.name}</span>
                <span className="text-white font-semibold">{inv.amount}</span>
                <span className="text-orange-400">{inv.days}</span>
                <span className={`font-medium ${inv.color}`}>{inv.status}</span>
              </motion.div>
            ))}
          </div>

          {/* Chase now badge */}
          <div className="flex justify-end">
            <span className="rounded-lg bg-blue-600/20 border border-blue-500/30 px-3 py-1 text-[10px] text-blue-400 font-medium">
              AI chasing 3 invoices now...
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Landing pricing ──────────────────────────────────────────────────────────
const LANDING_PLANS = [
  {
    name: 'Starter', monthlyPrice: 99, annualPrice: 82,
    description: 'Perfect for freelancers and small businesses.',
    features: ['Up to 50 invoices/month', 'Email chasing', 'Xero integration', 'Dashboard & history', 'Email support'],
    highlight: false,
  },
  {
    name: 'Professional', monthlyPrice: 249, annualPrice: 207,
    description: 'For growing businesses needing email + SMS.',
    features: ['Up to 200 invoices/month', 'Email + SMS chasing', 'Full analytics dashboard', 'Custom email signature', 'Payment links in emails', 'Priority support'],
    highlight: true, badge: 'Most popular',
  },
  {
    name: 'Enterprise', monthlyPrice: 499, annualPrice: 415,
    description: 'For agencies and high-volume teams.',
    features: ['Unlimited invoices', 'Email + SMS + escalation', 'Xero + QuickBooks', 'Advanced analytics', 'Custom sending domain', 'API access', 'Dedicated support'],
    highlight: false,
  },
]

function LandingPricing() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  return (
    <Section className="max-w-6xl mx-auto px-6 py-24">
      <motion.div variants={fadeUp} className="text-center mb-10">
        <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">Pricing</p>
        <h2 className="text-4xl font-bold text-white">Simple, transparent pricing</h2>
        <p className="mt-3 text-gray-500">Start recovering invoices today. Cancel anytime.</p>
        <div className="mt-6 inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          <button onClick={() => setBilling('monthly')}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${billing === 'monthly' ? 'bg-white text-gray-900 shadow' : 'text-gray-400 hover:text-white'}`}>
            Monthly
          </button>
          <button onClick={() => setBilling('annual')}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-all flex items-center gap-2 ${billing === 'annual' ? 'bg-white text-gray-900 shadow' : 'text-gray-400 hover:text-white'}`}>
            Annual
            <span className="rounded-full bg-green-500/20 border border-green-500/30 px-2 py-0.5 text-[10px] font-semibold text-green-400">2 months free</span>
          </button>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-5">
        {LANDING_PLANS.map(plan => {
          const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice
          return (
            <motion.div key={plan.name} variants={fadeUp}
              className={`relative rounded-2xl border p-7 flex flex-col transition-all duration-300 ${
                plan.highlight
                  ? 'border-blue-500/50 bg-blue-950/30 shadow-2xl shadow-blue-500/10'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
              }`}>
              {plan.highlight && (
                <div className="absolute inset-0 rounded-2xl opacity-30"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.2), transparent 60%)' }} />
              )}
              {'badge' in plan && plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-blue-600/30">{plan.badge}</span>
                </div>
              )}
              <div className="relative flex flex-col flex-1">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{plan.name}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">${price}</span>
                  <span className="text-gray-500 text-sm">/mo</span>
                </div>
                {billing === 'annual' && (
                  <p className="mt-1 text-xs text-green-400">${price * 12}/yr · save ${(plan.monthlyPrice - price) * 12}/yr</p>
                )}
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">{plan.description}</p>
                <ul className="mt-5 space-y-2.5 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <span className={`mt-0.5 flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold ${plan.highlight ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-gray-400'}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup"
                  className={`mt-7 block text-center w-full rounded-xl py-3 text-sm font-semibold transition-all ${
                    plan.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                      : 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
                  }`}>
                  Get started with {plan.name}
                </Link>
              </div>
            </motion.div>
          )
        })}
      </div>
    </Section>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">

      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-32 right-0 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[100px]" />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold">Pay<span className="text-blue-400">Pilot</span></span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-8 text-center">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300">
              🇳🇿 Built for New Zealand small businesses
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp}
            className="text-5xl sm:text-7xl font-extrabold leading-tight tracking-tight">
            Stop chasing invoices.
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              Let AI do it for you.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            PayPilot automatically sends personalised, professional follow-ups to overdue clients —
            so you get paid faster without the awkward conversations.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0">
              Start recovering invoices →
            </Link>
            <Link href="/demo"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-all">
              See it in action
            </Link>
          </motion.div>

          <motion.p variants={fadeUp} className="text-sm text-gray-600">
            From $99/mo · Cancel anytime · No lock-in contracts
          </motion.p>
        </motion.div>

        {/* Dashboard mockup */}
        <div className="mt-16">
          <DashboardMockup />
        </div>
      </section>

      {/* ── Stats bar ── */}
      <Section className="border-y border-white/5 bg-white/[0.02] py-12 mt-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '3.2×', label: 'faster invoice recovery' },
            { value: '94%', label: 'of clients pay within 2 contacts' },
            { value: '4 hrs', label: 'saved per week on average' },
            { value: '$18k', label: 'average recovered in first month' },
          ].map(stat => (
            <motion.div key={stat.label} variants={fadeUp}>
              <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── How it works ── */}
      <Section className="max-w-6xl mx-auto px-6 py-24">
        <motion.div variants={fadeUp} className="text-center mb-14">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-4xl font-bold text-white">Three steps to getting paid</h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6 relative">
          {/* Connector line */}
          <div className="hidden sm:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

          {[
            {
              step: '01', icon: '📂',
              title: 'Import your invoices',
              body: 'Upload a CSV or connect your Xero account. PayPilot pulls all overdue invoices automatically.',
            },
            {
              step: '02', icon: '🤖',
              title: 'Claude AI writes follow-ups',
              body: 'Claude crafts personalised, professional messages — adapting tone from friendly to urgent based on how overdue the invoice is.',
            },
            {
              step: '03', icon: '💸',
              title: 'Get paid. Automatically.',
              body: 'PayPilot tracks every contact, logs replies, and escalates when needed — all without you lifting a finger.',
            },
          ].map(item => (
            <motion.div key={item.step} variants={fadeUp}
              className="relative rounded-2xl border border-white/8 bg-white/[0.03] p-7 hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300 group">
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.08), transparent 60%)' }} />
              <div className="text-4xl mb-4">{item.icon}</div>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Step {item.step}</p>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Features ── */}
      <Section className="border-y border-white/5 bg-white/[0.01] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl font-bold text-white">Everything you need to get paid</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🤖', title: 'Claude AI messages', body: 'Personalised email and SMS powered by Claude — not templates. Each message feels genuinely human.' },
              { icon: '🔗', title: 'Xero integration', body: 'Syncs overdue invoices directly from your Xero account in real time. Zero manual entry.' },
              { icon: '📊', title: 'Recovery dashboard', body: 'Every outstanding invoice, chase history, and recovery rate visible at a glance.' },
              { icon: '⏱️', title: 'Automated follow-ups', body: 'Set-and-forget escalation — PayPilot contacts clients on a smart schedule based on your thresholds.' },
              { icon: '📨', title: 'Email + SMS chasing', body: 'Reaches clients on the channel they respond to. SMS kicks in automatically for harder cases.' },
              { icon: '📋', title: 'Full audit trail', body: 'Every message sent, every reply received — all logged forever for your records.' },
            ].map(f => (
              <motion.div key={f.title} variants={fadeUp}
                className="group flex gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-6 hover:bg-white/[0.06] hover:border-blue-500/20 transition-all duration-300 cursor-default">
                <span className="text-2xl mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </span>
                <div>
                  <p className="font-semibold text-white text-sm mb-1">{f.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Pricing ── */}
      <LandingPricing />

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-violet-600/15 to-blue-600/20" />
        <div className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <Section>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Ready to stop leaving<br />money on the table?
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-gray-400">
              Join NZ small businesses using PayPilot to recover invoices on autopilot.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8">
              <Link href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-10 py-4 text-base font-semibold text-gray-900 hover:bg-gray-100 transition-all shadow-2xl hover:-translate-y-0.5 active:translate-y-0">
                Start your free trial →
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <span>Pay<span className="text-blue-400">Pilot</span> © 2026.</span>
          <div className="flex flex-wrap justify-center gap-5">
            <Link href="/demo"    className="hover:text-gray-400 transition-colors">Demo</Link>
            <Link href="/login"   className="hover:text-gray-400 transition-colors">Log in</Link>
            <Link href="/signup"  className="hover:text-gray-400 transition-colors">Sign up</Link>
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-gray-400 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
