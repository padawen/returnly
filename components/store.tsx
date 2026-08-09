'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import {
  CURRENT_USER,
  INITIAL_ENTRIES,
  entryTotal,
  type Entry,
  type User,
} from '@/lib/data'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

type EntryInput = { pet: number; glass: number }
type Totals = { pet: number; glass: number; total: number }
export type Theme = 'light' | 'dark'
export type ReturnSummary = Totals & { id: string }

type ProfileRow = {
  id: string
  email: string
  display_name: string
  nickname: string
  theme: Theme
}

type RoleRow = {
  user_id: string
  is_admin: boolean
}

type EntryRow = {
  id: string
  user_id: string
  pet_count: number
  glass_count: number
  created_at: string
  return_event_id: string | null
}

type StoreValue = {
  entries: Entry[]
  activeEntries: Entry[]
  currentUser: User
  team: User[]
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  error: string | null
  nickname: string
  theme: Theme
  setNickname: (value: string) => Promise<void>
  setTheme: (value: Theme) => Promise<void>
  totals: Totals
  allTotals: Totals
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  addEntry: (input: EntryInput) => Promise<Entry>
  updateEntry: (id: string, input: EntryInput) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  markAllReturned: () => Promise<ReturnSummary>
  grantAdmin: (userId: string) => Promise<void>
  /** Returns the user with their display name (nickname wins for the current user). */
  resolveUser: (id: string) => User
}

const StoreContext = createContext<StoreValue | null>(null)

function mapEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    userId: row.user_id,
    pet: row.pet_count,
    glass: row.glass_count,
    createdAt: row.created_at,
    returnEventId: row.return_event_id,
  }
}

function totalsFor(entries: Entry[]): Totals {
  const pet = entries.reduce((sum, entry) => sum + entry.pet, 0)
  const glass = entries.reduce((sum, entry) => sum + entry.glass, 0)
  return { pet, glass, total: pet + glass }
}

function firstName(name: string, email: string) {
  return name.trim().split(/\s+/)[0] || email.split('@')[0] || 'Csapattag'
}

function avatarUrl(user: SupabaseUser | null) {
  const metadata = user?.user_metadata ?? {}
  const candidates = [metadata.avatar_url, metadata.picture]
  return candidates.find(
    (value): value is string =>
      typeof value === 'string' && value.trim().length > 0,
  )
}

