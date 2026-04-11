import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  const user = await getUser()
  if (user) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-sos-red rounded-2xl mb-4">
            <span className="text-sos-white font-bold text-xl">SOS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SOS CheckUp</h1>
          <p className="text-sm text-sos-gray mt-1">Gestión de chequeos médicos empresariales</p>
        </div>

        {/* Card */}
        <div className="bg-sos-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Iniciar sesión</h2>
          <LoginForm />
        </div>

        <p className="text-center text-xs text-sos-gray mt-6">
          SOS Medical © {new Date().getFullYear()}
        </p>
      </div>
    </main>
  )
}
