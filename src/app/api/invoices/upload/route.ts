import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

interface CsvRow {
  debtor_name?: string
  debtor_company?: string
  debtor_email?: string
  debtor_phone?: string
  invoice_number?: string
  amount_owed?: string | number
  due_date?: string
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { allowed } = rateLimit(`upload:${ip}`, 10, 60 * 60 * 1000) // 10/hr per IP
  if (!allowed) return rateLimitResponse()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { rows: CsvRow[] }
  if (!body.rows?.length) {
    return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
  }

  const today = new Date()

  const invoices = body.rows
    .filter(r => r.debtor_name && r.debtor_email && r.amount_owed && r.due_date)
    .map(r => {
      const dueDate = new Date(r.due_date!)
      const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / 86_400_000))
      return {
        tenant_id: user.id,
        debtor_name: String(r.debtor_name),
        debtor_company: r.debtor_company ? String(r.debtor_company) : null,
        debtor_email: String(r.debtor_email),
        debtor_phone: r.debtor_phone ? String(r.debtor_phone) : null,
        invoice_number: r.invoice_number ? String(r.invoice_number) : null,
        amount_owed: Number(r.amount_owed),
        currency: 'USD',
        due_date: r.due_date!,
        days_overdue: daysOverdue,
        status: 'pending' as const,
        times_chased: 0,
      }
    })

  if (!invoices.length) {
    return NextResponse.json({ error: 'No valid rows after filtering' }, { status: 400 })
  }

  const { error } = await supabase.from('invoices').insert(invoices)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ inserted: invoices.length })
}
