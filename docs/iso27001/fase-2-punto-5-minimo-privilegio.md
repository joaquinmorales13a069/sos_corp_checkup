# Punto 5 — Principio de Mínimo Privilegio

> **Control ISO:** ISO 27001 A.9
> **Fecha de implementación:** 2026-05-07
> **Estado:** ✅ Completo

---

## Descripción del Control

Se verifica y documenta que cada rol del sistema accede únicamente a los recursos y operaciones que necesita. Se implementa defensa en profundidad con múltiples capas de control de acceso.

---

## Matriz de Permisos por Rol

| Operación | `admin` | `responsable` |
|-----------|---------|--------------|
| Ver todas las empresas | ✅ | ❌ |
| Ver sus empresas asignadas | ✅ | ✅ |
| Crear / Editar / Eliminar empresas | ✅ | ❌ |
| Ver sucursales de sus empresas | ✅ | ✅ |
| Crear / Editar / Eliminar sucursales | ✅ | ❌ |
| Ver chequeos de sus sucursales | ✅ | ✅ |
| Crear / Editar / Eliminar chequeos | ✅ | ❌ |
| Ver chequeos pre-empleo de sus sucursales | ✅ | ✅ |
| Crear / Editar / Eliminar chequeos pre-empleo | ✅ | ❌ |
| Gestionar usuarios | ✅ | ❌ |
| Acceder a Google Drive (vía URL) | ✅ | ✅ |

---

## Capas de Control de Acceso

### Capa 1 — Row Level Security (RLS) en Supabase

Estado real verificado via Supabase MCP (Fase 0 — 2026-05-07):

| Tabla | RLS Habilitado | Política admin | Política responsable |
|-------|---------------|---------------|---------------------|
| `empresas` | ✅ | `admin_empresas_full` (ALL) | `responsable_empresas_select` (SELECT filtrado por asignación) |
| `sucursales` | ✅ | `admin_sucursales_full` (ALL) | `responsable_sucursales_select` (SELECT filtrado) |
| `chequeos` | ✅ | `admin_chequeos_full` (ALL) | `responsable_chequeos_select` (SELECT filtrado) |
| `profiles` | ✅ | `admin_profiles_full` (ALL) | `responsable_profiles_select` (SELECT propio) |
| `responsable_empresa` | ✅ | `admin_responsable_empresa_full` (ALL) | `responsable_responsable_empresa_select` (SELECT filtrado) |
| `chequeos_pre_empleo` | ✅ | (política admin) | (política responsable SELECT) |

Las políticas usan la función `is_admin()` que verifica `rol = 'admin'` en la tabla `profiles` vía `auth.uid()`.

### Capa 2 — Guards en Layouts (Server Components)

- `app/dashboard/admin/layout.tsx` → `requireAdminWithMFA()` — verifica rol admin + MFA AAL2
- `app/dashboard/responsable/layout.tsx` → `requireResponsable()` — verifica rol responsable

### Capa 3 — Guards en Server Actions (implementado en Fase 2)

`requireAdmin()` agregado como primera verificación en las 5 server actions admin:

| Action file | Funciones protegidas |
|-------------|---------------------|
| `app/actions/empresas.ts` | `createEmpresa`, `updateEmpresa`, `deleteEmpresa` |
| `app/actions/sucursales.ts` | `createSucursal`, `updateSucursal`, `deleteSucursal` |
| `app/actions/chequeos.ts` | `createChequeo`, `updateChequeo`, `deleteChequeo` |
| `app/actions/usuarios.ts` | `createUsuario`, `updateUsuario`, `deleteUsuario`, `updateAsignaciones`, `reenviarCredenciales` |
| `app/actions/chequeos-pre-empleo.ts` | `createChequeoPreEmpleo`, `updateChequeoPreEmpleo`, `deleteChequeoPreEmpleo` |

**Importancia crítica para `usuarios.ts`:** Este archivo usa `createAdminClient()` (service_role) para operaciones de Auth API (`auth.admin.createUser`, `auth.admin.deleteUser`). La Auth API de Supabase ignora RLS — por lo tanto, sin el guard explícito en la action, un responsable podría invocar estas operaciones directamente. El guard `requireAdmin()` bloquea este vector de ataque.

---

## Evidencia

- Políticas RLS: auditadas en `docs/iso27001/fase-0-auditoria-brechas.md` (Sección 1)
- Guards en actions: verificar con `grep -n "requireAdmin" app/actions/*.ts`
- Guards en layouts: `app/dashboard/admin/layout.tsx`, `app/dashboard/responsable/layout.tsx`

---

## Conclusión

El principio de mínimo privilegio está implementado en tres capas independientes: RLS en base de datos, guards en layouts de Next.js, y guards en server actions. Control cumplido según ISO 27001 A.9.
