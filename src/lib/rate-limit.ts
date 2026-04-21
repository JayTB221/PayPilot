// In-memory rate limiter — resets on cold start, sufficient for Fluid Compute
// Use Redis for distributed rate limiting if needed at scale.

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count }
}

export function rateLimitResponse(remaining: number = 0) {
  return new Response(
    JSON.stringify({ error: 'Too many requests — please try again later.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60',
        'X-RateLimit-Remaining': String(remaining),
      },
    }
  )
}
