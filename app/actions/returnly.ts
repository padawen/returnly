'use server'

import { withDatabase } from '@/lib/db'
import { currentSession, requireUser } from '@/lib/auth/require-user'
import { PublicError } from '@/lib/server/validation'
import * as service from '@/lib/server/returnly'
import type { ActionResult, EntryInput, Snapshot } from '@/lib/contracts'
import { publicErrorMessage } from '@/lib/errors'

async function safely<T>(work: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await work() }
  } catch (error) {
    return { ok: false, error: error instanceof PublicError ? error.message : publicErrorMessage(error) }
  }
}

export async function getSnapshot(): Promise<ActionResult<Snapshot | null>> {
  return safely(async () => {
    const user = await currentSession()
    if (!user) return null
    return withDatabase(async (db) => service.readSnapshot(db, await service.resolveIdentity(db, user)))
  })
}

export async function addEntry(input: EntryInput, requestId: string) {
  return safely(() => withDatabase(async (db) => service.addEntry(db, await requireUser(db), input, requestId)))
}
export async function updateEntry(id: string, input: EntryInput, expectedRevision: number) {
  return safely(() => withDatabase(async (db) => {
    await requireUser(db)
    await service.updateEntry(db, id, input, expectedRevision)
  }))
}
export async function deleteEntry(id: string) {
  return safely(() => withDatabase(async (db) => service.deleteEntry(db, await requireUser(db), id)))
}
export async function setNickname(value: string) {
  return safely(() => withDatabase(async (db) => service.setNickname(db, await requireUser(db), value)))
}
export async function setTheme(value: string) {
  return safely(() => withDatabase(async (db) => service.setTheme(db, await requireUser(db), value)))
}
export async function grantAdmin(userId: string) {
  return safely(() => withDatabase(async (db) => service.grantAdmin(db, await requireUser(db), userId)))
}
export async function markAllReturned() {
  return safely(() => withDatabase(async (db) => service.markAllReturned(db, await requireUser(db))))
}

export async function revokeAdmin(userId: string) {
  return safely(() => withDatabase(async (db) => service.revokeAdmin(db, await requireUser(db), userId)))
}
