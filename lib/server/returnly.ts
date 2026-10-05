import { randomUUID } from 'node:crypto'
import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import type { Database } from '../db'
import { accounts, entries, entryRequests, identities, profiles, returns, roles } from '../db/schema'
import type { EntryInput, Profile, ReturnSummary, Snapshot } from '../contracts'
import type { Entry } from '../data'
import { PublicError, validEntry, validId, validNickname, validTheme } from './validation'

export type AuthUser = { id: string; email: string; name: string; image?: string | null }
type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0]
type Executor = Database | Transaction

const entryDto = (row: typeof entries.$inferSelect): Entry => ({
  ...row, createdAt: row.createdAt.toISOString(),
})
const profileDto = (row: typeof profiles.$inferSelect): Profile => ({
  id: row.id, email: row.email, displayName: row.displayName,
  nickname: row.nickname, theme: row.theme, avatarUrl: row.avatarUrl,
})

async function admin(db: Executor, userId: string) {
  const [role] = await db.select({ isAdmin: roles.isAdmin }).from(roles).where(eq(roles.userId, userId)).for('share')
  if (!role?.isAdmin) throw new PublicError('Ezt a műveletet csak admin végezheti el.')
}

async function collectionLock(tx: Transaction) {
  // Shared by all writes: totals and the exact returned row set cannot drift.
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended('returnly:collection', 0))`)
}

async function requireOpenEntry(tx: Transaction, id: string) {
  const [entry] = await tx.select({ returnEventId: entries.returnEventId, revision: entries.revision })
    .from(entries).where(eq(entries.id, id)).for('update')
  if (!entry) throw new PublicError('A bejegyzés már nem található.')
  if (entry.returnEventId !== null) {
    throw new PublicError('A visszavitt bejegyzés már nem módosítható vagy törölhető.')
  }
  return entry
}

export async function resolveIdentity(db: Database, user: AuthUser): Promise<string> {
  validId(user.id)
  return db.transaction(async (tx) => {
    const config = await tx.execute(sql`SELECT private.google_only_auth_ready() AS ready`)
    if (!config.rows[0]?.ready) throw new PublicError('A Google-belépés beállítását ellenőrizni kell.')
    const linked = await tx.select({ subject: accounts.accountId }).from(accounts)
      .where(and(eq(accounts.userId, user.id), eq(accounts.providerId, 'google')))
    if (linked.length !== 1 || !linked[0].subject) {
      throw new PublicError('A belépéshez Google-fiók szükséges.')
    }
    const subject = linked[0].subject
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${`returnly:identity:${subject}`}, 0))`)
    const [mapping] = await tx.select().from(identities).where(eq(identities.subject, subject))
    if (mapping?.authUserId && mapping.authUserId !== user.id) {
      throw new PublicError('A Google-fiók összekapcsolását ellenőrizni kell.')
    }
    if (mapping) {
      await tx.update(identities).set({ authUserId: user.id }).where(eq(identities.subject, subject))
      return mapping.appUserId
    }
    // Email is deliberately not used to attach a new identity to a legacy profile.
    const email = user.email.toLowerCase()
    const [existing] = await tx.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email))
    if (existing) throw new PublicError('Ehhez az emailhez már tartozik profil. A Google-azonosítót ellenőrizni kell.')
    const id = randomUUID()
    const avatar = user.image && /^https:\/\/[^/]+\.googleusercontent\.com\//.test(user.image) ? user.image : null
    await tx.insert(profiles).values({ id, email, displayName: user.name, avatarUrl: avatar })
    await tx.insert(roles).values({ userId: id, isAdmin: false })
    await tx.insert(identities).values({ subject, appUserId: id, authUserId: user.id })
    return id
  })
}

export async function readSnapshot(db: Database, userId: string): Promise<Snapshot> {
  return db.transaction(async (tx) => {
    // A single consistent snapshot, retaining the existing shared-team visibility.
    const profileRows = await tx.select().from(profiles).orderBy(profiles.displayName)
    const roleRows = await tx.select({ userId: roles.userId, isAdmin: roles.isAdmin, isMainAdmin: roles.isMainAdmin }).from(roles)
    const entryRows = await tx.select().from(entries).orderBy(desc(entries.createdAt))
    const returnRows = await tx.select().from(returns).orderBy(desc(returns.returnedAt), desc(returns.id))
    return { userId, profiles: profileRows.map(profileDto), roles: roleRows, entries: entryRows.map(entryDto),
      returnEvents: returnRows.map(row => ({ ...row, total: row.pet + row.glass, returnedAt: row.returnedAt.toISOString() })) }
  }, { isolationLevel: 'repeatable read', accessMode: 'read only' })
}

export async function addEntry(db: Database, userId: string, input: EntryInput, requestId: string): Promise<Entry> {
  validId(requestId)
  const value = validEntry(input)
  return db.transaction(async (tx) => {
    await collectionLock(tx)
    const [previous] = await tx.select().from(entryRequests).where(eq(entryRequests.requestId, requestId))
    if (previous) {
      if (previous.userId !== userId || previous.pet !== value.pet || previous.glass !== value.glass) {
        throw new PublicError('Ez a mentés már más adatokkal megtörtént. Nyiss új bejegyzést.')
      }
      return { id: requestId, userId, ...value, revision: 0, createdAt: previous.createdAt.toISOString(), returnEventId: null }
    }
    await tx.insert(entryRequests).values({ requestId, userId, ...value })
    const [row] = await tx.insert(entries).values({ id: requestId, userId, ...value }).returning()
    return entryDto(row)
  })
}

