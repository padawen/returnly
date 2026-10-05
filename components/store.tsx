'use client'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { authClient } from '@/lib/auth/client'
import * as actions from '@/app/actions/returnly'
import { unwrap, type EntryInput, type Snapshot, type Theme } from '@/lib/contracts'
import { type Entry, type User } from '@/lib/data'
export type { Theme, ReturnSummary } from '@/lib/contracts'
const totalsFor = (entries: Entry[]) => {
  const pet = entries.reduce((sum, entry) => sum + entry.pet, 0)
  const glass = entries.reduce((sum, entry) => sum + entry.glass, 0)
  return { pet, glass, total: pet + glass }
}
const anonymous: User = { id: '', name: 'Csapattag', firstName: 'Csapattag', email: '', color: 'neutral', isAdmin: false }
function useStoreValue(configured: boolean) {

  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [isLoading, setLoading] = useState(configured)
  const [error, setError] = useState<string | null>(null)
  const version = useRef(0)
  const activeRequests = useRef(0)
  const { data: session, isPending } = authClient.useSession()
  const authId = session?.user.id
  const refresh = useCallback(async () => {
    const request = ++version.current
    activeRequests.current++
    try {
      const result = unwrap(await actions.getSnapshot())
      if (request === version.current) {
        setSnapshot(result)
        setError(result === null && authId ? 'A munkamenet lejárt. Jelentkezz be Google-fiókkal.' : null)
      }
    } catch (err) {
      if (request === version.current) { setError(err instanceof Error ? err.message : "Az adatok betöltése nem sikerült.") }
    } finally {
      activeRequests.current--
      if (request === version.current) setLoading(false)
    }
  }, [authId])
  useEffect(() => {
    version.current++
    setSnapshot(null)
    setError(null)
    setLoading(configured)
  }, [authId, configured])
  useEffect(() => {
    if (!configured || isPending) return
    void refresh()
    const focus = () => {
      if (document.visibilityState === 'visible' && navigator.onLine && activeRequests.current === 0) void refresh()
    }
    const interval = authId ? window.setInterval(focus, 15000) : undefined
    window.addEventListener('focus', focus)
    window.addEventListener('online', focus)
    document.addEventListener('visibilitychange', focus)
    const counter = version
    return () => {
      counter.current++
      window.clearInterval(interval)
      window.removeEventListener('focus', focus)
      window.removeEventListener('online', focus)
      document.removeEventListener('visibilitychange', focus)
    }
  }, [authId, configured, isPending, refresh])
  const roleById = new Map(snapshot?.roles.map(role => [role.userId, role]))
  const team: User[] = (snapshot?.profiles ?? []).map((profile, index) => {
    const name = profile.nickname.trim() || profile.displayName || profile.email
    return { id: profile.id, name, firstName: name.split(/\s+/)[0], email: profile.email,
      color: index % 3 === 0 ? 'pet' : index % 3 === 1 ? 'glass' : 'neutral',
      isAdmin: roleById.get(profile.id)?.isAdmin ?? false,
      isMainAdmin: roleById.get(profile.id)?.isMainAdmin ?? false, photoUrl: profile.avatarUrl ?? undefined }
  }).sort((a, b) => {
    if (a.id === snapshot?.userId) return -1
    if (b.id === snapshot?.userId) return 1
    return a.name.localeCompare(b.name, 'hu')
  })
  const currentUser = team.find(user => user.id === snapshot?.userId) ?? anonymous
  const profile = snapshot?.profiles.find(user => user.id === snapshot.userId)
  const entries = snapshot?.entries ?? []
  const activeEntries = entries.filter(entry => !entry.returnEventId)
  return {
    entries, activeEntries, currentUser, team, returnEvents: snapshot?.returnEvents ?? [],
    isAuthenticated: Boolean(snapshot), isAdmin: Boolean(currentUser.isAdmin), isLoading,
    error: configured ? error : "A bejelentkezés még nincs beállítva.",
    refresh,
    nickname: profile?.nickname ?? '', theme: profile?.theme ?? 'light',
    totals: totalsFor(activeEntries), allTotals: totalsFor(entries),
    resolveUser: (id: string) => team.find(user => user.id === id) ?? { ...anonymous, id },
    signInWithGoogle: async () => {
      if (!configured) throw new Error("A bejelentkezés még nincs beállítva.")
      const result = await authClient.signIn.social({ provider: 'google', callbackURL: '/auth/callback', errorCallbackURL: '/?authError=callback' })
      if (result.error) throw new Error("A Google-belépés nem sikerült.")
    },
    signOut: async () => {
      const result = await authClient.signOut()
      if (result.error) throw new Error("A kijelentkezés nem sikerült.")
      version.current++; setSnapshot(null); setError(null)
    },
    addEntry: async (input: EntryInput, requestId: string) => { const entry = unwrap(await actions.addEntry(input, requestId)); await refresh(); return entry },
    updateEntry: async (id: string, input: EntryInput, expectedRevision: number) => { unwrap(await actions.updateEntry(id, input, expectedRevision)); await refresh() },
    deleteEntry: async (id: string) => { unwrap(await actions.deleteEntry(id)); await refresh() },
    setNickname: async (value: string) => { unwrap(await actions.setNickname(value)); await refresh() },
    setTheme: async (value: Theme) => {
      try { unwrap(await actions.setTheme(value)); await refresh() }
      catch { setError("A téma mentése nem sikerült.") }
    },
    grantAdmin: async (id: string) => { unwrap(await actions.grantAdmin(id)); await refresh() },
    revokeAdmin: async (id: string) => { unwrap(await actions.revokeAdmin(id)); await refresh() },
    markAllReturned: async () => { const result = unwrap(await actions.markAllReturned()); await refresh(); return result },
  }
}
const StoreContext = createContext<ReturnType<typeof useStoreValue> | null>(null)
export function StoreProvider({ children, configured }: { children: ReactNode; configured: boolean }) {
  const value = useStoreValue(configured)
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
export function useStore() {
  const value = useContext(StoreContext)
  if (!value) throw new Error('useStore must be used within StoreProvider')
  return value
}
