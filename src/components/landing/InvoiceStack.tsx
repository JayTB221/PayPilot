'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// ── Types & data ──────────────────────────────────────────────────────────────

interface Invoice {
  readonly name: string
  readonly number: string
  readonly amount: string
  readonly days: number
}

type PaidPhase = 'overlay' | 'stamp' | 'slide' | 'reset' | 'fadein' | null

const INVOICES: readonly Invoice[] = [
  { name: 'Acme Electrical Co',  number: 'INV-1042', amount: '$3,200',  days: 47 },
  { name: 'Buildright Ltd',      number: 'INV-2891', amount: '$8,750',  days: 33 },
  { name: 'Horizon Plumbing',    number: 'INV-3654', amount: '$12,400', days: 22 },
  { name: 'Coastal Events Co',   number: 'INV-4127', amount: '$5,600',  days: 14 },
]

// Back card → front card. Rendered back-to-front so the front card DOM is last.
const STACK = [
  { top: 0,  left: 0,  zIndex: 4, opacity: 1.00 }, // index 0 — front
  { top: 8,  left: 8,  zIndex: 3, opacity: 0.80 }, // index 1
  { top: 16, left: 16, zIndex: 2, opacity: 0.65 }, // index 2
  { top: 24, left: 24, zIndex: 1, opacity: 0.50 }, // index 3 — back
] as const

// ── Envelope icon ─────────────────────────────────────────────────────────────

function EnvelopeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1" y="3" width="14" height="10" rx="1.5"
        stroke="rgba(255,255,255,0.75)" strokeWidth="1.2" />
      <path d="M1.5 3.5L8 9L14.5 3.5"
        stroke="rgba(255,255,255,0.75)" strokeWidth="1.2" />
    </svg>
  )
}

// ── Card face (shared between back cards and front card) ──────────────────────

function CardFace({ invoice }: { invoice: Invoice }) {
  return (
    <div
      style={{
        width: 280,
        background: 'linear-gradient(135deg, #0f0f23 0%, #13132b 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
      }}
    >
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-gray-600 uppercase tracking-widest">INVOICE</span>
        <span className="text-[10px] text-gray-500 font-mono">{invoice.number}</span>
      </div>
      <div className="border-t border-white/5 my-3" />
      <p className="text-sm font-semibold text-white/90">{invoice.name}</p>
      <p className="text-3xl font-bold text-white mt-1">{invoice.amount}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
        <span className="text-xs text-red-400">{invoice.days} days overdue</span>
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className="bg-red-500/15 border border-red-500/20 text-red-400 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
          OVERDUE
        </span>
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
          A
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function InvoiceStack() {
  const prefersReduced = useReducedMotion()
  const [showEmail, setShowEmail] = useState(false)
  const [paidPhase, setPaidPhase] = useState<PaidPhase>(null)
  const paidIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (prefersReduced) return

    // Envelope flies out every 2500ms
    const emailId = setInterval(() => {
      setShowEmail(true)
      setTimeout(() => setShowEmail(false), 1200)
    }, 2500)

    // Paid stamp sequence
    const runPaid = () => {
      setPaidPhase('overlay')                             // 0ms:    green wash
      setTimeout(() => setPaidPhase('stamp'),  400)       // 400ms:  PAID stamp
      setTimeout(() => setPaidPhase('slide'),  800)       // 800ms:  slide out
      setTimeout(() => setPaidPhase('reset'),  1300)      // 1300ms: hold off-screen
      setTimeout(() => setPaidPhase('fadein'), 1600)      // 1600ms: fade back in
      setTimeout(() => setPaidPhase(null),     2100)      // 2100ms: idle
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

  return (
    // Fixed container — 300×420px gives room for 280px card + 24px back-card offsets
    <div style={{ position: 'relative', width: 300, height: 420 }}>

      {/* Purple glow behind stack */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 400,
          height: 350,
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.2), transparent 70%)',
          filter: 'blur(40px)',
          zIndex: 0,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Back cards (indices 3, 2, 1) — plain divs, no JS animation ── */}
      {([3, 2, 1] as const).map(idx => {
        const pos = STACK[idx]
        return (
          <div
            key={INVOICES[idx].number}
            style={{
              position: 'absolute',
              top: pos.top,
              left: pos.left,
              zIndex: pos.zIndex,
              opacity: pos.opacity,
            }}
          >
            <CardFace invoice={INVOICES[idx]} />
          </div>
        )
      })}

      {/* ── Front card (index 0) — animated ── */}
      {/*
        Slide animation uses framer-motion `x`.
        CSS `top/left` positions the card in the stack (doesn't conflict with x).

        Phase states:
          null / overlay / stamp  → x:0, opacity:1  (visible, in place)
          slide                   → x:220, opacity:0 (slides right + fades)
          reset                   → x:220, opacity:0 (stays off-screen)
          fadein                  → x:0, opacity:1   (snaps to x:0, fades in)

        The snap-back during fadein is achieved with per-property transition:
          x  → duration:0   (instant)
          opacity → duration:0.4 (smooth fade)
      */}
      <motion.div
        initial={{ x: 0, opacity: 1 }}
        animate={
          prefersReduced
            ? { x: 0, opacity: 1 }
            : paidPhase === 'slide'
            ? { x: 220, opacity: 0 }
            : paidPhase === 'reset'
            ? { x: 220, opacity: 0 }
            : paidPhase === 'fadein'
            ? {
                x: 0,
                opacity: 1,
                transition: { x: { duration: 0 }, opacity: { duration: 0.4 } },
              }
            : { x: 0, opacity: 1 }
        }
        transition={
          paidPhase === 'slide'
            ? { duration: 0.5, ease: [0.4, 0, 1, 1] }
            : { duration: 0.4 }
        }
        style={{
          position: 'absolute',
          top: STACK[0].top,
          left: STACK[0].left,
          zIndex: STACK[0].zIndex,
        }}
      >
        {/* Float animation */}
        <motion.div
          animate={prefersReduced ? {} : { y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'relative' }}
        >
          {/* Paid overlay */}
          <AnimatePresence>
            {(paidPhase === 'overlay' || paidPhase === 'stamp' || paidPhase === 'slide') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 16,
                  background: 'rgba(34,197,94,0.2)',
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
                      animate={{ scale: 1, rotate: -12 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="text-green-400 text-base font-bold border-2 border-green-400/60 rounded px-3 py-1.5"
                    >
                      ✓ PAID
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Flying envelope */}
          {!prefersReduced && (
            <AnimatePresence>
              {showEmail && (
                <motion.div
                  key="env"
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    x: [0, 30, 70],
                    y: [0, -20, -60],
                    scale: [0.5, 1, 0.7],
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

          <CardFace invoice={INVOICES[0]} />
        </motion.div>
      </motion.div>
    </div>
  )
}
