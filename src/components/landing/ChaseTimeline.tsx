'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// ── Types & data ──────────────────────────────────────────────────────────────

type Side = 'left' | 'right'

interface NodeColor {
  bg: string
  border: string
  glow: string
  text: string
  tagBg: string
}

interface TimelineNode {
  day: string
  side: Side
  color: NodeColor
  icon: 'email' | 'sms' | 'escalate' | 'alert'
  title: string
  body: string
  tag: string
}

const NODES: readonly TimelineNode[] = [
  {
    day: 'DAY 1',
    side: 'left',
    color: {
      bg: 'rgba(59,130,246,0.15)',
      border: 'rgba(59,130,246,0.4)',
      glow: 'rgba(59,130,246,0.2)',
      text: '#60a5fa',
      tagBg: 'rgba(59,130,246,0.1)',
    },
    icon: 'email',
    title: 'Aria sends a friendly reminder',
    body: 'Warm, personalised email written specifically for this debtor. Assumes it slipped their mind. Professional and relationship-preserving.',
    tag: 'Email',
  },
  {
    day: 'DAY 7',
    side: 'right',
    color: {
      bg: 'rgba(124,58,237,0.15)',
      border: 'rgba(124,58,237,0.4)',
      glow: 'rgba(124,58,237,0.2)',
      text: '#a78bfa',
      tagBg: 'rgba(124,58,237,0.1)',
    },
    icon: 'sms',
    title: 'SMS follow-up fires automatically',
    body: 'A direct text to their mobile. Short, clear, impossible to ignore. 94% of SMS messages are read within 3 minutes of being received.',
    tag: 'SMS',
  },
  {
    day: 'DAY 21',
    side: 'left',
    color: {
      bg: 'rgba(251,191,36,0.15)',
      border: 'rgba(251,191,36,0.4)',
      glow: 'rgba(251,191,36,0.2)',
      text: '#fbbf24',
      tagBg: 'rgba(251,191,36,0.1)',
    },
    icon: 'escalate',
    title: 'Firm notice sent automatically',
    body: 'Tone escalates based on your settings. Aria references previous contact attempts, sets a clear payment deadline 7 days away. Firm but always professional.',
    tag: 'Escalation',
  },
  {
    day: 'DAY 45',
    side: 'right',
    color: {
      bg: 'rgba(239,68,68,0.15)',
      border: 'rgba(239,68,68,0.4)',
      glow: 'rgba(239,68,68,0.2)',
      text: '#f87171',
      tagBg: 'rgba(239,68,68,0.1)',
    },
    icon: 'alert',
    title: 'You get alerted to take action',
    body: 'Aria flags the invoice in your dashboard. She has done everything she can — now it is your call whether to involve a collection agency or write it off. Full audit trail included.',
    tag: 'Alert',
  },
]

// ── Icons ─────────────────────────────────────────────────────────────────────

function NodeIcon({ type, color }: { type: TimelineNode['icon']; color: string }) {
  const cls = `w-5 h-5`
  if (type === 'email')
    return (
      <svg className={cls} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" aria-hidden>
        <rect x="2" y="4" width="16" height="12" rx="2" />
        <path d="M2 7l8 5 8-5" />
      </svg>
    )
  if (type === 'sms')
    return (
      <svg className={cls} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" aria-hidden>
        <path d="M2 3h16a1 1 0 011 1v9a1 1 0 01-1 1H6l-4 3V4a1 1 0 011-1z" />
      </svg>
    )
  if (type === 'escalate')
    return (
      <svg className={cls} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" aria-hidden>
        <path d="M10 3v10M5 8l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 17h12" strokeLinecap="round" />
      </svg>
    )
  // alert
  return (
    <svg className={cls} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" aria-hidden>
      <path d="M10 2l8 14H2L10 2z" strokeLinejoin="round" />
      <path d="M10 8v4M10 14.5v.5" strokeLinecap="round" />
    </svg>
  )
}

// ── Content card ──────────────────────────────────────────────────────────────

