'use client'

import { Plus } from 'lucide-react'
import { formatFullDate, type Entry } from '@/lib/data'
import { useStore } from '@/components/store'
import { UserAvatar } from '@/components/user-avatar'
import { SummaryCard } from '@/components/summary-card'
import { EntryCard } from '@/components/entry-card'

export function DashboardScreen({
  onAdd,
  onEdit,
}: {
  onAdd: () => void
  onEdit: (entry: Entry) => void
}) {
  const { activeEntries, currentUser, totals } = useStore()

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
        <UserAvatar user={currentUser} />
      </header>

      <div className="mt-6">
        <SummaryCard pet={totals.pet} glass={totals.glass} total={totals.total} />
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:translate-y-px active:scale-[0.99]"
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
            {activeEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onEdit={onEdit} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
