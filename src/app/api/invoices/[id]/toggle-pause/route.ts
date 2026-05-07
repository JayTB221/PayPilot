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

  // Fetch current pause state (also verifies ownership)
  const { data: invoice } = await supabase
    .from('invoices')
    .select('chase_paused')
    .eq('id', id)
    .eq('tenant_id', user.id)
    .single()

  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  const { error } = await supabase
    .from('invoices')
    .update({ chase_paused: !invoice.chase_paused })
    .eq('id', id)
    .eq('tenant_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ chase_paused: !invoice.chase_paused })
}
