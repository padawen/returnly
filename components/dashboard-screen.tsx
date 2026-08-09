'use client'

import { useEffect, useState } from 'react'
import {
  formatFullDate,
  type Entry,
} from '@/lib/data'
import { useStore } from '@/components/store'
import { SummaryCard } from '@/components/summary-card'
import { EntryCard } from '@/components/entry-card'
import { AppHeader } from '@/components/app-header'
import { EntryPagination } from '@/components/entry-pagination'
import { DeleteEntryDialog } from '@/components/delete-entry-dialog'
import { publicErrorMessage } from '@/lib/errors'

const ENTRIES_PER_PAGE = 5

export function DashboardScreen({
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
  const {
    activeEntries,
    currentUser,
    deleteEntry,
    isAdmin,
    resolveUser,
    totals,
  } = useStore()
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
        publicErrorMessage(error, 'A bejegyzés törlése nem sikerült.'),
      )
    } finally {
      setDeletePending(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-32 pt-10">
      <AppHeader
        currentUser={currentUser}
        darkMode={darkMode}
        onHome={onHome}
        onProfile={onProfile}
        onToggleDarkMode={onToggleDarkMode}
      />
      <div className="mt-6">
        <div>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
            Szia, {currentUser.firstName}!
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {formatFullDate()}
          </p>
        </div>
      </div>

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

        <EntryPagination
          page={page}
          pageCount={pageCount}
          onPrevious={() => setPage((currentPage) => currentPage - 1)}
          onNext={() => setPage((currentPage) => currentPage + 1)}
        />
      </section>

      {deleteTarget && (
        <DeleteEntryDialog
          entry={deleteTarget}
          user={resolveUser(deleteTarget.userId)}
          error={deleteError}
          pending={deletePending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </div>
  )
}
