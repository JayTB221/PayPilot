import { createAdminClient } from '@/lib/supabase/server'

const XERO_TOKEN_URL = 'https://identity.xero.com/connect/token'
const XERO_API_BASE = 'https://api.xero.com/api.xro/2.0'

// ── Token refresh ─────────────────────────────────────────────────────────────
export async function refreshXeroToken(tenantId: string) {
  const supabase = await createAdminClient()
  const { data: tenant } = await supabase
    .from('tenants')
    .select('xero_refresh_token')
    .eq('id', tenantId)
    .single()

  if (!tenant?.xero_refresh_token) throw new Error('No Xero refresh token')

  const res = await fetch(XERO_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tenant.xero_refresh_token,
    }),
  })

  if (!res.ok) throw new Error(`Xero token refresh failed: ${res.status}`)

  const tokens = await res.json()
  const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  await supabase
    .from('tenants')
    .update({
      xero_access_token: tokens.access_token,
      xero_refresh_token: tokens.refresh_token,
      xero_token_expiry: expiry,
    })
    .eq('id', tenantId)

  return tokens.access_token as string
}

// ── Get valid access token (auto-refresh if expiring) ─────────────────────────
export async function getXeroAccessToken(tenantId: string): Promise<string> {
  const supabase = await createAdminClient()
  const { data: tenant } = await supabase
    .from('tenants')
    .select('xero_access_token, xero_token_expiry')
    .eq('id', tenantId)
    .single()

  if (!tenant?.xero_access_token) throw new Error('Xero not connected')

  const expiry = new Date(tenant.xero_token_expiry ?? 0)
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)

  if (expiry < fiveMinutesFromNow) {
    return refreshXeroToken(tenantId)
  }

  return tenant.xero_access_token
}

// ── Fetch overdue invoices from Xero ─────────────────────────────────────────
export async function fetchXeroOverdueInvoices(supabaseTenantId: string, xeroTenantId: string) {
  const accessToken = await getXeroAccessToken(supabaseTenantId)
  const today = new Date().toISOString().split('T')[0]

  const url = `${XERO_API_BASE}/Invoices?where=Status%3D%22AUTHORISED%22%20AND%20DueDate%3C%3DDateTime(${today.replace(/-/g, ',')})`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Xero-tenant-id': xeroTenantId,
      Accept: 'application/json',
    },
  })

  if (!res.ok) throw new Error(`Xero API error: ${res.status}`)
  const data = await res.json()
  return data.Invoices ?? []
}
