'use client'

import { useState, useTransition, useMemo } from 'react'
import { toast } from 'react-toastify'
import { createChequeo, updateChequeo, deleteChequeo } from '@/app/actions/chequeos'
import DeleteModal from '@/components/admin/DeleteModal'
import type { Tables } from '@/lib/database.types'
import {
  LuClipboardCheck,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuExternalLink,
  LuSearch,
  LuX,
} from 'react-icons/lu'

type Empresa = Tables<'empresas'>
type Sucursal = Tables<'sucursales'>
type Chequeo = Tables<'chequeos'> & {
  sucursales: Pick<Sucursal, 'nombre' | 'empresa_id'> & {
    empresas: Pick<Empresa, 'nombre'> | null
  } | null
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'

const selectClass =
  'w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'

function ChequeoModal({
  title,
  defaultValues,
  empresas,
  sucursales,
  onClose,
  onSave,
}: {
  title: string
  defaultValues?: {
    sucursal_id: string
    empresa_id: string
    año: number
    drive_url: string
  }
  empresas: Empresa[]
  sucursales: Sucursal[]
  onClose: () => void
  onSave: (fd: FormData) => Promise<{ error?: string } | undefined | void>
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>(
    defaultValues?.empresa_id ?? ''
  )

  const filteredSucursales = useMemo(
    () =>
      selectedEmpresa
        ? sucursales.filter((s) => s.empresa_id === selectedEmpresa)
        : [],
    [sucursales, selectedEmpresa]
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await onSave(fd)
      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success(title.startsWith('Nuevo') ? 'Chequeo creado exitosamente' : 'Chequeo actualizado exitosamente')
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-on-surface font-headline mb-5">
          {title}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5">
              Empresa
            </label>
            <select
              value={selectedEmpresa}
              onChange={(e) => setSelectedEmpresa(e.target.value)}
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
            <label className="block text-xs font-medium text-tertiary mb-1.5">
              Sucursal
            </label>
            <select
              name="sucursal_id"
              defaultValue={defaultValues?.sucursal_id ?? ''}
              required
              disabled={!selectedEmpresa}
              className={selectClass}
            >
              <option value="" disabled>
                {selectedEmpresa
                  ? 'Selecciona una sucursal'
                  : 'Primero selecciona una empresa'}
              </option>
              {filteredSucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5">
              Año
            </label>
            <input
              name="año"
              type="number"
              min={2020}
              max={2050}
              defaultValue={defaultValues?.año ?? new Date().getFullYear()}
              required
              placeholder="Ej. 2026"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5">
              Enlace de Google Drive
            </label>
            <input
              name="drive_url"
              type="url"
              defaultValue={defaultValues?.drive_url}
              required
              placeholder="https://drive.google.com/..."
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-xs text-error bg-error-container/40 px-3 py-2 rounded-lg">
              {error}
            </p>
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

export default function ChequeosClient({
  chequeos,
  empresas,
  sucursales,
}: {
  chequeos: Chequeo[]
  empresas: Empresa[]
  sucursales: Sucursal[]
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Chequeo | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Chequeo | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return chequeos
    return chequeos.filter(
      (c) =>
        (c.sucursales?.nombre ?? '').toLowerCase().includes(q) ||
        (c.sucursales?.empresas?.nombre ?? '').toLowerCase().includes(q) ||
        String(c.año).includes(q)
    )
  }, [search, chequeos])

  return (
    <div className="space-y-6">
      {/* Stats + action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 px-5 py-4 flex items-center gap-4">
          <LuClipboardCheck size={32} className="text-primary" />
          <div>
            <p className="text-xs text-tertiary font-medium uppercase tracking-wide">
              Total chequeos
            </p>
            <p className="text-3xl font-bold text-primary font-headline">
              {chequeos.length}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-container transition-colors self-start sm:self-auto"
        >
          <LuPlus size={18} />
          Nuevo Chequeo
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-on-surface font-headline">
            Listado de chequeos
          </h3>
          <div className="relative w-full sm:w-64">
            <LuSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar sucursal, empresa o año..."
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-tertiary hover:text-on-surface transition-colors"
              >
                <LuX size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container">
                <th className="px-5 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wide">
                  Sucursal
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wide hidden sm:table-cell">
                  Empresa
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wide">
                  Año
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wide hidden md:table-cell">
                  Drive
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wide hidden lg:table-cell">
                  Creado
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-tertiary uppercase tracking-wide">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-tertiary"
                  >
                    {search ? 'Sin resultados para la búsqueda' : 'No hay chequeos registrados'}
                  </td>
                </tr>
              ) : (
                filtered.map((chequeo) => (
                  <tr
                    key={chequeo.id}
                    className="border-t border-outline-variant/10 hover:bg-surface-container-low transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-on-surface">
                      {chequeo.sucursales?.nombre ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-tertiary hidden sm:table-cell">
                      {chequeo.sucursales?.empresas?.nombre ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-on-surface">
                      {chequeo.año}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <a
                        href={`/api/drive-redirect?url=${encodeURIComponent(chequeo.drive_url)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <LuExternalLink size={14} />
                        <span className="max-w-[180px] truncate">
                          {chequeo.drive_url}
                        </span>
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-tertiary hidden lg:table-cell">
                      {chequeo.created_at
                        ? new Date(chequeo.created_at).toLocaleDateString(
                            'es-NI'
                          )
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditTarget(chequeo)}
                          title="Editar"
                          className="p-1.5 rounded-lg text-tertiary hover:text-primary hover:bg-surface-container transition-colors"
                        >
                          <LuPencil size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(chequeo)}
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
        <ChequeoModal
          title="Nuevo Chequeo"
          empresas={empresas}
          sucursales={sucursales}
          onClose={() => setShowCreate(false)}
          onSave={createChequeo}
        />
      )}

      {editTarget && (
        <ChequeoModal
          title="Editar Chequeo"
          defaultValues={{
            sucursal_id: editTarget.sucursal_id,
            empresa_id: editTarget.sucursales?.empresa_id ?? '',
            año: editTarget.año,
            drive_url: editTarget.drive_url,
          }}
          empresas={empresas}
          sucursales={sucursales}
          onClose={() => setEditTarget(null)}
          onSave={(fd) => updateChequeo(editTarget.id, fd)}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          name={`${deleteTarget.sucursales?.nombre ?? 'Chequeo'} — ${deleteTarget.año}`}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteChequeo(deleteTarget.id)}
        />
      )}
    </div>
  )
}
