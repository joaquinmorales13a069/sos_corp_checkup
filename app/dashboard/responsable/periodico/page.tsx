import { createClient } from '@/lib/supabase/server'
import PeriodicoYearSelector from './PeriodicoYearSelector'

export default async function PeriodicoPage() {
  const supabase = await createClient()

  const { data: chequeos } = await supabase
    .from('chequeos')
    .select('*')

  const años = [...new Set((chequeos ?? []).map((c) => c.año))].sort(
    (a, b) => b - a,
  )

  return <PeriodicoYearSelector años={años} />
}
