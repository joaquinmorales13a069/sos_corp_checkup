import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url') ?? ''

  if (!url.startsWith('https://drive.google.com/')) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  await logAuditEvent('acceso_drive', url)
  return NextResponse.redirect(url)
}
