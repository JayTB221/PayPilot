'use client'

import { useState, useEffect, useRef } from 'react'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [count, setCount] = useState(0)

  // Test 1: Counter proves React state works
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Test 2: Canvas proves particles work
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let animId: number
    let x = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.beginPath()
      ctx.arc(x, 200, 20, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(99,102,241,0.8)'
      ctx.fill()
      x = (x + 2) % canvas.width
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <main style={{
      background: '#030712',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        color: 'white',
      }}>
        <h1 style={{
          fontSize: '80px',
          fontWeight: 900,
          background: 'linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          PayPilot
        </h1>
        <p style={{
          color: '#9ca3af',
          fontSize: '24px',
          marginTop: '16px',
        }}>
          Animations test page
        </p>
        <div style={{
          marginTop: '32px',
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#60a5fa',
        }}>
          {count}s
        </div>
        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
          counter — proves React state is running
        </p>
        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
          purple dot on canvas — proves canvas + RAF works
        </p>
      </div>
    </main>
  )
}
