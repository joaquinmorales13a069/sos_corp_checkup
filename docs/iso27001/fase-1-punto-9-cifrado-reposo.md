# Punto 9 — Cifrado en Reposo

> **Control ISO:** ISO 27001 A.10
> **Fecha de implementación:** 2026-05-07
> **Estado:** ✅ Completo (implementado por proveedores de infraestructura)

---

## Descripción del Control

Los datos del sistema SOS Corp Checkup (base de datos, archivos de configuración, backups) se almacenan cifrados en reposo. Este control está implementado íntegramente a nivel de infraestructura por los proveedores — la aplicación no almacena datos sensibles en filesystem propio.

---

## Capa 1 — Base de datos Supabase (PostgreSQL)

**Proveedor:** Supabase (región us-east-1, AWS)  
**Algoritmo:** AES-256  
**Alcance:** PostgreSQL data files, WAL (Write-Ahead Log), backups automáticos

Supabase despliega PostgreSQL sobre infraestructura AWS. AWS cifra todos los EBS volumes (almacenamiento de disco) con AES-256 por defecto. Esto aplica a:

- Datos de tablas: `empresas`, `sucursales`, `chequeos`, `profiles`, `responsable_empresa`
- Datos de autenticación: `auth.users`, tokens, sesiones
- Backups automáticos de la base de datos

**Referencia oficial:**
- [Supabase Security & Compliance](https://supabase.com/docs/guides/platform/security)
- [AWS EBS Encryption](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html)

---

## Capa 2 — Supabase Storage

No utilizado en la versión actual de SOS Corp Checkup. Los archivos de chequeo médico (epicrisis) viven en Google Drive, no en Supabase Storage. Si se incorpora en el futuro, Supabase Storage usa AES-256 sobre AWS S3.

**Referencia:** [Supabase Storage Security](https://supabase.com/docs/guides/storage)

---

## Capa 3 — VPS Contabo (servidor de aplicación)

**Proveedor:** Contabo VPS  
**Alcance:** Disco del servidor donde corre EasyPanel + la aplicación Next.js

La aplicación Next.js no persiste datos sensibles en el filesystem del VPS. Variables de entorno (API keys, secrets) existen únicamente en memoria del proceso Node.js. Los datos de sesión viven en cookies del browser gestionadas por `@supabase/ssr`.

**Referencia:** [Contabo DPA](https://contabo.com/en/legal/dpa/)

---

## Capa 4 — Google Drive (epicrisis de trabajadores)

Los archivos de epicrisis (PDFs de chequeos médicos) se almacenan en Google Drive (Google Workspace corporativo). Google cifra todos los archivos en reposo con AES-256.

**Referencia:** [Google Workspace Security](https://workspace.google.com/intl/en/security/)

---

## Inventario de datos y ubicación

| Dato | Dónde vive | Cifrado en reposo |
|------|-----------|-------------------|
| Datos de empresas, sucursales, chequeos | Supabase PostgreSQL | ✅ AES-256 (AWS EBS) |
| Credenciales de usuarios (hashed) | Supabase Auth | ✅ AES-256 (AWS EBS) |
| Sesiones / JWTs activos | Supabase Auth | ✅ AES-256 (AWS EBS) |
| URLs de Google Drive | Supabase PostgreSQL | ✅ AES-256 (AWS EBS) |
| Archivos de epicrisis (PDFs) | Google Drive | ✅ AES-256 |
| Variables de entorno (API keys) | Proceso Node.js en memoria | No persisten en disco |

---

## Conclusión

El cifrado en reposo está implementado íntegramente por los proveedores de infraestructura (Supabase/AWS, Google Drive). La aplicación no almacena datos sensibles propios en disco. Control cumplido según ISO 27001 A.10.
