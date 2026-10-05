import type { Entry } from './data'

export type Theme = 'light' | 'dark'
export type EntryInput = { pet: number; glass: number }
export type Profile = {
  id: string
  email: string
  displayName: string
  nickname: string
  theme: Theme
  avatarUrl: string | null
}
export type Role = { userId: string; isAdmin: boolean; isMainAdmin: boolean }
export type ReturnEvent = {
  id: string
  performedBy: string
  returnedAt: string
  pet: number
  glass: number
  total: number
}
export type Snapshot = {
  userId: string
  profiles: Profile[]
  roles: Role[]
  entries: Entry[]
  returnEvents: ReturnEvent[]
}
export type ReturnSummary = {
  id: string
  pet: number
  glass: number
  total: number
  entryIds: string[]
}
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

export function unwrap<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new Error(result.error)
  return result.data
}
