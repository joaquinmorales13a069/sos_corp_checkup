import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { getUser } from '@/lib/auth'
import LoginForm from './LoginForm'
import logo from '@/assets/images/logo-SOSMedical.webp'

export default async function LoginPage() {
  const user = await getUser()
  if (user) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src={logo}
            alt="SOS Medical"
            width={180}
            height={64}
            className="object-contain mx-auto mb-4"
            priority
          />
          <p className="text-sm text-sos-gray mt-1">Gestión de chequeos médicos empresariales</p>
        </div>

        {/* Card */}
        <div className="bg-sos-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Iniciar sesión</h2>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-sos-gray mt-6">
          SOS Medical © {new Date().getFullYear()}
        </p>
      </div>
    </main>
  )
}
