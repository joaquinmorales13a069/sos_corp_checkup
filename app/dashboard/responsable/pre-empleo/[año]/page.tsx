import { createClient } from '@/lib/supabase/server'
import PreEmpleoSucursalSelector from './PreEmpleoSucursalSelector'

export default async function PreEmpleoAñoPage({
  params,
}: {
  params: Promise<{ año: string }>
}) {
  const { año: añoParam } = await params
  const año = parseInt(añoParam, 10)

  const supabase = await createClient()

  const { data: chequeos } = await supabase
    .from('chequeos_pre_empleo')
    .select('sucursal_id, sucursales(id, nombre, empresa_id, empresas(nombre, logo_url))')
    .eq('año', año)

  const sucursalMap = new Map<
    string,
    {
      id: string
      nombre: string
      empresa_nombre: string
      logo_url: string | null
    }
  >()

  for (const c of chequeos ?? []) {
    const suc = c.sucursales as {
      id: string
      nombre: string
      empresa_id: string
      empresas: { nombre: string; logo_url: string | null } | null
    } | null
    if (!suc || sucursalMap.has(suc.id)) continue
    sucursalMap.set(suc.id, {
      id: suc.id,
      nombre: suc.nombre,
      empresa_nombre: suc.empresas?.nombre ?? 'Sin empresa',
      logo_url: suc.empresas?.logo_url ?? null,
    })
  }

  const sucursales = [...sucursalMap.values()].sort((a, b) =>
    a.empresa_nombre.localeCompare(b.empresa_nombre),
  )

  return <PreEmpleoSucursalSelector sucursales={sucursales} año={año} />
}
