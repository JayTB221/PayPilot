import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import type { PlanTier } from '@/lib/types'

const PRICE_IDS: Record<PlanTier, Record<'monthly' | 'annual', string>> = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_STARTER_ANNUAL  ?? '',
  },
  professional: {
    monthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL  ?? '',
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL  ?? '',
  },
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const planTier: PlanTier = body.planTier ?? 'professional'
  const billing: 'monthly' | 'annual' = body.billing ?? 'monthly'

  const priceId = PRICE_IDS[planTier]?.[billing]
  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe price not configured for ${planTier}/${billing}. Add the env var.` },
      { status: 500 }
    )
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('email, stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  let customerId = tenant.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: tenant.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('tenants').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`,
    subscription_data: {
      metadata: { supabase_user_id: user.id, plan_tier: planTier },
    },
  })

  return NextResponse.json({ url: session.url })
}
