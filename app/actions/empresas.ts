'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function createEmpresa(formData: FormData) {
  await requireAdmin()
  const nombre = (formData.get('nombre') as string).trim()
  if (!nombre) return { error: 'El nombre es requerido' }

  const supabase = await createClient()
  const { error } = await supabase.from('empresas').insert({ nombre })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin/empresas')
}

export async function updateEmpresa(id: string, formData: FormData) {
  await requireAdmin()
  const nombre = (formData.get('nombre') as string).trim()
  if (!nombre) return { error: 'El nombre es requerido' }

  const supabase = await createClient()
  const { error } = await supabase.from('empresas').update({ nombre }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin/empresas')
}

export async function deleteEmpresa(id: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('empresas').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin/empresas')
}
