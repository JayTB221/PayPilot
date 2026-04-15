import { createBrowserClient } from '@supabase/ssr'

/**
 * Use this in Client Components (anything with 'use client').
 * It reads the env vars that are exposed to the browser (NEXT_PUBLIC_*).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
