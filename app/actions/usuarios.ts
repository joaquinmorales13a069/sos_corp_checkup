'use server'

import crypto from 'crypto'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendCredenciales } from '@/lib/resend'
import { requireAdmin } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'

function generatePassword(): string {
  // URL-safe base64, ~11 chars — e.g. "aB3xKm9Rp2w"
  return crypto.randomBytes(8).toString('base64url')
}

export async function createUsuario(formData: FormData) {
  await requireAdmin()
  const nombre = (formData.get('nombre') as string).trim()
  const email = (formData.get('email') as string).trim().toLowerCase()
  const password = formData.get('password') as string

  if (!nombre) return { error: 'El nombre es requerido' }
  if (!email) return { error: 'El email es requerido' }
  if (!password || password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres' }

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { nombre, rol: 'responsable' },
    email_confirm: true,
  })

  if (error) return { error: error.message }

  // Assign empresas if selected
  const empresaIds = formData.getAll('empresa_ids') as string[]
  if (empresaIds.length > 0 && data.user) {
    const rows = empresaIds.map((empresa_id) => ({ usuario_id: data.user!.id, empresa_id }))
    const supabase = await createClient()
    await supabase.from('responsable_empresa').insert(rows)
  }

  await logAuditEvent('crear_usuario', email)

  // Send credentials email (non-blocking — user is created regardless)
  const emailResult = await sendCredenciales({ nombre, email, password })
  if (emailResult?.error) {
    // User was created successfully but email failed
    return { warning: `Usuario creado, pero el email no se pudo enviar: ${emailResult.error}` }
  }

  revalidatePath('/dashboard/admin/usuarios')
}

export async function updateUsuario(id: string, formData: FormData) {
  await requireAdmin()
  const nombre = (formData.get('nombre') as string).trim()
  if (!nombre) return { error: 'El nombre es requerido' }

  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ nombre }).eq('id', id)
  if (error) return { error: error.message }

  await logAuditEvent('editar_usuario', id)
  revalidatePath('/dashboard/admin/usuarios')
}

export async function deleteUsuario(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.deleteUser(id)
  if (error) return { error: error.message }

  await logAuditEvent('eliminar_usuario', id)
  revalidatePath('/dashboard/admin/usuarios')
}

export async function updateAsignaciones(usuarioId: string, empresaIds: string[]) {
  await requireAdmin()
  const supabase = await createClient()

  const { error: deleteError } = await supabase
    .from('responsable_empresa')
    .delete()
    .eq('usuario_id', usuarioId)

  if (deleteError) return { error: deleteError.message }

  if (empresaIds.length > 0) {
    const rows = empresaIds.map((empresa_id) => ({ usuario_id: usuarioId, empresa_id }))
    const { error: insertError } = await supabase.from('responsable_empresa').insert(rows)
    if (insertError) return { error: insertError.message }
  }

  revalidatePath('/dashboard/admin/usuarios')
}

export async function reenviarCredenciales(usuarioId: string, email: string, nombre: string) {
  await requireAdmin()
  const newPassword = generatePassword()

  // Reset password in Supabase Auth
  const adminSupabase = createAdminClient()
  const { error: updateError } = await adminSupabase.auth.admin.updateUserById(usuarioId, {
    password: newPassword,
  })
  if (updateError) return { error: updateError.message }

  // Send new credentials email
  const emailResult = await sendCredenciales({ nombre, email, password: newPassword })
  if (emailResult?.error) return { error: `Contraseña actualizada pero el email falló: ${emailResult.error}` }
}
