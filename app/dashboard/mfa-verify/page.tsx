'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MFAVerifyPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [factorId, setFactorId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    async function init() {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error || !data) {
        setError('Error al cargar la configuración MFA')
        return
      }
      const verified = data.totp.find(f => f.status === 'verified')
      if (!verified) {
        router.replace('/dashboard/mfa-setup')
        return
      }
      setFactorId(verified.id)
    }
    init()
  }, [])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!factorId || code.length !== 6) return
    setVerifying(true)
    setError(null)
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })
    setVerifying(false)
    if (error) {
      setError('Código incorrecto. Inténtalo de nuevo.')
      return
    }
    router.push('/dashboard/admin/empresas')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-lg font-bold text-on-surface font-headline mb-1">
            Verificación en dos pasos
          </h1>
          <p className="text-xs text-tertiary">
            Ingresa el código de tu app autenticadora
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            required
            autoFocus
            className="w-full px-3 py-3 rounded-lg border border-outline-variant bg-surface-container-low text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />

          {error && (
            <p className="text-xs text-error bg-error-container/40 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={verifying || code.length !== 6 || !factorId}
            className="w-full px-4 py-2 rounded-lg text-sm bg-primary text-on-primary font-medium hover:bg-primary-container transition-colors disabled:opacity-60"
          >
            {verifying ? 'Verificando...' : 'Verificar →'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-surface-container rounded-lg">
          <p className="text-xs font-medium text-on-surface mb-1">¿Perdiste acceso a tu app?</p>
          <p className="text-xs text-tertiary">
            Contacta al administrador de SOS Medical para restablecer tu MFA.
          </p>
        </div>
      </div>
    </div>
  )
}