function ContentCard({ node, visible }: { node: TimelineNode; visible: boolean }) {
  const prefersReduced = useReducedMotion()
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, x: node.side === 'left' ? -40 : 40 }}
      animate={visible ? { opacity: 1, x: 0 } : {}}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      style={{ willChange: 'transform, opacity' }}
      className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 backdrop-blur-sm max-w-[260px] w-full"
    >
      <p className="text-sm font-semibold text-white mb-2">{node.title}</p>
      <p className="text-xs text-gray-400 leading-relaxed">{node.body}</p>
      <span
        className="mt-3 inline-block text-[10px] rounded-full px-2 py-0.5 font-medium"
        style={{ background: node.color.tagBg, color: node.color.text }}
      >
        {node.tag}
      </span>
    </motion.div>
  )
}

// ── Circle node ───────────────────────────────────────────────────────────────

function CircleNode({ node, visible }: { node: TimelineNode; visible: boolean }) {
  const prefersReduced = useReducedMotion()
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, scale: 0.5 }}
      animate={visible ? { opacity: 1, scale: 1 } : {}}
      transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }}
      className="flex flex-col items-center gap-2"
      style={{ willChange: 'transform, opacity' }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: node.color.bg,
          border: `2px solid ${node.color.border}`,
          boxShadow: `0 0 20px ${node.color.glow}`,
        }}
      >
        <NodeIcon type={node.icon} color={node.color.text} />
      </div>
      <span
        className="text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: node.color.text }}
      >
        {node.day}
      </span>
    </motion.div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function ChaseTimeline() {
  const prefersReduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [lineH, setLineH] = useState(0)
  const [visibleNodes, setVisibleNodes] = useState<boolean[]>([false, false, false, false])

  // Measure container to size the vertical line
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(() => {
      if (containerRef.current) setLineH(containerRef.current.scrollHeight)
    })
    ro.observe(containerRef.current)
    setLineH(containerRef.current.scrollHeight)
    return () => ro.disconnect()
  }, [])

  // IntersectionObserver to trigger animations
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          // Stagger nodes: 0ms, 450ms, 900ms, 1350ms
          NODES.forEach((_, i) => {
            setTimeout(() => {
              setVisibleNodes(prev => {
                const next = [...prev]
                next[i] = true
                return next
              })
            }, i * 450)
          })
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="relative">

      {/* ── Desktop layout ── */}
      <div className="hidden md:block">
        {/* Animated vertical centre line */}
        <div
          className="absolute left-1/2 top-6 -translate-x-1/2 w-0.5 overflow-hidden"
          style={{ height: lineH > 0 ? lineH - 24 : '100%' }}
          aria-hidden
        >
          <motion.div
            className="w-full h-full origin-top"
            style={{
              background: 'linear-gradient(to bottom, #3b82f6, #7c3aed, #ef4444)',
              willChange: 'transform',
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: inView && !prefersReduced ? 1 : prefersReduced ? 1 : 0 }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          />
        </div>

        {/* Nodes */}
        <div className="space-y-16">
          {NODES.map((node, i) => (
            <div key={node.day} className="grid grid-cols-5 items-start gap-0">
              {/* Left content */}
              <div className="col-span-2 flex justify-end pr-8 pt-1">
                {node.side === 'left' ? (
                  <ContentCard node={node} visible={visibleNodes[i]} />
                ) : null}
              </div>

              {/* Centre circle */}
              <div className="col-span-1 flex justify-center">
                <CircleNode node={node} visible={visibleNodes[i]} />
              </div>

              {/* Right content */}
              <div className="col-span-2 pl-8 pt-1">
                {node.side === 'right' ? (
                  <ContentCard node={node} visible={visibleNodes[i]} />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="md:hidden relative">
        {/* Left-edge line */}
        <div
          className="absolute top-6 bottom-0 overflow-hidden"
          style={{ left: 20, width: 2 }}
          aria-hidden
        >
          <motion.div
            className="w-full h-full origin-top"
            style={{
              background: 'linear-gradient(to bottom, #3b82f6, #7c3aed, #ef4444)',
              willChange: 'transform',
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: inView && !prefersReduced ? 1 : prefersReduced ? 1 : 0 }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          />
        </div>

        <div className="space-y-10">
          {NODES.map((node, i) => (
            <div key={node.day} className="flex items-start gap-5" style={{ paddingLeft: 10 }}>
              {/* Circle */}
              <div className="flex-shrink-0" style={{ marginTop: 2 }}>
                <CircleNode node={node} visible={visibleNodes[i]} />
              </div>
              {/* Card */}
              <div className="flex-1 pt-1">
                <ContentCard node={node} visible={visibleNodes[i]} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
