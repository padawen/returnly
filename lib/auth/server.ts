import 'server-only'
import { createNeonAuth } from '@neondatabase/auth/next/server'

let instance: ReturnType<typeof createNeonAuth> | undefined

export function getAuth() {
  const baseUrl = process.env.NEON_AUTH_BASE_URL
  const secret = process.env.NEON_AUTH_COOKIE_SECRET
  if (!baseUrl || !secret || secret.length < 32) {
    throw new Error('Neon Auth configuration is missing or invalid')
  }
  instance ??= createNeonAuth({
    baseUrl,
    cookies: { secret, sessionDataTtl: 60 },
  })
  return instance
}
