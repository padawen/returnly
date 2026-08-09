export type User = {
  id: string
  name: string
  firstName: string
  email: string
  /** tailwind-ish token pair used for the initials avatar */
  color: string
  /** optional Google account profile photo */
  photoUrl?: string
  isAdmin?: boolean
}

export type Entry = {
  id: string
  userId: string
  pet: number
  glass: number
  /** ISO timestamp for when the entry was created today */
  createdAt: string
  /** Return event that closed this entry's active collection cycle */
  returnEventId?: string | null
}

export const CURRENT_USER: User = {
  id: 'u_david',
  name: 'Herczeg Dávid',
  firstName: 'Dávid',
  email: 'daveherczeg@gmail.com',
  color: 'pet',
  isAdmin: true,
}

function todayAt(hours: number, minutes: number): string {
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

export const INITIAL_ENTRIES: Entry[] = [
  {
    id: 'e_1',
    userId: 'u_david',
    pet: 84,
    glass: 12,
    createdAt: todayAt(14, 32),
    returnEventId: null,
  },
  {
    id: 'e_2',
    userId: 'u_bence',
    pet: 46,
    glass: 7,
    createdAt: todayAt(9, 8),
    returnEventId: null,
  },
]

export function entryTotal(entry: Pick<Entry, 'pet' | 'glass'>): number {
  return entry.pet + entry.glass
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('hu-HU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatEntryDateTime(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const time = formatTime(iso)

  if (date.toDateString() === today.toDateString()) {
    return `Ma, ${time}`
  }

  return `${date.toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })}, ${time}`
}

export function formatFullDate(date = new Date()): string {
  return date.toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

export function formatNumber(n: number): string {
  return n.toLocaleString('hu-HU')
}
