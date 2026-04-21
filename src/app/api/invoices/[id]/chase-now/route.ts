import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS } from '@/lib/utils'
import type { PlanTier } from '@/lib/types'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch tenant to check plan limits
  const { data: tenant } = await supabase
    .from('tenants')
    .select('plan_tier, usage_this_month')
    .eq('id', user.id)
    .single()

  const tier = (tenant?.plan_tier ?? 'starter') as PlanTier
  const limits = PLAN_LIMITS[tier]
  const usageThisMonth = tenant?.usage_this_month ?? 0

  if (usageThisMonth >= limits.invoices) {
    return NextResponse.json(
      { error: `Monthly limit reached (${limits.invoices} invoices on ${limits.label} plan). Upgrade to chase more.` },
      { status: 403 }
    )
  }

  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', user.id)
    .single()

  if (fetchError || !invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
  if (n8nWebhookUrl) {
    await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice, tenantId: user.id, planTier: tier, smsEnabled: limits.sms }),
    }).catch(() => null)
  }

  const now = new Date().toISOString()

  await Promise.all([
    supabase.from('invoices').update({
      status: 'contacted',
      last_chased_at: now,
      times_chased: invoice.times_chased + 1,
    }).eq('id', id),

    supabase.from('chase_log').insert({
      invoice_id: id,
      tenant_id: user.id,
      action_type: 'email',
      message_sent: `Manual chase triggered for invoice ${invoice.invoice_number ?? id}`,
      channel: 'email',
      sent_at: now,
      delivery_status: 'sent',
      response_received: false,
    }),

    supabase.from('tenants').update({
      usage_this_month: usageThisMonth + 1,
    }).eq('id', user.id),
  ])

  return NextResponse.json({ success: true })
}
