'use client'

import { useState } from 'react'
import { LuMenu } from 'react-icons/lu'
import PublicSidebar from './PublicSidebar'

export default function PublicShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <PublicSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col w-full lg:ml-[240px]">
        {/* Mobile header — hamburger only, hidden on desktop */}
        <header className="sticky top-0 h-16 bg-surface/80 backdrop-blur-md flex items-center px-4 z-40 border-b border-outline-variant/20 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-tertiary hover:bg-surface-container rounded-lg p-2 transition-colors"
          >
            <LuMenu size={22} />
          </button>
          <h2 className="ml-3 text-lg font-bold text-primary font-headline">
            Política de Privacidad
          </h2>
        </header>

        <section className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
          {children}
        </section>
      </main>
    </div>
  )
}
