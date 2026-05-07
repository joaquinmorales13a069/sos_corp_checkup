import { type NextRequest, NextResponse } from 'next/server'
import { logAuditEvent } from '@/lib/audit'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url') ?? ''

  if (!url.startsWith('https://drive.google.com/')) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  await logAuditEvent('acceso_drive', url)
  return NextResponse.redirect(url)
}
