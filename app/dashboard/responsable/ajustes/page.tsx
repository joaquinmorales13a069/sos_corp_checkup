import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import AjustesClient from './AjustesClient'

export default async function AjustesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const profile = await getProfile()

  return (
    <AjustesClient
      nombre={profile?.nombre ?? ''}
      email={user?.email ?? ''}
    />
  )
}
