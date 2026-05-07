'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { createClient } from '@/lib/supabase/client'

interface InactivityGuardProps {
  timeoutMs: number
  warningMs: number
}

export default function InactivityGuard({ timeoutMs, warningMs }: InactivityGuardProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let warningId: ReturnType<typeof setTimeout> | null = null
    let toastId: string | number | null = null

    function reset() {
      if (timeoutId) clearTimeout(timeoutId)
      if (warningId) clearTimeout(warningId)
      if (toastId !== null) {
        toast.dismiss(toastId)
        toastId = null
      }

      warningId = setTimeout(() => {
        toastId = toast.warning(
          'Tu sesión expirará en 5 minutos por inactividad.',
          { autoClose: false }
        )
      }, timeoutMs - warningMs)

      timeoutId = setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/login?timeout=1')
      }, timeoutMs)
    }

    const events = ['mousemove', 'keydown', 'click', 'touchstart'] as const
    events.forEach((e) => document.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (warningId) clearTimeout(warningId)
      if (toastId !== null) toast.dismiss(toastId)
      events.forEach((e) => document.removeEventListener(e, reset))
    }
  }, [timeoutMs, warningMs, supabase, router])

  return null
}
