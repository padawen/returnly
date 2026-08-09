'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { formatFullDate, type Entry } from '@/lib/data'
import { useStore } from '@/components/store'
import { UserAvatar } from '@/components/user-avatar'
import { SummaryCard } from '@/components/summary-card'
import { EntryCard } from '@/components/entry-card'

const ENTRIES_PER_PAGE = 5

export function DashboardScreen({
  onAdd,
  onEdit,
  onProfile,
}: {
  onAdd: () => void
  onEdit: (entry: Entry) => void
  onProfile: () => void
}) {
  const { activeEntries, currentUser, totals } = useStore()
  const [page, setPage] = useState(1)
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

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-32 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium capitalize text-muted-foreground">
            {formatFullDate()}
          </p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
            Szia, {currentUser.firstName}!
          </h1>
        </div>
        <button
          type="button"
          onClick={onProfile}
          aria-label="Profil megnyitása"
          className="rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-95"
        >
          <UserAvatar user={currentUser} />
        </button>
      </header>

      <div className="mt-6">
        <SummaryCard pet={totals.pet} glass={totals.glass} total={totals.total} />
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary/90 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/80 active:translate-y-px active:scale-[0.99]"
      >
        <Plus className="size-5" strokeWidth={2.5} />
        Új bejegyzés
      </button>

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
              <EntryCard key={entry.id} entry={entry} onEdit={onEdit} />
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
    </div>
  )
}
