# Punto 4 — Autenticación Multifactor (MFA)

> **Control ISO:** ISO 27001 A.9
> **Fecha de implementación:** 2026-05-07
> **Estado:** ✅ Completo

---

## Descripción del Control

Se implementó autenticación TOTP (Time-based One-Time Password) como segundo factor de autenticación para el rol `admin`. El rol `responsable` puede activarlo voluntariamente.

---

## Implementación Técnica

### Rol Admin — MFA Obligatorio

**Flujo de acceso:**

1. Admin inicia sesión con email y contraseña (sesión AAL1)
2. `requireAdminWithMFA()` en `app/dashboard/admin/layout.tsx` evalúa el nivel de seguridad de la sesión
3. Si `nextLevel === 'aal1'` (sin MFA enrollado) → redirect a `/dashboard/mfa-setup`
4. Si `currentLevel !== 'aal2'` (MFA enrollado pero no verificado) → redirect a `/dashboard/mfa-verify`
5. Si `currentLevel === 'aal2'` → acceso concedido

**Páginas MFA:**
- `/dashboard/mfa-setup` — Enrolamiento TOTP: genera QR (SVG data URI), muestra clave manual, verifica código
- `/dashboard/mfa-verify` — Verificación de sesión: input de 6 dígitos, eleva sesión a AAL2

**Gestión desde ajustes:**
- `/dashboard/admin/ajustes` → sección Seguridad → Desactivar MFA (con confirmación)

### Rol Responsable — MFA Voluntario

Disponible en `/dashboard/responsable/ajustes` → sección Seguridad. El responsable puede enrollar y desenrollar MFA libremente sin afectar su acceso al sistema.

---

## Apps Autenticadoras Compatibles

La implementación usa el estándar TOTP (RFC 6238) — compatible con:

| App | Plataforma |
|-----|-----------|
| Google Authenticator | iOS / Android |
| Microsoft Authenticator | iOS / Android |
| Authy | iOS / Android / Desktop |
| 1Password | Multiplataforma |
| Bitwarden | Multiplataforma |

---

## API Supabase Utilizada

```typescript
// Enrolamiento
supabase.auth.mfa.enroll({ factorType: 'totp' })
// → retorna totp.qr_code (SVG), totp.secret, id

// Verificación (enrollment y step-up)
supabase.auth.mfa.challengeAndVerify({ factorId, code })

// Verificar nivel de sesión (server-side)
supabase.auth.mfa.getAuthenticatorAssuranceLevel()
// → { currentLevel: 'aal1'|'aal2', nextLevel: 'aal1'|'aal2' }

// Listar factores (client-side)
supabase.auth.mfa.listFactors()

// Desenrolamiento
supabase.auth.mfa.unenroll({ factorId })
```

---

## Evidencia

- Código fuente: `lib/auth.ts` (`requireAdminWithMFA`), `app/dashboard/mfa-setup/page.tsx`, `app/dashboard/mfa-verify/page.tsx`
- Admin layout actualizado: `app/dashboard/admin/layout.tsx`
- Verificación: acceder a `/dashboard/admin/empresas` sin sesión AAL2 → redirect a `/dashboard/mfa-setup` o `/dashboard/mfa-verify`

---

## Conclusión

MFA TOTP obligatorio para admin implementado. Sin MFA activo y verificado, el rol `admin` no puede acceder a ninguna ruta del panel de administración. Control cumplido según ISO 27001 A.9.
