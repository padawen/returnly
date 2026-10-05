import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { connection } from 'next/server'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Returnly',
  description:
    'Palackgyűjtés és visszavitel követése egyszerűen, a csapatoddal együtt.',
  icons: {
    icon: [
      {
        url: '/returnly-wine-icon-192.png',
        type: 'image/png',
        sizes: '192x192',
      },
      {
        url: '/returnly-wine-logo.png',
        type: 'image/png',
        sizes: '1254x1254',
      },
    ],
    apple: '/returnly-wine-icon-180.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#009f6b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Every HTML page, including the not-found page, needs its request's script nonce.
  await connection()
  return (
    <html
      lang="hu"
      className={`light bg-background ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
