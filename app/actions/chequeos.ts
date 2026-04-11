'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createChequeo(formData: FormData) {
  const sucursal_id = formData.get('sucursal_id') as string
  const añoRaw = formData.get('año') as string
  const drive_url = (formData.get('drive_url') as string).trim()

  if (!sucursal_id) return { error: 'Selecciona una sucursal' }
  if (!añoRaw) return { error: 'El año es requerido' }
  if (!drive_url) return { error: 'El enlace de Drive es requerido' }

  const año = parseInt(añoRaw, 10)
  if (isNaN(año) || año < 2020 || año > 2050) {
    return { error: 'El año debe ser un número entre 2020 y 2050' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('chequeos')
    .insert({ sucursal_id, año, drive_url })
  if (error) {
    if (error.code === '23505') {
      return { error: 'Ya existe un chequeo para esa sucursal y año' }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard/admin/chequeos')
  revalidatePath('/dashboard/responsable')
}

export async function updateChequeo(id: string, formData: FormData) {
  const sucursal_id = formData.get('sucursal_id') as string
  const añoRaw = formData.get('año') as string
  const drive_url = (formData.get('drive_url') as string).trim()

  if (!sucursal_id) return { error: 'Selecciona una sucursal' }
  if (!añoRaw) return { error: 'El año es requerido' }
  if (!drive_url) return { error: 'El enlace de Drive es requerido' }

  const año = parseInt(añoRaw, 10)
  if (isNaN(año) || año < 2020 || año > 2050) {
    return { error: 'El año debe ser un número entre 2020 y 2050' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('chequeos')
    .update({ sucursal_id, año, drive_url })
    .eq('id', id)
  if (error) {
    if (error.code === '23505') {
      return { error: 'Ya existe un chequeo para esa sucursal y año' }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard/admin/chequeos')
  revalidatePath('/dashboard/responsable')
}

export async function deleteChequeo(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('chequeos').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin/chequeos')
  revalidatePath('/dashboard/responsable')
}
