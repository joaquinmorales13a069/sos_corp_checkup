'use client'

import { useState, useTransition, useMemo } from 'react'
import { createUsuario, updateUsuario, deleteUsuario, updateAsignaciones } from '@/app/actions/usuarios'
import DeleteModal from '@/components/admin/DeleteModal'
import type { Tables } from '@/lib/database.types'
import { LuUsers, LuUserPlus, LuSearch, LuX, LuPencil, LuTrash2 } from 'react-icons/lu'

type Profile = Tables<'profiles'>
type Empresa = Tables<'empresas'>
type UsuarioRow = Profile & { email: string }

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'

// ─── Empresa Picker (reutilizable con search) ─────────────────────────────────

function EmpresasPicker({
  empresas,
  selected,
  onChange,
}: {
  empresas: Empresa[]
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const [query, setQuery] = useState('')

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return empresas
    return empresas.filter((e) => e.nombre.toLowerCase().includes(q))
  }, [query, empresas])

  // Within filtered results, show selected ones first
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aSelected = selected.includes(a.id)
      const bSelected = selected.includes(b.id)
      if (aSelected && !bSelected) return -1
      if (!aSelected && bSelected) return 1
      return 0
    })
  }, [filtered, selected])

  return (
    <div className="space-y-2">
      {/* Header row: label + count badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-tertiary">Empresas asignadas</span>
        {selected.length > 0 && (
          <span className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full font-semibold">
            {selected.length} seleccionada{selected.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Search input */}
      <div className="relative">
        <LuSearch size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar empresa..."
          className="w-full pl-8 pr-8 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-tertiary hover:text-on-surface"
          >
            <LuX size={16} />
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-0.5 max-h-52 overflow-y-auto rounded-lg border border-outline-variant/30 p-1">
        {sorted.length === 0 ? (
          <p className="text-xs text-tertiary text-center py-6">
            Sin resultados para &ldquo;{query}&rdquo;
          </p>
        ) : (
          sorted.map((empresa) => {
            const checked = selected.includes(empresa.id)
            return (
              <label
                key={empresa.id}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors select-none ${
                  checked
                    ? 'bg-primary/8 text-primary'
                    : 'hover:bg-surface-container text-on-surface'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(empresa.id)}
                  className="accent-primary w-4 h-4 shrink-0"
                />
                <span className="text-sm font-medium truncate">{empresa.nombre}</span>
              </label>
            )
          })
        )}
      </div>

      {/* Footer: clear all shortcut */}
      {selected.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-xs text-tertiary hover:text-error transition-colors"
        >
          Limpiar selección
        </button>
      )}
    </div>
  )
}

// ─── Create Modal ────────────────────────────────────────────────────────────

function CreateUsuarioModal({
  empresas,
  onClose,
}: {
  empresas: Empresa[]
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    selected.forEach((id) => fd.append('empresa_ids', id))
    startTransition(async () => {
      const result = await createUsuario(fd)
      if (result?.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-on-surface font-headline mb-5">Nuevo Responsable</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5">Nombre completo</label>
            <input name="nombre" required placeholder="Ej. María López" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5">Correo electrónico</label>
            <input name="email" type="email" required placeholder="responsable@empresa.com" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5">Contraseña temporal</label>
            <input name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" className={inputClass} />
          </div>

          {empresas.length > 0 && (
            <EmpresasPicker empresas={empresas} selected={selected} onChange={setSelected} />
          )}

          {error && <p className="text-xs text-error bg-error-container/40 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-tertiary hover:bg-surface-container transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="px-4 py-2 rounded-lg text-sm bg-primary text-on-primary font-medium hover:bg-primary-container transition-colors disabled:opacity-60">
              {isPending ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditUsuarioModal({
  usuario,
  empresas,
  asignacionesIniciales,
  onClose,
}: {
  usuario: UsuarioRow
  empresas: Empresa[]
  asignacionesIniciales: string[]
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>(asignacionesIniciales)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const [r1, r2] = await Promise.all([
        updateUsuario(usuario.id, fd),
        updateAsignaciones(usuario.id, selected),
      ])
      if (r1?.error) { setError(r1.error); return }
      if (r2?.error) { setError(r2.error); return }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-on-surface font-headline mb-5">Editar Responsable</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5">Nombre completo</label>
            <input name="nombre" defaultValue={usuario.nombre} required className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5">Correo electrónico</label>
            <input value={usuario.email} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
            <p className="text-xs text-tertiary mt-1">El email no se puede modificar</p>
          </div>

          <EmpresasPicker empresas={empresas} selected={selected} onChange={setSelected} />

          {error && <p className="text-xs text-error bg-error-container/40 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-tertiary hover:bg-surface-container transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="px-4 py-2 rounded-lg text-sm bg-primary text-on-primary font-medium hover:bg-primary-container transition-colors disabled:opacity-60">
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UsuariosClient({
  usuarios,
  empresas,
  asignaciones,
}: {
  usuarios: UsuarioRow[]
  empresas: Empresa[]
  asignaciones: Record<string, string[]>
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<UsuarioRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UsuarioRow | null>(null)

  return (
    <div className="space-y-6">
      {/* Stats + action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 px-5 py-4 flex items-center gap-4">
          <LuUsers size={32} className="text-primary" />
          <div>
            <p className="text-xs text-tertiary font-medium uppercase tracking-wide">Total responsables</p>
            <p className="text-3xl font-bold text-primary font-headline">{usuarios.length}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-container transition-colors self-start sm:self-auto"
        >
          <LuUserPlus size={18} />
          Nuevo Responsable
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/10">
          <h3 className="text-sm font-semibold text-on-surface font-headline">Listado de responsables</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container">
                <th className="px-5 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wide">Nombre</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wide hidden sm:table-cell">Correo</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wide hidden md:table-cell">Empresas</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-tertiary uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-tertiary">
                    No hay responsables registrados
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => {
                  const count = asignaciones[usuario.id]?.length ?? 0
                  return (
                    <tr key={usuario.id} className="border-t border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-on-surface">{usuario.nombre}</td>
                      <td className="px-5 py-3.5 text-sm text-tertiary hidden sm:table-cell">{usuario.email}</td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        {count > 0 ? (
                          <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
                            {count} {count === 1 ? 'empresa' : 'empresas'}
                          </span>
                        ) : (
                          <span className="text-xs bg-surface-container text-tertiary px-2.5 py-1 rounded-full">
                            Sin asignar
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditTarget(usuario)}
                            title="Editar"
                            className="p-1.5 rounded-lg text-tertiary hover:text-primary hover:bg-surface-container transition-colors"
                          >
                            <LuPencil size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(usuario)}
                            title="Eliminar"
                            className="p-1.5 rounded-lg text-tertiary hover:text-error hover:bg-error-container/30 transition-colors"
                          >
                            <LuTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && <CreateUsuarioModal empresas={empresas} onClose={() => setShowCreate(false)} />}

      {editTarget && (
        <EditUsuarioModal
          usuario={editTarget}
          empresas={empresas}
          asignacionesIniciales={asignaciones[editTarget.id] ?? []}
          onClose={() => setEditTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.nombre}
          warning="También se eliminará su acceso al sistema."
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteUsuario(deleteTarget.id)}
        />
      )}
    </div>
  )
}
