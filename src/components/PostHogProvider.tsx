'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'

let initialised = false

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key || initialised) return
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
      capture_pageview: false, // we'll fire manually below
      autocapture: true,
      persistence: 'localStorage',
    })
    initialised = true
  }, [])

  // Fire page_viewed on route change
  useEffect(() => {
    if (!initialised) return
    posthog.capture('page_viewed', {
      path: pathname,
      search: searchParams.toString(),
    })
  }, [pathname, searchParams])

  return <>{children}</>
}

// Typed helper so any component can track events
export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  try { posthog.capture(event, props) } catch { /* noop */ }
}
