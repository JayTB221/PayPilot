'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  r: number
  g: number
  b: number
}

export function Particles() {
  const prefersReduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    console.log('Particles mounted')

    if (prefersReduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // 50 particles, brighter and more visible
    particlesRef.current = Array.from({ length: 50 }, () => {
      const isBlue = Math.random() > 0.5
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 2,        // 2–3.5px
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.3 + 0.3,   // 0.3–0.6
        r: isBlue ? 59 : 124,
        g: isBlue ? 130 : 58,
        b: isBlue ? 246 : 237,
      }
    })

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particlesRef.current) {
        p.y -= p.speed
        if (p.y < -5) {
          p.y = canvas.height + 5
          p.x = Math.random() * canvas.width
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.opacity})`
        ctx.fill()
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [prefersReduced])

  if (prefersReduced) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  )
}
