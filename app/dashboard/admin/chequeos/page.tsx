import { createClient } from '@/lib/supabase/server'
import ChequeosClient from './ChequeosClient'
import type { Tables } from '@/lib/database.types'

type Sucursal = Tables<'sucursales'>
type Empresa = Tables<'empresas'>
type ChequeoWithSucursal = Tables<'chequeos'> & {
  sucursales: Pick<Sucursal, 'nombre' | 'empresa_id'> & {
    empresas: Pick<Empresa, 'nombre'> | null
  } | null
}

export default async function ChequeosPage() {
  const supabase = await createClient()

  const [{ data: chequeos }, { data: empresas }, { data: sucursales }] =
    await Promise.all([
      supabase
        .from('chequeos')
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
    <ChequeosClient
      chequeos={(chequeos ?? []) as ChequeoWithSucursal[]}
      empresas={empresas ?? []}
      sucursales={sucursales ?? []}
    />
  )
}
