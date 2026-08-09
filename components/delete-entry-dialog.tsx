import { Trash2, X } from 'lucide-react'
import { entryTotal, formatEntryDateTime, formatNumber, type Entry, type User } from '@/lib/data'
import { UserAvatar } from '@/components/user-avatar'

export function DeleteEntryDialog({
  entry,
  user,
  error,
  pending,
  onClose,
  onConfirm,
}: {
  entry: Entry
  user: User
  error: string | null
  pending: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Bezárás"
        onClick={onClose}
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
          onClick={onClose}
          disabled={pending}
          aria-label="Bezárás"
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50"
        >
          <X className="size-5" />
        </button>

        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <Trash2 className="size-6" />
        </div>
        <h2 id="delete-entry-title" className="mt-5 text-2xl font-bold tracking-tight text-card-foreground">
          Bejegyzés törlése?
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Ez a bejegyzés végleg törlődik, és az összesítőből is kikerül. A művelet nem vonható vissza.
        </p>

        <div className="mt-5 rounded-2xl bg-secondary p-4">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-secondary-foreground">
                {user.name} bejegyzése
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatEntryDateTime(entry.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
                {formatNumber(entryTotal(entry))}
              </p>
              <p className="text-[11px] font-medium text-muted-foreground">összesen · db</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-pet-soft px-3 py-2 text-pet">
              <p className="text-xs font-medium">PET / ALU</p>
              <p className="mt-0.5 font-mono text-xl font-bold tabular-nums">{formatNumber(entry.pet)} db</p>
            </div>
            <div className="rounded-xl bg-glass-soft px-3 py-2 text-glass">
              <p className="text-xs font-medium">Üveg</p>
              <p className="mt-0.5 font-mono text-xl font-bold tabular-nums">{formatNumber(entry.glass)} db</p>
            </div>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="h-12 rounded-xl border border-border bg-secondary px-4 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            Mégse
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-semibold text-destructive-foreground shadow-lg shadow-destructive/20 transition-colors hover:bg-destructive/90 disabled:opacity-50"
          >
            <Trash2 className="size-4" />
            {pending ? 'Törlés…' : 'Törlés'}
          </button>
        </div>
      </div>
    </div>
  )
}
