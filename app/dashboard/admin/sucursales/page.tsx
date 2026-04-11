import { createClient } from '@/lib/supabase/server'
import SucursalesClient from './SucursalesClient'
import type { Tables } from '@/lib/database.types'

type SucursalWithEmpresa = Tables<'sucursales'> & { empresas: Pick<Tables<'empresas'>, 'nombre'> | null }

export default async function SucursalesPage() {
  const supabase = await createClient()

  const [{ data: sucursales }, { data: empresas }] = await Promise.all([
    supabase
      .from('sucursales')
      .select('*, empresas(nombre)')
      .order('nombre', { ascending: true }),
    supabase
      .from('empresas')
      .select('*')
      .order('nombre', { ascending: true }),
  ])

  return (
    <SucursalesClient
      sucursales={(sucursales ?? []) as SucursalWithEmpresa[]}
      empresas={empresas ?? []}
    />
  )
}
