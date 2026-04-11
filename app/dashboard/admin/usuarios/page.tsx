import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import UsuariosClient from './UsuariosClient'

export default async function UsuariosPage() {
  const adminSupabase = createAdminClient()
  const supabase = await createClient()

  const [
    { data: profiles },
    { data: authData },
    { data: empresas },
    { data: asignacionesRaw },
  ] = await Promise.all([
    adminSupabase.from('profiles').select('*').eq('rol', 'responsable').order('nombre'),
    adminSupabase.auth.admin.listUsers(),
    supabase.from('empresas').select('*').order('nombre'),
    supabase.from('responsable_empresa').select('usuario_id, empresa_id'),
  ])

  const emailMap = new Map(
    (authData?.users ?? []).map((u) => [u.id, u.email ?? ''])
  )

  const usuarios = (profiles ?? []).map((p) => ({
    ...p,
    email: emailMap.get(p.id) ?? '',
  }))

  // Build map: usuarioId → empresaId[]
  const asignaciones: Record<string, string[]> = {}
  for (const row of asignacionesRaw ?? []) {
    if (!asignaciones[row.usuario_id]) asignaciones[row.usuario_id] = []
    asignaciones[row.usuario_id].push(row.empresa_id)
  }

  return (
    <UsuariosClient
      usuarios={usuarios}
      empresas={empresas ?? []}
      asignaciones={asignaciones}
    />
  )
}
