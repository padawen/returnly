import { randomBytes } from 'node:crypto'
import { NextResponse, NextRequest } from 'next/server'
import { getAuth } from '@/lib/auth/server'

export async function proxy(request: NextRequest) {
  const nonce = randomBytes(16).toString('base64')
  const isDevelopment = process.env.NODE_ENV !== 'production'
  const contentSecurityPolicy = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ''} https://va.vercel-scripts.com`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.googleusercontent.com",
    "font-src 'self' data:",
    `connect-src 'self' https://va.vercel-scripts.com${isDevelopment ? ' ws: wss:' : ''}`,
    "manifest-src 'self'",
    "worker-src 'self' blob:",
  ].join('; ')
  // Next.js reads the request CSP to attach this nonce to its generated scripts.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy)

  // Neon exchanges its OAuth verifier and sets the app's HTTP-only session cookies here.
  // Authorization is validated independently in every Server Action.
  const response = request.nextUrl.pathname === '/auth/callback' &&
    process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET
    ? await getAuth().middleware({ loginUrl: '/' })(new NextRequest(request, { headers: requestHeaders }))
    : NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', contentSecurityPolicy)
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_vercel/insights|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|woff|woff2)$).*)',
  ],
}
