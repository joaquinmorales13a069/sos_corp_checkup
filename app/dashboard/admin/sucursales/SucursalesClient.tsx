'use client'

import { useState, useTransition } from 'react'
import { createSucursal, updateSucursal, deleteSucursal } from '@/app/actions/sucursales'
import DeleteModal from '@/components/admin/DeleteModal'
import type { Tables } from '@/lib/database.types'

type Sucursal = Tables<'sucursales'>
type Empresa = Tables<'empresas'>
type SucursalWithEmpresa = Sucursal & { empresas: Pick<Empresa, 'nombre'> | null }

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'

const selectClass =
  'w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'

function SucursalModal({
  title,
  defaultValues,
  empresas,
  onClose,
  onSave,
}: {
  title: string
  defaultValues?: { nombre: string; empresa_id: string }
  empresas: Empresa[]
  onClose: () => void
  onSave: (fd: FormData) => Promise<{ error?: string } | undefined | void>
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await onSave(fd)
      if (result?.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-on-surface font-headline mb-5">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5">Empresa</label>
            <select
              name="empresa_id"
              defaultValue={defaultValues?.empresa_id ?? ''}
              required
              className={selectClass}
            >
              <option value="" disabled>
                Selecciona una empresa
              </option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5">Nombre de la sucursal</label>
            <input
              name="nombre"
              defaultValue={defaultValues?.nombre}
              required
              placeholder="Ej. LAFISE Villa Fontana"
              className={inputClass}
            />
          </div>
          {error && (
            <p className="text-xs text-error bg-error-container/40 px-3 py-2 rounded-lg">{error}</p>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-tertiary hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-lg text-sm bg-primary text-on-primary font-medium hover:bg-primary-container transition-colors disabled:opacity-60"
            >
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SucursalesClient({
  sucursales,
  empresas,
}: {
  sucursales: SucursalWithEmpresa[]
  empresas: Empresa[]
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<SucursalWithEmpresa | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SucursalWithEmpresa | null>(null)

  return (
    <div className="space-y-6">
      {/* Stats + action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 px-5 py-4 flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-[32px]">domain</span>
          <div>
            <p className="text-xs text-tertiary font-medium uppercase tracking-wide">Total sucursales</p>
            <p className="text-3xl font-bold text-primary font-headline">{sucursales.length}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-container transition-colors self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nueva Sucursal
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/10">
          <h3 className="text-sm font-semibold text-on-surface font-headline">Listado de sucursales</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container">
                <th className="px-5 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wide">
                  Nombre
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wide hidden sm:table-cell">
                  Empresa
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wide hidden md:table-cell">
                  Creada
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-tertiary uppercase tracking-wide">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {sucursales.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-tertiary">
                    No hay sucursales registradas
                  </td>
                </tr>
              ) : (
                sucursales.map((sucursal) => (
                  <tr
                    key={sucursal.id}
                    className="border-t border-outline-variant/10 hover:bg-surface-container-low transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-on-surface">
                      {sucursal.nombre}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-tertiary hidden sm:table-cell">
                      {sucursal.empresas?.nombre ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-tertiary hidden md:table-cell">
                      {sucursal.created_at
                        ? new Date(sucursal.created_at).toLocaleDateString('es-NI')
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditTarget(sucursal)}
                          title="Editar"
                          className="p-1.5 rounded-lg text-tertiary hover:text-primary hover:bg-surface-container transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(sucursal)}
                          title="Eliminar"
                          className="p-1.5 rounded-lg text-tertiary hover:text-error hover:bg-error-container/30 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <SucursalModal
          title="Nueva Sucursal"
          empresas={empresas}
          onClose={() => setShowCreate(false)}
          onSave={createSucursal}
        />
      )}

      {editTarget && (
        <SucursalModal
          title="Editar Sucursal"
          defaultValues={{ nombre: editTarget.nombre, empresa_id: editTarget.empresa_id }}
          empresas={empresas}
          onClose={() => setEditTarget(null)}
          onSave={(fd) => updateSucursal(editTarget.id, fd)}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.nombre}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteSucursal(deleteTarget.id)}
        />
      )}
    </div>
  )
}
