'use client'

import Link from 'next/link'
import { LuBuilding2, LuBuilding, LuChevronRight, LuArrowLeft } from 'react-icons/lu'

type SucursalItem = {
  id: string
  nombre: string
  empresa_nombre: string
  logo_url: string | null
}

type EmpresaGroup = {
  empresa_nombre: string
  sucursales: SucursalItem[]
}

function groupByEmpresa(sucursales: SucursalItem[]): EmpresaGroup[] {
  const map = new Map<string, EmpresaGroup>()

  for (const s of sucursales) {
    if (!map.has(s.empresa_nombre)) {
      map.set(s.empresa_nombre, { empresa_nombre: s.empresa_nombre, sucursales: [] })
    }
    map.get(s.empresa_nombre)!.sucursales.push(s)
  }

  return [...map.values()].sort((a, b) =>
    a.empresa_nombre.localeCompare(b.empresa_nombre),
  )
}

export default function PreEmpleoSucursalSelector({
  sucursales,
  año,
}: {
  sucursales: SucursalItem[]
  año: number
}) {
  if (sucursales.length === 0) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/responsable/pre-empleo"
          className="inline-flex items-center gap-2 text-sm text-tertiary hover:text-primary font-medium transition-colors"
        >
          <LuArrowLeft size={16} />
          Volver a años
        </Link>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
            <LuBuilding size={32} className="text-tertiary" />
          </div>
          <h3 className="text-lg font-bold text-on-surface font-headline mb-2">
            Sin sucursales para {año}
          </h3>
          <p className="text-sm text-tertiary max-w-sm">
            No se encontraron exámenes pre empleo para este año.
          </p>
        </div>
      </div>
    )
  }

  const groups = groupByEmpresa(sucursales)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/dashboard/responsable/pre-empleo"
          className="inline-flex items-center gap-2 text-sm text-tertiary hover:text-primary font-medium transition-colors"
        >
          <LuArrowLeft size={16} />
          Volver a años
        </Link>
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 px-5 py-4 flex items-center gap-4">
          <LuBuilding size={32} className="text-primary" />
          <div>
            <p className="text-xs text-tertiary font-medium uppercase tracking-wide">Sucursales en {año}</p>
            <p className="text-3xl font-bold text-primary font-headline">{sucursales.length}</p>
          </div>
        </div>
      </div>

      {groups.map((group) => (
        <div key={group.empresa_nombre} className="space-y-3">
          <div className="flex items-center gap-3 px-1">
            <LuBuilding2 size={18} className="text-primary" />
            <h3 className="text-sm font-semibold text-on-surface font-headline uppercase tracking-wide">
              {group.empresa_nombre}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.sucursales.map((suc) => (
              <Link
                key={suc.id}
                href={`/dashboard/responsable/pre-empleo/${año}/${suc.id}`}
                className="group bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 flex items-center justify-between hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed shrink-0 flex items-center justify-center">
                    <LuBuilding size={20} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-on-surface font-headline truncate">
                      {suc.nombre}
                    </p>
                    <p className="text-xs text-tertiary mt-0.5">Seleccionar mes</p>
                  </div>
                </div>
                <LuChevronRight
                  size={18}
                  className="text-tertiary group-hover:text-primary transition-colors shrink-0 ml-3"
                />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
