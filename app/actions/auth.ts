'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'

export type LoginState = {
  error?: string
  redirectTo?: string
} | null

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Completa todos los campos.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    await logAuditEvent('login_fallido', email)
    return { error: 'Credenciales incorrectas. Verifica tu email y contraseña.' }
  }

  await logAuditEvent('login', email, data.user?.id)

  const profile = await getProfile()
  const redirectTo = profile?.rol === 'admin'
    ? '/dashboard/admin/empresas'
    : '/dashboard/responsable'

  return { redirectTo }
}

export async function logout() {
  await logAuditEvent('logout')
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login?logout=1')
}
