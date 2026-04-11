'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="bg-red-50 border border-sos-red/30 text-sos-red text-sm px-4 py-3 rounded-lg">
          {state.error}
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
