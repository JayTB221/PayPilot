'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Invoice {
  readonly name: string
  readonly number: string
  readonly amount: string
  readonly days: number
}

type PaidPhase = 'overlay' | 'stamp' | 'slide' | 'reset' | 'fadein' | null

// ── Data ──────────────────────────────────────────────────────────────────────

const INVOICES: readonly Invoice[] = [
  { name: 'Acme Electrical Co', number: 'INV-1042', amount: '$3,200',  days: 47 },
  { name: 'Buildright Ltd',     number: 'INV-2891', amount: '$8,750',  days: 33 },
  { name: 'Horizon Plumbing',   number: 'INV-3654', amount: '$12,400', days: 22 },
  { name: 'Coastal Events Co',  number: 'INV-4127', amount: '$5,600',  days: 14 },
]

// 2D stack offsets — index 0 is the front card, rendered LAST in the DOM so it paints on top.
// Each card behind is shifted right + down and slightly dimmed.
const STACK = [
  { dx: 0,  dy: 0,  opacity: 1.00, zIndex: 40 },
  { dx: 8,  dy: 8,  opacity: 0.80, zIndex: 30 },
  { dx: 16, dy: 16, opacity: 0.60, zIndex: 20 },
  { dx: 24, dy: 24, opacity: 0.40, zIndex: 10 },
] as const

// ── Envelope icon ─────────────────────────────────────────────────────────────

function EnvelopeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1" y="3" width="14" height="10" rx="1.5"
        stroke="rgba(255,255,255,0.75)" strokeWidth="1.2" />
      <path d="M1.5 3.5L8 9L14.5 3.5"
        stroke="rgba(255,255,255,0.75)" strokeWidth="1.2" />
    </svg>
  )
}

// ── Single card ───────────────────────────────────────────────────────────────

interface StackCardProps {
  invoice: Invoice
  stackIndex: number
  showEmail: boolean
  paidPhase: PaidPhase
  prefersReduced: boolean
}

function StackCard({ invoice, stackIndex, showEmail, paidPhase, prefersReduced }: StackCardProps) {
  const cfg = STACK[stackIndex]
  const isTop = stackIndex === 0
  const slidingOut = isTop && (paidPhase === 'slide' || paidPhase === 'reset')

  return (
    <motion.div
      // Start at the correct stacked position immediately (no initial entrance animation)
      initial={{ x: cfg.dx, y: cfg.dy, opacity: cfg.opacity }}
      animate={
        prefersReduced
          ? { x: cfg.dx, y: cfg.dy, opacity: cfg.opacity }
          : slidingOut
          ? { x: cfg.dx + 280, y: cfg.dy - 20, opacity: 0 }
          : { x: cfg.dx, y: cfg.dy, opacity: cfg.opacity }
      }
      transition={
        slidingOut
          ? { duration: 0.5, ease: [0.4, 0, 1, 1] }
          : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
      }
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: cfg.zIndex,
        willChange: 'transform, opacity',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #0f0f23 0%, #13132b 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: 20,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Paid overlay */}
        <AnimatePresence>
          {isTop && (paidPhase === 'overlay' || paidPhase === 'stamp' || paidPhase === 'slide') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute', inset: 0, borderRadius: 16,
                background: 'rgba(34,197,94,0.18)', zIndex: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <AnimatePresence>
                {(paidPhase === 'stamp' || paidPhase === 'slide') && (
                  <motion.div
                    initial={{ scale: 0, rotate: -12 }}
                    animate={{ scale: [0, 1.1, 1], rotate: -12 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{
                      border: '2px solid rgba(74,222,128,0.6)',
                      borderRadius: 4, padding: '6px 12px',
                      color: '#4ade80', fontSize: 14,
                      fontWeight: 700, letterSpacing: '0.1em',
                    }}
                  >
                    ✓ PAID
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flying envelope */}
        {isTop && !prefersReduced && (
          <AnimatePresence>
            {showEmail && (
              <motion.div
                key="env"
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  x: [0, 40, 80],
                  y: [0, -30, -70],
                  scale: [0.5, 1, 0.8],
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  zIndex: 20, pointerEvents: 'none',
                }}
              >
                <EnvelopeIcon />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 500 }}>
            INVOICE
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
            {invoice.number}
          </span>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', margin: '12px 0' }} />

        <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
          {invoice.name}
        </p>
        <p style={{ fontSize: 28, fontWeight: 700, color: 'white', marginTop: 4, textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
          {invoice.amount}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <span
            className="animate-pulse"
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0, display: 'inline-block' }}
          />
          <span style={{ fontSize: 11, color: '#f87171', fontWeight: 500 }}>
            {invoice.days} days overdue
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 10px', borderRadius: 999 }}>
            OVERDUE
          </span>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white' }}>
            A
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function InvoiceStack() {
  const prefersReduced = useReducedMotion()
  const [showEmail, setShowEmail] = useState(false)
  const [paidPhase, setPaidPhase] = useState<PaidPhase>(null)
  const paidIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (prefersReduced) return

    const emailId = setInterval(() => {
      setShowEmail(true)
      setTimeout(() => setShowEmail(false), 1200)
    }, 2500)

    const runPaid = () => {
      setPaidPhase('overlay')
      setTimeout(() => setPaidPhase('stamp'),  400)
      setTimeout(() => setPaidPhase('slide'),  700)
      setTimeout(() => setPaidPhase('reset'),  1200)
      setTimeout(() => setPaidPhase('fadein'), 2000)
      setTimeout(() => setPaidPhase(null),     2500)
    }

    const delayId = setTimeout(() => {
      runPaid()
      paidIntervalRef.current = setInterval(runPaid, 6000)
    }, 3000)

    return () => {
      clearInterval(emailId)
      clearTimeout(delayId)
      if (paidIntervalRef.current) clearInterval(paidIntervalRef.current)
    }
  }, [prefersReduced])

  const cardW = isMobile ? 240 : 300
  // Container must be wide enough to show all 4 cards including the rightmost offset (24px)
  const containerW = cardW + 50
  const containerH = isMobile ? 340 : 420

  return (
    <div
      className="relative"
      style={{ width: containerW, height: containerH }}
    >
      {/* Purple glow */}
      <motion.div
        animate={prefersReduced ? {} : { opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
        style={{
          position: 'absolute', width: 500, height: 400,
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)',
          filter: 'blur(40px)', zIndex: 0,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Perspective + overall tilt */}
      <div
        style={{
          perspective: 1200,
          position: 'relative',
          zIndex: 1,
          paddingTop: isMobile ? 30 : 50,
          width: '100%',
        }}
      >
        <div
          style={{
            transform: isMobile ? 'none' : 'rotateX(10deg) rotateY(-18deg)',
          }}
        >
          {/* Floating up/down animation */}
          <motion.div
            animate={prefersReduced ? {} : { y: [0, -14, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'relative',
              height: 220,
              width: cardW,
              willChange: 'transform',
            }}
          >
            {/*
              Render from index 3 (back) down to 0 (front).
              The front card (index 0) is last in the DOM and therefore
              paints on top. Combined with explicit z-index this is
              robust across all browsers.
            */}
            {[3, 2, 1, 0].map(idx => (
              <StackCard
                key={INVOICES[idx].number}
                invoice={INVOICES[idx]}
                stackIndex={idx}
                showEmail={showEmail && idx === 0}
                paidPhase={idx === 0 ? paidPhase : null}
                prefersReduced={!!prefersReduced}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
