'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ── Data ──────────────────────────────────────────────────────────────────────

const CARDS = [
  { company: 'Coastal Events Co',  number: 'INV-4127', amount: '$5,600',  days: 14, top: 24, left: 24, opacity: 0.35, zIndex: 1 },
  { company: 'Horizon Plumbing',   number: 'INV-3654', amount: '$12,400', days: 22, top: 16, left: 16, opacity: 0.55, zIndex: 2 },
  { company: 'Buildright Ltd',     number: 'INV-2891', amount: '$8,750',  days: 33, top: 8,  left: 8,  opacity: 0.75, zIndex: 3 },
  { company: 'Acme Electrical Co', number: 'INV-1042', amount: '$3,200',  days: 47, top: 0,  left: 0,  opacity: 1,    zIndex: 4 },
]

const FEATURES = [
  { icon: '✉️', gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',  title: 'AI-written emails',     body: 'Aria crafts personalised, relationship-preserving emails for every debtor — not templates.' },
  { icon: '💬', gradient: 'linear-gradient(135deg,#7c3aed,#4c1d95)',  title: 'Automated SMS',         body: '94% of SMS messages are read within 3 minutes. Aria follows up by text when email doesn\'t work.' },
  { icon: '📈', gradient: 'linear-gradient(135deg,#059669,#064e3b)',  title: 'Escalation engine',     body: 'Tone adjusts automatically — friendly reminder to firm notice to final warning, hands-free.' },
  { icon: '📊', gradient: 'linear-gradient(135deg,#d97706,#92400e)',  title: 'Full audit trail',      body: 'Every contact attempt logged. Know exactly what was sent, when, and what happened next.' },
  { icon: '🔗', gradient: 'linear-gradient(135deg,#db2777,#831843)',  title: 'Xero integration',      body: 'Connects to Xero in 30 seconds. Invoices sync automatically — no manual data entry ever.' },
  { icon: '🛡️', gradient: 'linear-gradient(135deg,#0891b2,#164e63)', title: 'Pause anytime',         body: 'Pause recovery on any invoice instantly. You stay in full control — Aria handles the rest.' },
]

const STATS = [
  { value: '94',   suffix: '%',   label: 'invoices recovered' },
  { value: '2.4',  prefix: '$',   suffix: 'M', label: 'recovered this month' },
  { value: '48',   suffix: 'h',   label: 'average recovery time' },
  { value: '1200', suffix: '+',   label: 'businesses trust PayPilot' },
]

const PLANS = [
  { name: 'Starter',      price: '$49',   period: '/mo', desc: 'For freelancers and small businesses.', cta: 'Get started',     featured: false,
    features: ['Up to 20 invoices/month', 'Email chase sequences', 'Xero integration', 'Email support'] },
  { name: 'Professional', price: '$149',  period: '/mo', desc: 'For growing businesses with more volume.', cta: 'Start free trial', featured: true,
    features: ['Unlimited invoices', 'Email + SMS sequences', 'Priority support', 'Advanced analytics', 'Custom escalation rules', 'Team access'] },
  { name: 'Enterprise',   price: 'Custom', period: '',   desc: 'For large teams and custom requirements.', cta: 'Contact sales',   featured: false,
    features: ['Everything in Professional', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'White-label options'] },
]

// ── Mouse spotlight ───────────────────────────────────────────────────────────

function MouseSpotlight() {
  const [pos, setPos] = useState({ x: -9999, y: -9999 })

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2,
        background: `radial-gradient(700px circle at ${pos.x}px ${pos.y}px, rgba(124,58,237,0.10), transparent 40%)`,
        transition: 'background 0.05s',
      }}
    />
  )
}

// ── Canvas particles ──────────────────────────────────────────────────────────

function Particles() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    type P = { x: number; y: number; vx: number; vy: number; r: number; op: number; cr: number; cg: number; cb: number }
    const pts: P[] = Array.from({ length: 70 }, () => {
      const blue = Math.random() > 0.5
      return { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.25, vy: -(Math.random() * 0.35 + 0.1),
        r: Math.random() * 1.5 + 1.5, op: Math.random() * 0.4 + 0.15,
        cr: blue ? 59 : 124, cg: blue ? 130 : 58, cb: blue ? 246 : 237 }
    })

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width }
        if (p.x < -5) p.x = canvas.width + 5
        if (p.x > canvas.width + 5) p.x = -5
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.cr},${p.cg},${p.cb},${p.op})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={ref} aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }} />
}

// ── 3D glow card — magnetic tilt + inner light that follows mouse ─────────────

