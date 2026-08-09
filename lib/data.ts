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

export const CATEGORY_META = {
  pet: {
    key: 'pet' as const,
    label: 'PET / ALU',
    short: 'PET / ALU',
    className: 'pet',
  },
  glass: {
    key: 'glass' as const,
    label: 'Törhető üveg',
    short: 'Üveg',
    className: 'glass',
  },
}

export const CURRENT_USER: User = {
  id: 'u_david',
  name: 'Herczeg Dávid',
  firstName: 'Dávid',
  email: 'daveherczeg@gmail.com',
  color: 'pet',
  photoUrl: '/avatar-david.png',
  isAdmin: true,
}

export const TEAM: User[] = [
  CURRENT_USER,
  {
    id: 'u_bence',
    name: 'Nagy Bence',
    firstName: 'Bence',
    email: 'bence.nagy@gmail.com',
    color: 'glass',
    isAdmin: false,
  },
  {
    id: 'u_anna',
    name: 'Tóth Anna',
    firstName: 'Anna',
    email: 'anna.toth@gmail.com',
    color: 'neutral',
    isAdmin: false,
  },
]

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

export function getUser(id: string): User {
  return TEAM.find((u) => u.id === id) ?? CURRENT_USER
}

export function entryTotal(entry: Pick<Entry, 'pet' | 'glass'>): number {
  return entry.pet + entry.glass
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('hu-HU', {
    hour: '2-digit',
    minute: '2-digit',
  })
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
