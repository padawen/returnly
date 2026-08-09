'use client'

import { useEffect, useState } from 'react'
import { entryTotal, type Entry } from '@/lib/data'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { StoreProvider, useStore } from '@/components/store'
import { LoginScreen } from '@/components/login-screen'
import { DashboardScreen } from '@/components/dashboard-screen'
import { ProfileScreen } from '@/components/profile-screen'
import { BottomNav, type Tab } from '@/components/bottom-nav'
import { EntryFormSheet, type SheetState } from '@/components/entry-form-sheet'
import { SuccessToast, type ToastData } from '@/components/success-toast'

export function ReturnlyApp() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  )
}

function AppInner() {
  const {
    addEntry,
    currentUser,
    isAuthenticated,
    isLoading,
    markAllReturned,
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

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const savedTheme = window.localStorage.getItem('returnly-theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setDarkMode(savedTheme ? savedTheme === 'dark' : prefersDark)
      return
    }

    setDarkMode(theme === 'dark')
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', darkMode)
    root.classList.toggle('light', !darkMode)
    window.localStorage.setItem('returnly-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={signInWithGoogle} />
  }

  const handleSave = async (input: { pet: number; glass: number }) => {
    const isEdit = sheet?.mode === 'edit'
    if (isEdit) {
      await updateEntry(sheet.entry.id, input)
    } else {
      await addEntry(input)
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

  return (
    <main className="min-h-dvh bg-background">
      {tab === 'home' && (
        <DashboardScreen
          onEdit={(entry: Entry) => setSheet({ mode: 'edit', entry })}
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
          onHome={() => setTab('home')}
        />
      )}

      <BottomNav
        active={tab}
        onNavigate={setTab}
        onAdd={() => setSheet({ mode: 'add' })}
      />

      <EntryFormSheet
        state={sheet}
        onClose={() => setSheet(null)}
        onSave={handleSave}
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
