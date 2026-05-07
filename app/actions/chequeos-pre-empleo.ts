'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'

export async function createChequeoPreEmpleo(formData: FormData) {
  await requireAdmin()
  const sucursal_id = formData.get('sucursal_id') as string
  const añoRaw = formData.get('año') as string
  const mesRaw = formData.get('mes') as string
  const diaRaw = formData.get('dia') as string
  const drive_url = (formData.get('drive_url') as string).trim()

  if (!sucursal_id) return { error: 'Selecciona una sucursal' }
  if (!añoRaw) return { error: 'El año es requerido' }
  if (!mesRaw) return { error: 'El mes es requerido' }
  if (!diaRaw) return { error: 'El día es requerido' }
  if (!drive_url) return { error: 'El enlace de Drive es requerido' }

  const año = parseInt(añoRaw, 10)
  if (isNaN(año) || año < 2020 || año > 2050) {
    return { error: 'El año debe ser un número entre 2020 y 2050' }
  }

  const mes = parseInt(mesRaw, 10)
  if (isNaN(mes) || mes < 1 || mes > 12) {
    return { error: 'El mes debe ser un número entre 1 y 12' }
  }

  const dia = parseInt(diaRaw, 10)
  if (isNaN(dia) || dia < 1 || dia > 31) {
    return { error: 'El día debe ser un número entre 1 y 31' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('chequeos_pre_empleo')
    .insert({ sucursal_id, año, mes, dia, drive_url })
  if (error) {
    if (error.code === '23505') {
      return { error: 'Ya existe un chequeo pre empleo para esa sucursal, año, mes y día' }
    }
    return { error: error.message }
  }

  await logAuditEvent('crear_chequeo_pre_empleo', `${sucursal_id}/${año}/${mes}/${dia}`)
  revalidatePath('/dashboard/admin/pre-empleo')
  revalidatePath('/dashboard/responsable')
}

export async function updateChequeoPreEmpleo(id: string, formData: FormData) {
  await requireAdmin()
  const sucursal_id = formData.get('sucursal_id') as string
  const añoRaw = formData.get('año') as string
  const mesRaw = formData.get('mes') as string
  const diaRaw = formData.get('dia') as string
  const drive_url = (formData.get('drive_url') as string).trim()

  if (!sucursal_id) return { error: 'Selecciona una sucursal' }
  if (!añoRaw) return { error: 'El año es requerido' }
  if (!mesRaw) return { error: 'El mes es requerido' }
  if (!diaRaw) return { error: 'El día es requerido' }
  if (!drive_url) return { error: 'El enlace de Drive es requerido' }

  const año = parseInt(añoRaw, 10)
  if (isNaN(año) || año < 2020 || año > 2050) {
    return { error: 'El año debe ser un número entre 2020 y 2050' }
  }

  const mes = parseInt(mesRaw, 10)
  if (isNaN(mes) || mes < 1 || mes > 12) {
    return { error: 'El mes debe ser un número entre 1 y 12' }
  }

  const dia = parseInt(diaRaw, 10)
  if (isNaN(dia) || dia < 1 || dia > 31) {
    return { error: 'El día debe ser un número entre 1 y 31' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('chequeos_pre_empleo')
    .update({ sucursal_id, año, mes, dia, drive_url })
    .eq('id', id)
  if (error) {
    if (error.code === '23505') {
      return { error: 'Ya existe un chequeo pre empleo para esa sucursal, año, mes y día' }
    }
    return { error: error.message }
  }

  await logAuditEvent('editar_chequeo_pre_empleo', `${sucursal_id}/${año}/${mes}/${dia}`)
  revalidatePath('/dashboard/admin/pre-empleo')
  revalidatePath('/dashboard/responsable')
}

export async function deleteChequeoPreEmpleo(id: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('chequeos_pre_empleo')
    .delete()
    .eq('id', id)
  if (error) return { error: error.message }

  await logAuditEvent('eliminar_chequeo_pre_empleo', id)
  revalidatePath('/dashboard/admin/pre-empleo')
  revalidatePath('/dashboard/responsable')
}
