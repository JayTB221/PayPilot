import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do NOT add logic between createServerClient and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Public routes — no auth required ─────────────────────────────────────
  const publicPaths = ['/demo', '/forgot-password', '/reset-password', '/confirm-email', '/privacy', '/terms']
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return supabaseResponse
  }

  // ── Protect /dashboard/* ──────────────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const { data: tenant } = await supabase
      .from('tenants')
      .select('subscription_status, trial_ends_at')
      .eq('id', user.id)
      .single()

    const isActive = tenant?.subscription_status === 'active'
    const trialEndsAt = tenant?.trial_ends_at ? new Date(tenant.trial_ends_at) : null
    const isOnValidTrial = trialEndsAt !== null && trialEndsAt > new Date()

    if (!isActive && !isOnValidTrial) {
      const url = request.nextUrl.clone()
      url.pathname = '/subscribe'
      if (trialEndsAt && trialEndsAt <= new Date()) {
        url.searchParams.set('trial_expired', '1')
      }
      return NextResponse.redirect(url)
    }
  }

  // ── Redirect logged-in users away from auth pages ─────────────────────────
  if ((pathname === '/login' || pathname === '/signup') && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
