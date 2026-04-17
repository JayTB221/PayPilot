import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { refreshXeroToken } from '@/lib/xero'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const accessToken = await refreshXeroToken(user.id)
    return NextResponse.json({ success: true, accessToken })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