function GlowCard({ children, style: s, deg = 8 }: { children: React.ReactNode; style?: React.CSSProperties; deg?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [glow, setGlow] = useState({ x: 50, y: 50 })
  const [hov, setHov] = useState(false)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width   // 0‒1
    const ny = (e.clientY - r.top) / r.height
    setTilt({ rx: -(ny * 2 - 1) * deg, ry: (nx * 2 - 1) * deg })
    setGlow({ x: nx * 100, y: ny * 100 })
  }

  const onLeave = () => { setTilt({ rx: 0, ry: 0 }); setHov(false) }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={onLeave}
      style={{
        position: 'relative',
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${hov ? 1.025 : 1})`,
        transition: hov ? 'transform 0.08s ease-out' : 'transform 0.55s cubic-bezier(0.23,1,0.32,1)',
        willChange: 'transform',
        ...s,
      }}
    >
      {/* Inner mouse-following glow */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', zIndex: 1,
        background: `radial-gradient(180px circle at ${glow.x}% ${glow.y}%, rgba(124,58,237,${hov ? 0.18 : 0}), transparent 70%)`,
        transition: hov ? 'background 0.05s' : 'background 0.4s',
      }} />
      {children}
    </div>
  )
}

// ── Scroll reveal ─────────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, y = 28 }: { children: React.ReactNode; delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold: 0.08 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : `translateY(${y}px)`,
      transition: `opacity 0.75s ease ${delay}ms, transform 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

// ── Animated counter ──────────────────────────────────────────────────────────

function Counter({ value, prefix = '', suffix = '' }: { value: string; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState('0')
  const [started, setStarted] = useState(false)
  const target = parseFloat(value.replace(/,/g, ''))

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) { setStarted(true); obs.disconnect() } }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const dur = 1800
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      const cur = eased * target
      setDisplay(target % 1 !== 0 ? cur.toFixed(1) : Math.round(cur).toLocaleString())
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [started, target])

  return <span ref={ref}>{prefix}{display}{suffix}</span>
}

// ── Invoice card face ─────────────────────────────────────────────────────────

function CardFace({ card }: { card: typeof CARDS[0] }) {
  return (
    <div style={{ width: 280, background: 'linear-gradient(135deg,#0d0d1f,#111128)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 18, boxShadow: '0 20px 40px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.12em' }}>INVOICE</span>
        <span style={{ fontSize: 9, color: '#374151', fontFamily: 'monospace' }}>{card.number}</span>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '10px 0' }} />
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{card.company}</p>
      <p style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{card.amount}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef4444' }} />
        <span style={{ fontSize: 11, color: '#f87171' }}>{card.days} days overdue</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
        <span style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '3px 8px', borderRadius: 9999 }}>OVERDUE</span>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white' }}>A</div>
      </div>
    </div>
  )
}

// ── Invoice stack — 4 cards + RAF float on front + 3D tilt ───────────────────

