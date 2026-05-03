import { createClient } from '@/lib/supabase/server'
import { TrialBanner } from '@/components/dashboard/TrialBanner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <>{children}</>

  const { data: tenant } = await supabase
    .from('tenants')
    .select('subscription_status, trial_ends_at')
    .eq('id', user.id)
    .single()

  const isSubscribed   = tenant?.subscription_status === 'active'
  const trialEndsAt    = tenant?.trial_ends_at ?? null
  const trialIsActive  = trialEndsAt !== null && new Date(trialEndsAt) > new Date()
  const showBanner     = !isSubscribed && trialIsActive && trialEndsAt !== null

  return (
    <>
      {showBanner && <TrialBanner trialEndsAt={trialEndsAt!} />}
      {children}
    </>
  )
}
