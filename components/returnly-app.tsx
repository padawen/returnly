'use client'

import { useState } from 'react'
import { entryTotal, type Entry } from '@/lib/data'
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
    updateEntry,
  } = useStore()
  const [tab, setTab] = useState<Tab>('home')
  const [sheet, setSheet] = useState<SheetState | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)

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
          onAdd={() => setSheet({ mode: 'add' })}
          onEdit={(entry: Entry) => setSheet({ mode: 'edit', entry })}
        />
      )}
      {tab === 'profile' && (
        <ProfileScreen
          onLogout={signOut}
          onMarkReturned={handleReturnAll}
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
