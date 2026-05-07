# ISO 27001 — Fase 3 · Punto 7: Gestión Segura de Sesiones

> **Fecha:** 2026-05-07
> **Control:** ISO 27001 A.9.4, A.14.1
> **Estado:** ✅ Completo

## Resumen

SOS Corp Checkup implementa gestión segura de sesiones con refresco automático, timeout por inactividad, y revocación de sesión en servidor.

## Ciclo de vida de sesión

| Aspecto | Valor |
|---------|-------|
| Access token (JWT) | 1 hora — Supabase default |
| Refresco automático | En cada request HTTP vía `middleware.ts` |
| Refresh token | Semanas — Supabase default (rotación automática) |
| Timeout por inactividad | 1 hora sin eventos de usuario (mousemove, keydown, click, touchstart) |
| Aviso de expiración | Toast de advertencia 5 minutos antes del timeout |
| Logout explícito | `supabase.auth.signOut()` — invalida refresh token en servidor |
| Cookie flags | `httpOnly; Secure; SameSite=Lax` — seteado por `@supabase/ssr` |

## Controles implementados

### Refresco automático de sesión — `middleware.ts`

El middleware intercepta todos los requests y llama a `supabase.auth.getUser()` vía `@supabase/ssr`. Esta llamada refresca automáticamente el JWT si está por expirar y actualiza las cookies en la respuesta. Sin este middleware, los JWT de 1 hora expiran silenciosamente aunque el usuario esté activo.

```
Request → middleware.ts → createServerClient → getUser() → refresh JWT si necesario → setAll cookies → NextResponse
```

### Timeout por inactividad — `components/InactivityGuard.tsx`

Client Component renderizado en `app/dashboard/layout.tsx` (cubre admins y responsables). Escucha eventos de usuario en `document`. Cualquier evento reinicia los timers.

```
Timer de 55 minutos → toast warning "Tu sesión expirará en 5 minutos"
Timer de 60 minutos → supabase.auth.signOut() → redirect /login?timeout=1
```

Eventos monitoreados: `mousemove`, `keydown`, `click`, `touchstart` (todos con `{ passive: true }`)

### Logout explícito

`supabase.auth.signOut()` invalida el refresh token en el servidor de Supabase — no solo borra cookies locales. Esto previene que tokens robados puedan ser usados para obtener nuevos access tokens.

Implementado en:
- Botón "Cerrar sesión" del sidebar (admin y responsable)
- `InactivityGuard` al expirar el timeout
- Desactivación de MFA en `AjustesClient.tsx` (signOut antes de redirect)

### Cookies seguras

`@supabase/ssr` setea automáticamente las cookies de sesión con:
- `httpOnly` — inaccesibles desde JavaScript del cliente
- `Secure` — solo transmitidas vía HTTPS
- `SameSite=Lax` — protección básica contra CSRF

### Mensaje diferenciado en login

`LoginForm.tsx` detecta el query param al volver de un logout:
- `?logout=1` → toast info: "Sesión cerrada correctamente."
- `?timeout=1` → toast warning: "Tu sesión expiró por inactividad. Inicia sesión nuevamente."

## Referencias

- `middleware.ts` — Session refresh en cada request
- `components/InactivityGuard.tsx` — Timeout por inactividad
- `app/dashboard/layout.tsx` — Renderizado de InactivityGuard
- `app/login/LoginForm.tsx` — Mensajes de logout/timeout
