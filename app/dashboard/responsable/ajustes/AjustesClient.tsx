'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'react-toastify'
import { updateProfile, updateEmail, updatePassword } from '@/app/actions/settings'
import { LuUser, LuMail, LuLock, LuCheck, LuShield } from 'react-icons/lu'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'

function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-primary bg-primary-fixed/40 px-3 py-2 rounded-lg">
      <LuCheck size={14} />
      {message}
    </div>
  )
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof LuUser
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
      <div className="px-5 py-4 border-b border-outline-variant/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center">
          <Icon size={16} className="text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-on-surface font-headline">{title}</h3>
          <p className="text-xs text-tertiary">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function MFASectionResponsable() {
  const supabase = createClient()
  const [factorId, setFactorId] = useState<string | null>(null)
  const [mfaActive, setMfaActive] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [enrollFactorId, setEnrollFactorId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [unenrolling, setUnenrolling] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [mfaError, setMfaError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const verified = data?.totp.find(f => f.status === 'verified')
      if (verified) { setFactorId(verified.id); setMfaActive(true) }
    })
  }, [])

  async function handleStartEnroll() {
    setEnrolling(true)
    setMfaError(null)
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    setEnrolling(false)
    if (error || !data) { setMfaError(error?.message ?? 'Error al iniciar enrolamiento'); return }
    setQrCode(data.totp.qr_code)
    setSecret(data.totp.secret)
    setEnrollFactorId(data.id)
  }

  async function handleVerifyEnroll(e: React.FormEvent) {
    e.preventDefault()
    if (!enrollFactorId || code.length !== 6) return
    setVerifying(true)
    setMfaError(null)
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enrollFactorId, code })
    setVerifying(false)
    if (error) { setMfaError('Código incorrecto. Inténtalo de nuevo.'); return }
    setMfaActive(true)
    setQrCode(null)
    setCode('')
    toast.success('MFA activado correctamente')
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const verified = data?.totp.find(f => f.status === 'verified')
      if (verified) setFactorId(verified.id)
    })
  }

  async function handleUnenroll() {
    if (!factorId) return
    setUnenrolling(true)
    const { error } = await supabase.auth.mfa.unenroll({ factorId })
    setUnenrolling(false)
    if (error) { toast.error(error.message); return }
    setMfaActive(false)
    setFactorId(null)
    setConfirming(false)
    toast.success('MFA desactivado')
  }

  const mfaInputClass =
    'w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'

  if (mfaActive) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-on-surface">Estado:</span>
          <span className="text-xs text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full">✅ Activo</span>
        </div>
        <p className="text-xs text-tertiary">Tu cuenta está protegida con autenticación de dos factores.</p>
        {!confirming ? (
          <button onClick={() => setConfirming(true)} className="px-4 py-2 rounded-lg text-xs bg-error-container text-on-error-container font-medium hover:opacity-80 transition-opacity">
            Desactivar MFA
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-error font-medium">¿Confirmas la desactivación del MFA?</p>
            <div className="flex gap-2">
              <button onClick={handleUnenroll} disabled={unenrolling} className="px-4 py-2 rounded-lg text-xs bg-error text-on-error font-medium disabled:opacity-60">
                {unenrolling ? 'Desactivando...' : 'Confirmar'}
              </button>
              <button onClick={() => setConfirming(false)} className="px-4 py-2 rounded-lg text-xs border border-outline-variant text-on-surface">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (qrCode) {
    return (
      <div className="space-y-4">
        <p className="text-xs text-tertiary">Escanea con Google Authenticator, Authy o Microsoft Authenticator</p>
        <div className="flex justify-center">
          <img src={qrCode} alt="QR MFA" className="w-36 h-36 rounded-lg bg-white" />
        </div>
        <div className="bg-surface-container rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-tertiary mb-1">Clave manual:</p>
          <code className="text-xs text-primary font-mono tracking-wider break-all">{secret}</code>
        </div>
        <form onSubmit={handleVerifyEnroll} className="space-y-3">
          <input
            type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
            value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000" required autoFocus className={mfaInputClass}
          />
          {mfaError && <p className="text-xs text-error bg-error-container/40 px-3 py-2 rounded-lg">{mfaError}</p>}
          <button type="submit" disabled={verifying || code.length !== 6} className="w-full px-4 py-2 rounded-lg text-sm bg-primary text-on-primary font-medium disabled:opacity-60">
            {verifying ? 'Verificando...' : 'Activar MFA →'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-on-surface">Estado:</span>
        <span className="text-xs text-tertiary bg-surface-container px-2 py-0.5 rounded-full">⚠️ No activo</span>
      </div>
      <p className="text-xs text-tertiary">Agrega una capa extra de seguridad a tu cuenta con autenticación de dos factores.</p>
      {mfaError && <p className="text-xs text-error bg-error-container/40 px-3 py-2 rounded-lg">{mfaError}</p>}
      <button onClick={handleStartEnroll} disabled={enrolling} className="px-4 py-2 rounded-lg text-xs bg-primary text-on-primary font-medium hover:bg-primary-container transition-colors disabled:opacity-60">
        {enrolling ? 'Cargando...' : 'Activar MFA (TOTP)'}
      </button>
    </div>
  )
}

export default function AjustesClient({
  nombre,
  email,
}: {
  nombre: string
  email: string
}) {
  const [profilePending, startProfileTransition] = useTransition()
  const [emailPending, startEmailTransition] = useTransition()
  const [passwordPending, startPasswordTransition] = useTransition()

  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfileError(null)
    setProfileSuccess(false)
    const fd = new FormData(e.currentTarget)
    startProfileTransition(async () => {
      const result = await updateProfile(fd)
      if (result?.error) { setProfileError(result.error); toast.error(result.error) }
      else { setProfileSuccess(true); toast.success('Nombre actualizado correctamente') }
    })
  }

  function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEmailError(null)
    setEmailSuccess(false)
    const fd = new FormData(e.currentTarget)
    startEmailTransition(async () => {
      const result = await updateEmail(fd)
      if (result?.error) { setEmailError(result.error); toast.error(result.error) }
      else { setEmailSuccess(true); toast.success('Correo actualizado correctamente') }
    })
  }

  function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)
    const fd = new FormData(e.currentTarget)
    startPasswordTransition(async () => {
      const result = await updatePassword(fd)
      if (result?.error) { setPasswordError(result.error); toast.error(result.error) }
      else {
        setPasswordSuccess(true)
        toast.success('Contraseña actualizada correctamente')
        e.currentTarget?.reset?.()
      }
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <SectionCard
        icon={LuUser}
        title="Nombre"
        description="Cambia tu nombre visible en el sistema"
      >
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5">
              Nombre completo
            </label>
            <input
              name="nombre"
              defaultValue={nombre}
              required
              placeholder="Tu nombre"
              className={inputClass}
            />
          </div>
          {profileError && (
            <p className="text-xs text-error bg-error-container/40 px-3 py-2 rounded-lg">{profileError}</p>
          )}
          {profileSuccess && <SuccessMessage message="Nombre actualizado correctamente" />}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profilePending}
              className="px-4 py-2 rounded-lg text-sm bg-primary text-on-primary font-medium hover:bg-primary-container transition-colors disabled:opacity-60"
            >
              {profilePending ? 'Guardando...' : 'Guardar nombre'}
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        icon={LuMail}
        title="Correo electrónico"
        description="Actualiza tu dirección de correo"
      >
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5">
              Nuevo correo electrónico
            </label>
            <input
              name="email"
              type="email"
              defaultValue={email}
              required
              placeholder="correo@empresa.com"
              className={inputClass}
            />
          </div>
          {emailError && (
            <p className="text-xs text-error bg-error-container/40 px-3 py-2 rounded-lg">{emailError}</p>
          )}
          {emailSuccess && <SuccessMessage message="Correo actualizado correctamente" />}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={emailPending}
              className="px-4 py-2 rounded-lg text-sm bg-primary text-on-primary font-medium hover:bg-primary-container transition-colors disabled:opacity-60"
            >
              {emailPending ? 'Guardando...' : 'Guardar correo'}
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        icon={LuLock}
        title="Contraseña"
        description="Cambia tu contraseña de acceso"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5">
              Contraseña actual
            </label>
            <input
              name="current_password"
              type="password"
              required
              placeholder="••••••••"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5">
              Nueva contraseña
            </label>
            <input
              name="new_password"
              type="password"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1.5">
              Confirmar nueva contraseña
            </label>
            <input
              name="confirm_password"
              type="password"
              required
              minLength={6}
              placeholder="Repite la nueva contraseña"
              className={inputClass}
            />
          </div>
          {passwordError && (
            <p className="text-xs text-error bg-error-container/40 px-3 py-2 rounded-lg">{passwordError}</p>
          )}
          {passwordSuccess && <SuccessMessage message="Contraseña actualizada correctamente" />}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passwordPending}
              className="px-4 py-2 rounded-lg text-sm bg-primary text-on-primary font-medium hover:bg-primary-container transition-colors disabled:opacity-60"
            >
              {passwordPending ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        icon={LuShield}
        title="Seguridad"
        description="Autenticación de dos factores (MFA) — opcional pero recomendado"
      >
        <MFASectionResponsable />
      </SectionCard>
    </div>
  )
}
