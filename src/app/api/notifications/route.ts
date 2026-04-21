import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('notifications')
    .select('id, message, read, created_at')
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ notifications: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))

  if (body.action === 'mark_all_read') {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('tenant_id', user.id)
      .eq('read', false)

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
