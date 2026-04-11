'use client'

import { useState, useTransition } from 'react'
import { updateProfile, updateEmail, updatePassword } from '@/app/actions/settings'
import { LuUser, LuMail, LuLock, LuCheck } from 'react-icons/lu'

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
      if (result?.error) setProfileError(result.error)
      else setProfileSuccess(true)
    })
  }

  function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEmailError(null)
    setEmailSuccess(false)
    const fd = new FormData(e.currentTarget)
    startEmailTransition(async () => {
      const result = await updateEmail(fd)
      if (result?.error) setEmailError(result.error)
      else setEmailSuccess(true)
    })
  }

  function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)
    const fd = new FormData(e.currentTarget)
    startPasswordTransition(async () => {
      const result = await updatePassword(fd)
      if (result?.error) setPasswordError(result.error)
      else {
        setPasswordSuccess(true)
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
    </div>
  )
}
