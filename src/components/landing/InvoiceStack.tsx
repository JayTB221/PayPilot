'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

interface Invoice {
  readonly name: string
  readonly number: string
  readonly amount: string
  readonly days: number
}

type PaidPhase = 'overlay' | 'stamp' | 'slide' | 'reset' | 'fadein' | null

// ── Data ─────────────────────────────────────────────────────────────────────

const INVOICES: readonly Invoice[] = [
  { name: 'Acme Electrical Co',  number: 'INV-1042', amount: '$3,200',  days: 47 },
  { name: 'Buildright Ltd',      number: 'INV-2891', amount: '$8,750',  days: 33 },
  { name: 'Horizon Plumbing',    number: 'INV-3654', amount: '$12,400', days: 22 },
  { name: 'Coastal Events Co',   number: 'INV-4127', amount: '$5,600',  days: 14 },
]

const STACK_OFFSETS = [
  { z: 0,   x: 0,  y: 0  },
  { z: -8,  x: 6,  y: 6  },
  { z: -16, x: 12, y: 12 },
  { z: -24, x: 18, y: 18 },
]

// ── Envelope SVG ─────────────────────────────────────────────────────────────

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
  index: number
  showEmail: boolean
  paidPhase: PaidPhase
  prefersReduced: boolean
}

function StackCard({ invoice, index, showEmail, paidPhase, prefersReduced }: StackCardProps) {
  const off = STACK_OFFSETS[index]
  const isTop = index === 0

  const slideOut = isTop && (paidPhase === 'slide' || paidPhase === 'reset')
  const fadeBack = isTop && paidPhase === 'fadein'

  return (
    // Outer div places card in 3D stack space
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        transformStyle: 'preserve-3d',
        transform: `translateZ(${off.z}px) translateX(${off.x}px) translateY(${off.y}px)`,
      }}
    >
      {/* Inner motion.div handles the paid-slide animation */}
      <motion.div
        animate={
          prefersReduced
            ? {}
            : slideOut
            ? { x: 200, opacity: 0 }
            : fadeBack
            ? { x: 0, opacity: 1 }
            : { x: 0, opacity: 1 }
        }
        transition={{ duration: 0.5, ease: 'easeIn' }}
        style={{ willChange: 'transform, opacity', position: 'relative' }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #0f0f23 0%, #13132b 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 20,
            boxShadow:
              '0 25px 50px -12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* ── Paid overlay (green wash + stamp) ── */}
          <AnimatePresence>
            {isTop &&
              (paidPhase === 'overlay' ||
                paidPhase === 'stamp' ||
                paidPhase === 'slide') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 16,
                    background: 'rgba(34,197,94,0.18)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                          borderRadius: 4,
                          padding: '6px 12px',
                          color: '#4ade80',
                          fontSize: 14,
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                        }}
                      >
                        ✓ PAID
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
          </AnimatePresence>

          {/* ── Flying envelope ── */}
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
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 20,
                    pointerEvents: 'none',
                  }}
                >
                  <EnvelopeIcon />
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* ── Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.25)',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                fontWeight: 500,
              }}
            >
              INVOICE
            </span>
            <span
              style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}
            >
              {invoice.number}
            </span>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', margin: '12px 0' }} />

          {/* ── Debtor ── */}
          <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
            {invoice.name}
          </p>

          {/* ── Amount ── */}
          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'white',
              marginTop: 4,
              textShadow: '0 0 20px rgba(255,255,255,0.1)',
            }}
          >
            {invoice.amount}
          </p>

          {/* ── Overdue ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <span className="animate-pulse"
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#ef4444',
                flexShrink: 0,
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: 11, color: '#f87171', fontWeight: 500 }}>
              {invoice.days} days overdue
            </span>
          </div>

          {/* ── Bottom row ── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
            }}
          >
            <span
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171',
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '4px 10px',
                borderRadius: 999,
              }}
            >
              OVERDUE
            </span>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
                color: 'white',
              }}
            >
              A
            </div>
          </div>
        </div>
      </motion.div>
    </div>
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
      setTimeout(() => setPaidPhase('stamp'), 400)
      setTimeout(() => setPaidPhase('slide'), 700)
      setTimeout(() => setPaidPhase('reset'), 1200)
      setTimeout(() => setPaidPhase('fadein'), 2000)
      setTimeout(() => setPaidPhase(null), 2500)
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

  const cardWidth = isMobile ? 240 : 300
  const containerW = isMobile ? 260 : 320
  const containerH = isMobile ? 340 : 420

  // On mobile: no 3D rotation, just floating
  const rotation = isMobile
    ? 'none'
    : 'rotateX(12deg) rotateY(-20deg)'

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: containerW, height: containerH }}
    >
      {/* Purple glow */}
      <motion.div
        animate={prefersReduced ? {} : { opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: 500,
          height: 400,
          background:
            'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: 0,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Perspective wrapper */}
      <div
        style={{
          perspective: 1200,
          position: 'relative',
          zIndex: 1,
          width: '100%',
          paddingTop: isMobile ? 40 : 60,
        }}
      >
        {/* 3D rotation wrapper */}
        <div
          style={{
            transformStyle: 'preserve-3d',
            transform: rotation,
          }}
        >
          {/* Floating animation wrapper */}
          <motion.div
            animate={prefersReduced ? {} : { y: [0, -14, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              transformStyle: 'preserve-3d',
              position: 'relative',
              height: 200,
              willChange: 'transform',
              width: cardWidth,
            }}
          >
            {INVOICES.map((inv, idx) => (
              <StackCard
                key={inv.number}
                invoice={inv}
                index={idx}
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
