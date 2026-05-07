import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'
import { formatCurrency } from '@/lib/utils'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const EMAIL_KEY = 'trial_warning'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { allowed } = rateLimit(`trial-warning:${ip}`, 10, 60 * 60 * 1000)
  if (!allowed) return rateLimitResponse()

  const authHeader = req.headers.get('authorization')
  const secret = process.env.WEEKLY_SUMMARY_SECRET
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createAdminClient()
  const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? 'https://paypilot.app'
  const fromDomain  = process.env.RESEND_FROM_DOMAIN  ?? 'paypilot.app'

  // Find tenants whose trial ends in ~3 days (between 2.5 and 3.5 days from now)
  const now       = new Date()
  const low       = new Date(now.getTime() + 2.5 * 24 * 60 * 60 * 1000).toISOString()
  const high      = new Date(now.getTime() + 3.5 * 24 * 60 * 60 * 1000).toISOString()

  // Allow targeting a specific tenant via body
  const body = await req.json().catch(() => ({}))
  const specificTenantId: string | null = body.tenant_id ?? null

  let query = supabase
    .from('tenants')
    .select('id, email, owner_name, business_name, trial_ends_at, subscription_status, trial_emails_sent')

  if (specificTenantId) {
    query = query.eq('id', specificTenantId)
  } else {
    query = query.gte('trial_ends_at', low).lte('trial_ends_at', high).neq('subscription_status', 'active')
  }

  const { data: tenants } = await query

  if (!tenants?.length) return NextResponse.json({ sent: 0 })

  let sent = 0
  let skipped = 0

  for (const tenant of tenants) {
    // Deduplication: skip if this email was already sent to this tenant
    if ((tenant.trial_emails_sent ?? []).includes(EMAIL_KEY)) {
      skipped++
      continue
    }

    const { data: chaseLogs } = await supabase
      .from('chase_log')
      .select('id')
      .eq('tenant_id', tenant.id)
      .gte('sent_at', tenant.trial_ends_at
        ? new Date(new Date(tenant.trial_ends_at).getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(0).toISOString()
      )

    const { data: outstanding } = await supabase
      .from('invoices')
      .select('amount_owed')
      .eq('tenant_id', tenant.id)
      .in('status', ['pending', 'contacted', 'escalated'])

    const chased         = chaseLogs?.length ?? 0
    const totalOutstanding = (outstanding ?? []).reduce((s, i) => s + Number(i.amount_owed), 0)
    const firstName      = tenant.owner_name?.split(' ')[0] ?? 'there'
    const daysLeft       = Math.ceil((new Date(tenant.trial_ends_at!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

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
        Your free trial ends in <strong>${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong>. Here's what I've accomplished for you.
      </p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
        <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:16px">
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#7e22ce;font-weight:600">Invoices chased</p>
          <p style="margin:6px 0 0;font-size:32px;font-weight:800;color:#3b0764">${chased}</p>
        </div>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px">
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#92400e;font-weight:600">Still outstanding</p>
          <p style="margin:6px 0 0;font-size:28px;font-weight:800;color:#451a03">${formatCurrency(totalOutstanding)}</p>
        </div>
      </div>
      <div style="background:#faf5ff;border-left:3px solid #8b5cf6;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#6d28d9">From Aria</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6">
          I've been working hard for you during your trial. Don't let that momentum stop — upgrade now and I'll keep chasing ${formatCurrency(totalOutstanding)} in outstanding invoices for you.
        </p>
      </div>
      <a href="${appUrl}/subscribe"
        style="display:block;background:#7c3aed;color:#fff;text-align:center;padding:14px 24px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;margin-bottom:20px">
        Keep Aria working — upgrade now →
      </a>
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6">
        Your trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. After that, I'll pause until you choose a plan.<br>
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
        subject: `Aria has ${daysLeft} days left on your trial — here's what she's done`,
        html,
      })
      // Mark this email type as sent so it never fires again for this tenant
      const updated = [...(tenant.trial_emails_sent ?? []), EMAIL_KEY]
      await supabase.from('tenants').update({ trial_emails_sent: updated }).eq('id', tenant.id)
      sent++
    } catch {
      // Continue to next tenant
    }
  }

  return NextResponse.json({ sent, skipped, total: tenants.length })
}
