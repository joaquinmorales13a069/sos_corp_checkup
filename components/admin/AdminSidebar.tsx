'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import logo from '@/assets/images/logo-SOSMedical.webp'
import { LuBuilding2, LuBuilding, LuUsers, LuClipboardCheck, LuUserCheck, LuLogOut, LuX } from 'react-icons/lu'
import type { IconType } from 'react-icons'

type NavLink = { kind: 'link'; href: string; label: string; icon: IconType }
type NavSeparator = { kind: 'separator'; label: string }
type NavEntry = NavLink | NavSeparator

const navItems: NavEntry[] = [
  { kind: 'separator', label: 'Clientes' },
  { kind: 'link', href: '/dashboard/admin/empresas', label: 'Empresas', icon: LuBuilding2 },
  { kind: 'link', href: '/dashboard/admin/sucursales', label: 'Sucursales', icon: LuBuilding },
  { kind: 'link', href: '/dashboard/admin/usuarios', label: 'Usuarios', icon: LuUsers },
  { kind: 'separator', label: 'Chequeos' },
  { kind: 'link', href: '/dashboard/admin/chequeos', label: 'Periódico', icon: LuClipboardCheck },
  { kind: 'link', href: '/dashboard/admin/pre-empleo', label: 'Pre Empleo', icon: LuUserCheck },
]

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen w-[240px] bg-surface-container-lowest flex flex-col py-6 px-4 z-50
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Logo */}
      <div className="mb-10 px-2 flex items-start justify-between">
        <Image
          src={logo}
          alt="SOS Medical"
          width={130}
          height={46}
          className="object-contain"
          priority
        />
        <button
          onClick={onClose}
          className="lg:hidden text-tertiary hover:bg-surface-container-low rounded-lg p-1 mt-1"
        >
          <LuX size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          if (item.kind === 'separator') {
            return (
              <p
                key={item.label}
                className="px-4 pt-5 pb-1 text-[11px] font-semibold text-tertiary uppercase tracking-widest"
              >
                {item.label}
              </p>
            )
          }

          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] font-headline ${
                isActive
                  ? 'text-primary bg-surface-container border-l-4 border-primary'
                  : 'text-tertiary border-l-4 border-transparent hover:bg-surface-container-low'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="pt-6 border-t border-surface-container">
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-2 text-tertiary text-sm font-medium font-headline hover:bg-surface-container-low rounded-lg transition-colors w-full"
          >
            <LuLogOut size={20} />
            Cerrar Sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