export async function updateEntry(db: Database, id: string, input: EntryInput, expectedRevision: number) {
  validId(id)
  if (!Number.isInteger(expectedRevision) || expectedRevision < 0) throw new PublicError('Érvénytelen bejegyzésverzió.')
  const value = validEntry(input)
  await db.transaction(async (tx) => {
    await collectionLock(tx)
    const current = await requireOpenEntry(tx, id)
    if (current.revision !== expectedRevision) {
      throw new PublicError('Ezt a bejegyzést közben módosították. Töltsd újra a szerkesztőt.')
    }
    const changed = await tx.update(entries).set(value).where(eq(entries.id, id)).returning({ id: entries.id })
    if (!changed.length) throw new PublicError('A bejegyzés már nem található.')
  })
}

export async function deleteEntry(db: Database, userId: string, id: string) {
  validId(id)
  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('returnly.actor_id', ${userId}, true)`)
    await admin(tx, userId)
    await collectionLock(tx)
    await requireOpenEntry(tx, id)
    const changed = await tx.delete(entries).where(eq(entries.id, id)).returning({ id: entries.id })
    if (!changed.length) throw new PublicError('A bejegyzés már nem található.')
  })
}

export async function setNickname(db: Database, userId: string, value: string) {
  await db.update(profiles).set({ nickname: validNickname(value) }).where(eq(profiles.id, userId))
}

export async function setTheme(db: Database, userId: string, value: string) {
  await db.update(profiles).set({ theme: validTheme(value) }).where(eq(profiles.id, userId))
}

export async function grantAdmin(db: Database, userId: string, targetId: string) {
  validId(targetId)
  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('returnly.actor_id', ${userId}, true)`)
    await admin(tx, userId)
    const [target] = await tx.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, targetId))
    if (!target) throw new PublicError('A felhasználó nem található.')
    await tx.insert(roles).values({ userId: targetId, isAdmin: true })
      .onConflictDoUpdate({ target: roles.userId, set: { isAdmin: true } })
  })
}

export async function revokeAdmin(db: Database, userId: string, targetId: string) {
  validId(targetId)
  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('returnly.actor_id', ${userId}, true)`)
    await admin(tx, userId)
    const [actor] = await tx.select({ isMainAdmin: roles.isMainAdmin }).from(roles).where(eq(roles.userId, userId))
    if (!actor?.isMainAdmin) {
      throw new PublicError('Adminjogot csak a főadmin vehet el.')
    }
    const [target] = await tx.select({ id: profiles.id, isMainAdmin: roles.isMainAdmin }).from(profiles)
      .leftJoin(roles, eq(roles.userId, profiles.id)).where(eq(profiles.id, targetId))
    if (!target) throw new PublicError('A felhasználó nem található.')
    if (target.isMainAdmin) {
      throw new PublicError('A főadmin jogosultsága nem vehető el.')
    }
    await tx.update(roles).set({ isAdmin: false }).where(eq(roles.userId, targetId))
  })
}

export async function markAllReturned(db: Database, userId: string): Promise<ReturnSummary> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('returnly.actor_id', ${userId}, true)`)
    await admin(tx, userId)
    await collectionLock(tx)
    const open = await tx.select().from(entries).where(isNull(entries.returnEventId)).for('update')
    const pet = open.reduce((sum, entry) => sum + entry.pet, 0)
    const glass = open.reduce((sum, entry) => sum + entry.glass, 0)
    if (pet + glass === 0) throw new PublicError('Nincs visszavitelre váró készlet.')
    const [event] = await tx.insert(returns).values({ performedBy: userId, pet, glass }).returning({ id: returns.id })
    await tx.update(entries).set({ returnEventId: event.id }).where(isNull(entries.returnEventId))
    return { id: event.id, pet, glass, total: pet + glass, entryIds: open.map((entry) => entry.id) }
  })
}

export async function restoreReturn(db: Database, userId: string, eventId: string): Promise<ReturnSummary> {
  validId(eventId)
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('returnly.actor_id', ${userId}, true)`)
    await admin(tx, userId)
    await collectionLock(tx)
    // collectionLock serializes return mutations; FOR UPDATE would also require
    // UPDATE privileges on return_events, which the app deliberately lacks.
    const [event] = await tx.select().from(returns).where(eq(returns.id, eventId))
    if (!event) throw new PublicError('Ez a visszavitel már nem található. Frissítsd az előzményeket.')
    const restored = await tx.update(entries).set({ returnEventId: null })
      .where(eq(entries.returnEventId, eventId)).returning({ id: entries.id })
    await tx.delete(returns).where(eq(returns.id, eventId))
    return { id: eventId, pet: event.pet, glass: event.glass,
      total: event.pet + event.glass, entryIds: restored.map(entry => entry.id) }
  })
}
