import type { NextRequest } from 'next/server'
import { getAuth } from '@/lib/auth/server'

type Context = { params: Promise<{ path: string[] }> }
export const runtime = 'nodejs'

export async function GET(request: NextRequest, context: Context) {
  const { path } = await context.params
  if (path.join('/') !== 'get-session') return Response.json({ error: 'Not found' }, { status: 404 })
  try {
    return await getAuth().handler().GET(request, context)
  } catch {
    return Response.json({ error: 'A bejelentkezés jelenleg nem elérhető.' }, { status: 503 })
  }
}

export async function POST(request: NextRequest, context: Context) {
  const { path } = await context.params
  const route = path.join('/')
  if (route !== 'sign-in/social' && route !== 'sign-out') {
    return Response.json({ error: 'Only Google sign-in is supported' }, { status: 404 })
  }
  if (route === 'sign-in/social') {
    const body = await request.clone().json().catch(() => null)
    if (body?.provider !== 'google' || body.idToken || body.callbackURL !== '/auth/callback' ||
        body.newUserCallbackURL || body.errorCallbackURL !== '/?authError=callback') {
      return Response.json({ error: 'Invalid Google sign-in request' }, { status: 400 })
    }
  }
  try {
    return await getAuth().handler().POST(request, context)
  } catch {
    return Response.json({ error: 'A bejelentkezés jelenleg nem elérhető.' }, { status: 503 })
  }
}
