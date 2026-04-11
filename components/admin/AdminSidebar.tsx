'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import logo from '@/assets/images/logo-SOSMedical.webp'

const navItems = [
  { href: '/dashboard/admin/empresas', label: 'Empresas', icon: 'business' },
  { href: '/dashboard/admin/sucursales', label: 'Sucursales', icon: 'domain' },
  { href: '/dashboard/admin/usuarios', label: 'Usuarios', icon: 'group' },
  { href: '/dashboard/admin/chequeos', label: 'Chequeos', icon: 'fact_check' },
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
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
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
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
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
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Logout
          </button>
        </form>
      </div>
    </aside>
  )
}
