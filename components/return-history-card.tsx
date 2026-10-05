import { RotateCcw } from 'lucide-react'
import { formatEntryDateTime, formatNumber, type Entry, type User } from '@/lib/data'
import type { ReturnEvent } from '@/lib/contracts'
import { UserAvatar } from '@/components/user-avatar'
import { BottleBreakdown } from '@/components/bottle-breakdown'
import { formatCollectionDate, returnStatistics } from '@/lib/return-statistics'

export function ReturnHistoryCard({
  event,
  entries,
  user,
  pending,
  onRestore,
}: {
  event: ReturnEvent
  entries: Entry[]
  user: User
  pending: boolean
  onRestore?: () => void
}) {
  const period = returnStatistics(entries, event.total)
  return (
    <li className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3">
        <UserAvatar user={user} size="sm" />
        <div className="min-w-0 flex-1">
          <time dateTime={event.returnedAt} className="text-sm font-semibold text-card-foreground">
            {formatEntryDateTime(event.returnedAt)}
          </time>
          <p className="mt-1 truncate text-xs text-muted-foreground" title={`Rögzítette: ${user.name}`}>
            Rögzítette: {user.name}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-2xl font-bold leading-none tabular-nums text-foreground sm:text-3xl">
            {formatNumber(event.total)}
          </p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">összesen · db</p>
        </div>
      </div>

      <div className="mt-4">
        <BottleBreakdown pet={event.pet} glass={event.glass} />
      </div>

      {period ? (
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-4 rounded-2xl border border-border bg-secondary/50 p-3 sm:p-4">
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Első bejegyzés</dt>
            <dd className="mt-1 text-sm font-semibold text-card-foreground">
              <time dateTime={period.firstAt}>{formatCollectionDate(period.firstAt)}</time>
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Utolsó bejegyzés</dt>
            <dd className="mt-1 text-sm font-semibold text-card-foreground">
              <time dateTime={period.lastAt}>{formatCollectionDate(period.lastAt)}</time>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Időszak</dt>
            <dd className="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-card-foreground">
              <span className="font-mono text-xl font-bold tabular-nums">{formatNumber(period.days)}</span>
              <span className="text-xs font-medium text-muted-foreground">nap</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Napi átlag</dt>
            <dd className="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-card-foreground">
              <span className="font-mono text-xl font-bold tabular-nums">{period.dailyAverage.toLocaleString('hu-HU', { maximumFractionDigits: 1 })}</span>
              <span className="text-xs font-medium text-muted-foreground">db / nap</span>
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">Az időszak adatai nem érhetők el.</p>
      )}

      {onRestore && (
        <button type="button" onClick={onRestore} disabled={pending}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary text-sm font-semibold text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-50">
          <RotateCcw className="size-4" aria-hidden="true" />
          Visszaállítás
        </button>
      )}
    </li>
  )
}
