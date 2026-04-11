interface CredencialesEmailProps {
  nombre: string
  email: string
  password: string
  loginUrl: string
}

export function credencialesHtml({
  nombre,
  email,
  password,
  loginUrl,
}: CredencialesEmailProps): string {
  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Tus credenciales — Resultados Médicos Empresariales</title>
</head>
<body style="margin:0;padding:0;background:#f8f9fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.24);">

        <!-- Header: white background for logo -->
        <tr>
          <td style="background:#ffffff;padding:24px 40px;">
            <img src="${loginUrl}/logo-SOSMedical.webp" alt="SOS Medical" height="44" style="display:block;height:44px;width:auto;" />
          </td>
        </tr>

        <!-- Body: light gray background -->
        <tr>
          <td style="background:#f2f4f6;padding:40px;">
            <p style="margin:0 0 6px;color:#191c1e;font-size:20px;font-weight:700;">Bienvenido, ${nombre}</p>
            <p style="margin:0 0 32px;color:#505050;font-size:14px;line-height:1.7;">
              Tu cuenta en <strong style="color:#191c1e;">SOS Medical Online</strong> ha sido creada. A continuación encontrarás tus credenciales de acceso al sistema:
            </p>

            <!-- Credentials box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;margin-bottom:32px;border:1px solid #e0e3e5;">
              <tr>
                <td style="padding:24px 28px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-bottom:16px;border-bottom:1px solid #e0e3e5;">
                        <p style="margin:0 0 4px;color:#727784;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Usuario</p>
                        <p style="margin:0;color:#191c1e;font-size:15px;font-weight:500;">${email}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top:16px;">
                        <p style="margin:0 0 4px;color:#727784;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Contraseña temporal</p>
                        <p style="margin:0;color:#004e9f;font-size:22px;font-weight:700;font-family:'Courier New',Courier,monospace;letter-spacing:2px;">${password}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- CTA Button: SOS red -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="background:#CC3333;border-radius:10px;">
                  <a href="${loginUrl}/login" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">
                    Ingresar al sistema →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;color:#727784;font-size:13px;line-height:1.7;border-top:1px solid #e0e3e5;padding-top:24px;">
              Por seguridad, te recomendamos cambiar tu contraseña después de tu primer ingreso.<br>
              Si tienes algún problema para acceder, contacta al administrador de SOS Medical.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#ffffff;padding:20px 40px;border-top:1px solid #eceef0;">
            <p style="margin:0;color:#727784;font-size:12px;line-height:1.6;">
              © ${year} SOS Medical Nicaragua.<br>
              Este es un correo automático — por favor no respondas a este mensaje.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
