'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Moon, Sun, Trash2, X } from 'lucide-react'
import {
  entryTotal,
  formatEntryDateTime,
  formatFullDate,
  formatNumber,
  type Entry,
} from '@/lib/data'
import { useStore } from '@/components/store'
import { UserAvatar } from '@/components/user-avatar'
import { SummaryCard } from '@/components/summary-card'
import { EntryCard } from '@/components/entry-card'
import { BrandMark } from '@/components/brand-mark'

const ENTRIES_PER_PAGE = 5

export function DashboardScreen({
  onAdd,
  onEdit,
  onProfile,
  onHome,
  darkMode,
  onToggleDarkMode,
}: {
  onEdit: (entry: Entry) => void
  onProfile: () => void
  onHome: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
}) {
  const { activeEntries, currentUser, deleteEntry, isAdmin, totals } = useStore()
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Entry | null>(null)
  const [deletePending, setDeletePending] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const pageCount = Math.max(
    1,
    Math.ceil(activeEntries.length / ENTRIES_PER_PAGE),
  )

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, pageCount))
  }, [pageCount])

  const visibleEntries = activeEntries.slice(
    (page - 1) * ENTRIES_PER_PAGE,
    page * ENTRIES_PER_PAGE,
  )

  const handleDelete = (entry: Entry) => {
    setDeleteError(null)
    setDeleteTarget(entry)
  }

  const confirmDelete = async () => {
    if (!deleteTarget || deletePending) return
    setDeletePending(true)
    try {
      await deleteEntry(deleteTarget.id)
      setDeleteTarget(null)
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : 'A bejegyzés törlése nem sikerült.',
      )
    } finally {
      setDeletePending(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-32 pt-10">
      <button
        type="button"
        onClick={onHome}
        aria-label="Vissza a kezdőlapra"
        className="mb-8 block rounded-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-95"
      >
        <BrandMark iconOnly />
      </button>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
            Szia, {currentUser.firstName}!
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {formatFullDate()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Világos mód' : 'Sötét mód'}
            title={darkMode ? 'Világos mód' : 'Sötét mód'}
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {darkMode ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
          </button>
          <button
            type="button"
            onClick={onProfile}
            aria-label="Profil megnyitása"
            className="rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-95"
          >
            <UserAvatar user={currentUser} />
          </button>
        </div>
      </header>

      <div className="mt-6">
        <SummaryCard pet={totals.pet} glass={totals.glass} total={totals.total} />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Aktuális bejegyzések
          </h2>
          <span className="text-sm text-muted-foreground">
            {activeEntries.length} db
          </span>
        </div>

        {activeEntries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-10 text-center text-sm text-muted-foreground">
            Jelenleg nincs nyitott bejegyzés. Koppints az „Új bejegyzés”
            gombra az elsőhöz.
          </p>
        ) : (
          <ul className="grid gap-4">
            {visibleEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={onEdit}
                onDelete={isAdmin ? handleDelete : undefined}
              />
            ))}
          </ul>
        )}

        {pageCount > 1 && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-card px-3 py-2">
            <button
              type="button"
              onClick={() => setPage((currentPage) => currentPage - 1)}
              disabled={page === 1}
              aria-label="Előző oldal"
              className="flex size-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="size-5" />
            </button>
            <span className="text-sm font-medium text-muted-foreground">
              {page}. / {pageCount}. oldal
            </span>
            <button
              type="button"
              onClick={() => setPage((currentPage) => currentPage + 1)}
              disabled={page === pageCount}
              aria-label="Következő oldal"
              className="flex size-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        )}
      </section>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 sm:items-center sm:pb-0">
          <button
            type="button"
            aria-label="Bezárás"
            onClick={() => setDeleteTarget(null)}
            className="absolute inset-0 bg-foreground/45 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-entry-title"
            className="relative w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deletePending}
              aria-label="Bezárás"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <X className="size-5" />
            </button>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <Trash2 className="size-6" />
            </div>
            <h2
              id="delete-entry-title"
              className="mt-5 text-2xl font-bold tracking-tight text-card-foreground"
            >
              Bejegyzés törlése?
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Ez a bejegyzés végleg törlődik, és az összesítőből is kikerül. A
              művelet nem vonható vissza.
            </p>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-secondary px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-secondary-foreground">
                  {formatEntryDateTime(deleteTarget.createdAt)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PET/ALU {formatNumber(deleteTarget.pet)} · üveg{' '}
                  {formatNumber(deleteTarget.glass)}
                </p>
              </div>
              <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                {formatNumber(entryTotal(deleteTarget))} db
              </span>
            </div>

            {deleteError && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
              >
                {deleteError}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deletePending}
                className="h-12 rounded-xl border border-border bg-secondary px-4 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-50"
              >
                Mégse
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deletePending}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-semibold text-destructive-foreground shadow-lg shadow-destructive/20 transition-colors hover:bg-destructive/90 disabled:opacity-50"
              >
                <Trash2 className="size-4" />
                {deletePending ? 'Törlés…' : 'Törlés'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
