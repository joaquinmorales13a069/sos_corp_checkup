import { requireAdminWithMFA } from '@/lib/auth'
import AdminShell from '@/components/admin/AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdminWithMFA()
  return (
    <AdminShell nombre={profile.nombre}>
      {children}
    </AdminShell>
  )
}
