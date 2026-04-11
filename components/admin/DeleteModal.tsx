'use client'

import { useState, useTransition } from 'react'
import { toast } from 'react-toastify'
import { LuTriangleAlert } from 'react-icons/lu'

interface DeleteModalProps {
  name: string
  warning?: string
  onClose: () => void
  onConfirm: () => Promise<{ error?: string } | undefined | void>
}

export default function DeleteModal({ name, warning, onClose, onConfirm }: DeleteModalProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleConfirm() {
    startTransition(async () => {
      const result = await onConfirm()
      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success('Registro eliminado exitosamente')
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <LuTriangleAlert size={24} className="text-error shrink-0" />
          <h3 className="text-base font-bold text-on-surface font-headline">Eliminar registro</h3>
        </div>
        <p className="text-sm text-on-surface-variant">
          ¿Estás seguro que deseas eliminar{' '}
          <strong className="text-on-surface">{name}</strong>?
          {' '}Esta acción no se puede deshacer.
        </p>
        {warning && (
          <p className="mt-2 text-xs text-error bg-error-container/40 px-3 py-2 rounded-lg">
            {warning}
          </p>
        )}
        {error && (
          <p className="mt-3 text-xs text-error bg-error-container/40 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-sm text-tertiary hover:bg-surface-container transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-sm bg-error text-on-primary font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isPending ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
