import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'
import { formatCurrency } from '@/lib/utils'

export async function POST(req: NextRequest) {
  // Simple shared secret to protect this endpoint
  const authHeader = req.headers.get('authorization')
  const secret = process.env.WEEKLY_SUMMARY_SECRET
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createAdminClient()

  // Fetch all active tenants
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, email, owner_name, business_name, plan_tier')
    .eq('subscription_status', 'active')

  if (!tenants || tenants.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://paypilot.app'

  let sent = 0

  for (const tenant of tenants) {
    // Fetch this week's chase log
    const { data: chaseLogs } = await supabase
      .from('chase_log')
      .select('id, response_received')
      .eq('tenant_id', tenant.id)
      .gte('sent_at', weekAgo)

    // Fetch outstanding invoices
    const { data: outstanding } = await supabase
      .from('invoices')
      .select('amount_owed')
      .eq('tenant_id', tenant.id)
      .in('status', ['pending', 'contacted', 'escalated'])

    // Fetch paid this week
    const { data: recovered } = await supabase
      .from('invoices')
      .select('amount_owed')
      .eq('tenant_id', tenant.id)
      .eq('status', 'paid')
      .gte('last_chased_at', weekAgo)

    const chased = chaseLogs?.length ?? 0
    const responses = chaseLogs?.filter(l => l.response_received).length ?? 0
    const totalOutstanding = (outstanding ?? []).reduce((s, i) => s + Number(i.amount_owed), 0)
    const totalRecovered = (recovered ?? []).reduce((s, i) => s + Number(i.amount_owed), 0)

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden">
    <!-- Header -->
    <div style="background:#030712;padding:28px 32px">
      <p style="margin:0;font-size:22px;font-weight:800;color:#fff">
        Pay<span style="color:#60a5fa">Pilot</span>
      </p>
      <p style="margin:8px 0 0;font-size:13px;color:#9ca3af">Weekly recovery summary</p>
    </div>

    <!-- Body -->
    <div style="padding:32px">
      <p style="margin:0 0 20px;font-size:15px;color:#374151">
        Hi ${tenant.owner_name ?? 'there'} — here&apos;s your PayPilot summary for the past 7 days.
      </p>

      <!-- Stats grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px">
        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:16px">
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#0369a1;font-weight:600">Invoices chased</p>
          <p style="margin:6px 0 0;font-size:28px;font-weight:800;color:#0c4a6e">${chased}</p>
        </div>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px">
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#15803d;font-weight:600">Responses received</p>
          <p style="margin:6px 0 0;font-size:28px;font-weight:800;color:#14532d">${responses}</p>
        </div>
        <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:16px">
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#92400e;font-weight:600">Recovered this week</p>
          <p style="margin:6px 0 0;font-size:24px;font-weight:800;color:#451a03">${formatCurrency(totalRecovered)}</p>
        </div>
        <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:16px">
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#7e22ce;font-weight:600">Total outstanding</p>
          <p style="margin:6px 0 0;font-size:24px;font-weight:800;color:#3b0764">${formatCurrency(totalOutstanding)}</p>
        </div>
      </div>

      <a href="${appUrl}/dashboard"
        style="display:block;background:#2563eb;color:#fff;text-align:center;padding:14px 24px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;margin-bottom:24px">
        View your dashboard →
      </a>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">
        PayPilot · AI-powered invoice recovery<br>
        <a href="${appUrl}/dashboard/settings" style="color:#9ca3af">Manage preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`

    try {
      await resend.emails.send({
        from: `PayPilot <noreply@${process.env.RESEND_FROM_DOMAIN ?? 'paypilot.app'}>`,
        to: tenant.email,
        subject: `Your PayPilot weekly summary — ${chased} invoices chased`,
        html,
      })
      sent++
    } catch {
      // Continue sending to other tenants even if one fails
    }
  }

  return NextResponse.json({ sent, total: tenants.length })
}
