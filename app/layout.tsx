import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
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
  title: 'Returnly — Palackvisszavitel-követő',
  description:
    'Palackgyűjtés és visszavitel követése egyszerűen, a csapatoddal együtt.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/returnly-icon-192.png',
        type: 'image/png',
        sizes: '192x192',
      },
      {
        url: '/returnly-logo.png',
        type: 'image/png',
        sizes: '1254x1254',
      },
    ],
    apple: '/returnly-icon-180.png',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
