'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { LuChevronLeft, LuChevronRight, LuShieldCheck } from 'react-icons/lu'
import type { AuditAction } from '@/lib/audit'

export type AuditRow = {
  id: string
  accion: string
  recurso: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  usuario_id: string | null
  profiles: { nombre: string } | null
}

type Profile = { id: string; nombre: string; rol: string }

type Filters = {
  accion: string
  desde: string
  hasta: string
  usuario: string
  q: string
}

const ALL_ACTIONS: AuditAction[] = [
  'login', 'login_fallido', 'logout',
  'acceso_drive',
  'crear_empresa', 'editar_empresa', 'eliminar_empresa',
  'crear_sucursal', 'editar_sucursal', 'eliminar_sucursal',
  'crear_usuario', 'editar_usuario', 'eliminar_usuario',
  'crear_chequeo', 'editar_chequeo', 'eliminar_chequeo',
  'crear_chequeo_pre_empleo', 'editar_chequeo_pre_empleo', 'eliminar_chequeo_pre_empleo',
  'cambio_nombre', 'cambio_correo', 'cambio_contraseña',
]

function actionBadgeClass(accion: string): string {
  if (accion === 'login_fallido') return 'bg-error-container/40 text-error'
  if (accion === 'login' || accion === 'logout') return 'bg-primary-fixed/40 text-primary'
  if (accion === 'acceso_drive') return 'bg-primary-fixed/40 text-primary'
  if (accion.startsWith('eliminar')) return 'bg-error-container/20 text-on-surface'
  return 'bg-surface-container text-on-surface'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-NI', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const inputClass =
  'px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'

export default function AuditTable({
  rows,
  totalCount,
  profiles,
  page,
  pageSize,
  filters,
}: {
  rows: AuditRow[]
  totalCount: number
  profiles: Profile[]
  page: number
  pageSize: number
  filters: Filters
}) {
  const router = useRouter()
  const sp = useSearchParams()

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(sp.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(sp.toString())
    params.set('page', String(p))
    router.push(`?${params.toString()}`)
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center">
          <LuShieldCheck size={16} className="text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-on-surface font-headline">Registros de Auditoría</h2>
          <p className="text-xs text-tertiary">{totalCount} eventos totales</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select
            defaultValue={filters.accion}
            onChange={(e) => setFilter('accion', e.target.value)}
            className={inputClass}
          >
            <option value="">Todas las acciones</option>
            {ALL_ACTIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            defaultValue={filters.usuario}
            onChange={(e) => setFilter('usuario', e.target.value)}
            className={inputClass}
          >
            <option value="">Todos los usuarios</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>

          <input
            type="date"
            defaultValue={filters.desde}
            onChange={(e) => setFilter('desde', e.target.value)}
            className={inputClass}
            placeholder="Desde"
          />

          <input
            type="date"
            defaultValue={filters.hasta}
            onChange={(e) => setFilter('hasta', e.target.value)}
            className={inputClass}
            placeholder="Hasta"
          />

          <input
            type="text"
            defaultValue={filters.q}
            onChange={(e) => setFilter('q', e.target.value)}
            className={inputClass}
            placeholder="Buscar recurso..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-tertiary uppercase tracking-wide whitespace-nowrap">Fecha/Hora</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-tertiary uppercase tracking-wide">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-tertiary uppercase tracking-wide">Acción</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-tertiary uppercase tracking-wide">Recurso</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-tertiary uppercase tracking-wide">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-tertiary">
                    No hay registros para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-container/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-tertiary whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface">
                      {row.profiles?.nombre ?? <span className="text-tertiary italic">desconocido</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${actionBadgeClass(row.accion)}`}>
                        {row.accion}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface max-w-xs">
                      {row.recurso ? (
                        <span className="truncate block max-w-[200px]" title={row.recurso}>
                          {row.recurso}
                        </span>
                      ) : (
                        <span className="text-tertiary">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-tertiary font-mono whitespace-nowrap">
                      {row.ip_address ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-tertiary">
            Página {page + 1} de {totalPages} · {totalCount} registros
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-outline-variant text-on-surface disabled:opacity-40 hover:bg-surface-container transition-colors"
            >
              <LuChevronLeft size={16} />
            </button>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-outline-variant text-on-surface disabled:opacity-40 hover:bg-surface-container transition-colors"
            >
              <LuChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
