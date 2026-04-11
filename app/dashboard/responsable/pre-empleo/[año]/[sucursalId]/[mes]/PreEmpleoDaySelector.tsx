'use client'

import Link from 'next/link'
import { LuCalendar, LuExternalLink, LuArrowLeft } from 'react-icons/lu'

type DayEntry = {
  dia: number
  drive_url: string
}

export default function PreEmpleoDaySelector({
  dias,
  año,
  mes,
  mesNombre,
  sucursalId,
  sucursalNombre,
  empresaNombre,
}: {
  dias: DayEntry[]
  año: number
  mes: number
  mesNombre: string
  sucursalId: string
  sucursalNombre: string
  empresaNombre: string
}) {
  if (dias.length === 0) {
    return (
      <div className="space-y-6">
        <Link
          href={`/dashboard/responsable/pre-empleo/${año}/${sucursalId}`}
          className="inline-flex items-center gap-2 text-sm text-tertiary hover:text-primary font-medium transition-colors"
        >
          <LuArrowLeft size={16} />
          Volver a meses
        </Link>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
            <LuCalendar size={32} className="text-tertiary" />
          </div>
          <h3 className="text-lg font-bold text-on-surface font-headline mb-2">
            Sin días disponibles
          </h3>
          <p className="text-sm text-tertiary max-w-sm">
            No se encontraron exámenes pre empleo para {mesNombre} {año}.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={`/dashboard/responsable/pre-empleo/${año}/${sucursalId}`}
          className="inline-flex items-center gap-2 text-sm text-tertiary hover:text-primary font-medium transition-colors"
        >
          <LuArrowLeft size={16} />
          Volver a meses
        </Link>
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 px-5 py-4 flex items-center gap-4">
          <LuCalendar size={32} className="text-primary" />
          <div>
            <p className="text-xs text-tertiary font-medium uppercase tracking-wide">
              {sucursalNombre}{empresaNombre ? ` — ${empresaNombre}` : ''} · {mesNombre} {año}
            </p>
            <p className="text-3xl font-bold text-primary font-headline">
              {dias.length} <span className="text-sm font-medium text-tertiary">días</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
        {dias.map((entry) => (
          <a
            key={entry.dia}
            href={entry.drive_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-4 flex flex-col items-center gap-2 hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.98]"
          >
            <span className="text-2xl font-bold text-on-surface font-headline">
              {entry.dia}
            </span>
            <span className="text-[10px] text-tertiary font-medium uppercase tracking-wide">
              {mesNombre.slice(0, 3)}
            </span>
            <LuExternalLink
              size={14}
              className="text-tertiary group-hover:text-primary transition-colors"
            />
          </a>
        ))}
      </div>
    </div>
  )
}