function InvoiceStack() {
  const frontRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const y = Math.sin(((now - start) / 3000) * Math.PI * 2) * 10
      if (frontRef.current) frontRef.current.style.transform = `translateY(${y}px)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div style={{ position: 'relative', width: 320, height: 380, overflow: 'visible' }}>
      {/* Back cards — static */}
      {CARDS.slice(0, 3).map(card => (
        <div key={card.number} style={{ position: 'absolute', top: card.top, left: card.left, zIndex: card.zIndex, opacity: card.opacity }}>
          <CardFace card={card} />
        </div>
      ))}
      {/* Front card — float animation wrapper, tilt on top */}
      <div ref={frontRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 4 }}>
        <GlowCard deg={6}>
          <CardFace card={CARDS[3]} />
        </GlowCard>
      </div>
    </div>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ height: 1, background: 'linear-gradient(to right,transparent,rgba(255,255,255,0.07) 50%,transparent)' }} />
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [heroIn, setHeroIn] = useState(false)
  const [p1, setP1] = useState(false)
  const [p2, setP2] = useState(false)
  const [ctaHov, setCtaHov] = useState(false)

  useEffect(() => { const t = setTimeout(() => setHeroIn(true), 80); return () => clearTimeout(t) }, [])

  const heroItem = (delay: number): React.CSSProperties => ({
    opacity: heroIn ? 1 : 0,
    transform: heroIn ? 'none' : 'translateY(20px)',
    transition: `opacity 0.75s ease ${delay}ms, transform 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
  })

  return (
    <>
      <style>{`
        @keyframes gradientMove  { 0%{background-position:0% center} 100%{background-position:300% center} }
        @keyframes livePulse     { 0%,100%{box-shadow:0 0 6px #4ade80} 50%{box-shadow:0 0 16px #4ade80,0 0 30px #4ade8055} }
        @keyframes beamSweep     { 0%{left:-100%;opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{left:200%;opacity:0} }
        @keyframes shimmer       { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        * { box-sizing:border-box }
        @media(max-width:768px){
          .hgrid{grid-template-columns:1fr !important}
          .hstack{display:none !important}
          .sgrid{grid-template-columns:repeat(2,1fr) !important}
          .fgrid{grid-template-columns:1fr !important}
          .pgrid{grid-template-columns:1fr !important}
          .navlinks{display:none !important}
          .hbtns{justify-content:center !important}
        }
      `}</style>

      <MouseSpotlight />
      <Particles />

      <div style={{ background: '#030712', color: 'white', overflowX: 'hidden', position: 'relative', zIndex: 3 }}>

        {/* ── NAV ── */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(124,58,237,0.6) 50%,transparent)' }} />
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em' }}>PayPilot</span>
            <div className="navlinks" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <a href="#features" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, textDecoration: 'none' }}>Features</a>
              <a href="#pricing"  style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, textDecoration: 'none' }}>Pricing</a>
              <Link href="/login" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, textDecoration: 'none' }}>Log in</Link>
              <Link href="/signup" style={{ background: 'white', color: '#030712', fontSize: 14, fontWeight: 700, padding: '8px 18px', borderRadius: 8, textDecoration: 'none' }}>Get started</Link>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{ position: 'relative', overflow: 'hidden', padding: '140px 0 120px' }}>
          {/* Radial base */}
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -20%,rgba(120,119,198,0.35),transparent)', pointerEvents: 'none' }} />
          {/* Perspective grid */}
          <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 320, backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px)', backgroundSize: '50px 50px', transform: 'perspective(500px) rotateX(35deg)', transformOrigin: 'top', maskImage: 'linear-gradient(to bottom,transparent,black 25%,black 65%,transparent)', WebkitMaskImage: 'linear-gradient(to bottom,transparent,black 25%,black 65%,transparent)', pointerEvents: 'none' }} />
          {/* Orbs */}
          <div aria-hidden style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'rgba(124,58,237,0.14)', filter: 'blur(120px)', top: -300, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
          <div aria-hidden style={{ position: 'absolute', width: 450, height: 450, borderRadius: '50%', background: 'rgba(59,130,246,0.10)', filter: 'blur(90px)', top: 80, left: -120, pointerEvents: 'none' }} />
          <div aria-hidden style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'rgba(236,72,153,0.08)', filter: 'blur(90px)', top: 180, right: -60, pointerEvents: 'none' }} />
          {/* Noise */}
          <div aria-hidden style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />

          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
            <div className="hgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>

              <div>
                {/* Live pill */}
                <div style={{ ...heroItem(0), display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9999, padding: '6px 14px 6px 8px', marginBottom: 28 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', animation: 'livePulse 2s infinite' }} />
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Aria is recovering invoices right now</span>
                </div>

                {/* Headline */}
                <h1 style={{ ...heroItem(120), margin: 0, fontWeight: 900, lineHeight: 0.92, letterSpacing: '-0.04em', fontSize: 'clamp(52px,8vw,100px)' }}>
                  <span style={{ display: 'block', color: 'white' }}>Stop chasing.</span>
                  <span style={{ display: 'block', background: 'linear-gradient(135deg,#60a5fa 0%,#a78bfa 40%,#f472b6 70%,#60a5fa 100%)', backgroundSize: '300% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent', animation: 'gradientMove 4s linear infinite' }}>
                    Start recovering.
                  </span>
                </h1>

                <p style={{ ...heroItem(240), maxWidth: 460, fontSize: 18, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, fontWeight: 400, margin: '28px 0 44px' }}>
                  PayPilot's AI agent Aria automatically chases overdue invoices with personalised emails and SMS — so you never have to again.
                </p>

                <div className="hbtns" style={{ ...heroItem(360), display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link href="/signup" onMouseEnter={() => setP1(true)} onMouseLeave={() => setP1(false)} style={{ background: 'white', color: '#030712', fontWeight: 700, fontSize: 15, padding: '15px 30px', borderRadius: 10, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', boxShadow: p1 ? '0 0 0 1px rgba(255,255,255,0.25),0 24px 64px rgba(0,0,0,0.7)' : '0 0 0 1px rgba(255,255,255,0.12),0 20px 40px rgba(0,0,0,0.45)', transform: p1 ? 'scale(1.025)' : 'scale(1)', transition: 'all 0.2s ease' }}>
                    Start recovering invoices →
                  </Link>
                  <Link href="/demo" onMouseEnter={() => setP2(true)} onMouseLeave={() => setP2(false)} style={{ background: p2 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontWeight: 600, fontSize: 15, padding: '15px 30px', borderRadius: 10, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', transition: 'all 0.2s ease' }}>
                    Watch demo
                  </Link>
                </div>
              </div>

              <div className="hstack" style={{ ...heroItem(200), display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <InvoiceStack />
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* ── STATS ── */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(to right,transparent,rgba(124,58,237,0.06) 50%,transparent)', padding: '56px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <div className="sgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
              {STATS.map((s, i) => (
                <Reveal key={s.label} delay={i * 80}>
                  <div style={{ textAlign: 'center', padding: '0 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.03em', color: 'white' }}>
                      <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
                    </div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>{s.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ── FEATURES ── */}
        <section id="features" style={{ padding: '128px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 72 }}>
                <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, letterSpacing: '-0.03em' }}>Everything Aria does for you</h2>
                <p style={{ margin: 0, fontSize: 18, color: 'rgba(255,255,255,0.5)', maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>Aria works 24/7 chasing invoices while you focus on running your business.</p>
              </div>
            </Reveal>
            <div className="fgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * 60}>
                  <GlowCard style={{ height: '100%', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 28, overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: f.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 18 }}>{f.icon}</div>
                      <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: 'white' }}>{f.title}</h3>
                      <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{f.body}</p>
                    </div>
                  </GlowCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ── PRICING ── */}
        <section id="pricing" style={{ padding: '128px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 72 }}>
                <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, letterSpacing: '-0.03em' }}>Simple, transparent pricing</h2>
                <p style={{ margin: 0, fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>Start free. No credit card required.</p>
              </div>
            </Reveal>
            <div className="pgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, alignItems: 'start' }}>
              {PLANS.map((plan, i) => (
                <Reveal key={plan.name} delay={i * 80}>
                  <GlowCard deg={5} style={{ position: 'relative', background: plan.featured ? 'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(124,58,237,0.15))' : 'rgba(255,255,255,0.03)', border: plan.featured ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 32, overflow: 'hidden', boxShadow: plan.featured ? '0 0 0 1px rgba(99,102,241,0.1),0 30px 60px rgba(99,102,241,0.18),inset 0 1px 0 rgba(255,255,255,0.1)' : 'none' }}>
                    {/* Sweeping beam on featured */}
                    {plan.featured && (
                      <div aria-hidden style={{ position: 'absolute', top: 0, bottom: 0, width: '40%', background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.15),transparent)', animation: 'beamSweep 3.5s ease-in-out infinite', animationDelay: '1s' }} />
                    )}
                    {/* Top beam line */}
                    {plan.featured && <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.9),transparent)' }} />}
                    {/* Badge */}
                    {plan.featured && <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: 'white', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 14px', borderRadius: 9999, whiteSpace: 'nowrap' }}>Most popular</div>}
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>{plan.name}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                        <span style={{ fontSize: 58, fontWeight: 900, letterSpacing: '-0.04em', color: 'white' }}>{plan.price}</span>
                        {plan.period && <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>{plan.period}</span>}
                      </div>
                      <p style={{ margin: '0 0 28px', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{plan.desc}</p>
                      <Link href="/signup" style={{ display: 'block', textAlign: 'center', background: plan.featured ? 'white' : 'rgba(255,255,255,0.08)', color: plan.featured ? '#030712' : 'white', fontWeight: 700, fontSize: 15, padding: '13px 0', borderRadius: 10, textDecoration: 'none', marginBottom: 28, border: plan.featured ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>{plan.cta}</Link>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                        {plan.features.map(feat => (
                          <li key={feat} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                            <span style={{ color: '#4ade80', fontSize: 15, flexShrink: 0 }}>✓</span>{feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </GlowCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ── CTA ── */}
        <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(124,58,237,0.1),rgba(59,130,246,0.2))', borderTop: '1px solid rgba(99,102,241,0.2)', padding: '128px 0', textAlign: 'center' }}>
          <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
            <Reveal>
              <h2 style={{ margin: '0 0 20px', fontSize: 'clamp(36px,5vw,66px)', fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1.05 }}>
                The money is already yours.<br />Let Aria go get it.
              </h2>
              <p style={{ margin: '0 0 44px', fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                Join thousands of businesses recovering overdue invoices on autopilot. Start free today.
              </p>
              <Link href="/signup" onMouseEnter={() => setCtaHov(true)} onMouseLeave={() => setCtaHov(false)} style={{ background: 'white', color: '#030712', fontWeight: 700, fontSize: 16, padding: '17px 38px', borderRadius: 10, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', boxShadow: ctaHov ? '0 0 0 1px rgba(255,255,255,0.25),0 24px 64px rgba(0,0,0,0.7)' : '0 0 0 1px rgba(255,255,255,0.12),0 20px 40px rgba(0,0,0,0.45)', transform: ctaHov ? 'scale(1.025)' : 'scale(1)', transition: 'all 0.2s ease' }}>
                Start recovering invoices →
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '48px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>PayPilot</span>
            <div style={{ display: 'flex', gap: 28 }}>
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
