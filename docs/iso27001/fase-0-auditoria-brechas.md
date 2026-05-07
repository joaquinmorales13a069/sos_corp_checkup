# Fase 0 — Auditoría del Estado Actual

> **Fecha:** 2026-05-07
> **Auditor:** Generado por Claude Code vía análisis de código + Supabase MCP
> **Sistema:** SOS Corp Checkup
> **Referencia:** ISO 27001 — Plan de Implementación

---

## Resumen Ejecutivo

Se auditaron 6 tablas de base de datos con RLS, 7 server actions, el middleware de Next.js, los headers HTTP y el estado de MFA. Las principales brechas son: el middleware de autenticación (`proxy.ts`) está inactivo porque no cumple la convención de Next.js, ninguna server action llama a `requireAdmin()` antes de ejecutar operaciones de escritura (la autorización depende únicamente de RLS en la BD), no existe tabla `audit_log` ni ningún mecanismo de logging de eventos de seguridad, y ningún usuario tiene MFA enrollado. RLS está habilitado en todas las tablas auditadas, lo cual es positivo, pero la ausencia de `rls_forzado` significa que el service_role puede bypassear las políticas.

---

## 1. Row Level Security (RLS)

### Estado real de RLS por tabla

Todas las 6 tablas auditadas tienen RLS habilitado (`rls_habilitado = true`). Ninguna tiene `rls_forzado = true`, lo que significa que conexiones con `service_role` (usado en `createAdminClient()`) bypasean las políticas.

| Tabla | RLS Habilitado | RLS Forzado | Políticas encontradas | Severidad |
|-------|---------------|-------------|----------------------|-----------|
| `empresas` | ✅ Sí | ❌ No | `admin_empresas_full` (ALL via `is_admin()`), `responsable_empresas_select` (SELECT via JOIN responsable_empresa) | Baja |
| `sucursales` | ✅ Sí | ❌ No | `admin_sucursales_full` (ALL via `is_admin()`), `responsable_sucursales_select` (SELECT via JOIN responsable_empresa) | Baja |
| `chequeos` | ✅ Sí | ❌ No | `admin_chequeos_full` (ALL via `is_admin()`), `responsable_chequeos_select` (SELECT via JOIN sucursales+responsable_empresa) | Baja |
| `chequeos_pre_empleo` | ✅ Sí | ❌ No | `admin_chequeos_pre_empleo_full` (ALL via `is_admin()`), `responsable_chequeos_pre_empleo_select` (SELECT via JOIN) | Baja |
| `profiles` | ✅ Sí | ❌ No | `admin_profiles_full` (ALL via `is_admin()`), `usuario_ver_su_perfil` (SELECT WHERE id = auth.uid()) | Baja |
| `responsable_empresa` | ✅ Sí | ❌ No | `admin_responsable_empresa_full` (ALL via `is_admin()`), `responsable_ver_sus_asignaciones` (SELECT WHERE usuario_id = auth.uid()) | Baja |

### Hallazgos RLS

- **Positivo:** RLS habilitado en todas las tablas expuestas. Modelo de acceso correcto: admin con acceso total, responsable solo SELECT filtrado por sus asignaciones.
- **Brecha:** `rls_forzado = false` en todas las tablas. El `service_role` utilizado en `createAdminClient()` (llamado desde `usuarios.ts`) bypasea las políticas. Esto es aceptable para operaciones admin intencionales, pero requiere control estricto del uso del client admin.
- **Brecha:** Los roles `roles = {public}` en las políticas indican que aplican al rol `public` de Postgres. Dado que Supabase autentica usuarios con el rol `authenticated`, se recomienda verificar que la función `is_admin()` usa `auth.uid()` y no claims editables de `user_metadata`.
- **Nota:** No se encontró política UPDATE o DELETE para `responsable` en ninguna tabla — correctamente restringido a solo lectura para ese rol.

**Severidad global RLS:** Baja (bien configurado, brecha menor en rls_forzado)
**Control ISO:** A.9 — Documentado

---

## 2. Autenticación Multifactor (MFA)

La consulta a `auth.mfa_factors` retornó 0 filas — ningún usuario del sistema tiene MFA enrollado.

**Hallazgo:** Cero usuarios (administradores ni responsables) han enrollado MFA. El sistema no exige ni promueve MFA en el flujo de login. Un atacante que comprometa credenciales obtiene acceso completo sin segunda barrera.
**Severidad:** Alta
**Control ISO:** A.9 — Fase 2 del plan

---

## 3. Middleware de autenticación

