'use client'

import { motion, AnimatePresence, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// ── Lazy-load animation-heavy components ──────────────────────────────────────

const InvoiceStack = dynamic(
  () => import('@/components/landing/InvoiceStack').then(m => m.InvoiceStack),
  {
    ssr: false,
    loading: () => (
      <div className="w-[350px] h-[420px] rounded-2xl bg-white/[0.03] border border-white/[0.08] animate-pulse" />
    ),
  }
)

const ChaseTimeline = dynamic(
  () => import('@/components/landing/ChaseTimeline').then(m => m.ChaseTimeline),
  {
    ssr: false,
    loading: () => <div className="h-[560px] rounded-2xl bg-white/[0.02] animate-pulse" />,
  }
)

const AriaTyping = dynamic(
  () => import('@/components/landing/AriaTyping').then(m => m.AriaTyping),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] rounded-2xl bg-white/[0.02] animate-pulse max-w-2xl mx-auto w-full" />
    ),
  }
)

const Particles = dynamic(
  () => import('@/components/landing/Particles').then(m => m.Particles),
  { ssr: false }
)

// ── Animation variants ────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

// ── Scroll progress bar ───────────────────────────────────────────────────────

function ScrollProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement
      const scrollTop = el.scrollTop || document.body.scrollTop
      const scrollHeight = el.scrollHeight - el.clientHeight
      setProgress(scrollHeight > 0 ? scrollTop / scrollHeight : 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 200,
        height: 3,
        width: `${progress * 100}%`,
        background: 'linear-gradient(to right, #3b82f6, #7c3aed)',
        borderRadius: '0 9999px 9999px 0',
        pointerEvents: 'none',
      }}
    />
  )
}

// ── Live money counter ────────────────────────────────────────────────────────

