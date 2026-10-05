import { GlassWater, Milk } from 'lucide-react'
import { formatNumber } from '@/lib/data'

export function BottleBreakdown({ pet, glass }: { pet: number; glass: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {([
        { label: 'PET / ALU', value: pet, Icon: Milk, tone: 'bg-pet-soft text-pet' },
        { label: 'Törhető üveg', value: glass, Icon: GlassWater, tone: 'bg-glass-soft text-glass' },
      ] as const).map(({ label, value, Icon, tone }) => (
        <div key={label} className={`min-w-0 rounded-2xl px-3 py-3 sm:px-4 ${tone}`}>
          <div className="flex items-center gap-1.5 opacity-80">
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap text-xs font-medium">{label}</span>
          </div>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 font-mono text-2xl font-bold tabular-nums sm:text-3xl">
            {formatNumber(value)} <span className="font-sans text-xs font-medium opacity-70">db</span>
          </p>
        </div>
      ))}
    </div>
  )
}
