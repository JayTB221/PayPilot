import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Stripe requires the raw body for webhook signature verification
export const config = { api: { bodyParser: false } }

async function updateSubscriptionStatus(
  userId: string,
  status: string,
  subscriptionId?: string
) {
  const supabase = await createAdminClient()
  await supabase
    .from('tenants')
    .update({
      subscription_status: status,
      ...(subscriptionId ? { stripe_subscription_id: subscriptionId } : {}),
    })
    .eq('id', userId)
}

export async function POST(req: NextRequest) {
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

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = getUserId(session)
      if (userId && session.subscription) {
        await updateSubscriptionStatus(userId, 'active', session.subscription as string)
      }
      break
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
      const userId = getUserId(sub)
      if (userId) await updateSubscriptionStatus(userId, 'active', sub.id)
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
      const userId = getUserId(sub)
      if (userId) await updateSubscriptionStatus(userId, 'past_due')
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = getUserId(sub)
      if (userId) await updateSubscriptionStatus(userId, 'cancelled')
      break
    }
  }

  return NextResponse.json({ received: true })
}
