import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const rawNext = url.searchParams.get('next')
  let next = '/'

  try {
    const candidate = new URL(rawNext ?? '/', url.origin)

    if (candidate.origin === url.origin) {
      next = `${candidate.pathname}${candidate.search}${candidate.hash}`
    }
  } catch {
    next = '/'
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin))
    }
  }

  return NextResponse.redirect(new URL('/?authError=callback', url.origin))
}
