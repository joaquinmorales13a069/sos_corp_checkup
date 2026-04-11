'use client'

import Link from 'next/link'
import { LuCalendar, LuChevronRight, LuArrowLeft } from 'react-icons/lu'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default function PreEmpleoMonthSelector({
  meses,
  año,
  sucursalId,
  sucursalNombre,
  empresaNombre,
}: {
  meses: number[]
  año: number
  sucursalId: string
  sucursalNombre: string
  empresaNombre: string
}) {
  if (meses.length === 0) {
    return (
      <div className="space-y-6">
        <Link
          href={`/dashboard/responsable/pre-empleo/${año}`}
          className="inline-flex items-center gap-2 text-sm text-tertiary hover:text-primary font-medium transition-colors"
        >
          <LuArrowLeft size={16} />
          Volver a sucursales
        </Link>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
            <LuCalendar size={32} className="text-tertiary" />
          </div>
          <h3 className="text-lg font-bold text-on-surface font-headline mb-2">
            Sin meses disponibles
          </h3>
          <p className="text-sm text-tertiary max-w-sm">
            No se encontraron exámenes pre empleo para {sucursalNombre} en {año}.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={`/dashboard/responsable/pre-empleo/${año}`}
          className="inline-flex items-center gap-2 text-sm text-tertiary hover:text-primary font-medium transition-colors"
        >
          <LuArrowLeft size={16} />
          Volver a sucursales
        </Link>
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 px-5 py-4 flex items-center gap-4">
          <LuCalendar size={32} className="text-primary" />
          <div>
            <p className="text-xs text-tertiary font-medium uppercase tracking-wide">
              {sucursalNombre}{empresaNombre ? ` — ${empresaNombre}` : ''} · {año}
            </p>
            <p className="text-3xl font-bold text-primary font-headline">{meses.length} <span className="text-sm font-medium text-tertiary">meses</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {meses.map((mes) => (
          <Link
            key={mes}
            href={`/dashboard/responsable/pre-empleo/${año}/${sucursalId}/${mes}`}
            className="group bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 flex items-center justify-between hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{mes}</span>
              </div>
              <p className="text-sm font-semibold text-on-surface font-headline">
                {MESES[mes - 1]}
              </p>
            </div>
            <LuChevronRight
              size={18}
              className="text-tertiary group-hover:text-primary transition-colors shrink-0 ml-2"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
