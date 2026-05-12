'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ── Invoice stack data ────────────────────────────────────────────────────────

const CARDS = [
  { company: 'Coastal Events Co',  number: 'INV-4127', amount: '$5,600',  days: 14, top: 24, left: 24, opacity: 0.35, zIndex: 1 },
  { company: 'Horizon Plumbing',   number: 'INV-3654', amount: '$12,400', days: 22, top: 16, left: 16, opacity: 0.55, zIndex: 2 },
  { company: 'Buildright Ltd',     number: 'INV-2891', amount: '$8,750',  days: 33, top: 8,  left: 8,  opacity: 0.75, zIndex: 3 },
  { company: 'Acme Electrical Co', number: 'INV-1042', amount: '$3,200',  days: 47, top: 0,  left: 0,  opacity: 1,    zIndex: 4 },
]

// ── Features ──────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: '✉️', gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',  title: 'AI-written emails',     body: 'Aria crafts personalised, relationship-preserving emails for every debtor — not templates.' },
  { icon: '💬', gradient: 'linear-gradient(135deg,#7c3aed,#4c1d95)',  title: 'Automated SMS',         body: '94% of SMS messages are read within 3 minutes. Aria follows up by text when email doesn\'t work.' },
  { icon: '📈', gradient: 'linear-gradient(135deg,#059669,#064e3b)',  title: 'Escalation engine',     body: 'Tone adjusts automatically over time — friendly reminder to firm notice to final warning.' },
  { icon: '📊', gradient: 'linear-gradient(135deg,#d97706,#92400e)',  title: 'Full audit trail',      body: 'Every contact attempt logged. Know exactly what was sent, when, and what happened.' },
  { icon: '🔗', gradient: 'linear-gradient(135deg,#db2777,#831843)',  title: 'Xero integration',      body: 'Connects to Xero in 30 seconds. Invoices sync automatically — no manual data entry.' },
  { icon: '🛡️', gradient: 'linear-gradient(135deg,#0891b2,#164e63)', title: 'Pause anytime',         body: 'Pause recovery on any invoice instantly. You stay in control — Aria handles the grunt work.' },
]

// ── Stats ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '94%',    label: 'invoices recovered' },
  { value: '$2.4M',  label: 'recovered this month' },
  { value: '48h',    label: 'average recovery time' },
  { value: '1,200+', label: 'businesses trust PayPilot' },
]

// ── Pricing ───────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: 'Starter', price: '$49', period: '/mo',
    desc: 'For freelancers and small businesses.',
    features: ['Up to 20 invoices/month', 'Email chase sequences', 'Xero integration', 'Email support'],
    cta: 'Get started', featured: false,
  },
  {
    name: 'Professional', price: '$149', period: '/mo',
    desc: 'For growing businesses with more volume.',
    features: ['Unlimited invoices', 'Email + SMS sequences', 'Priority support', 'Advanced analytics', 'Custom escalation rules', 'Team access'],
    cta: 'Start free trial', featured: true,
  },
  {
    name: 'Enterprise', price: 'Custom', period: '',
    desc: 'For large teams and custom requirements.',
    features: ['Everything in Professional', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'White-label options'],
    cta: 'Contact sales', featured: false,
  },
]

// ── Divider ───────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div style={{ height: 1, background: 'linear-gradient(to right,transparent,rgba(255,255,255,0.06) 50%,transparent)' }} />
  )
}

// ── Invoice card ──────────────────────────────────────────────────────────────

function InvoiceCard({ card }: { card: typeof CARDS[0] }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg,#0d0d1f,#111128)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16,
      padding: 18,
      boxShadow: '0 20px 40px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.05)',
      width: 280,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.12em' }}>INVOICE</span>
        <span style={{ fontSize: 9, color: '#374151', fontFamily: 'monospace' }}>{card.number}</span>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '10px 0' }} />
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{card.company}</p>
      <p style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{card.amount}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
        <span style={{ fontSize: 11, color: '#f87171' }}>{card.days} days overdue</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
        <span style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '3px 8px', borderRadius: 9999 }}>OVERDUE</span>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white' }}>A</div>
      </div>
    </div>
  )
}

// ── Invoice stack ─────────────────────────────────────────────────────────────

