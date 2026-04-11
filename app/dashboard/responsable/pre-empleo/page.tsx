import { createClient } from '@/lib/supabase/server'
import PreEmpleoYearSelector from './PreEmpleoYearSelector'

export default async function PreEmpleoPage() {
  const supabase = await createClient()

  const { data: chequeos } = await supabase
    .from('chequeos_pre_empleo')
    .select('*')

  const años = [...new Set((chequeos ?? []).map((c) => c.año))].sort(
    (a, b) => b - a,
  )

  return <PreEmpleoYearSelector años={años} />
}
