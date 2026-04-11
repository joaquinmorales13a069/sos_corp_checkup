'use client'

import { useState, useTransition } from 'react'
import { createEmpresa, updateEmpresa, deleteEmpresa } from '@/app/actions/empresas'
import DeleteModal from '@/components/admin/DeleteModal'
import type { Tables } from '@/lib/database.types'
import { LuBuilding2, LuPlus, LuPencil, LuTrash2 } from 'react-icons/lu'

type Empresa = Tables<'empresas'>

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'

function EmpresaModal({
  title,
  defaultValues,
  onClose,
  onSave,
}: {
  title: string
  defaultValues?: { nombre: string }
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
            <label className="block text-xs font-medium text-tertiary mb-1.5">Nombre</label>
            <input
              name="nombre"
              defaultValue={defaultValues?.nombre}
              required
              placeholder="Ej. LAFISE"
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

export default function EmpresasClient({ empresas }: { empresas: Empresa[] }) {
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Empresa | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Empresa | null>(null)

  return (
    <div className="space-y-6">
      {/* Stats + action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 px-5 py-4 flex items-center gap-4">
          <LuBuilding2 size={32} className="text-primary" />
          <div>
            <p className="text-xs text-tertiary font-medium uppercase tracking-wide">Total empresas</p>
            <p className="text-3xl font-bold text-primary font-headline">{empresas.length}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-container transition-colors self-start sm:self-auto"
        >
          <LuPlus size={18} />
          Nueva Empresa
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/10">
          <h3 className="text-sm font-semibold text-on-surface font-headline">Listado de empresas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container">
                <th className="px-5 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wide">
                  Nombre
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wide hidden sm:table-cell">
                  Creada
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-tertiary uppercase tracking-wide">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {empresas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center text-sm text-tertiary">
                    No hay empresas registradas
                  </td>
                </tr>
              ) : (
                empresas.map((empresa) => (
                  <tr
                    key={empresa.id}
                    className="border-t border-outline-variant/10 hover:bg-surface-container-low transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-on-surface">
                      {empresa.nombre}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-tertiary hidden sm:table-cell">
                      {empresa.created_at
                        ? new Date(empresa.created_at).toLocaleDateString('es-NI')
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditTarget(empresa)}
                          title="Editar"
                          className="p-1.5 rounded-lg text-tertiary hover:text-primary hover:bg-surface-container transition-colors"
                        >
                          <LuPencil size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(empresa)}
                          title="Eliminar"
                          className="p-1.5 rounded-lg text-tertiary hover:text-error hover:bg-error-container/30 transition-colors"
                        >
                          <LuTrash2 size={18} />
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
        <EmpresaModal
          title="Nueva Empresa"
          onClose={() => setShowCreate(false)}
          onSave={createEmpresa}
        />
      )}

      {editTarget && (
        <EmpresaModal
          title="Editar Empresa"
          defaultValues={{ nombre: editTarget.nombre }}
          onClose={() => setEditTarget(null)}
          onSave={(fd) => updateEmpresa(editTarget.id, fd)}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.nombre}
          warning="Esta acción también eliminará todas las sucursales asociadas."
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteEmpresa(deleteTarget.id)}
        />
      )}
    </div>
  )
}
