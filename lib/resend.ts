import { Resend } from 'resend'
import { credencialesHtml } from '@/emails/credenciales'

export const resend = new Resend(process.env.RESEND_API_KEY)

interface SendCredencialesParams {
  nombre: string
  email: string
  password: string
}

export async function sendCredenciales({ nombre, email, password }: SendCredencialesParams) {
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const from = process.env.RESEND_FROM_EMAIL ?? 'SOS CheckUp <onboarding@resend.dev>'

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: 'Tus credenciales de acceso — SOS Medical Online',
    html: credencialesHtml({ nombre, email, password, loginUrl }),
  })

  if (error) return { error: error.message }
}
