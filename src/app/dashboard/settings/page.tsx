import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logOut } from '@/app/actions/auth'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import type { TenantSettings } from '@/lib/types'

async function disconnectXero() {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('tenants').update({
    xero_access_token: null,
    xero_refresh_token: null,
    xero_tenant_id: null,
    xero_token_expiry: null,
  }).eq('id', user.id)

  revalidatePath('/dashboard/settings')
}

async function saveSettings(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('tenant_settings').upsert({
    tenant_id: user.id,
    chase_start_days: Number(formData.get('chase_start_days')),
    email_tone_friendly_threshold: Number(formData.get('email_tone_friendly_threshold')),
    email_tone_firm_threshold: Number(formData.get('email_tone_firm_threshold')),
    escalation_threshold: Number(formData.get('escalation_threshold')),
    sms_enabled: formData.get('sms_enabled') === 'on',
    sms_start_days: Number(formData.get('sms_start_days')),
    payment_link: (formData.get('payment_link') as string) || null,
    email_signature: (formData.get('email_signature') as string) || null,
  }, { onConflict: 'tenant_id' })

  revalidatePath('/dashboard/settings')
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: tenant }, { data: settings }] = await Promise.all([
    supabase.from('tenants').select('business_name, owner_name, email, xero_tenant_id, subscription_status').eq('id', user.id).single(),
    supabase.from('tenant_settings').select('*').eq('tenant_id', user.id).single(),
  ])

  const s = settings as TenantSettings | null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</Link>
            <span className="text-xl font-bold text-gray-900">
              Pay<span className="text-blue-600">Pilot</span>
            </span>
          </div>
          <form action={logOut}>
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">Log out</button>
          </form>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account and chase preferences</p>
        </div>

        {/* Account info */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Account</h2>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-400">Business name</dt>
              <dd className="mt-0.5 font-medium text-gray-900">{tenant?.business_name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Owner</dt>
              <dd className="mt-0.5 font-medium text-gray-900">{tenant?.owner_name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Email</dt>
              <dd className="mt-0.5 font-medium text-gray-900">{tenant?.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Subscription</dt>
              <dd className="mt-0.5">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold
                  ${tenant?.subscription_status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'}`}>
                  {tenant?.subscription_status ?? 'inactive'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Xero</dt>
              <dd className="mt-0.5 font-medium text-gray-900">
                {tenant?.xero_tenant_id ? (
                  <div className="flex items-center gap-3">
                    <span className="text-green-600">Connected</span>
                    <form action={disconnectXero}>
                      <button
                        type="submit"
                        className="text-xs text-red-500 hover:text-red-700 underline transition-colors"
                      >
                        Disconnect
                      </button>
                    </form>
                  </div>
                ) : (
                  <a href="/api/xero/auth" className="text-blue-600 hover:underline">Connect Xero</a>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Chase settings form */}
        <form action={saveSettings} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-6">
          <h2 className="text-base font-semibold text-gray-900">Chase preferences</h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Start chasing after (days overdue)</span>
              <input
                type="number" name="chase_start_days" min={1} max={60}
                defaultValue={s?.chase_start_days ?? 1}
                className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Friendly tone up to (days overdue)</span>
              <input
                type="number" name="email_tone_friendly_threshold" min={1} max={90}
                defaultValue={s?.email_tone_friendly_threshold ?? 14}
                className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Firm tone up to (days overdue)</span>
              <input
                type="number" name="email_tone_firm_threshold" min={1} max={120}
                defaultValue={s?.email_tone_firm_threshold ?? 30}
                className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Escalate after (days overdue)</span>
              <input
                type="number" name="escalation_threshold" min={1} max={180}
                defaultValue={s?.escalation_threshold ?? 45}
                className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">SMS settings</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="sms_enabled" defaultChecked={s?.sms_enabled ?? false}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Enable SMS follow-ups</span>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Start SMS after (days overdue)</span>
              <input
                type="number" name="sms_start_days" min={1} max={90}
                defaultValue={s?.sms_start_days ?? 7}
                className="mt-1 block w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Personalisation</h3>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Payment link (optional)</span>
              <input
                type="url" name="payment_link" placeholder="https://yourpayment.link"
                defaultValue={s?.payment_link ?? ''}
                className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-400">Included in follow-up emails so clients can pay instantly.</p>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Email signature (optional)</span>
              <textarea
                name="email_signature" rows={3}
                placeholder="Kind regards, Jane&#10;Jane's Accounting Ltd"
                defaultValue={s?.email_signature ?? ''}
                className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Save settings
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
