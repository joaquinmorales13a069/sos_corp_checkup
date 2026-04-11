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

  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { nombre, rol: 'responsable' },
    email_confirm: true,
  })

  if (error) return { error: error.message }
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
