import 'server-only'
import { getAuth } from './server'
import { PublicError } from '../server/validation'
import { resolveIdentity } from '../server/returnly'
import type { Database } from '../db'

export async function currentSession() {
  // Validate with the upstream service on every protected operation, including revocation.
  const { data, error } = await getAuth().getSession({ query: { disableCookieCache: 'true' } })
  if (error) throw new Error('Session validation failed')
  return data?.user ?? null
}

export async function requireUser(db: Database) {
  const user = await currentSession()
  if (!user) throw new PublicError('A munkamenet lejárt. Jelentkezz be Google-fiókkal.')
  return resolveIdentity(db, user)
}
