import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch invoice to confirm ownership
  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', user.id)
    .single()

  if (fetchError || !invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  // If n8n webhook URL is set, trigger the workflow
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
  if (n8nWebhookUrl) {
    await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice, tenantId: user.id }),
    }).catch(() => null) // fire-and-forget; don't block on n8n
  }

  // Update invoice: mark as contacted, increment times_chased
  const now = new Date().toISOString()
  await supabase
    .from('invoices')
    .update({
      status: 'contacted',
      last_chased_at: now,
      times_chased: invoice.times_chased + 1,
    })
    .eq('id', id)

  // Write chase log entry
  await supabase.from('chase_log').insert({
    invoice_id: id,
    tenant_id: user.id,
    action_type: 'email',
    message_sent: `Manual chase triggered for invoice ${invoice.invoice_number ?? id}`,
    channel: 'email',
    sent_at: now,
    delivery_status: 'sent',
    response_received: false,
  })

  return NextResponse.json({ success: true })
}
