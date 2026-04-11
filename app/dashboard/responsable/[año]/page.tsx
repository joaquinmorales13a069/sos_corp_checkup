import { createClient } from '@/lib/supabase/server'
import ResponsableChequeos from './ResponsableChequeos'

export default async function ResponsableAñoPage({
  params,
}: {
  params: Promise<{ año: string }>
}) {
  const { año: añoParam } = await params
  const año = parseInt(añoParam, 10)

  const supabase = await createClient()

  const { data: chequeos } = await supabase
    .from('chequeos')
    .select('*, sucursales(nombre, empresa_id, empresas(nombre, logo_url))')
    .eq('año', año)
    .order('created_at', { ascending: true })

  return <ResponsableChequeos chequeos={chequeos ?? []} año={año} />
}
