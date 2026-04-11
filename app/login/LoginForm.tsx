'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('logout') === '1') {
      toast.info('Sesión cerrada correctamente')
      window.history.replaceState({}, '', '/login')
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsPending(true)

    const form = new FormData(e.currentTarget)
    const email = form.get('email') as string
    const password = form.get('password') as string

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      toast.error('Credenciales incorrectas')
      setIsPending(false)
      return
    }

    toast.success('Sesión iniciada correctamente')
    window.location.href = '/dashboard'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-sos-red/30 text-sos-red text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-sos-gray">
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="correo@empresa.com"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sos-bluegreen/30 focus:border-sos-bluegreen transition"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-sos-gray">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sos-bluegreen/30 focus:border-sos-bluegreen transition"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-sos-red text-sos-white py-2.5 rounded-lg text-sm font-semibold hover:bg-sos-red/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}
