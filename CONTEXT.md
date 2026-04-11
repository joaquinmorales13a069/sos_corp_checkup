# SOS CheckUp — Contexto del Proyecto

## Descripción
Sistema de gestión de chequeos médicos empresariales para **SOS Medical** (Nicaragua).
Permite a administradores gestionar empresas, sucursales y responsables, y a los responsables
acceder a los resultados de chequeos médicos almacenados en Google Drive.

---

## Stack Tecnológico
- **Frontend:** Next.js (App Router)
- **Backend / DB:** Supabase (PostgreSQL, Auth, Storage)
- **Email:** Resend (SMTP para envío de credenciales)
- **Almacenamiento de archivos:** Google Drive (manual por el admin)
- **Región Supabase:** `us-east-1` (East US - North Virginia)

---

## Roles del Sistema
| Rol | Descripción |
|---|---|
| `admin` | Administrador de SOS Medical — acceso total al sistema |
| `responsable` | Responsable de chequeo médico de la empresa (RRHH, Doctor, etc.) |

---

## Flujo de Trabajo

1. Admin de SOS Medical crea carpeta de la empresa en Google Drive manualmente.
2. Crea subcarpeta del año (ej. `2026`) dentro de la carpeta de la empresa.
3. Crea subcarpeta con el nombre de la sucursal dentro del año (ej. `LAFISE Villa Fontana`).
4. Carga todas las epicrisis de los trabajadores dentro de la carpeta de la sucursal.
5. Genera un hipervínculo de share de la carpeta de la sucursal.
6. Admin crea la empresa en el sistema (si no existe).
7. Admin crea la sucursal en el sistema, agregando el hipervínculo del paso 5.
8. Admin crea el usuario responsable (si no existe) y lo asigna a la empresa.
9. Sistema envía credenciales al responsable por correo (via Resend).
10. Responsable accede al sistema con sus credenciales.
11. Responsable filtra por año los chequeos realizados.
12. Aparecen todas las sucursales con chequeos en ese año.
13. Click en card de sucursal redirige al hipervínculo de la carpeta en Google Drive.

---

## Esquema SQL (Supabase / PostgreSQL)

```sql
-- Empresas
create table empresas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  logo_url text,
  created_at timestamptz default now()
);

-- Sucursales
create table sucursales (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas(id) on delete cascade,
  nombre text not null,
  created_at timestamptz default now()
);

-- Profiles (extiende auth.users de Supabase)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol text not null check (rol in ('admin', 'responsable')),
  created_at timestamptz default now()
);

-- Relación M:M responsable ↔ empresa
create table responsable_empresa (
  usuario_id uuid references profiles(id) on delete cascade,
  empresa_id uuid references empresas(id) on delete cascade,
  primary key (usuario_id, empresa_id)
);

-- Chequeos por sucursal + año (aquí vive el drive_url)
create table chequeos (
  id uuid primary key default gen_random_uuid(),
  sucursal_id uuid references sucursales(id) on delete cascade,
  año int not null,
  drive_url text not null,
  created_at timestamptz default now(),
  unique (sucursal_id, año)
);
```

---

## Row Level Security (RLS)

```sql
-- Habilitar RLS en todas las tablas
alter table empresas enable row level security;
alter table sucursales enable row level security;
alter table chequeos enable row level security;
alter table responsable_empresa enable row level security;

-- Admin: acceso total
create policy "admin_full_access" on empresas
  for all using (
    exists (select 1 from profiles where id = auth.uid() and rol = 'admin')
  );

-- Repetir patrón admin para sucursales, chequeos y responsable_empresa

-- Responsable: solo ve sus empresas asignadas
create policy "responsable_ver_empresas" on empresas
  for select using (
    exists (
      select 1 from responsable_empresa
      where usuario_id = auth.uid() and empresa_id = empresas.id
    )
  );

-- Responsable: solo ve sucursales de sus empresas
create policy "responsable_ver_sucursales" on sucursales
  for select using (
    exists (
      select 1 from responsable_empresa
      where usuario_id = auth.uid() and empresa_id = sucursales.empresa_id
    )
  );

-- Responsable: solo ve chequeos de sus sucursales
create policy "responsable_ver_chequeos" on chequeos
  for select using (
    exists (
      select 1 from sucursales s
      join responsable_empresa re on re.empresa_id = s.empresa_id
      where s.id = chequeos.sucursal_id and re.usuario_id = auth.uid()
    )
  );
```

---

## Estructura del Proyecto Next.js

```
/sos-checkup
  /app
    /login
      page.tsx                  ← Supabase Auth UI
    /dashboard
      layout.tsx                ← Guard de sesión + rol
      /admin
        /empresas
          page.tsx              ← Listado + crear empresa
          /[id]/page.tsx        ← Editar / eliminar
        /sucursales
          page.tsx              ← Listado + crear sucursal
          /[id]/page.tsx        ← Editar / eliminar
        /usuarios
          page.tsx              ← Listado + crear responsable
          /[id]/page.tsx        ← Editar / asignar empresas
        /chequeos
          page.tsx              ← Crear chequeo (sucursal + año + drive_url)
      /responsable
        page.tsx                ← Selector de año
        /[año]/page.tsx         ← Cards de sucursales → redirect Drive
  /components
    /ui                         ← Componentes reutilizables
    AdminSidebar.tsx
    ResponsableSidebar.tsx
  /lib
    supabase.ts                 ← Cliente Supabase
    resend.ts                   ← Cliente Resend para emails
    auth.ts                     ← Helpers de sesión y rol
  /emails
    credenciales.tsx            ← Template React Email para Resend
```

---

## Flujo de Envío de Credenciales

```
Admin crea usuario en Supabase Auth
       ↓
Supabase genera password temporal
       ↓
API Route /api/send-credentials
       ↓
Resend envía email con:
  - Usuario: email
  - Contraseña temporal
  - Link al sistema
       ↓
Usuario entra y Supabase fuerza cambio de password (opcional)
```

---

## Plan de Desarrollo por Fases

| Fase | Descripción |
|---|---|
| **1** | Setup Next.js + Supabase + Resend + estructura base |
| **2** | Migraciones SQL + RLS completo |
| **3** | Auth: login, guard de roles, middleware |
| **4** | CRUD Empresas, Sucursales, Usuarios |
| **5** | Asignación responsable ↔ empresa |
| **6** | Envío de credenciales por email (Resend) |
| **7** | Vista responsable: año → sucursales → Drive |
| **8** | CRUD Chequeos (sucursal + año + drive_url) |
| **9** | QA + verificación de RLS + bugs |

---

## Estimación de Tiempo
- **Total estimado:** 16-24 horas de trabajo activo
- **Con IA + MCP + Skills:** 3-5 días trabajando por fases

---

## Notas Importantes
- El `drive_url` vive en la tabla `chequeos` (no en `sucursales`) porque el link es por **sucursal + año**.
- Un responsable puede estar asignado a **múltiples empresas y sus sucursales**.
- La creación de carpetas en Google Drive la hace el **admin manualmente** desde Drive.
- RLS es crítico — diseñado para que responsables solo vean sus datos asignados.
- Región Supabase seleccionada: `us-east-1` — más cercana a Nicaragua.