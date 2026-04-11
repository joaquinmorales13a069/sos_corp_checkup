'use client'

import Link from 'next/link'
import { LuBuilding2, LuExternalLink, LuFolderOpen, LuArrowLeft } from 'react-icons/lu'

type Chequeo = {
  id: string
  año: number
  drive_url: string
  sucursal_id: string
  sucursales: {
    nombre: string
    empresa_id: string
    empresas: {
      nombre: string
      logo_url: string | null
    } | null
  } | null
}

type EmpresaGroup = {
  empresa_nombre: string
  logo_url: string | null
  sucursales: { nombre: string; drive_url: string }[]
}

function groupByEmpresa(chequeos: Chequeo[]): EmpresaGroup[] {
  const map = new Map<string, EmpresaGroup>()

  for (const c of chequeos) {
    const empresa_nombre = c.sucursales?.empresas?.nombre ?? 'Sin empresa'
    const logo_url = c.sucursales?.empresas?.logo_url ?? null
    const key = empresa_nombre

    if (!map.has(key)) {
      map.set(key, { empresa_nombre, logo_url, sucursales: [] })
    }

    map.get(key)!.sucursales.push({
      nombre: c.sucursales?.nombre ?? 'Sin nombre',
      drive_url: c.drive_url,
    })
  }

  return [...map.values()].sort((a, b) =>
    a.empresa_nombre.localeCompare(b.empresa_nombre),
  )
}

export default function PeriodicoChequeos({
  chequeos,
  año,
}: {
  chequeos: Chequeo[]
  año: number
}) {
  if (chequeos.length === 0) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/responsable/periodico"
          className="inline-flex items-center gap-2 text-sm text-tertiary hover:text-primary font-medium transition-colors"
        >
          <LuArrowLeft size={16} />
          Volver a años
        </Link>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
            <LuFolderOpen size={32} className="text-tertiary" />
          </div>
          <h3 className="text-lg font-bold text-on-surface font-headline mb-2">
            Sin chequeos para {año}
          </h3>
          <p className="text-sm text-tertiary max-w-sm">
            No se encontraron chequeos médicos periódicos para este año.
          </p>
        </div>
      </div>
    )
  }

  const groups = groupByEmpresa(chequeos)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/dashboard/responsable/periodico"
          className="inline-flex items-center gap-2 text-sm text-tertiary hover:text-primary font-medium transition-colors"
        >
          <LuArrowLeft size={16} />
          Volver a años
        </Link>
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 px-5 py-4 flex items-center gap-4">
          <LuFolderOpen size={32} className="text-primary" />
          <div>
            <p className="text-xs text-tertiary font-medium uppercase tracking-wide">Sucursales en {año}</p>
            <p className="text-3xl font-bold text-primary font-headline">{chequeos.length}</p>
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
              <a
                key={suc.nombre + suc.drive_url}
                href={suc.drive_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 flex items-center justify-between hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed shrink-0 flex items-center justify-center">
                    <LuFolderOpen size={20} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-on-surface font-headline truncate">
                      {suc.nombre}
                    </p>
                    <p className="text-xs text-tertiary mt-0.5">Ver en Google Drive</p>
                  </div>
                </div>
                <LuExternalLink
                  size={18}
                  className="text-tertiary group-hover:text-primary transition-colors shrink-0 ml-3"
                />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
