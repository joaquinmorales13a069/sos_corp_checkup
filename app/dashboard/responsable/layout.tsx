import { requireResponsable } from '@/lib/auth'

export default async function ResponsableLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireResponsable()
  return <>{children}</>
}
