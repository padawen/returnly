import 'server-only'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle, type NeonDatabase } from 'drizzle-orm/neon-serverless'
import * as schema from './schema'

export type Database = NeonDatabase<typeof schema>
neonConfig.webSocketConstructor = WebSocket

export async function withDatabase<T>(work: (db: Database) => Promise<T>): Promise<T> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is missing')
  const authUrl = new URL(process.env.NEON_AUTH_BASE_URL || '')
  const databaseUrl = new URL(connectionString)
  const endpoint = authUrl.hostname.split('.neonauth.')[0]
  if (!databaseUrl.hostname.startsWith(endpoint + '-pooler.') ||
      authUrl.pathname !== databaseUrl.pathname + '/auth') {
    throw new Error('Database and Auth must use the same Neon branch')
  }
  const pool = new Pool({ connectionString })
  try {
    // Fail closed if an owner or BYPASSRLS credential is accidentally deployed.
    const result = await pool.query<{ rolname: string; rolbypassrls: boolean; rolsuper: boolean }>(
      'SELECT rolname, rolbypassrls, rolsuper FROM pg_roles WHERE rolname = current_user',
    )
    const role = result.rows[0]
    if (!role || role.rolname !== 'returnly_app' || role.rolbypassrls || role.rolsuper) {
      throw new Error('DATABASE_URL must use the restricted returnly_app role')
    }
    return await work(drizzle(pool, { schema }))
  } finally {
    await pool.end()
  }
}
