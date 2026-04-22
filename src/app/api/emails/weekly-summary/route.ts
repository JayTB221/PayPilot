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

  const supabase = await createAdminClient()

  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, email, owner_name, business_name, plan_tier')
    .eq('subscription_status', 'active')

  if (!tenants || tenants.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://paypilot.app'
  const fromDomain = process.env.RESEND_FROM_DOMAIN ?? 'paypilot.app'

  let sent = 0

  for (const tenant of tenants) {
    const { data: chaseLogs } = await supabase
      .from('chase_log')
      .select('id, response_received, channel')
      .eq('tenant_id', tenant.id)
      .gte('sent_at', weekAgo)

    const { data: outstanding } = await supabase
      .from('invoices')
      .select('amount_owed, debtor_name')
      .eq('tenant_id', tenant.id)
      .in('status', ['pending', 'contacted', 'escalated'])

    const { data: recovered } = await supabase
      .from('invoices')
      .select('amount_owed')
      .eq('tenant_id', tenant.id)
      .eq('status', 'paid')
      .gte('last_chased_at', weekAgo)

    const chased = chaseLogs?.length ?? 0
    const responses = chaseLogs?.filter(l => l.response_received).length ?? 0
    const emails = chaseLogs?.filter(l => l.channel === 'email').length ?? 0
    const sms = chaseLogs?.filter(l => l.channel === 'sms').length ?? 0
    const totalOutstanding = (outstanding ?? []).reduce((s, i) => s + Number(i.amount_owed), 0)
    const totalRecovered = (recovered ?? []).reduce((s, i) => s + Number(i.amount_owed), 0)
    const outstandingCount = outstanding?.length ?? 0

    const firstName = tenant.owner_name?.split(' ')[0] ?? 'there'

    // Aria's tone: warm, specific, professional
    const openingLine = chased > 0
      ? `I've been busy this week. Here's what I got done on your behalf.`
      : `It's been a quiet week — no invoices fell into my chase window. Here's where things stand.`

    const recoveryNote = totalRecovered > 0
      ? `The good news: <strong style="color:#15803d">${formatCurrency(totalRecovered)}</strong> came in this week from invoices I was chasing.`
      : `Nothing landed in the paid column this week, but I&apos;m still working on it.`

    const outstandingNote = outstandingCount > 0
      ? `You still have <strong>${outstandingCount} outstanding invoice${outstandingCount !== 1 ? 's' : ''}</strong> totalling <strong>${formatCurrency(totalOutstanding)}</strong>. I&apos;m on it.`
      : `Remarkably, nothing is outstanding right now. Nice work.`

    const activityNote = chased > 0
      ? `This week I sent ${emails > 0 ? `<strong>${emails} email${emails !== 1 ? 's' : ''}</strong>` : ''}${emails > 0 && sms > 0 ? ' and ' : ''}${sms > 0 ? `<strong>${sms} SMS${sms !== 1 ? 's' : ''}</strong>` : ''}.${responses > 0 ? ` <strong>${responses} ${responses === 1 ? 'person' : 'people'} replied</strong> — I&apos;ll follow those up.` : ''}`
      : ''

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:580px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden">

    <!-- Header with Aria identity -->
    <div style="background:#030712;padding:28px 32px;display:flex;align-items:center;gap:14px">
      <div style="height:44px;width:44px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#7c3aed);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <span style="color:#fff;font-size:18px;font-weight:800">A</span>
      </div>
      <div>
        <p style="margin:0;font-size:13px;font-weight:600;color:#a78bfa;text-transform:uppercase;letter-spacing:.08em">Weekly briefing from Aria</p>
        <p style="margin:4px 0 0;font-size:11px;color:#6b7280">Your PayPilot invoice recovery agent</p>
      </div>
    </div>

    <!-- Body -->
    <div style="padding:32px">
      <p style="margin:0 0 6px;font-size:18px;font-weight:700;color:#111827">Hi ${firstName},</p>
      <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6">${openingLine}</p>

      <!-- Stats grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
        <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:16px">
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#7e22ce;font-weight:600">Chased this week</p>
          <p style="margin:6px 0 0;font-size:32px;font-weight:800;color:#3b0764">${chased}</p>
          <p style="margin:4px 0 0;font-size:11px;color:#9333ea">${responses > 0 ? `${responses} response${responses !== 1 ? 's' : ''} received` : 'No replies yet'}</p>
        </div>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px">
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#15803d;font-weight:600">Recovered this week</p>
          <p style="margin:6px 0 0;font-size:28px;font-weight:800;color:#14532d">${formatCurrency(totalRecovered)}</p>
          <p style="margin:4px 0 0;font-size:11px;color:#16a34a">${totalRecovered > 0 ? 'Landed in the bank ✓' : 'Keep an eye out'}</p>
        </div>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px">
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#92400e;font-weight:600">Still outstanding</p>
          <p style="margin:6px 0 0;font-size:28px;font-weight:800;color:#451a03">${formatCurrency(totalOutstanding)}</p>
          <p style="margin:4px 0 0;font-size:11px;color:#b45309">${outstandingCount} invoice${outstandingCount !== 1 ? 's' : ''}</p>
        </div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px">
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#1e40af;font-weight:600">Messages sent</p>
          <p style="margin:6px 0 0;font-size:28px;font-weight:800;color:#1e3a8a">${emails + sms}</p>
          <p style="margin:4px 0 0;font-size:11px;color:#2563eb">${emails} email${emails !== 1 ? 's' : ''}${sms > 0 ? ` · ${sms} SMS` : ''}</p>
        </div>
      </div>

      <!-- Aria's narrative -->
      <div style="background:#faf5ff;border-left:3px solid #8b5cf6;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#6d28d9">From Aria</p>
        <p style="margin:0 0 8px;font-size:14px;color:#374151;line-height:1.6">${recoveryNote}</p>
        ${activityNote ? `<p style="margin:0 0 8px;font-size:14px;color:#374151;line-height:1.6">${activityNote}</p>` : ''}
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6">${outstandingNote}</p>
      </div>

      <a href="${appUrl}/dashboard"
        style="display:block;background:#7c3aed;color:#fff;text-align:center;padding:14px 24px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;margin-bottom:28px">
        View your dashboard →
      </a>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">

      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6">
        I run every morning at 8am and will send you another update next Monday.<br>
        — <strong>Aria</strong>, your invoice recovery agent
      </p>

      <p style="margin:16px 0 0;font-size:11px;color:#9ca3af">
        <a href="${appUrl}/dashboard/settings" style="color:#9ca3af">Manage Aria&apos;s settings</a>
        &nbsp;·&nbsp;
        <a href="${appUrl}/privacy" style="color:#9ca3af">Privacy policy</a>
      </p>
    </div>
  </div>
</body>
</html>`

    try {
      await resend.emails.send({
        from: `Aria at PayPilot <aria@${fromDomain}>`,
        to: tenant.email,
        subject: `Aria's weekly briefing — ${chased > 0 ? `${chased} invoices chased` : 'here\'s where things stand'}`,
        html,
      })
      sent++
    } catch {
      // Continue to next tenant on failure
    }
  }

  return NextResponse.json({ sent, total: tenants.length })
}
