export type SubscriptionStatus = 'inactive' | 'active' | 'cancelled' | 'past_due'
export type InvoiceStatus =
  | 'pending' | 'contacted' | 'responded'
  | 'paid' | 'escalated' | 'written_off'
export type ActionType = 'email' | 'sms' | 'escalation_flag'
export type Channel = 'email' | 'sms'
export type DeliveryStatus = 'sent' | 'delivered' | 'failed'
export type PlanTier = 'starter' | 'professional' | 'enterprise'

export interface Tenant {
  id: string
  email: string
  business_name: string
  owner_name: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: SubscriptionStatus
  plan_tier: PlanTier
  usage_this_month: number
  xero_access_token: string | null
  xero_refresh_token: string | null
  xero_tenant_id: string | null
  xero_token_expiry: string | null
  created_at: string
}

export interface Invoice {
  id: string
  tenant_id: string
  xero_invoice_id: string | null
  debtor_name: string
  debtor_company: string | null
  debtor_email: string
  debtor_phone: string | null
  invoice_number: string | null
  amount_owed: number
  currency: string
  due_date: string
  days_overdue: number
  status: InvoiceStatus
  last_chased_at: string | null
  times_chased: number
  created_at: string
}

export interface ChaseLog {
  id: string
  invoice_id: string
  tenant_id: string
  action_type: ActionType
  message_sent: string
  channel: Channel
  sent_at: string
  delivery_status: DeliveryStatus
  response_received: boolean
}

export interface TenantSettings {
  id: string
  tenant_id: string
  chase_start_days: number
  email_tone_friendly_threshold: number
  email_tone_firm_threshold: number
  escalation_threshold: number
  sms_enabled: boolean
  sms_start_days: number
  payment_link: string | null
  email_signature: string | null
  created_at: string
}

export interface DashboardStats {
  totalInvoices: number
  totalOutstanding: number
  totalRecoveredThisMonth: number
  recoveryRate: number
}
