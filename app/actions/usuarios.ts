'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createUsuario(formData: FormData) {
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

  // Assign empresas if any were selected
  const empresaIds = formData.getAll('empresa_ids') as string[]
  if (empresaIds.length > 0 && data.user) {
    const rows = empresaIds.map((empresa_id) => ({ usuario_id: data.user!.id, empresa_id }))
    const supabase = await createClient()
    await supabase.from('responsable_empresa').insert(rows)
  }

  revalidatePath('/dashboard/admin/usuarios')
}

export async function updateUsuario(id: string, formData: FormData) {
  const nombre = (formData.get('nombre') as string).trim()
  if (!nombre) return { error: 'El nombre es requerido' }

  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ nombre }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin/usuarios')
}

export async function deleteUsuario(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.deleteUser(id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin/usuarios')
}

export async function updateAsignaciones(usuarioId: string, empresaIds: string[]) {
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
