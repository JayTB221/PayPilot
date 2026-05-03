import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'
import { formatCurrency } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const secret = process.env.WEEKLY_SUMMARY_SECRET
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase   = await createAdminClient()
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? 'https://paypilot.app'
  const fromDomain = process.env.RESEND_FROM_DOMAIN  ?? 'paypilot.app'

  // Find tenants whose trial expired in the last 2 hours (run daily, catches the day-of expiry)
  const now  = new Date()
  const low  = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
  const high = now.toISOString()

  // Allow targeting a specific tenant via body
  const body = await req.json().catch(() => ({}))
  const specificTenantId: string | null = body.tenant_id ?? null

  let query = supabase
    .from('tenants')
    .select('id, email, owner_name, business_name, trial_ends_at, subscription_status')

  if (specificTenantId) {
    query = query.eq('id', specificTenantId)
  } else {
    query = query.gte('trial_ends_at', low).lte('trial_ends_at', high).neq('subscription_status', 'active')
  }

  const { data: tenants } = await query

  if (!tenants?.length) return NextResponse.json({ sent: 0 })

  let sent = 0

  for (const tenant of tenants) {
    const { data: chaseLogs } = await supabase
      .from('chase_log')
      .select('id, response_received')
      .eq('tenant_id', tenant.id)
      .gte('sent_at', tenant.trial_ends_at
        ? new Date(new Date(tenant.trial_ends_at).getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(0).toISOString()
      )

    const { data: outstanding } = await supabase
      .from('invoices')
      .select('amount_owed, debtor_name')
      .eq('tenant_id', tenant.id)
      .in('status', ['pending', 'contacted', 'escalated'])

    const chased           = chaseLogs?.length ?? 0
    const responses        = chaseLogs?.filter(l => l.response_received).length ?? 0
    const totalOutstanding = (outstanding ?? []).reduce((s, i) => s + Number(i.amount_owed), 0)
    const outstandingCount = outstanding?.length ?? 0
    const firstName        = tenant.owner_name?.split(' ')[0] ?? 'there'

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:580px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden">
    <div style="background:#030712;padding:28px 32px;display:flex;align-items:center;gap:14px">
      <div style="height:44px;width:44px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#7c3aed);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <span style="color:#fff;font-size:18px;font-weight:800">A</span>
      </div>
      <div>
        <p style="margin:0;font-size:13px;font-weight:600;color:#a78bfa;text-transform:uppercase;letter-spacing:.08em">Message from Aria</p>
        <p style="margin:4px 0 0;font-size:11px;color:#6b7280">Your PayPilot invoice recovery agent</p>
      </div>
    </div>
    <div style="padding:32px">
      <p style="margin:0 0 6px;font-size:18px;font-weight:700;color:#111827">Hi ${firstName},</p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6">
        Your 14-day free trial has ended. I've had to pause — but here's what I accomplished for you.
      </p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
        <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:16px">
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#7e22ce;font-weight:600">Invoices chased</p>
          <p style="margin:6px 0 0;font-size:32px;font-weight:800;color:#3b0764">${chased}</p>
          <p style="margin:4px 0 0;font-size:11px;color:#9333ea">${responses > 0 ? `${responses} client${responses !== 1 ? 's' : ''} replied` : 'During your trial'}</p>
        </div>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px">
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#92400e;font-weight:600">Still outstanding</p>
          <p style="margin:6px 0 0;font-size:28px;font-weight:800;color:#451a03">${formatCurrency(totalOutstanding)}</p>
          <p style="margin:4px 0 0;font-size:11px;color:#b45309">${outstandingCount} invoice${outstandingCount !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div style="background:#faf5ff;border-left:3px solid #8b5cf6;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#6d28d9">From Aria</p>
        <p style="margin:0 0 8px;font-size:14px;color:#374151;line-height:1.6">
          I hate stopping when there&apos;s still ${formatCurrency(totalOutstanding)} outstanding. Without a plan, those ${outstandingCount} invoice${outstandingCount !== 1 ? 's' : ''} will keep aging — and clients who haven&apos;t paid yet are less likely to the longer they wait.
        </p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6">
          Upgrade now and I&apos;ll pick up exactly where I left off, tonight.
        </p>
      </div>
      <a href="${appUrl}/subscribe"
        style="display:block;background:#7c3aed;color:#fff;text-align:center;padding:14px 24px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;margin-bottom:20px">
        Upgrade and keep Aria working →
      </a>
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6">
        All your invoice data is saved. I&apos;ll be ready to start chasing again as soon as you upgrade.<br>
        — <strong>Aria</strong>
      </p>
    </div>
  </div>
</body>
</html>`

    try {
      await resend.emails.send({
        from: `Aria at PayPilot <aria@${fromDomain}>`,
        to: tenant.email,
        subject: `Your Aria trial has ended — ${formatCurrency(totalOutstanding)} is still outstanding`,
        html,
      })
      sent++
    } catch {
      // Continue to next tenant
    }
  }

  return NextResponse.json({ sent, total: tenants.length })
}
