'use client'

import { useState } from 'react'
import ResponsableSidebar from './ResponsableSidebar'
import ResponsableHeader from './ResponsableHeader'

export default function ResponsableShell({
  nombre,
  children,
}: {
  nombre: string
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-surface">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <ResponsableSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col w-full lg:ml-[240px]">
        <ResponsableHeader
          nombre={nombre}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <section className="mt-16 p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
          {children}
        </section>
      </main>
    </div>
  )
}
