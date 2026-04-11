import { createClient } from '@/lib/supabase/server'
import PreEmpleoDaySelector from './PreEmpleoDaySelector'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default async function PreEmpleoMesPage({
  params,
}: {
  params: Promise<{ año: string; sucursalId: string; mes: string }>
}) {
  const { año: añoParam, sucursalId, mes: mesParam } = await params
  const año = parseInt(añoParam, 10)
  const mes = parseInt(mesParam, 10)

  const supabase = await createClient()

  const [{ data: chequeos }, { data: sucursal }] = await Promise.all([
    supabase
      .from('chequeos_pre_empleo')
      .select('dia, drive_url')
      .eq('sucursal_id', sucursalId)
      .eq('año', año)
      .eq('mes', mes)
      .order('dia', { ascending: true }),
    supabase
      .from('sucursales')
      .select('nombre, empresas(nombre)')
      .eq('id', sucursalId)
      .single(),
  ])

  const dias = (chequeos ?? []).map((c) => ({
    dia: c.dia,
    drive_url: c.drive_url,
  }))

  const sucursalNombre = sucursal?.nombre ?? 'Sucursal'
  const empresaNombre =
    (sucursal?.empresas as { nombre: string } | null)?.nombre ?? ''
  const mesNombre = MESES[mes - 1] ?? `Mes ${mes}`

  return (
    <PreEmpleoDaySelector
      dias={dias}
      año={año}
      mes={mes}
      mesNombre={mesNombre}
      sucursalId={sucursalId}
      sucursalNombre={sucursalNombre}
      empresaNombre={empresaNombre}
    />
  )
}
