// Template de email para envío de credenciales — Fase 6

interface CredencialesEmailProps {
  email: string
  password: string
  loginUrl: string
}

export function CredencialesEmail({
  email,
  password,
  loginUrl,
}: CredencialesEmailProps) {
  return (
    <div>
      <h1>Bienvenido a SOS CheckUp</h1>
      <p>Tus credenciales de acceso:</p>
      <p><strong>Usuario:</strong> {email}</p>
      <p><strong>Contraseña:</strong> {password}</p>
      <p><a href={loginUrl}>Ingresar al sistema</a></p>
    </div>
  )
}
