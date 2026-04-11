import { getProfile } from '@/lib/auth'
import AdminShell from '@/components/admin/AdminShell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getProfile()

  return (
    <AdminShell nombre={profile?.nombre ?? 'Admin'}>
      {children}
    </AdminShell>
  )
}
