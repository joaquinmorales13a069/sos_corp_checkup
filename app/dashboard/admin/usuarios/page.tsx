import { createAdminClient } from '@/lib/supabase/admin'
import UsuariosClient from './UsuariosClient'

export default async function UsuariosPage() {
  const supabase = createAdminClient()

  const [{ data: profiles }, { data: authData }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('rol', 'responsable')
      .order('nombre', { ascending: true }),
    supabase.auth.admin.listUsers(),
  ])

  const emailMap = new Map(
    (authData?.users ?? []).map((u) => [u.id, u.email ?? ''])
  )

  const usuarios = (profiles ?? []).map((p) => ({
    ...p,
    email: emailMap.get(p.id) ?? '',
  }))

  return <UsuariosClient usuarios={usuarios} />
}
