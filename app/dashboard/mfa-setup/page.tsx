'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MFASetupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      if (factors?.totp.some(f => f.status === 'verified')) {
        router.replace('/dashboard/mfa-verify')
        return
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (error || !data) {
        setError(error?.message ?? 'Error al iniciar el enrolamiento MFA')
        return
      }
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setFactorId(data.id)
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
      setError('Código incorrecto. Verifica tu app autenticadora e intenta de nuevo.')
      return
    }
    router.push('/dashboard/admin/empresas')
    router.refresh()
  }

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6">
        <h1 className="text-lg font-bold text-on-surface font-headline mb-1">
          Configura tu autenticador
        </h1>
        <p className="text-xs text-tertiary mb-6">
          Escanea el código QR con Google Authenticator, Authy o Microsoft Authenticator
        </p>

        {error && !qrCode && (
          <p className="text-xs text-error bg-error-container/40 px-3 py-2 rounded-lg mb-4">{error}</p>
        )}

        {!qrCode && !error && (
          <div className="text-center text-xs text-tertiary py-8">Generando código QR...</div>
        )}

        {qrCode && (
          <>
            <div className="flex justify-center mb-4">
              <img src={qrCode} alt="Código QR para MFA" className="w-40 h-40 rounded-lg bg-white" />
            </div>

            <div className="bg-surface-container rounded-lg px-4 py-3 mb-5 text-center">
              <p className="text-xs text-tertiary mb-1">Clave manual (si no puedes escanear):</p>
              <code className="text-xs text-primary font-mono tracking-wider break-all">{secret}</code>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-tertiary mb-1.5">
                  Código de verificación (6 dígitos)
                </label>
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
                  className={inputClass}
                />
              </div>

              {error && (
                <p className="text-xs text-error bg-error-container/40 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={verifying || code.length !== 6}
                className="w-full px-4 py-2 rounded-lg text-sm bg-primary text-on-primary font-medium hover:bg-primary-container transition-colors disabled:opacity-60"
              >
                {verifying ? 'Verificando...' : 'Activar MFA →'}
              </button>
            </form>
          </>
        )}

        <p className="text-xs text-tertiary text-center mt-6">
          Una vez activado, necesitarás el código en cada inicio de sesión
        </p>
      </div>
    </div>
  )
}
