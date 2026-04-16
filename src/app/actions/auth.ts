'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────────────────────
//  Sign Up
//  1. Creates the Supabase Auth user
//  2. Inserts a row into public.tenants (needs service role to
//     bypass RLS — the user doesn't exist in the session yet)
//  3. Redirects to Stripe checkout (Step 6 will wire this up)
// ─────────────────────────────────────────────────────────────
export async function signUp(formData: FormData) {
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

  // Insert tenant row using admin client (bypasses RLS)
  const admin = await createAdminClient()
  const { error: tenantError } = await admin.from('tenants').insert({
    id: userId,
    email,
    business_name: businessName,
    owner_name: ownerName,
    subscription_status: 'inactive',
  })

  if (tenantError) {
    // Clean up the auth user so the email isn't stuck as "taken"
    await admin.auth.admin.deleteUser(userId)
    return redirect(`/signup?error=${encodeURIComponent(tenantError.message)}`)
  }

  // Stripe checkout redirect added in Step 6.
  // For now, send them to a holding page.
  return redirect('/subscribe?new=1')
}

// ─────────────────────────────────────────────────────────────
//  Log In
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
//  Log Out
// ─────────────────────────────────────────────────────────────
export async function logOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}