function InvoiceStack() {
  const frontRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const y = Math.sin(((now - start) / 1000 / 3) * Math.PI * 2) * 10
      if (frontRef.current) frontRef.current.style.transform = `translateY(${y}px)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div style={{ position: 'relative', width: 300, height: 360 }}>
      {CARDS.map((card, i) => (
        <div
          key={card.number}
          ref={i === 3 ? frontRef : undefined}
          style={{ position: 'absolute', top: card.top, left: card.left, opacity: card.opacity, zIndex: card.zIndex }}
        >
          <InvoiceCard card={card} />
        </div>
      ))}
    </div>
  )
}

// ── Feature card ──────────────────────────────────────────────────────────────

function FeatureCard({ f }: { f: typeof FEATURES[0] }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: hov ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
        borderRadius: 20,
        padding: 28,
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hov ? '0 20px 40px rgba(0,0,0,0.3)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: f.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>{f.icon}</div>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: 'white' }}>{f.title}</h3>
      <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{f.body}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [p1, setP1] = useState(false)
  const [p2, setP2] = useState(false)
  const [ctaHov, setCtaHov] = useState(false)

  return (
    <>
      <style>{`
        @keyframes gradientMove {
          0%   { background-position: 0% center; }
          100% { background-position: 300% center; }
        }
        @keyframes livePulse {
          0%,100% { opacity:1; box-shadow:0 0 8px #4ade80; }
          50%      { opacity:0.6; box-shadow:0 0 16px #4ade80; }
        }
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .hero-grid   { grid-template-columns: 1fr !important; text-align: center; }
          .hero-stack  { display: none !important; }
          .stats-grid  { grid-template-columns: repeat(2,1fr) !important; }
          .feat-grid   { grid-template-columns: 1fr !important; }
          .plan-grid   { grid-template-columns: 1fr !important; }
          .nav-links   { display: none !important; }
          .hero-btns   { justify-content: center !important; }
          .hero-pill   { justify-content: center !important; }
        }
      `}</style>

      <div style={{ background: '#030712', color: 'white', overflowX: 'hidden', minHeight: '100vh' }}>

        {/* ── NAV ── */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(3,7,18,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(124,58,237,0.5) 50%,transparent)' }} />
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>PayPilot</span>
            <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <a href="#features" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, textDecoration: 'none' }}>Features</a>
              <a href="#pricing"  style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, textDecoration: 'none' }}>Pricing</a>
              <Link href="/login" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, textDecoration: 'none' }}>Log in</Link>
              <Link href="/signup" style={{ background: 'white', color: '#030712', fontSize: 14, fontWeight: 700, padding: '8px 18px', borderRadius: 8, textDecoration: 'none' }}>Get started</Link>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{ position: 'relative', overflow: 'hidden', padding: '128px 0' }}>

          {/* Layer 1 — radial gradient */}
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -20%,rgba(120,119,198,0.3),transparent)', pointerEvents: 'none' }} />

          {/* Layer 2 — perspective grid */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0, height: 300,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
            backgroundSize: '50px 50px',
            transform: 'perspective(500px) rotateX(30deg)',
            transformOrigin: 'top',
            maskImage: 'linear-gradient(to bottom,transparent,black 30%,black 70%,transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom,transparent,black 30%,black 70%,transparent)',
            pointerEvents: 'none',
          }} />

          {/* Layer 3 — glow orbs */}
          <div aria-hidden style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', filter: 'blur(100px)', top: -200, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
          <div aria-hidden style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(59,130,246,0.1)',  filter: 'blur(80px)',  top: 100,  left: -100, pointerEvents: 'none' }} />
          <div aria-hidden style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'rgba(236,72,153,0.08)', filter: 'blur(80px)',  top: 200,  right: -50, pointerEvents: 'none' }} />

          {/* Layer 4 — noise */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }} />

          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
            <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

              {/* Left — text */}
              <div>
                {/* Live pill */}
                <div className="hero-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9999, padding: '6px 14px 6px 8px', marginBottom: 24 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', animation: 'livePulse 2s infinite' }} />
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Aria is recovering invoices right now</span>
                </div>

                {/* Headline */}
                <h1 style={{ margin: 0, fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.04em', fontSize: 'clamp(48px,8vw,96px)' }}>
                  <span style={{ display: 'block', color: 'white' }}>Stop chasing.</span>
                  <span style={{
                    display: 'block',
                    background: 'linear-gradient(135deg,#60a5fa 0%,#a78bfa 40%,#f472b6 70%,#60a5fa 100%)',
                    backgroundSize: '300% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent',
                    animation: 'gradientMove 4s linear infinite',
                  }}>
                    Start recovering.
                  </span>
                </h1>

                {/* Subheading */}
                <p style={{ maxWidth: 480, fontSize: 18, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, fontWeight: 400, margin: '24px 0 40px' }}>
                  PayPilot's AI agent Aria automatically chases overdue invoices with personalised emails and SMS — so you never have to again.
                </p>

                {/* CTAs */}
                <div className="hero-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link
                    href="/signup"
                    onMouseEnter={() => setP1(true)}
                    onMouseLeave={() => setP1(false)}
                    style={{
                      background: 'white', color: '#030712', fontWeight: 700, fontSize: 15,
                      padding: '14px 28px', borderRadius: 10, textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
                      boxShadow: p1 ? '0 0 0 1px rgba(255,255,255,0.2),0 20px 60px rgba(0,0,0,0.6)' : '0 0 0 1px rgba(255,255,255,0.1),0 20px 40px rgba(0,0,0,0.4)',
                      transform: p1 ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Start recovering invoices →
                  </Link>
                  <Link
                    href="/demo"
                    onMouseEnter={() => setP2(true)}
                    onMouseLeave={() => setP2(false)}
                    style={{
                      background: p2 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontWeight: 600, fontSize: 15,
                      padding: '14px 28px', borderRadius: 10, textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Watch demo
                  </Link>
                </div>
              </div>

              {/* Right — invoice stack */}
              <div className="hero-stack" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <InvoiceStack />
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* ── STATS ── */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(to right,transparent,rgba(124,58,237,0.05) 50%,transparent)', padding: '48px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
              {STATS.map((s, i) => (
                <div key={s.label} style={{ textAlign: 'center', padding: '0 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-0.02em', color: 'white' }}>{s.value}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ── FEATURES ── */}
        <section id="features" style={{ padding: '128px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, letterSpacing: '-0.03em' }}>Everything Aria does for you</h2>
              <p style={{ margin: 0, fontSize: 18, color: 'rgba(255,255,255,0.5)', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>Aria works 24/7 chasing invoices while you focus on running your business.</p>
            </div>
            <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {FEATURES.map(f => <FeatureCard key={f.title} f={f} />)}
            </div>
          </div>
        </section>

        <Divider />

        {/* ── PRICING ── */}
        <section id="pricing" style={{ padding: '128px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, letterSpacing: '-0.03em' }}>Simple, transparent pricing</h2>
              <p style={{ margin: 0, fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>Start free. No credit card required.</p>
            </div>
            <div className="plan-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, alignItems: 'start' }}>
              {PLANS.map(plan => (
                <div key={plan.name} style={{
                  position: 'relative',
                  background: plan.featured ? 'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(124,58,237,0.15))' : 'rgba(255,255,255,0.03)',
                  border: plan.featured ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 20,
                  padding: 32,
                  boxShadow: plan.featured ? '0 0 0 1px rgba(99,102,241,0.1),0 30px 60px rgba(99,102,241,0.15),inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
                }}>
                  {/* Light beam */}
                  {plan.featured && (
                    <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.8),transparent)', borderRadius: '20px 20px 0 0' }} />
                  )}
                  {/* Badge */}
                  {plan.featured && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: 'white', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 14px', borderRadius: 9999 }}>Most popular</div>
                  )}
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                    <span style={{ fontSize: 56, fontWeight: 900, letterSpacing: '-0.03em', color: 'white' }}>{plan.price}</span>
                    {plan.period && <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>{plan.period}</span>}
                  </div>
                  <p style={{ margin: '0 0 24px', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{plan.desc}</p>
                  <Link href="/signup" style={{
                    display: 'block', textAlign: 'center',
                    background: plan.featured ? 'white' : 'rgba(255,255,255,0.08)',
                    color: plan.featured ? '#030712' : 'white',
                    fontWeight: 700, fontSize: 15, padding: '12px 0', borderRadius: 10, textDecoration: 'none', marginBottom: 28,
                    border: plan.featured ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  }}>{plan.cta}</Link>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {plan.features.map(feat => (
                      <li key={feat} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                        <span style={{ color: '#4ade80', fontSize: 16, lineHeight: 1, flexShrink: 0 }}>✓</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ── CTA ── */}
        <section style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(124,58,237,0.1),rgba(59,130,246,0.2))', borderTop: '1px solid rgba(99,102,241,0.2)', padding: '128px 0', textAlign: 'center' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 'clamp(36px,5vw,64px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
              The money is already yours.<br />Let Aria go get it.
            </h2>
            <p style={{ margin: '0 0 40px', fontSize: 18, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              Join thousands of businesses recovering overdue invoices on autopilot. Start free today.
            </p>
            <Link
              href="/signup"
              onMouseEnter={() => setCtaHov(true)}
              onMouseLeave={() => setCtaHov(false)}
              style={{
                background: 'white', color: '#030712', fontWeight: 700, fontSize: 16,
                padding: '16px 36px', borderRadius: 10, textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
                boxShadow: ctaHov ? '0 0 0 1px rgba(255,255,255,0.2),0 20px 60px rgba(0,0,0,0.6)' : '0 0 0 1px rgba(255,255,255,0.1),0 20px 40px rgba(0,0,0,0.4)',
                transform: ctaHov ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
            >
              Start recovering invoices →
            </Link>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '48px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>PayPilot</span>
            <div style={{ display: 'flex', gap: 32 }}>
              <Link href="/privacy" style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacy</Link>
              <Link href="/terms"   style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Terms</Link>
              <a href="mailto:hello@paypilot.ai" style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Contact</a>
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>© 2026 PayPilot. All rights reserved.</span>
          </div>
        </footer>

      </div>
    </>
  )
}
