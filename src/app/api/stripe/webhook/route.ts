import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import type { PlanTier } from '@/lib/types'

export const config = { api: { bodyParser: false } }

async function updateSubscription(
  userId: string,
  status: string,
  opts?: { subscriptionId?: string; planTier?: PlanTier }
) {
  const supabase = await createAdminClient()
  await supabase
    .from('tenants')
    .update({
      subscription_status: status,
      ...(opts?.subscriptionId ? { stripe_subscription_id: opts.subscriptionId } : {}),
      ...(opts?.planTier       ? { plan_tier: opts.planTier }                    : {}),
    })
    .eq('id', userId)
}

// Stripe webhook IPs — https://stripe.com/files/ips/ips_webhooks.txt
const STRIPE_IPS = new Set([
  '3.18.12.63','3.130.192.231','13.235.14.237','13.235.122.149','18.211.135.69',
  '35.154.171.200','52.15.183.38','54.88.130.119','54.88.130.122','54.187.174.169',
  '54.187.205.235','54.187.216.72',
])

export async function POST(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim()
  if (ip && !STRIPE_IPS.has(ip) && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const getUserId = (obj: { metadata?: Record<string, string> | null }) =>
    obj.metadata?.supabase_user_id

  const getPlanTier = (obj: { metadata?: Record<string, string> | null }): PlanTier =>
    (obj.metadata?.plan_tier as PlanTier) ?? 'starter'

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = getUserId(session)
      if (userId && session.subscription) {
        // Retrieve subscription to get plan metadata
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        await updateSubscription(userId, 'active', {
          subscriptionId: sub.id,
          planTier: getPlanTier(sub),
        })
      }
      break
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
      const userId = getUserId(sub)
      if (userId) await updateSubscription(userId, 'active', { subscriptionId: sub.id, planTier: getPlanTier(sub) })
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
      const userId = getUserId(sub)
      if (userId) await updateSubscription(userId, 'past_due')
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = getUserId(sub)
      if (userId) await updateSubscription(userId, 'cancelled')
      break
    }
  }

  return NextResponse.json({ received: true })
}
