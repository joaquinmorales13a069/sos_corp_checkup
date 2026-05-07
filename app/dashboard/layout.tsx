import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import InactivityGuard from '@/components/InactivityGuard'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  if (!user) redirect('/login')

  return (
    <>
      <InactivityGuard timeoutMs={3_600_000} warningMs={300_000} />
      {children}
    </>
  )
}
