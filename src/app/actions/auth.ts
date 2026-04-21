'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'

export async function signUp(formData: FormData) {
  const hdrs = await headers()
  const ip = hdrs.get('x-forwarded-for') ?? 'unknown'
  const { allowed } = rateLimit(`signup:${ip}`, 5, 60 * 60 * 1000) // 5/hr per IP
  if (!allowed) {
    return redirect('/signup?error=Too+many+attempts+%E2%80%94+please+try+again+in+an+hour')
  }
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const businessName = formData.get('business_name') as string
  const ownerName = formData.get('owner_name') as string

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  const userId = data.user?.id
  if (!userId) {
    return redirect('/signup?error=Signup+failed+-+please+try+again')
  }

  const admin = await createAdminClient()
  const { error: tenantError } = await admin.from('tenants').insert({
    id: userId,
    email,
    business_name: businessName,
    owner_name: ownerName,
    subscription_status: 'inactive',
  })

  if (tenantError) {
    await admin.auth.admin.deleteUser(userId)
    return redirect(`/signup?error=${encodeURIComponent(tenantError.message)}`)
  }

  return redirect(`/confirm-email?email=${encodeURIComponent(email)}`)
}

export async function logIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  return redirect('/dashboard')
}

export async function logOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })

  return redirect('/forgot-password?sent=1')
}

export async function resendConfirmation(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()

  await supabase.auth.resend({ type: 'signup', email })

  return redirect(`/confirm-email?email=${encodeURIComponent(email)}&resent=1`)
}
