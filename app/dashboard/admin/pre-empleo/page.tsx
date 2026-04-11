import { createClient } from '@/lib/supabase/server'
import PreEmpleoClient from './PreEmpleoClient'
import type { Tables } from '@/lib/database.types'

type Sucursal = Tables<'sucursales'>
type Empresa = Tables<'empresas'>
type ChequeoPreEmpleoWithSucursal = Tables<'chequeos_pre_empleo'> & {
  sucursales: Pick<Sucursal, 'nombre' | 'empresa_id'> & {
    empresas: Pick<Empresa, 'nombre'> | null
  } | null
}

export default async function PreEmpleoPage() {
  const supabase = await createClient()

  const [{ data: chequeos }, { data: empresas }, { data: sucursales }] =
    await Promise.all([
      supabase
        .from('chequeos_pre_empleo')
        .select('*, sucursales(nombre, empresa_id, empresas(nombre))')
        .order('año', { ascending: false }),
      supabase
        .from('empresas')
        .select('*')
        .order('nombre', { ascending: true }),
      supabase
        .from('sucursales')
        .select('*')
        .order('nombre', { ascending: true }),
    ])

  return (
    <PreEmpleoClient
      chequeos={(chequeos ?? []) as ChequeoPreEmpleoWithSucursal[]}
      empresas={empresas ?? []}
      sucursales={sucursales ?? []}
    />
  )
}
