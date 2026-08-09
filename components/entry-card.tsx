'use client'

import { GlassWater, Milk, Pencil, Trash2 } from 'lucide-react'
import {
  entryTotal,
  formatEntryDateTime,
  formatNumber,
  type Entry,
} from '@/lib/data'
import { useStore } from '@/components/store'
import { UserAvatar } from '@/components/user-avatar'

export function EntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: Entry
  onEdit: (entry: Entry) => void
  onDelete?: (entry: Entry) => void
}) {
  const { resolveUser } = useStore()
  const user = resolveUser(entry.userId)
  const total = entryTotal(entry)

  return (
    <li className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <UserAvatar user={user} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-card-foreground">
            {user.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatEntryDateTime(entry.createdAt)}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-mono text-3xl font-bold tabular-nums leading-none text-foreground">
            {formatNumber(total)}
          </span>
          <span className="mt-1 text-xs font-medium text-muted-foreground">
            összesen · db
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat
          icon={<Milk className="size-4" />}
          label="PET / ALU"
          value={entry.pet}
          tone="pet"
        />
        <Stat
          icon={<GlassWater className="size-4" />}
          label="Törhető üveg"
          value={entry.glass}
          tone="glass"
        />
      </div>

      <div
        className={`mt-4 grid gap-2 ${onDelete ? 'grid-cols-2' : 'grid-cols-1'}`}
      >
        <button
          type="button"
          onClick={() => onEdit(entry)}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-secondary text-sm font-semibold text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground active:translate-y-px"
        >
          <Pencil className="size-4" />
          Szerkesztés
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(entry)}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/15 active:translate-y-px"
          >
            <Trash2 className="size-4" />
            Törlés
          </button>
        )}
      </div>
    </li>
  )
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: number
  tone: 'pet' | 'glass'
}) {
  const toneClass =
    tone === 'pet' ? 'bg-pet-soft text-pet' : 'bg-glass-soft text-glass'
  return (
    <div className={`rounded-2xl px-4 py-3 ${toneClass}`}>
      <div className="flex items-center gap-1.5 opacity-80">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="mt-1 block font-mono text-3xl font-bold tabular-nums">
        {formatNumber(value)}
      </span>
    </div>
  )
}