function LiveMoneyCounter() {
  const [amount, setAmount] = useState(48340)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    const schedule = () => {
      const delay = 8000 + Math.random() * 7000
      timeoutId = setTimeout(() => {
        setAmount(prev => prev + Math.floor(200 + Math.random() * 600))
        schedule()
      }, delay)
    }

    schedule()
    return () => clearTimeout(timeoutId)
  }, [])

  const formatted = '$' + amount.toLocaleString('en-US')

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span
        className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0"
        aria-hidden
      />
      <span className="text-sm text-gray-500">Aria recovered</span>
      <span
        className="overflow-hidden inline-flex items-center"
        style={{ height: '1.25rem' }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={amount}
            initial={prefersReduced ? false : { y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={prefersReduced ? undefined : { y: '-100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm font-bold text-green-400 block"
          >
            {formatted}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="text-sm text-gray-500">in invoices today</span>
    </div>
  )
}

// ── Scroll-triggered section wrapper ─────────────────────────────────────────

function Section({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
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

// ── Count-up stat ─────────────────────────────────────────────────────────────

interface StatItem {
  prefix: string
  value: number
  suffix: string
  label: string
  decimals?: number
}

const STATS: StatItem[] = [
  { prefix: '', value: 3.2, suffix: '×',    label: 'faster invoice recovery',         decimals: 1 },
  { prefix: '', value: 94,  suffix: '%',    label: 'of clients pay within 2 contacts'               },
  { prefix: '', value: 4,   suffix: ' hrs', label: 'saved per week on average'                      },
  { prefix: '$', value: 18, suffix: 'k',   label: 'average recovered in first month'               },
]

function CountUpStat({ stat }: { stat: StatItem }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const prefersReduced = useReducedMotion()
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (!inView || prefersReduced) {
      if (inView) setDisplayed(stat.value)
      return
    }
    const start = performance.now()
    const duration = 2000

    const raf = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(eased * stat.value)
      if (progress < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [inView, prefersReduced, stat.value])

  const formatted =
    stat.decimals !== undefined
      ? displayed.toFixed(stat.decimals)
      : Math.round(displayed).toString()

  return (
    <div className="text-center">
      <p
        ref={ref}
        className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent"
      >
        {stat.prefix}{formatted}{stat.suffix}
      </p>
      <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
    </div>
  )
}

// ── Pricing data & component ──────────────────────────────────────────────────

interface Plan {
  name: string
  monthlyPrice: number
  annualPrice: number
  description: string
  features: string[]
  highlight: boolean
  badge?: string
}

const PLANS: Plan[] = [
  {
    name: 'Starter',
    monthlyPrice: 99,
    annualPrice: 82,
    description: 'Perfect for freelancers and small businesses.',
    features: [
      '14-day free trial, no credit card',
      'Up to 50 invoices chased/month',
      'Email chasing only',
      'Xero integration',
      'Basic dashboard & history',
      'Email support',
    ],
    highlight: false,
  },
  {
    name: 'Professional',
    monthlyPrice: 249,
    annualPrice: 207,
    description: 'For growing businesses that need email and SMS recovery.',
    features: [
      '14-day free trial, no credit card',
      'Up to 200 invoices/month',
      'Email AND SMS chasing',
      'Advanced analytics',
      'Custom email signature',
      'Payment link in every chase email',
      'Downloadable chase reports',
      'Priority email support',
    ],
    highlight: true,
    badge: 'Most popular',
  },
  {
    name: 'Enterprise',
    monthlyPrice: 499,
    annualPrice: 415,
    description: 'For agencies and high-volume teams.',
    features: [
      '14-day free trial, no credit card',
      'Unlimited invoices',
      'Email + SMS + escalation',
      'Custom sending domain',
      'QuickBooks + Xero integration',
      'API access',
      'Multiple team seats',
      'Dedicated support with SLA',
      'Personal onboarding call',
    ],
    highlight: false,
  },
]

function LandingPricing() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

  return (
    <Section className="max-w-6xl mx-auto px-6 py-24">
      <motion.div variants={fadeUp} className="text-center mb-10">
        <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">
          Pricing
        </p>
        <h2 className="text-4xl font-bold text-white">Simple, transparent pricing</h2>
        <p className="mt-3 text-gray-500">
          14-day free trial on all plans. No credit card required. Cancel anytime.
        </p>

        {/* Billing toggle */}
        <div className="mt-6 inline-flex items-center gap-1 rounded-xl p-1 bg-white/[0.04] border border-white/[0.08]">
          {(['monthly', 'annual'] as const).map(b => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-all capitalize flex items-center gap-2 ${
                billing === b
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {b}
              {b === 'annual' && (
                <span className="rounded-full bg-green-500/20 border border-green-500/30 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                  2 months free
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-5">
        {PLANS.map(plan => {
          const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice

          if (plan.highlight) {
            return (
              <motion.div key={plan.name} variants={fadeUp} className="relative">
                {/* Animated gradient border wrapper */}
                <div
                  className="absolute inset-0 rounded-2xl animate-gradient-border"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #7c3aed, #3b82f6)',
                    padding: 1,
                    zIndex: 0,
                  }}
                  aria-hidden
                />
                <div
                  className="relative rounded-2xl p-7 flex flex-col h-full"
                  style={{
                    background: 'rgba(23,37,84,0.6)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1,
                    margin: 1,
                    borderRadius: 15,
                    boxShadow: '0 0 0 1px rgba(59,130,246,0.1), 0 25px 50px rgba(59,130,246,0.1)',
                  }}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-blue-600/30">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  <PlanCardContent plan={plan} price={price} billing={billing} highlighted />
                </div>
              </motion.div>
            )
          }

          return (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              className="rounded-2xl p-7 flex flex-col transition-all duration-300 border bg-white/[0.02] border-white/[0.07] hover:border-white/[0.15] hover:bg-white/[0.04]"
            >
              <PlanCardContent plan={plan} price={price} billing={billing} highlighted={false} />
            </motion.div>
          )
        })}
      </div>
    </Section>
  )
}

function PlanCardContent({
  plan,
  price,
  billing,
  highlighted,
}: {
  plan: Plan
  price: number
  billing: 'monthly' | 'annual'
  highlighted: boolean
}) {
  return (
    <div className="flex flex-col flex-1">
      <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{plan.name}</p>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-xs text-gray-500 self-end mb-1">USD</span>
        <span className="text-4xl font-extrabold text-white">${price}</span>
        <span className="text-gray-500 text-sm">/mo</span>
      </div>
      {billing === 'annual' && (
        <p className="mt-1 text-xs text-green-400">
          ${price * 12}/yr · save ${(plan.monthlyPrice - price) * 12}/yr
        </p>
      )}
      <p className="mt-3 text-sm text-gray-500 leading-relaxed">{plan.description}</p>
      <ul className="mt-5 space-y-2.5 flex-1">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
            <span
              className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                highlighted
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-white/[0.08] text-gray-400'
              }`}
            >
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-7 space-y-1">
        <Link
          href="/signup"
          className={`block text-center w-full rounded-xl py-3 text-sm font-semibold transition-all ${
            highlighted
              ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
              : 'border border-white/[0.15] bg-white/5 text-white hover:bg-white/10'
          }`}
        >
          Start free 14-day trial
        </Link>
        <p className="text-center text-xs text-gray-600">No credit card required</p>
      </div>
    </div>
  )
}

// ── Features data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '🤖',
    title: "Aria's messages",
    body: 'Every follow-up written by Aria — not templates. Each message considers the debtor, the amount, and the history.',
  },
  {
    icon: '🔗',
    title: 'Xero integration',
    body: 'Syncs overdue invoices directly from your Xero account. Zero manual entry. Always up to date.',
  },
  {
    icon: '📊',
    title: 'Recovery dashboard',
    body: 'Every invoice, chase status, and recovery stat visible at a glance. Full audit trail forever.',
  },
  {
    icon: '⏱️',
    title: 'Automated escalation',
    body: 'Set your thresholds. Aria handles the rest — friendly to firm to urgent, automatically.',
  },
  {
    icon: '📨',
    title: 'Email + SMS chasing',
    body: 'Aria contacts debtors on the channel they respond to. SMS kicks in automatically for harder cases.',
  },
  {
    icon: '🛡️',
    title: '14-day free trial',
    body: 'Try Aria free for 14 days. No credit card required. Cancel anytime. No lock-in contracts.',
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const prefersReduced = useReducedMotion()

  return (
    <>
      {/* Particles canvas — fixed, z-index 0, behind all content */}
      <Particles />

      {/* Scroll progress bar */}
      <ScrollProgressBar />

      {/* All page content sits above the canvas (position relative + z-index 1) */}
      <div className="relative min-h-screen bg-[#030712] text-white overflow-x-hidden" style={{ zIndex: 2 }}>

        {/* Background layers */}
        <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
          <div
            className="absolute rounded-full blur-[140px]"
            style={{
              width: 900, height: 600,
              top: '25%', left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(59,130,246,0.08)',
            }}
          />
          <div
            className="absolute rounded-full blur-[120px]"
            style={{
              width: 500, height: 400,
              top: '33%', right: 0,
              background: 'rgba(124,58,237,0.06)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        {/* ── Nav ── */}
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 flex items-center justify-between" style={{ height: 64 }}>
            <span className="text-xl font-bold">
              Pay<span className="text-blue-400">Pilot</span>
            </span>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
              >
                Get started free
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-12 min-h-screen flex items-center">
          <div className="w-full grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">

            {/* Left col — 60% */}
            <div className="lg:col-span-3">
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="space-y-7"
              >
                {/* Badge */}
                <motion.div variants={fadeUp}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-300">
                    ✦ AI-powered invoice recovery
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  variants={fadeUp}
                  className="text-6xl sm:text-8xl font-extrabold leading-none tracking-tight"
                >
                  <span className="text-white">Your invoices.</span>
                  <br />
                  {/* Moving gradient text — uses gradient-hero-text class from globals.css */}
                  <span className="gradient-hero-text">
                    Chased. Paid.
                  </span>
                  <br />
                  <span className="text-white">Automatically.</span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                  variants={fadeUp}
                  className="text-xl text-gray-400 max-w-lg leading-relaxed"
                >
                  Aria is your AI invoice recovery agent. She chases overdue clients with
                  personalised emails and SMS — escalating automatically until they pay. You
                  focus on your business. Aria handles the rest.
                </motion.p>

                {/* CTA buttons */}
                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                  {/* Primary button with expanding pulse rings */}
                  <div className="relative inline-flex">
                    {!prefersReduced && (
                      <>
                        <div className="pulse-ring" aria-hidden />
                        <div className="pulse-ring pulse-ring-delayed" aria-hidden />
                      </>
                    )}
                    <Link
                      href="/signup"
                      className="relative z-10 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0"
                      style={{ willChange: 'transform' }}
                    >
                      Start recovering invoices →
                    </Link>
                  </div>
                  <Link
                    href="/demo"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    See it in action
                  </Link>
                </motion.div>

                {/* Live money counter */}
                <motion.div variants={fadeUp}>
                  <LiveMoneyCounter />
                </motion.div>

                {/* Trust line */}
                <motion.p variants={fadeUp} className="text-sm text-gray-600">
                  14-day free trial · No credit card required · Cancel anytime
                </motion.p>
              </motion.div>
            </div>

            {/* Right col — 40%: Invoice Stack */}
            <div className="lg:col-span-2 flex justify-center">
              <div className="hidden lg:flex justify-center">
                <InvoiceStack />
              </div>
              <div className="lg:hidden flex justify-center" style={{ transform: 'scale(0.75)', transformOrigin: 'center top' }}>
                <InvoiceStack />
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <section className="border-y border-white/[0.04] bg-white/[0.015] py-10">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(s => (
              <CountUpStat key={s.label} stat={s} />
            ))}
          </div>
        </section>

        {/* ── How it works / Chase Timeline ── */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <RevealHeading>
              <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">
                How it works
              </p>
              <h2 className="text-4xl font-bold text-white">How Aria recovers your money</h2>
              <p className="mt-3 text-gray-500 max-w-xl mx-auto">
                A fully automated sequence from first reminder to final escalation.
              </p>
            </RevealHeading>
          </div>
          <ChaseTimeline />
        </section>

        {/* ── Features grid ── */}
        <section className="border-y border-white/[0.04] bg-white/[0.01] py-24">
          <div className="max-w-6xl mx-auto px-6">
            <Section>
              <motion.div variants={fadeUp} className="text-center mb-14">
                <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">
                  Features
                </p>
                <h2 className="text-4xl font-bold text-white">Everything you need to get paid</h2>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FEATURES.map(f => (
                  <motion.div
                    key={f.title}
                    variants={fadeUp}
                    className="group relative flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.05] hover:border-white/[0.12] hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-default overflow-hidden"
                  >
                    {/* Radial hover glow */}
                    <div
                      className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.06), transparent)',
                      }}
                      aria-hidden
                    />
                    <span className="text-2xl mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10">
                      {f.icon}
                    </span>
                    <div className="relative z-10">
                      <p className="font-semibold text-white text-sm mb-1">{f.title}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{f.body}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ── Aria typing demo ── */}
        <section className="relative overflow-hidden py-24">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.05), transparent 60%)' }}
            aria-hidden
          />
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <RevealHeading>
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-medium text-purple-400 mb-6">
                  ✦ Powered by Aria
                </div>
                <h2 className="text-4xl font-bold text-white">
                  See Aria write a follow-up in real time
                </h2>
                <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
                  Every message is crafted personally for each debtor. No templates. No
                  copy-paste. Ever.
                </p>
              </RevealHeading>
            </div>
            <AriaTyping />
          </div>
        </section>

        {/* ── Pricing ── */}
        <div
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.04), transparent 60%)' }}
        >
          <LandingPricing />
        </div>

        {/* ── Bottom CTA ── */}
        <section className="relative overflow-hidden py-24">
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(59,130,246,0.15), rgba(124,58,237,0.10), rgba(59,130,246,0.15))' }}
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
            aria-hidden
          />
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <Section>
              <motion.h2
                variants={fadeUp}
                className="text-5xl font-extrabold text-white leading-tight"
              >
                Ready to stop leaving<br />money on the table?
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-4 text-xl text-gray-400 max-w-xl mx-auto">
                Join thousands of businesses using Aria to recover invoices on autopilot.
                Start your free trial today.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-10 py-4 text-lg font-bold text-gray-900 hover:bg-gray-100 transition-all shadow-2xl hover:-translate-y-1 hover:shadow-white/10 duration-200"
                  style={{ willChange: 'transform' }}
                >
                  Start your free trial →
                </Link>
              </motion.div>
            </Section>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-white/[0.05] py-8 px-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <span>
              Pay<span className="text-blue-400">Pilot</span> © 2026.
            </span>
            <div className="flex flex-wrap justify-center gap-5">
              {[
                ['Demo', '/demo'],
                ['Log in', '/login'],
                ['Sign up', '/signup'],
                ['Privacy', '/privacy'],
                ['Terms', '/terms'],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="hover:text-gray-400 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

// ── Inline reveal wrapper for section headings ────────────────────────────────
// Kept at the bottom to avoid hoisting issues; used above via JSX

function RevealHeading({ children }: { children: React.ReactNode }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      initial={prefersReduced ? false : { opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : prefersReduced ? {} : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
