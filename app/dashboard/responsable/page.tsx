import { createClient } from '@/lib/supabase/server'
import ResponsableYearSelector from './ResponsableYearSelector'

export default async function ResponsablePage() {
  const supabase = await createClient()

  const { data: chequeos } = await supabase
    .from('chequeos')
    .select('*')

  const años = [...new Set((chequeos ?? []).map((c) => c.año))].sort(
    (a, b) => b - a,
  )

  return <ResponsableYearSelector años={años} />
}
