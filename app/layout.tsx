import type { Metadata } from 'next'
import Script from 'next/script'
import localFont from 'next/font/local'
import Header from '@/components/Header'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { getAuthUser } from '@/lib/authUtils'

import './globals.css'

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const authUser = await getAuthUser()

  return (
    <html lang="en">
      <Script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></Script>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <div className="flex flex-col h-screen overflow-hidden">
          <AuthProvider user={authUser}>
            <Header />
            <div className="flex-1 overflow-auto">{children}</div>
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}
