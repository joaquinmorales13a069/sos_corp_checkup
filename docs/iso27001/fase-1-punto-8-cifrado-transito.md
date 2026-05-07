# Punto 8 — Cifrado en Tránsito (HTTPS/TLS)

> **Control ISO:** ISO 27001 A.10
> **Fecha de implementación:** 2026-05-07
> **Estado:** ✅ Completo

---

## Descripción del Control

Toda comunicación entre el cliente (browser) y el sistema SOS Corp Checkup, así como entre el sistema y sus servicios externos (Supabase, Resend), viaja cifrada mediante TLS.

---

## Capa 1 — TLS en el servidor de producción (EasyPanel + Traefik)

**Proveedor:** EasyPanel sobre VPS Contabo  
**Proxy inverso:** Traefik (incluido en EasyPanel)  
**Certificado:** Let's Encrypt (renovación automática cada 90 días)

EasyPanel configura automáticamente Traefik como reverse proxy. Al registrar el dominio en EasyPanel, Traefik solicita y renueva el certificado TLS via ACME (Let's Encrypt) sin intervención manual.

**Comportamiento:**
- Todo el tráfico HTTPS externo termina en Traefik (TLS termination)
- Traefik hace forward del tráfico a la aplicación Next.js via HTTP interno (en la misma red Docker)
- Traefik redirige automáticamente HTTP → HTTPS (301) antes de llegar a la aplicación

**Referencia:** [EasyPanel Docs](https://easypanel.io/docs)

---

## Capa 2 — Headers HTTP de seguridad (Next.js)

Configurados en `next.config.ts` (implementados en Fase 1):

| Header | Valor | Propósito |
|--------|-------|-----------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Fuerza HTTPS en el browser por 1 año |
| `X-Frame-Options` | `DENY` | Previene clickjacking via iframes |
| `X-Content-Type-Options` | `nosniff` | Previene MIME type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limita información de referrer a terceros |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Restringe APIs del browser |

**Nota:** El header `Strict-Transport-Security` instruye al browser a usar solo HTTPS por 1 año incluso si el usuario escribe `http://`. Esto es adicional al redirect de Traefik — el redirect es la primera línea, HSTS es el refuerzo en el cliente.

---

## Capa 3 — TLS en conexiones Supabase

Supabase requiere TLS en todas las conexiones a la base de datos y a la API REST.

- **Conexión a PostgreSQL:** TLS obligatorio (`sslmode=require`)
- **Conexión via supabase-js:** Todas las llamadas a la API REST usan HTTPS por defecto
- **JWT firmado:** Tokens firmados con secret gestionado por Supabase

**Referencia oficial:** [Supabase Security](https://supabase.com/docs/guides/platform/ssl-enforcement)

---

## Capa 4 — TLS en conexiones Resend (envío de emails)

Resend envía emails via API usando HTTPS. La integración via SDK de Resend usa TLS en toda comunicación.

---

## Evidencia

- `next.config.ts` — código fuente con security headers implementados
- Verificación manual en producción: `curl -I https://[dominio] | grep -i strict-transport`
- EasyPanel dashboard — certificado Let's Encrypt activo con fecha de expiración visible

---

## Conclusión

El cifrado en tránsito está implementado en múltiples capas: TLS terminado en Traefik (EasyPanel), HSTS forzado via header en el browser, y TLS obligatorio en todas las conexiones a servicios externos (Supabase, Resend). Control cumplido según ISO 27001 A.10.
