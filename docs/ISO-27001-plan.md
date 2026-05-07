# Plan de Implementación ISO 27001 — SOS Corp Checkup

> **Fecha:** 2026-05-07
> **Sistema:** SOS Corp Checkup
> **Stack:** Next.js · Supabase · Contabo VPS · Google Workspace · Resend
> **Normativas:** ISO 27001, ISO 27701

---

## Puntos fuera de scope

| N | Dominio | Control |
|---|---------|---------|
| 3 | Gestión de Accesos | Cuentas individuales para doctores y/o personal |
| 10 | Google Drive | Uso exclusivo de Google Workspace corporativo |

---

## Tabla de Controles

| N | Dominio | Control | Tipo | Estado | Referencia |
|---|---------|---------|------|--------|-----------|
| 1 | Gobernanza y Cumplimiento | Cumplimiento legal en protección de datos de salud | Documento | ⬜ Pendiente | ISO 27001 A.5 / ISO 27701 |
| 2 | Gobernanza y Cumplimiento | Existencia de políticas formales de seguridad de la información | Documento | ⬜ Pendiente | ISO 27001 A.5 |
| 4 | Gestión de Accesos | Autenticación multifactor (MFA) | Técnico | ✅ Completo | ISO 27001 A.9 |
| 5 | Gestión de Accesos | Principio de mínimo privilegio | Técnico + Documento | ✅ Completo | ISO 27001 A.9 |
| 6 | Aplicación Web | Protección contra OWASP Top 10 | Técnico | ✅ Completo | ISO 27001 A.8, A.14 |
| 7 | Aplicación Web | Gestión segura de sesiones | Técnico + Documento | ✅ Completo | ISO 27001 A.9, A.14 |
| 8 | Protección de Datos | Cifrado en tránsito (HTTPS/TLS) | Técnico + Documento | ✅ Completo | ISO 27001 A.10 |
| 9 | Protección de Datos | Cifrado en reposo | Documento | ✅ Completo | ISO 27001 A.10 |
| 11 | Google Drive | Acceso restringido / No se comparte Drive con otras empresas | Documento | ⬜ Pendiente | ISO 27001 A.9 |
| 12 | Google Drive | Auditoría y revisión periódica de permisos | Documento | ⬜ Pendiente | ISO 27001 A.12 |
| 13 | Registro y Monitoreo | Registro de accesos y descargas | Técnico | ⬜ Pendiente | ISO 27001 A.12 |
| 14 | Gestión de Incidentes | Procedimiento documentado de respuesta a incidentes | Documento | ⬜ Pendiente | ISO 27001 A.16 |
| 15 | Gestión de Incidentes | Notificación de brechas de datos | Documento | ⬜ Pendiente | ISO 27001 A.16 / ISO 27701 |
| 16 | Continuidad | Backups cifrados y probados | Técnico + Documento | ⬜ Pendiente | ISO 27001 A.17 |
| 17 | Relación Contractual | Cláusulas de confidencialidad y DPA | Documento | ⬜ Pendiente | ISO 27001 A.15 |
| 18 | Concienciación | Capacitación en seguridad y privacidad | Documento | ⬜ Pendiente | ISO 27001 A.7 |

---

## Fases de Implementación

### Fase 0 — Auditoría del Estado Actual

**Objetivo:** Mapear controles ya existentes antes de documentar o implementar.

| Acción | Archivos |
|--------|---------|
| Revisar RLS en Supabase | `CONTEXT.md`, migraciones SQL |
| Revisar auth y guards de rol | `lib/auth.ts`, `app/dashboard/layout.tsx` |
| Revisar headers HTTP y config del servidor | `next.config.ts`, `proxy.ts` |
| Revisar server actions (validación, SQL injection) | `app/actions/*.ts` |
| Verificar logging existente | Todo el proyecto |

**Entregable:** Documento interno de brechas detectadas.

---

### Fase 1 — Protección de Datos

> Puntos: **8** y **9** · ISO 27001 A.10

