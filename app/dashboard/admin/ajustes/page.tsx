import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import AjustesAdminClient from './AjustesClient'

export default async function AjustesAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const profile = await getProfile()

  return (
    <AjustesAdminClient
      nombre={profile?.nombre ?? ''}
      email={user?.email ?? ''}
    />
  )
}
