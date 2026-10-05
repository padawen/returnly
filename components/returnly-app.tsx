'use client'
import { useEffect, useRef, useState } from 'react'
import { entryTotal, type Entry } from '@/lib/data'
import { StoreProvider, useStore } from '@/components/store'
import { LoginScreen } from '@/components/login-screen'
import { DashboardScreen } from '@/components/dashboard-screen'
import { ProfileScreen } from '@/components/profile-screen'
import { BottomNav, type Tab } from '@/components/bottom-nav'
import { EntryFormSheet, type SheetState } from '@/components/entry-form-sheet'
import { SuccessToast, type ToastData } from '@/components/success-toast'
export function ReturnlyApp({ configured }: { configured: boolean }) {
  return (
    <StoreProvider configured={configured}>
      <AppInner />
    </StoreProvider>
  )
}
function AppInner() {
  const {
    addEntry,
    error,
    isAuthenticated,
    isLoading,
    markAllReturned,
    restoreReturn,
    refresh,
    signInWithGoogle,
    signOut,
    setTheme,
    theme,
    updateEntry,
  } = useStore()
  const [tab, setTab] = useState<Tab>('home')
  const [darkMode, setDarkMode] = useState(false)
  const [sheet, setSheet] = useState<SheetState | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)
  const savingEntry = useRef(false)
  useEffect(() => {
    setDarkMode(theme === 'dark')
  }, [theme])
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', darkMode)
    root.classList.toggle('light', !darkMode)
  }, [darkMode])
  if (isLoading) {
    return <LoadingScreen />
  }
  if (!isAuthenticated) {
    return <>
      <LoginScreen onLogin={signInWithGoogle} sessionError={error} />
      {error && <button type="button" onClick={() => void refresh()}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-primary px-4 py-3 text-primary-foreground">
        Újrapróbálás
      </button>}
    </>
  }
  const handleSave = async (input: { pet: number; glass: number }, requestId: string) => {
    if (entryTotal(input) === 0) return
    const isEdit = sheet?.mode === 'edit'
    if (isEdit) {
      await updateEntry(sheet.entry.id, input, sheet.entry.revision)
    } else {
      await addEntry(input, requestId)
    }
    setSheet(null)
    setToast({
      id: Date.now(),
      title: isEdit ? 'Módosítások mentve' : 'Bejegyzés mentve',
      pet: input.pet,
      glass: input.glass,
      total: entryTotal(input),
    })
  }
  const handleReturnAll = async () => {
    const summary = await markAllReturned()
    setToast({
      id: Date.now(),
      title: 'Visszavitel rögzítve',
      pet: summary.pet,
      glass: summary.glass,
      total: summary.total,
    })
  }
  const handleRestoreReturn = async (eventId: string) => {
    const summary = await restoreReturn(eventId)
    setToast({
      id: Date.now(),
      title: 'Készlet visszaállítva',
      pet: summary.pet,
      glass: summary.glass,
      total: summary.total,
    })
  }
  return (
    <main className="min-h-dvh bg-background">
      <div inert={sheet !== null}>
      {error && <div role="alert" className="flex items-center justify-between gap-3 p-3 text-destructive">
        <p>{error}</p>
        <button type="button" onClick={() => void refresh()} className="shrink-0 rounded-xl border border-current px-3 py-2">Újrapróbálás</button>
      </div>}
      {tab === 'home' && (
        <DashboardScreen
          onEdit={(entry: Entry) => { if (!savingEntry.current) setSheet({ mode: 'edit', entry }) }}
          onProfile={() => setTab('profile')}
          onHome={() => setTab('home')}
          darkMode={darkMode}
          onToggleDarkMode={() => {
            void setTheme(darkMode ? 'light' : 'dark')
          }}
        />
      )}
      {tab === 'profile' && (
        <ProfileScreen
          onLogout={signOut}
          onMarkReturned={handleReturnAll}
          onRestoreReturn={handleRestoreReturn}
          onHome={() => setTab('home')}
          darkMode={darkMode}
          onToggleDarkMode={() => {
            void setTheme(darkMode ? 'light' : 'dark')
          }}
        />
      )}

      <BottomNav
        active={tab}
        onNavigate={(nextTab) => { if (!savingEntry.current) setTab(nextTab) }}
        onAdd={() => { if (!savingEntry.current) setSheet({ mode: 'add' }) }}
      />
      </div>

      <EntryFormSheet
        state={sheet}
        onClose={() => { if (!savingEntry.current) setSheet(null) }}
        onSave={handleSave}
        onReload={(entry) => setSheet({ mode: 'edit', entry })}
        onSavingChange={(saving) => { savingEntry.current = saving }}
      />

      <SuccessToast toast={toast} onDismiss={() => setToast(null)} />
    </main>
  )
}
function LoadingScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <p className="text-sm text-muted-foreground">Returnly betöltése…</p>
    </div>
  )
}