#### Punto 8 — Cifrado en tránsito (HTTPS/TLS)

- Verificar certificado TLS activo en el VPS de Contabo
- Documentar configuración del servidor (Nginx/Caddy + Let's Encrypt o similar)
- Verificar que Next.js redirige HTTP → HTTPS
- Documentar que Supabase usa TLS en todas sus conexiones

**Evidencia:** Screenshot del certificado SSL del dominio, configuración del servidor, documentación de Supabase.

#### Punto 9 — Cifrado en reposo

- Documentar cifrado AES-256 de Supabase en reposo (PostgreSQL + Storage)
- Documentar cifrado del disco del VPS de Contabo (si aplica)
- Referenciar documentación oficial de ambos proveedores

**Evidencia:** Extractos de documentación oficial de Supabase y Contabo, documento Word.

---

### Fase 2 — Gestión de Accesos

> Puntos: **4** y **5** · ISO 27001 A.9

#### Punto 4 — Autenticación Multifactor (MFA)

- Verificar si MFA TOTP está habilitado en Supabase Auth
- Implementar flujo de enrolamiento MFA para el rol `admin`
- Evaluar si MFA aplica también al rol `responsable`
- Documentar flujo de MFA con screenshots

**Evidencia:** Código de implementación, screenshots de Supabase Auth dashboard, documento Word.

#### Punto 5 — Principio de Mínimo Privilegio

- Auditar y documentar el esquema RLS actual en Supabase
- Verificar que `responsable` no puede acceder a datos de otras empresas
- Verificar que `responsable` no puede realizar operaciones de escritura
- Crear matriz de permisos por rol

**Roles actuales:**

| Acción | `admin` | `responsable` |
|--------|---------|--------------|
| Ver todas las empresas | ✅ | ❌ |
| Ver sus empresas asignadas | ✅ | ✅ |
| Crear/Editar/Eliminar empresas | ✅ | ❌ |
| Ver sucursales de sus empresas | ✅ | ✅ |
| Crear/Editar/Eliminar sucursales | ✅ | ❌ |
| Ver chequeos de sus sucursales | ✅ | ✅ |
| Crear/Editar/Eliminar chequeos | ✅ | ❌ |
| Gestionar usuarios | ✅ | ❌ |

**Evidencia:** Políticas RLS en SQL, matriz de permisos, documento Word.

---

### Fase 3 — Aplicación Web (OWASP y Sesiones)

> Puntos: **6** y **7** · ISO 27001 A.8, A.9, A.14

#### Punto 6 — Protección contra OWASP Top 10

Auditar y remediar las siguientes categorías:

| OWASP | Descripción | Área a revisar |
|-------|-------------|---------------|
| A01 Broken Access Control | Guards de rol y RLS | `app/dashboard/layout.tsx`, `app/actions/*.ts` |
| A02 Cryptographic Failures | TLS, cookies seguras | `next.config.ts`, headers HTTP |
| A03 Injection | Queries parametrizadas (Supabase) | `app/actions/*.ts` |
| A05 Security Misconfiguration | Headers de seguridad | `next.config.ts` |
| A07 Authentication Failures | Login, sesión, MFA | `app/login/`, `lib/auth.ts` |

Implementar headers de seguridad en `next.config.ts`:
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security`
- `Referrer-Policy`

**Evidencia:** Código auditado y corregido, headers HTTP verificados con herramienta, documento Word.

#### Punto 7 — Gestión Segura de Sesiones

- Verificar expiración de sesión en Supabase Auth (JWT expiry)
- Verificar cookies `httpOnly` y `secure` en el cliente SSR de Supabase
- Implementar logout que invalide la sesión en servidor
- Documentar ciclo de vida de la sesión

**Evidencia:** Configuración de Supabase Auth, código del cliente SSR, documento Word.

---

### Fase 4 — Registro y Monitoreo

> Punto: **13** · ISO 27001 A.12

#### Punto 13 — Registro de Accesos y Descargas

Implementar tabla `audit_log` en Supabase para registrar:

```sql
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references profiles(id),
  accion text not null,          -- 'login', 'logout', 'acceso_drive', 'crear_empresa', etc.
  recurso text,                  -- nombre de empresa, sucursal, URL de Drive
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);
```

Eventos a registrar:
- Login / logout
- Acceso a URL de Google Drive (click en chequeo)
- Creación, edición y eliminación de empresas, sucursales, usuarios, chequeos
- Cambio de contraseña
- Intentos de acceso no autorizado

**Evidencia:** Esquema SQL, código de logging en server actions, documento Word.

---

### Fase 5 — Gobernanza y Cumplimiento

> Puntos: **1** y **2** · ISO 27001 A.5 / ISO 27701

#### Punto 1 — Cumplimiento Legal en Protección de Datos de Salud

Documento Word que incluye:
- Base legal para procesar datos médicos (epicrisis de trabajadores)
- Descripción de datos procesados y su clasificación
- Mapa de flujo de datos: Admin → Google Drive → Responsable → Trabajador
- Responsables del tratamiento de datos (SOS Medical como controlador)
- Proveedores como encargados del tratamiento: Supabase, Contabo, Google Workspace
- Derechos de los titulares de datos
- Período de retención de datos

#### Punto 2 — Política Formal de Seguridad de la Información

Documento Word que incluye:
- Alcance y objetivos de la política
- Roles y responsabilidades (Admin SOS Medical, responsables de empresa)
- Clasificación de información (datos médicos = confidencial)
- Controles de acceso
- Gestión de incidentes (referencia a Fase 7)
- Revisión y actualización de la política

**Evidencia:** Documentos Word firmados.

---

### Fase 6 — Google Drive

> Puntos: **11** y **12** · ISO 27001 A.9, A.12

#### Punto 11 — Acceso Restringido a Drive

Documento Word que incluye:
- Política de compartir enlaces de Drive (solo lectura, solo para responsables asignados)
- Prohibición de compartir carpetas con cuentas personales o empresas externas
- Proceso para revocar acceso cuando un responsable deja de serlo
- Responsable de gestionar las carpetas de Drive (admin SOS Medical)

#### Punto 12 — Auditoría y Revisión Periódica de Permisos

Documento Word que incluye:
- Frecuencia de revisión de permisos (mínimo trimestral)
- Checklist de auditoría de carpetas en Drive
- Proceso para detectar accesos no autorizados
- Registro de auditorías realizadas

**Evidencia:** Documentos Word, screenshot de configuración de compartir en Drive.

---

### Fase 7 — Gestión de Incidentes

> Puntos: **14** y **15** · ISO 27001 A.16 / ISO 27701

#### Punto 14 — Procedimiento de Respuesta a Incidentes

Documento Word con flujo:

```
Detección → Clasificación → Contención → Erradicación → Recuperación → Lecciones aprendidas
```

Incluye:
- Definición de tipos de incidente (brecha de datos, acceso no autorizado, pérdida de datos)
- Roles y responsables en cada etapa
- Tiempos de respuesta por severidad
- Plantilla de reporte de incidente
- Contactos de emergencia (Supabase support, Contabo support, Google Workspace support)

#### Punto 15 — Notificación de Brechas de Datos

Documento Word que incluye:
- Criterios para determinar si una brecha requiere notificación
- Plazo de notificación (72 horas según GDPR/ISO 27701)
- A quién notificar: autoridades regulatorias, afectados, proveedores
- Plantilla de notificación de brecha
- Registro de brechas notificadas

**Evidencia:** Documentos Word.

---

### Fase 8 — Continuidad

> Punto: **16** · ISO 27001 A.17

#### Punto 16 — Backups Cifrados y Probados

- Verificar backups automáticos de Supabase (Point-in-Time Recovery en plan Pro)
- Documentar política de backup de la base de datos (frecuencia, retención)
- Documentar backup del VPS de Contabo (snapshots, frecuencia)
- Definir procedimiento de prueba de restauración (frecuencia mínima: trimestral)
- Verificar que los backups están cifrados

**Evidencia:** Screenshot de configuración de backups en Supabase, configuración de Contabo, documento Word con procedimiento de restauración y registro de pruebas.

---

### Fase 9 — Relación Contractual

> Punto: **17** · ISO 27001 A.15

#### Punto 17 — Cláusulas de Confidencialidad y DPA

- Revisar y referenciar DPAs públicos de proveedores:
  - [Supabase DPA](https://supabase.com/privacy)
  - [Contabo DPA](https://contabo.com/en/legal/dpa/)
  - [Google Workspace DPA](https://workspace.google.com/terms/dpa_terms.html)
- Crear plantilla de Acuerdo de Confidencialidad (NDA) para empleados de SOS Medical
- Crear cláusulas de confidencialidad para responsables de empresa (usuarios del sistema)
- Documentar proceso de firma y resguardo de estos acuerdos

**Evidencia:** Links a DPAs de proveedores, plantillas Word de NDA y cláusulas de confidencialidad.

---

### Fase 10 — Concienciación

> Punto: **18** · ISO 27001 A.7

#### Punto 18 — Capacitación en Seguridad y Privacidad

Documento Word con programa de capacitación:

**Para Admins de SOS Medical:**
- Manejo seguro de credenciales y contraseñas
- Gestión de permisos en Google Drive
- Cómo responder ante un incidente de seguridad
- Protección de datos médicos (confidencialidad de epicrisis)

**Para Responsables de Empresa:**
- Uso seguro del sistema (contraseñas, sesiones)
- Confidencialidad de los datos de los trabajadores
- Qué hacer si detectan acceso no autorizado
- Política de pantalla limpia y escritorio limpio

**Evidencia:** Documento del programa, registro de capacitaciones realizadas (fecha, participantes, tema).

---

### Fase 11 — Páginas del Sistema

#### Páginas públicas (sin login)

- `/politica-privacidad` — Política de privacidad y protección de datos de salud
- `/aviso-cumplimiento` — Resumen público de controles ISO implementados y proveedores

#### Panel admin de cumplimiento (con login, rol `admin`)

- `/dashboard/admin/cumplimiento` — Checklist interactivo con estado de cada control ISO 27001
  - Estado por control (Pendiente / En progreso / Completo)
  - Links a documentos de evidencia
  - Fecha de última revisión
  - Filtro por dominio (Gobernanza, Accesos, Aplicación Web, etc.)

---

## Resumen de Entregables

| Fase | Tipo | Puntos cubiertos | Estado |
|------|------|-----------------|--------|
| 0 | Auditoría | Todos | ✅ Completo |
| 1 | Técnico + Documento | 8, 9 | ✅ Completo |
| 2 | Técnico + Documento | 4, 5 | ✅ Completo |
| 3 | Técnico + Documento | 6, 7 | ✅ Completo |
| 4 | Técnico | 13 | ⬜ Pendiente |
| 5 | Documento Word | 1, 2 | ⬜ Pendiente |
| 6 | Documento Word | 11, 12 | ⬜ Pendiente |
| 7 | Documento Word | 14, 15 | ⬜ Pendiente |
| 8 | Técnico + Documento | 16 | ⬜ Pendiente |
| 9 | Documento Word | 17 | ⬜ Pendiente |
| 10 | Documento Word | 18 | ⬜ Pendiente |
| 11 | Código (Next.js) | — | ⬜ Pendiente |

**Documentos Word a generar:** ~10 documentos
**Implementaciones técnicas en código:** 4–5 cambios (MFA, headers OWASP, logging, sesiones, páginas)

---

## Leyenda de Estado

| Símbolo | Significado |
|---------|------------|
| ⬜ Pendiente | No iniciado |
| 🔄 En progreso | En desarrollo |
| ✅ Completo | Finalizado y con evidencia |
| ⚠️ Bloqueado | Requiere información externa |
