'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// ── Email content ─────────────────────────────────────────────────────────────

const FULL_TEXT =
  `Hi Sarah,

I hope you are well. I am reaching out regarding Invoice #1042 for $3,200 which was due on 15 March.

I am sure it has just slipped through the cracks — could you let me know when we can expect payment? I am happy to answer any questions you might have.

Kind regards,
Aria
On behalf of Acme Electrical Co`

const CHAR_DELAY_MS = 25

// ── State machine ─────────────────────────────────────────────────────────────

type Phase =
  | 'typing'
  | 'pause'
  | 'sending'
  | 'delivered'
  | 'replied'
  | 'resetting'

// ── Sub-components ────────────────────────────────────────────────────────────

function TrafficDots() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-full bg-red-500/70" />
      <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
      <span className="w-3 h-3 rounded-full bg-green-500/70" />
    </div>
  )
}

interface CursorProps { visible: boolean }
function Cursor({ visible }: CursorProps) {
  if (!visible) return null
  return (
    <motion.span
      aria-hidden
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1, repeat: Infinity }}
      className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 align-middle"
    />
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function AriaTyping() {
  const prefersReduced = useReducedMotion()
  const [displayText, setDisplayText] = useState('')
  const [phase, setPhase] = useState<Phase>('typing')
  const [progressW, setProgressW] = useState(0)
  const [showReply, setShowReply] = useState(false)
  const charRef = useRef(0)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  function clearAllTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function addTimer(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
    return id
  }

  // Typewriter effect
  useEffect(() => {
    if (phase !== 'typing') return

    // If reduced motion: just show all text immediately
    if (prefersReduced) {
      setDisplayText(FULL_TEXT)
      addTimer(() => setPhase('sending'), 400)
      return
    }

    let intervalId: ReturnType<typeof setInterval>

    intervalId = setInterval(() => {
      charRef.current++
      setDisplayText(FULL_TEXT.slice(0, charRef.current))
      if (charRef.current >= FULL_TEXT.length) {
        clearInterval(intervalId)
        addTimer(() => setPhase('pause'), 0)
      }
    }, CHAR_DELAY_MS)

    return () => clearInterval(intervalId)
  }, [phase, prefersReduced])

  // Pause → sending
  useEffect(() => {
    if (phase !== 'pause') return
    const id = addTimer(() => setPhase('sending'), 800)
    return () => clearTimeout(id)
  }, [phase])

  // Sending: animate progress bar
  useEffect(() => {
    if (phase !== 'sending') return
    setProgressW(0)
    const id = addTimer(() => {
      setProgressW(100)
      addTimer(() => setPhase('delivered'), 900)
    }, 50)
    return () => clearTimeout(id)
  }, [phase])

  // Delivered → show reply after 1200ms
  useEffect(() => {
    if (phase !== 'delivered') return
    const id = addTimer(() => {
      setShowReply(true)
      setPhase('replied')
    }, 1200)
    return () => clearTimeout(id)
  }, [phase])

  // Replied: reset after 3000ms
  useEffect(() => {
    if (phase !== 'replied') return
    const id = addTimer(() => setPhase('resetting'), 3000)
    return () => clearTimeout(id)
  }, [phase])

  // Reset sequence
  useEffect(() => {
    if (phase !== 'resetting') return
    // Slide reply out
    setShowReply(false)
    const id = addTimer(() => {
      // Reset and restart
      charRef.current = 0
      setDisplayText('')
      setProgressW(0)
      setPhase('typing')
    }, 1200)
    return () => clearTimeout(id)
  }, [phase])

  useEffect(() => {
    return () => clearAllTimers()
  }, [])

  const showCursor = phase === 'typing'
  const showProgress = phase === 'sending' || phase === 'delivered' || phase === 'replied'
  const showDelivered = phase === 'delivered' || phase === 'replied'
  const textVisible = phase !== 'resetting'

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Purple glow behind card */}
      <div
        className="absolute -z-10 pointer-events-none"
        style={{
          width: 600,
          height: 400,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        aria-hidden
      />

      {/* Email card */}
      <div
        className="relative overflow-hidden"
        style={{
          background: '#080818',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20,
          boxShadow:
            '0 50px 100px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-4"
          style={{
            height: 44,
            background: '#0d0d1e',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <TrafficDots />
          <span className="text-xs text-gray-600">New Message — Aria</span>
          <div className="w-16" />
        </div>

        {/* Email headers */}
        <div
          className="space-y-2 px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          {[
            { label: 'From', value: 'aria@paypilot.app' },
            { label: 'To', value: 'sarah@acmeelectrical.co.nz' },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-14 font-medium">{row.label}</span>
              <span className="text-xs text-gray-300">{row.value}</span>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 w-14 font-medium">Subject</span>
            <span className="text-sm font-medium text-white">
              Invoice #1042 — Friendly Reminder
            </span>
          </div>
        </div>

        {/* Email body */}
        <div className="relative px-5 py-5" style={{ minHeight: 220 }}>
          <AnimatePresence>
            {textVisible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p
                  className="text-sm text-gray-300"
                  style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}
                >
                  {displayText}
                  <Cursor visible={showCursor} />
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress bar */}
          <AnimatePresence>
            {showProgress && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                <motion.div
                  className="h-full"
                  style={{
                    background: 'linear-gradient(to right, #3b82f6, #7c3aed)',
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progressW}%` }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sending indicator */}
          <AnimatePresence>
            {phase === 'sending' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-3 right-4 flex items-center gap-1.5"
              >
                <div
                  className="w-3 h-3 rounded-full border border-blue-400 animate-spin"
                  style={{ borderTopColor: 'transparent' }}
                />
                <span className="text-xs text-blue-400">Aria is sending...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delivered badge */}
          <AnimatePresence>
            {showDelivered && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="absolute bottom-4 right-4 flex items-center gap-1.5 text-xs text-green-400 rounded-full px-3 py-1.5"
                style={{
                  background: 'rgba(34,197,94,0.15)',
                  border: '1px solid rgba(34,197,94,0.25)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M2 6l3 3 5-5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Delivered successfully
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Reply notification — slides in from right */}
      <AnimatePresence>
        {showReply && (
          <motion.div
            initial={{ x: 340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 340, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="absolute top-4 right-4"
            style={{
              width: 280,
              background: '#12122a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: 14,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              zIndex: 10,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                  }}
                >
                  S
                </div>
                <span className="text-xs font-semibold text-white">Sarah</span>
              </div>
              <span className="text-[10px] text-gray-600">just now</span>
            </div>

            {/* Message */}
            <p className="text-sm text-gray-300 leading-relaxed">
              So sorry! I completely forgot. Paying now 🙏
            </p>

            {/* Payment indicator */}
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"
              />
              <span className="text-xs text-green-400 font-medium">
                $3,200 payment initiated
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
