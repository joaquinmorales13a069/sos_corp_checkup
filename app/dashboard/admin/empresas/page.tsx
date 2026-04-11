import { createClient } from '@/lib/supabase/server'
import EmpresasClient from './EmpresasClient'

export default async function EmpresasPage() {
  const supabase = await createClient()
  const { data: empresas } = await supabase
    .from('empresas')
    .select('*')
    .order('nombre', { ascending: true })

  return <EmpresasClient empresas={empresas ?? []} />
}
