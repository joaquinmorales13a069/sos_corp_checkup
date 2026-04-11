'use client'

import Link from 'next/link'
import { LuCalendar, LuChevronRight, LuArrowLeft } from 'react-icons/lu'

export default function PreEmpleoYearSelector({ años }: { años: number[] }) {
  if (años.length === 0) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/responsable"
          className="inline-flex items-center gap-2 text-sm text-tertiary hover:text-primary font-medium transition-colors"
        >
          <LuArrowLeft size={16} />
          Volver a categorías
        </Link>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
            <LuCalendar size={32} className="text-tertiary" />
          </div>
          <h3 className="text-lg font-bold text-on-surface font-headline mb-2">
            Sin exámenes pre empleo
          </h3>
          <p className="text-sm text-tertiary max-w-sm">
            Aún no hay exámenes pre empleo asignados. Contacta al administrador de SOS Medical para más información.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/responsable"
        className="inline-flex items-center gap-2 text-sm text-tertiary hover:text-primary font-medium transition-colors"
      >
        <LuArrowLeft size={16} />
        Volver a categorías
      </Link>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 px-5 py-4 flex items-center gap-4">
        <LuCalendar size={32} className="text-primary" />
        <div>
          <p className="text-xs text-tertiary font-medium uppercase tracking-wide">Años disponibles</p>
          <p className="text-3xl font-bold text-primary font-headline">{años.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {años.map((año) => (
          <Link
            key={año}
            href={`/dashboard/responsable/pre-empleo/${año}`}
            className="group bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6 flex items-center justify-between hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center">
                <LuCalendar size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-on-surface font-headline">{año}</p>
                <p className="text-xs text-tertiary font-medium">Pre empleo</p>
              </div>
            </div>
            <LuChevronRight size={20} className="text-tertiary group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
