import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type AuditAction =
  | 'login'
  | 'login_fallido'
  | 'logout'
  | 'acceso_drive'
  | 'crear_empresa'
  | 'editar_empresa'
  | 'eliminar_empresa'
  | 'crear_sucursal'
  | 'editar_sucursal'
  | 'eliminar_sucursal'
  | 'crear_usuario'
  | 'editar_usuario'
  | 'eliminar_usuario'
  | 'crear_chequeo'
  | 'editar_chequeo'
  | 'eliminar_chequeo'
  | 'crear_chequeo_pre_empleo'
  | 'editar_chequeo_pre_empleo'
  | 'eliminar_chequeo_pre_empleo'
  | 'cambio_nombre'
  | 'cambio_correo'
  | 'cambio_contraseña'

export async function logAuditEvent(
  accion: AuditAction,
  recurso?: string,
  usuarioId?: string,
): Promise<void> {
  try {
    const h = await headers()
    const ip =
      h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      h.get('x-real-ip') ??
      null
    const userAgent = h.get('user-agent') ?? null

    let resolvedUserId = usuarioId ?? null
    if (!resolvedUserId) {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      resolvedUserId = user?.id ?? null
    }

    const admin = createAdminClient()
    await admin.from('audit_log').insert({
      usuario_id: resolvedUserId,
      accion,
      recurso: recurso ?? null,
      ip_address: ip,
      user_agent: userAgent,
    })
  } catch {
    // audit failure never blocks main flow
  }
}
