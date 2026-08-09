'use client'

import { GlassWater, Milk } from 'lucide-react'
import { formatNumber } from '@/lib/data'

export function SummaryCard({
  pet,
  glass,
  total,
}: {
  pet: number
  glass: number
  total: number
}) {
  return (
    <section
      aria-label="Aktuális összesen"
      className="overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-xl shadow-primary/20"
    >
      <div className="flex items-center justify-between px-6 pt-6">
        <span className="text-sm font-medium text-primary-foreground/70">
          Összesen
        </span>
        <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium">
          Nyitott
        </span>
      </div>

      <div className="px-6 pb-6 pt-1">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-6xl font-bold tabular-nums tracking-tight">
            {formatNumber(total)}
          </span>
          <span className="text-lg font-medium text-primary-foreground/70">
            db
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-primary-foreground/15">
        <CategoryStat
          icon={<Milk className="size-4" />}
          label="PET / ALU"
          value={pet}
        />
        <CategoryStat
          icon={<GlassWater className="size-4" />}
          label="Törhető üveg"
          value={glass}
        />
      </div>
    </section>
  )
}

function CategoryStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="bg-primary px-6 py-4">
      <div className="flex items-center gap-1.5 text-primary-foreground/70">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-mono text-2xl font-semibold tabular-nums">
          {formatNumber(value)}
        </span>
        <span className="text-sm text-primary-foreground/60">db</span>
      </div>
    </div>
  )
}
