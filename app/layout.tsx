import type { Metadata } from 'next'
import { Poppins, Manrope } from 'next/font/google'
import ToastProvider from '@/components/ToastProvider'
import './globals.css'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'SOS Medical Online',
  description: 'Sistema de gestión de chequeos médicos empresariales',
  icons: {
    icon: '/icon-SOSMedical.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${poppins.variable} ${manrope.variable} h-full`}>
      <head />
      <body className="min-h-full">
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}