**Hallazgo:** El archivo `proxy.ts` en la raíz del proyecto exporta una función nombrada `proxy` (no `default`). Next.js requiere que el middleware esté en `middleware.ts` con `export default function middleware(...)`. El archivo actual (`proxy.ts` con `export async function proxy`) es completamente ignorado por el framework — nunca se ejecuta. La protección de rutas `/dashboard` solo existe a nivel de Server Component layouts.

El código dentro de `proxy.ts` es funcional y correcto (refresca sesión Supabase, redirige si no hay usuario), pero está totalmente inactivo.

**Riesgo:** Sin middleware activo, no hay protección centralizada de rutas. Si un Server Component layout falla o una ruta nueva se agrega sin guard, la ruta queda desprotegida a nivel HTTP.
**Severidad:** Alta
**Control ISO:** A.9, A.14 — Fase 3 del plan

---

## 4. Guards de rol en rutas

**Hallazgo:** `app/dashboard/layout.tsx` solo llama a `getUser()` y redirige a `/login` si no hay sesión — no verifica el rol del usuario. Los sub-layouts de admin y responsable llaman a `requireAdmin()` / `requireResponsable()` individualmente (definidos en `lib/auth.ts`).

`lib/auth.ts` contiene guards correctos:
- `requireAuth()` — verifica sesión activa
- `requireAdmin()` — verifica `profile.rol === 'admin'`, redirige a `/dashboard/responsable` si no
- `requireResponsable()` — verifica `profile.rol === 'responsable'`, redirige a `/dashboard/admin/empresas` si no

**Riesgo:** Cualquier ruta nueva creada directamente bajo `/dashboard` (sin sub-layout de admin/responsable) solo verificaría sesión, no rol. Un `responsable` autenticado podría acceder a rutas admin nuevas si el desarrollador olvida agregar el guard.
**Severidad:** Media
**Control ISO:** A.9 — Fase 2 del plan

---

## 5. Headers HTTP de seguridad

**Hallazgo:** `next.config.ts` tiene configuración vacía — no define ningún header HTTP de seguridad. TLS está activo vía EasyPanel/Traefik, pero HSTS y otros headers de seguridad no se configuran a nivel aplicación.

| Header | Estado | Severidad |
|--------|--------|-----------|
| `Strict-Transport-Security` (HSTS) | ❌ Falta | Alta |
| `X-Frame-Options` | ❌ Falta | Alta |
| `X-Content-Type-Options` | ❌ Falta | Media |
| `Referrer-Policy` | ❌ Falta | Media |
| `Permissions-Policy` | ❌ Falta | Baja |
| `Content-Security-Policy` | ❌ Falta | Alta (diferida a Fase 3) |

**Control ISO:** A.8, A.10, A.14 — HSTS implementado en Fase 1; CSP en Fase 3

---

## 6. Autorización en Server Actions

**Hallazgo:** Ninguna de las 4 server actions de escritura auditadas llama a `requireAdmin()` antes de ejecutar operaciones de escritura en la base de datos. El grep de `requireAdmin|requireResponsable|requireAuth` en `app/actions/` retornó 0 resultados.

**Distinción importante — layouts vs. endpoints de action:**

Los sub-layouts de admin (`app/dashboard/admin/layout.tsx`) llaman a `requireAdmin()` antes de renderizar, lo que protege la navegación UI: un `responsable` que intente navegar a rutas admin es redirigido. Sin embargo, esta protección es exclusivamente a nivel de renderizado de Server Components.

Las Server Actions se exponen como endpoints HTTP independientes en la ruta interna `/next/server-action`. Estos endpoints pueden invocarse directamente con un `fetch` o herramienta HTTP (curl, Burp Suite, etc.) enviando la sesión de un usuario `responsable` autenticado — **sin pasar por ningún layout**. El servidor ejecuta la acción sin verificar el rol porque el guard vive en el layout, no en la action.

Acciones auditadas sin guard explícito de autorización:

| Archivo | Funciones sin guard | Operación |
|---------|---------------------|-----------|
| `empresas.ts` | `createEmpresa`, `updateEmpresa`, `deleteEmpresa` | INSERT/UPDATE/DELETE en `empresas` |
| `sucursales.ts` | `createSucursal`, `updateSucursal`, `deleteSucursal` | INSERT/UPDATE/DELETE en `sucursales` |
| `chequeos.ts` | `createChequeo`, `updateChequeo`, `deleteChequeo` | INSERT/UPDATE/DELETE en `chequeos` |
| `usuarios.ts` | `createUsuario`, `updateUsuario`, `deleteUsuario`, `updateAsignaciones`, `reenviarCredenciales` | Operaciones admin en Auth API + profiles |

