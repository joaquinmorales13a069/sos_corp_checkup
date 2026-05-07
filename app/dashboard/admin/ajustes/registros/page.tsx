import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import AuditTable from './AuditTable'

const PAGE_SIZE = 50

type SearchParams = Promise<{
  accion?: string
  desde?: string
  hasta?: string
  usuario?: string
  q?: string
  page?: string
}>

export default async function RegistrosPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams

  const accion = sp.accion ?? ''
  const desde = sp.desde ?? ''
  const hasta = sp.hasta ?? ''
  const usuario = sp.usuario ?? ''
  const q = sp.q ?? ''
  const rawPage = parseInt(sp.page ?? '0', 10)
  const page = Math.max(0, isNaN(rawPage) ? 0 : rawPage)
  const offset = page * PAGE_SIZE

  const supabase = await createClient()

  // Load profiles for filter dropdown
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nombre, rol')
    .order('nombre')

  // Build audit log query
  let query = supabase
    .from('audit_log')
    .select('id, accion, recurso, ip_address, user_agent, created_at, usuario_id, profiles(nombre)', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (accion) query = query.eq('accion', accion)
  if (usuario) query = query.eq('usuario_id', usuario)
  if (desde) query = query.gte('created_at', desde)
  if (hasta) query = query.lte('created_at', hasta + 'T23:59:59')
  if (q) query = query.ilike('recurso', `%${q}%`)

  const { data: rows, count } = await query

  return (
    <Suspense fallback={<div className="text-sm text-tertiary p-4">Cargando registros...</div>}>
      <AuditTable
        rows={(rows ?? []) as import('./AuditTable').AuditRow[]}
        totalCount={count ?? 0}
        profiles={profiles ?? []}
        page={page}
        pageSize={PAGE_SIZE}
        filters={{ accion, desde, hasta, usuario, q }}
      />
    </Suspense>
  )
}
