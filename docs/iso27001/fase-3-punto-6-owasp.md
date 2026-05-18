# ISO 27001 — Fase 3 · Punto 6: Protección OWASP Top 10

> **Fecha:** 2026-05-07
> **Control:** ISO 27001 A.8.1, A.14.1, A.14.2
> **Estado:** ✅ Completo

## Resumen

SOS Corp Checkup implementa controles para las categorías OWASP Top 10 relevantes al sistema.

## Controles implementados

### A01 — Broken Access Control

| Capa | Implementación |
|------|---------------|
| Layout guard (admin) | `requireAdminWithMFA()` en `app/dashboard/admin/layout.tsx` — verifica rol + MFA AAL2 |
| Layout guard (dashboard) | `getUser()` en `app/dashboard/layout.tsx` — redirige a login si no hay sesión |
| Server actions | `requireAdmin()` como primera línea en las 17 funciones de `app/actions/*.ts` |
| Base de datos | RLS activo en 6 tablas: `profiles`, `empresas`, `sucursales`, `chequeos`, `chequeos_pre_empleo`, `asignaciones` |
| Middleware | `middleware.ts` intercepta todos los requests y redirige `/dashboard/*` si no hay sesión |

### A02 — Cryptographic Failures

| Control | Detalle |
|---------|---------|
| TLS en tránsito | HTTPS forzado vía EasyPanel/Traefik con certificado Let's Encrypt |
| HSTS | `Strict-Transport-Security: max-age=31536000; includeSubDomains` en `next.config.ts` |
| Cookies seguras | `@supabase/ssr` setea automáticamente `httpOnly; Secure; SameSite=Lax` en todas las cookies de sesión |

### A03 — Injection

| Control | Detalle |
|---------|---------|
| Queries parametrizadas | Supabase JavaScript client usa queries parametrizadas en todas las operaciones — cero SQL raw en el codebase |
| Validación de inputs | Server actions reciben datos tipados via TypeScript y Supabase rechaza queries malformadas |

### A05 — Security Misconfiguration

Headers de seguridad configurados en `next.config.ts`:

| Header | Valor |
|--------|-------|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co; font-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

Nota: `unsafe-inline` y `unsafe-eval` en `script-src` son requeridos por Next.js 16 hydration (chunk loading y scripts de hidratación del servidor).

### A07 — Authentication Failures

| Control | Implementación |
|---------|---------------|
| MFA obligatorio para admin | `requireAdminWithMFA()` verifica AAL2 — sin MFA no hay acceso al panel admin |
| Error genérico en login | `LoginForm.tsx` muestra "Credenciales incorrectas" sin revelar si el email existe |
| Logout invalida sesión en servidor | `supabase.auth.signOut()` invalida el refresh token en Supabase — no solo borra cookie local |
| Protección CAPTCHA | Cloudflare Turnstile en login previene ataques de fuerza bruta automatizados |

## Verificación

```bash
# Verificar headers de seguridad
curl -s -o /dev/null -D - https://empresas.sosmedical.com.ni/login | grep -E "content-security-policy|x-frame-options|x-content-type-options|strict-transport-security"
```

## Referencias

- `middleware.ts` — Session refresh y protección de rutas
- `next.config.ts` — Security headers
- `lib/auth.ts` — `requireAdmin()`, `requireAdminWithMFA()`
- `app/actions/*.ts` — Server actions con guards
