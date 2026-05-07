'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent } from '@/lib/audit'

export async function updateProfile(formData: FormData) {
  const nombre = (formData.get('nombre') as string).trim()
  if (!nombre) return { error: 'El nombre es requerido' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('profiles')
    .update({ nombre })
    .eq('id', user.id)

  if (error) return { error: error.message }

  await logAuditEvent('cambio_nombre', nombre)
  revalidatePath('/dashboard/responsable')
}

export async function updateEmail(formData: FormData) {
  const email = (formData.get('email') as string).trim().toLowerCase()
  if (!email) return { error: 'El correo es requerido' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.auth.admin.updateUserById(user.id, { email })

  if (error) return { error: error.message }

  await logAuditEvent('cambio_correo', email)
  revalidatePath('/dashboard/responsable')
}

export async function updatePassword(formData: FormData) {
  const currentPassword = (formData.get('current_password') as string)
  const newPassword = (formData.get('new_password') as string)
  const confirmPassword = (formData.get('confirm_password') as string)

  if (!currentPassword) return { error: 'La contraseña actual es requerida' }
  if (!newPassword || newPassword.length < 6) return { error: 'La nueva contraseña debe tener al menos 6 caracteres' }
  if (newPassword !== confirmPassword) return { error: 'Las contraseñas no coinciden' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })
  if (signInError) return { error: 'La contraseña actual es incorrecta' }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
  })

  if (error) return { error: error.message }

  await logAuditEvent('cambio_contraseña')
}
