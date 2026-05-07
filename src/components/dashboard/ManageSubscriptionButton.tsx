'use client'

import { useState } from 'react'

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleClick() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Could not open billing portal.')
        setLoading(false)
      }
    } catch {
      setError('Network error — please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-sm font-medium text-blue-600 hover:text-blue-800 underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Opening portal…' : 'Manage subscription →'}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
