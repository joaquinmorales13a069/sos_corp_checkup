import { requireResponsable } from '@/lib/auth'
import ResponsableShell from '@/components/responsable/ResponsableShell'

export default async function ResponsableLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireResponsable()

  return (
    <ResponsableShell nombre={profile.nombre}>
      {children}
    </ResponsableShell>
  )
}
