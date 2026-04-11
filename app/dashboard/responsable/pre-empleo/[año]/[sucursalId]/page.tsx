import { createClient } from '@/lib/supabase/server'
import PreEmpleoMonthSelector from './PreEmpleoMonthSelector'

export default async function PreEmpleoSucursalPage({
  params,
}: {
  params: Promise<{ año: string; sucursalId: string }>
}) {
  const { año: añoParam, sucursalId } = await params
  const año = parseInt(añoParam, 10)

  const supabase = await createClient()

  const [{ data: chequeos }, { data: sucursal }] = await Promise.all([
    supabase
      .from('chequeos_pre_empleo')
      .select('mes')
      .eq('sucursal_id', sucursalId)
      .eq('año', año),
    supabase
      .from('sucursales')
      .select('nombre, empresas(nombre)')
      .eq('id', sucursalId)
      .single(),
  ])

  const meses = [...new Set((chequeos ?? []).map((c) => c.mes))].sort(
    (a, b) => a - b,
  )

  const sucursalNombre = sucursal?.nombre ?? 'Sucursal'
  const empresaNombre =
    (sucursal?.empresas as { nombre: string } | null)?.nombre ?? ''

  return (
    <PreEmpleoMonthSelector
      meses={meses}
      año={año}
      sucursalId={sucursalId}
      sucursalNombre={sucursalNombre}
      empresaNombre={empresaNombre}
    />
  )
}
