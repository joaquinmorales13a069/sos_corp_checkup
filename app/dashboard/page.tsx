import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/auth'

export default async function DashboardPage() {
  const profile = await getProfile()

  if (profile?.rol === 'admin') {
    redirect('/dashboard/admin/empresas')
  }

  redirect('/dashboard/responsable')
}
