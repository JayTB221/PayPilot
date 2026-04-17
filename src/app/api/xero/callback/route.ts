import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state') // supabase user id

  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?xero=error`)
  }

  // Exchange auth code for tokens
  const tokenRes = await fetch('https://identity.xero.com/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.XERO_REDIRECT_URI!,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?xero=error`)
  }

  const tokens = await tokenRes.json()
  const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  // Get Xero tenant ID (organisation ID)
  const connectionsRes = await fetch('https://api.xero.com/connections', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const connections = await connectionsRes.json()
  const xeroTenantId = connections[0]?.tenantId ?? null

  const supabase = await createAdminClient()
  await supabase
    .from('tenants')
    .update({
      xero_access_token: tokens.access_token,
      xero_refresh_token: tokens.refresh_token,
      xero_tenant_id: xeroTenantId,
      xero_token_expiry: expiry,
    })
    .eq('id', state)

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?xero=connected`)
}