Para `empresas.ts`, `sucursales.ts` y `chequeos.ts`, RLS actúa como segunda línea de defensa: las políticas bloquean escrituras de usuarios con rol `responsable`. La ausencia de guard en la action es un defecto de defensa en profundidad, pero RLS contiene el daño.

**Riesgo crítico en `usuarios.ts`:** Este archivo usa `createAdminClient()` (cliente con `service_role`) para llamar a `auth.admin.createUser` y `auth.admin.deleteUser`. La Auth API de Supabase opera fuera de RLS — el `service_role` bypasea todas las políticas de tabla. Si un usuario `responsable` invoca directamente el endpoint de `createUsuario` o `deleteUsuario`, RLS no lo detiene porque la operación nunca toca las políticas de tabla; ocurre en la capa de Auth. Solo un guard explícito (`requireAdmin()`) dentro de la action puede bloquearlo.

**Severidad:** Alta
**Control ISO:** A.9 — Remediación recomendada en Fase 2

---

## 7. Validación de Inputs

**Hallazgo:** Todas las server actions auditadas realizan validación de inputs antes de consultar Supabase (`.trim()`, type checking, rangos numéricos en año 2020–2050, longitud mínima de contraseña 6 caracteres). Supabase JS usa queries parametrizadas — sin riesgo de SQL injection directa.

**Estado:** ✅ Correcto
**Control ISO:** A.8, A.14 — OWASP A03 Injection cubierto

---

## 8. Cifrado en Tránsito

**Hallazgo:** EasyPanel maneja TLS automáticamente via Let's Encrypt (Traefik como reverse proxy). Supabase usa TLS 1.2+ en todas las conexiones. `next.config.ts` no configura HSTS — el header debe enviarse explícitamente en la respuesta HTTP para instruir a los browsers a forzar HTTPS en futuras visitas.

**Estado:** Parcial — TLS activo, HSTS faltante
**Severidad:** Media
**Control ISO:** A.10 — Implementado en Fase 1

---

## 9. Cifrado en Reposo

**Hallazgo:** Supabase cifra datos en reposo con AES-256. El VPS de Contabo usa cifrado de disco. No hay datos sensibles almacenados en el filesystem de la aplicación (sin uploads, sin archivos locales).

**Estado:** ✅ Cubierto por proveedores de infraestructura
**Control ISO:** A.10 — Documentado en Fase 1

---

## 10. Audit Logging

**Hallazgo:** La tabla `audit_log` no existe en el schema `public`. El grep de `audit_log|logger` en `app/` y `lib/` retornó 0 resultados. No existe ningún mecanismo de logging de eventos de seguridad en la aplicación (logins, cambios de datos sensibles, creación/eliminación de usuarios).

**Riesgo:** Sin audit trail, es imposible detectar accesos no autorizados, investigar incidentes de seguridad, o cumplir con los requerimientos de trazabilidad de ISO 27001 (A.12.4).

**Severidad:** Alta
**Control ISO:** A.12 — Implementar en Fase 4

---

## Tabla Resumen de Brechas

| N | Área | Hallazgo | Severidad | Estado | Fase de remediación |
|---|------|----------|-----------|--------|---------------------|
| 1 | RLS | Habilitado en todas las tablas; rls_forzado=false permite bypass via service_role | Baja | Parcial | Fase 2 (documentar uso de service_role) |
| 2 | MFA | 0 usuarios con MFA enrollado | Alta | Falta | Fase 2 |
| 3 | Middleware | `proxy.ts` con export nombrado no es middleware válido en Next.js — completamente inactivo | Alta | Falta | Fase 3 |
| 4 | Guards de rol | Layout principal `/dashboard` solo verifica sesión, no rol | Media | Parcial | Fase 2 |
| 5 | Headers HTTP | `next.config.ts` sin headers de seguridad (HSTS, X-Frame-Options, CSP, etc.) | Alta | Falta | Fase 1 (HSTS) / Fase 3 (CSP) |
| 6 | Autorización actions | Ninguna server action llama `requireAdmin()`; `usuarios.ts` usa service_role sin guard — endpoints invocables directamente sin pasar por layout | Alta | Falta | Fase 2 |
| 7 | Validación inputs | Validación presente en todas las actions, parametrized queries, sin SQL injection | — | ✅ Existe | — |
| 8 | TLS en tránsito | EasyPanel/Traefik activo con Let's Encrypt; HSTS faltante a nivel app | Media | Parcial | Fase 1 |
| 9 | Cifrado en reposo | Supabase AES-256 + Contabo disk encryption | — | ✅ Existe | — |
| 10 | Audit logging | Tabla `audit_log` inexistente; cero logging de eventos de seguridad | Alta | Falta | Fase 4 |
