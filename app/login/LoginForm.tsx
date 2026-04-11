'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { createClient } from '@/lib/supabase/client'
import Turnstile, { useTurnstile } from 'react-turnstile'

export default function LoginForm() {
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const turnstile = useTurnstile()

  useEffect(() => {
    if (searchParams.get('logout') === '1') {
      toast.info('Sesión cerrada correctamente')
      window.history.replaceState({}, '', '/login')
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!captchaToken) {
      setError('Por favor espera a que se complete la verificación de seguridad.')
      return
    }

    setIsPending(true)

    const form = new FormData(e.currentTarget)
    const email = form.get('email') as string
    const password = form.get('password') as string

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    })

    if (authError) {
      console.error('[Auth error]', authError.status, authError.message)

      const msg = authError.message.toLowerCase()
      let userMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.'

      if (msg.includes('captcha')) {
        userMessage = 'Error en la verificación de seguridad. Recarga la página e inténtalo de nuevo.'
      } else if (msg.includes('email not confirmed')) {
        userMessage = 'Debes confirmar tu correo electrónico antes de iniciar sesión.'
      } else if (msg.includes('too many requests')) {
        userMessage = 'Demasiados intentos. Espera unos minutos antes de intentarlo de nuevo.'
      }

      setError(userMessage)
      toast.error(userMessage)
      setCaptchaToken(null)
      turnstile.reset()
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
          suppressHydrationWarning
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
          suppressHydrationWarning
        />
      </div>

      <Turnstile
        sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onVerify={(token) => setCaptchaToken(token)}
        onExpire={() => setCaptchaToken(null)}
        onError={() => {
          setCaptchaToken(null)
          setError('Error al cargar la verificación de seguridad. Recarga la página.')
        }}
        className="flex justify-center"
      />

      <button
        type="submit"
        disabled={isPending || !captchaToken}
        className="w-full bg-sos-red text-sos-white py-2.5 rounded-lg text-sm font-semibold hover:bg-sos-red/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}
