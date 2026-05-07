import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/database.types'

export type Profile = Tables<'profiles'>

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) redirect('/login')
  return user
}

export async function requireAdmin() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (profile.rol !== 'admin') redirect('/dashboard/responsable')
  return profile
}

export async function requireResponsable() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (profile.rol !== 'responsable') redirect('/dashboard/admin/empresas')
  return profile
}

export async function requireAdminWithMFA(): Promise<Profile> {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (profile.rol !== 'admin') redirect('/dashboard/responsable')

  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (error || !data) redirect('/login')

  if (data.nextLevel === 'aal1') {
    redirect('/dashboard/mfa-setup')
  }

  if (data.currentLevel !== 'aal2') {
    redirect('/dashboard/mfa-verify')
  }

  return profile
}
