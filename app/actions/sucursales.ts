'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createSucursal(formData: FormData) {
  const nombre = (formData.get('nombre') as string).trim()
  const empresa_id = formData.get('empresa_id') as string
  if (!nombre) return { error: 'El nombre es requerido' }
  if (!empresa_id) return { error: 'Selecciona una empresa' }

  const supabase = await createClient()
  const { error } = await supabase.from('sucursales').insert({ nombre, empresa_id })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin/sucursales')
}

export async function updateSucursal(id: string, formData: FormData) {
  const nombre = (formData.get('nombre') as string).trim()
  const empresa_id = formData.get('empresa_id') as string
  if (!nombre) return { error: 'El nombre es requerido' }
  if (!empresa_id) return { error: 'Selecciona una empresa' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('sucursales')
    .update({ nombre, empresa_id })
    .eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin/sucursales')
}

export async function deleteSucursal(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('sucursales').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin/sucursales')
}