function toError(error: unknown, fallback: string) {
  if (error instanceof Error) return error

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) {
      return new Error(message)
    }
  }

  return new Error(fallback)
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null)
  const [mockLoggedIn, setMockLoggedIn] = useState(false)
  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [roles, setRoles] = useState<RoleRow[]>([])
  const [entries, setEntries] = useState<Entry[]>(
    isSupabaseConfigured ? [] : INITIAL_ENTRIES,
  )
  const [localNickname, setLocalNickname] = useState('')
  const [localTheme, setLocalTheme] = useState<Theme>('light')
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(
    async (userId: string) => {
      if (!supabase) return

      setError(null)
      const [profilesResult, rolesResult, entriesResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id,email,display_name,nickname,theme')
          .order('display_name'),
        supabase.from('user_roles').select('user_id,is_admin'),
        supabase
          .from('collection_entries')
          .select(
            'id,user_id,pet_count,glass_count,created_at,return_event_id',
          )
          .order('created_at', { ascending: false }),
      ])

      const queryError =
        profilesResult.error ?? rolesResult.error ?? entriesResult.error
      if (queryError) {
        setError(queryError.message)
        setIsLoading(false)
        return
      }

      const nextProfiles = (profilesResult.data ?? []) as ProfileRow[]
      const nextRoles = (rolesResult.data ?? []) as RoleRow[]
      const nextEntries = (entriesResult.data ?? []) as EntryRow[]
      setProfiles(nextProfiles)
      setRoles(nextRoles)
      setEntries(nextEntries.map(mapEntry))

      const currentProfile = nextProfiles.find((profile) => profile.id === userId)
      setLocalNickname(currentProfile?.nickname ?? '')
      setLocalTheme(currentProfile?.theme ?? 'light')
      setIsLoading(false)
    },
    [supabase],
  )

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    const loadSession = async (user: SupabaseUser | null) => {
      if (cancelled) return
      setAuthUser(user)
      if (!user) {
        setProfiles([])
        setRoles([])
        setEntries([])
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      await loadData(user.id)
    }

    void supabase.auth.getUser().then(({ data }) => loadSession(data.user))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        void loadSession(session?.user ?? null)
      }, 0)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [loadData, supabase])

  const activeUserId = authUser?.id ?? (mockLoggedIn ? CURRENT_USER.id : null)

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      setMockLoggedIn(true)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signInError) throw signInError
  }, [supabase])

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setMockLoggedIn(false)
    setAuthUser(null)
  }, [supabase])

  const addEntry = useCallback(
    async (input: EntryInput) => {
      const userId = activeUserId
      if (!userId) throw new Error('Nincs bejelentkezett felhasználó.')

      if (!supabase) {
        const entry: Entry = {
          id: `e_${Date.now()}`,
          userId,
          pet: input.pet,
          glass: input.glass,
          createdAt: new Date().toISOString(),
          returnEventId: null,
        }
        setEntries((previous) => [entry, ...previous])
        return entry
      }

      const { data, error: insertError } = await supabase
        .from('collection_entries')
        .insert({
          user_id: userId,
          pet_count: input.pet,
          glass_count: input.glass,
        })
        .select(
          'id,user_id,pet_count,glass_count,created_at,return_event_id',
        )
        .single()

      if (insertError) throw insertError
      const entry = mapEntry(data as EntryRow)
      setEntries((previous) => [entry, ...previous])
      return entry
    },
    [activeUserId, supabase],
  )

  const updateEntry = useCallback(
    async (id: string, input: EntryInput) => {
      if (!supabase) {
        setEntries((previous) =>
          previous.map((entry) =>
            entry.id === id
              ? { ...entry, pet: input.pet, glass: input.glass }
              : entry,
          ),
        )
        return
      }

      const { error: updateError } = await supabase
        .from('collection_entries')
        .update({ pet_count: input.pet, glass_count: input.glass })
        .eq('id', id)

      if (updateError) throw updateError
      setEntries((previous) =>
        previous.map((entry) =>
          entry.id === id
            ? { ...entry, pet: input.pet, glass: input.glass }
            : entry,
        ),
      )
    },
    [supabase],
  )

  const deleteEntry = useCallback(
    async (id: string) => {
      if (!supabase) {
        setEntries((previous) => previous.filter((entry) => entry.id !== id))
        return
      }

      const { error: deleteError } = await supabase
        .from('collection_entries')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setEntries((previous) => previous.filter((entry) => entry.id !== id))
    },
    [supabase],
  )

  const setNickname = useCallback(
    async (value: string) => {
      const trimmed = value.trim()
      setLocalNickname(trimmed)
      if (!supabase || !activeUserId) return

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ nickname: trimmed })
        .eq('id', activeUserId)

      if (updateError) throw updateError
      setProfiles((previous) =>
        previous.map((profile) =>
          profile.id === activeUserId
            ? { ...profile, nickname: trimmed }
            : profile,
        ),
      )
    },
    [activeUserId, supabase],
  )

  const setTheme = useCallback(
    async (value: Theme) => {
      const previousTheme = localTheme
      setLocalTheme(value)

      if (!supabase || !activeUserId) return

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ theme: value })
        .eq('id', activeUserId)

      if (updateError) {
        setLocalTheme(previousTheme)
        return
      }

      setProfiles((previous) =>
        previous.map((profile) =>
          profile.id === activeUserId
            ? { ...profile, theme: value }
            : profile,
        ),
      )
    },
    [activeUserId, localTheme, supabase],
  )

  const markAllReturned = useCallback(async (): Promise<ReturnSummary> => {
    const activeTotals = totalsFor(entries.filter((entry) => !entry.returnEventId))
    if (activeTotals.total === 0) {
      throw new Error('Nincs visszavitelre váró készlet.')
    }

    if (!supabase) {
      const id = `r_${Date.now()}`
      setEntries((previous) =>
        previous.map((entry) =>
          entry.returnEventId ? entry : { ...entry, returnEventId: id },
        ),
      )
      return { id, ...activeTotals }
    }

    const { data, error: returnError } = await supabase.rpc(
      'mark_all_returned',
    )
    if (returnError) {
      throw toError(
        returnError,
        'A visszavitel rögzítése nem sikerült.',
      )
    }

    const result = (Array.isArray(data) ? data[0] : data) as {
      id: string
      pet_count: number
      glass_count: number
      total_count: number
    }
    if (!result?.id) {
      throw new Error('A visszavitel válasza hiányos.')
    }
    setEntries((previous) =>
      previous.map((entry) =>
        entry.returnEventId
          ? entry
          : { ...entry, returnEventId: result.id },
      ),
    )
    return {
      id: result.id,
      pet: result.pet_count,
      glass: result.glass_count,
      total: result.total_count,
    }
  }, [entries, supabase])

  const grantAdmin = useCallback(
    async (userId: string) => {
      if (!supabase) {
        setRoles((previous) => [
          ...previous.filter((role) => role.user_id !== userId),
          { user_id: userId, is_admin: true },
        ])
        return
      }

      const { error: grantError } = await supabase.rpc('grant_admin', {
        target_user_id: userId,
      })
      if (grantError) throw grantError
      setRoles((previous) => [
        ...previous.filter((role) => role.user_id !== userId),
        { user_id: userId, is_admin: true },
      ])
    },
    [supabase],
  )

  const value = useMemo<StoreValue>(() => {
    const roleById = new Map(roles.map((role) => [role.user_id, role.is_admin]))
    const profileById = new Map(profiles.map((profile) => [profile.id, profile]))
    const authAvatarUrl = avatarUrl(authUser)

    const team: User[] = profiles
      .map((profile, index) => {
        const name = profile.nickname.trim() || profile.display_name || profile.email
        return {
          id: profile.id,
          name,
          firstName: firstName(name, profile.email),
          email: profile.email,
          color: index % 3 === 0 ? 'pet' : index % 3 === 1 ? 'glass' : 'neutral',
          isAdmin: roleById.get(profile.id) ?? false,
          photoUrl:
            profile.id === authUser?.id
              ? authAvatarUrl
              : undefined,
        }
      })
      .sort((a, b) => {
        if (a.id === activeUserId) return -1
        if (b.id === activeUserId) return 1
        return a.name.localeCompare(b.name, 'hu')
      })

    const currentProfile = activeUserId ? profileById.get(activeUserId) : null
    const fallbackName = authUser?.user_metadata.full_name || authUser?.email || CURRENT_USER.name
    const currentUser: User =
      team.find((member) => member.id === activeUserId) ?? {
        ...CURRENT_USER,
        id: activeUserId ?? CURRENT_USER.id,
        name: localNickname || fallbackName,
        firstName: firstName(localNickname || fallbackName, authUser?.email ?? CURRENT_USER.email),
        email: authUser?.email ?? CURRENT_USER.email,
        isAdmin: mockLoggedIn || false,
        photoUrl: authAvatarUrl ?? CURRENT_USER.photoUrl,
      }

    if (localNickname.trim() && currentProfile?.id === currentUser.id) {
      currentUser.name = localNickname.trim()
      currentUser.firstName = firstName(localNickname, currentUser.email)
    }

    const sorted = [...entries].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    const activeEntries = sorted.filter((entry) => !entry.returnEventId)
    const totals = totalsFor(activeEntries)
    const allTotals = totalsFor(sorted)

    return {
      entries: sorted,
      activeEntries,
      currentUser,
      team: team.length > 0 ? team : [currentUser],
      isAuthenticated: Boolean(activeUserId),
      isAdmin: currentUser.isAdmin ?? roleById.get(currentUser.id) ?? false,
      isLoading,
      error,
      nickname: localNickname,
      theme: localTheme,
      setNickname,
      setTheme,
      totals,
      allTotals,
      signInWithGoogle,
      signOut,
      addEntry,
      updateEntry,
      deleteEntry,
      markAllReturned,
      grantAdmin,
      resolveUser: (id: string) =>
        team.find((member) => member.id === id) ?? currentUser,
    }
  }, [
    activeUserId,
    addEntry,
    deleteEntry,
    authUser,
    entries,
    error,
    grantAdmin,
    isLoading,
    localNickname,
    localTheme,
    markAllReturned,
    mockLoggedIn,
    profiles,
    roles,
    setNickname,
    setTheme,
    signInWithGoogle,
    signOut,
    updateEntry,
  ])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export { entryTotal }
