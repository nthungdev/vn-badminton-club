import type { Metadata } from 'next'
import Script from 'next/script'
import localFont from 'next/font/local'
import Header from '@/components/Header'
import './globals.css'
import { verifySession } from '@/lib/session'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { DecodedIdToken } from 'firebase-admin/auth'
import { AuthContextUser } from './contexts/AuthContext'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: process.env.SITE_TITLE,
  description: process.env.SITE_DESCRIPTION,
}

export function toUser(decodedIdToken: DecodedIdToken): AuthContextUser {
  return {
    ...decodedIdToken,
    uid: decodedIdToken.uid,
    email: decodedIdToken.email!,
    displayName: decodedIdToken.name,
    emailVerified: decodedIdToken.email_verified ?? false,
    role: decodedIdToken?.role,
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { decodedIdToken, isAuth } = await verifySession()
  const user = isAuth ? toUser(decodedIdToken) : null

  return (
    <html lang="en">
      <Script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></Script>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <div className="flex flex-col h-screen overflow-hidden">
          <AuthProvider user={user}>
            <Header />
            <div className="flex-1 overflow-auto">{children}</div>
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}
