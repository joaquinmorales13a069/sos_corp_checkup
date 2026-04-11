'use client'

import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/dashboard/admin/empresas': 'Empresas',
  '/dashboard/admin/sucursales': 'Sucursales',
  '/dashboard/admin/usuarios': 'Usuarios',
  '/dashboard/admin/chequeos': 'Chequeos',
}

interface AdminHeaderProps {
  nombre: string
  onMenuClick: () => void
}

export default function AdminHeader({ nombre, onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname()
  const title =
    Object.entries(titles).find(([key]) => pathname.startsWith(key))?.[1] ??
    'Dashboard'

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[240px] h-16 bg-surface/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 z-40 border-b border-outline-variant/20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-tertiary hover:bg-surface-container rounded-lg p-2 transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-primary font-headline">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-surface-container-lowest shadow-sm border border-outline-variant/30">
        <span className="text-xs font-medium text-tertiary">
          <span className="hidden sm:inline">Admin: </span>
          <span className="text-primary font-bold">{nombre}</span>
        </span>
      </div>
    </header>
  )
}
