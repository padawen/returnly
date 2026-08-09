'use client'

import { House, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Tab = 'home' | 'profile'

export function BottomNav({
  active,
  onNavigate,
  onAdd,
}: {
  active: Tab
  onNavigate: (tab: Tab) => void
  onAdd: () => void
}) {
  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center"
    >
      <div className="pointer-events-auto mb-4 flex w-[min(100%-2rem,26rem)] items-center justify-between rounded-full border border-border bg-card/90 px-3 py-2 shadow-xl shadow-black/5 backdrop-blur-md">
        <NavButton
          label="Kezdőlap"
          active={active === 'home'}
          onClick={() => onNavigate('home')}
        >
          <House className="size-5.5" />
        </NavButton>

        <button
          type="button"
          onClick={onAdd}
          aria-label="Új bejegyzés"
          className="flex size-14 -translate-y-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background transition-transform active:scale-95"
        >
          <Plus className="size-7" strokeWidth={2.5} />
        </button>

        <NavButton
          label="Profil"
          active={active === 'profile'}
          onClick={() => onNavigate('profile')}
        >
          <User className="size-5.5" />
        </NavButton>
      </div>
    </nav>
  )
}

function NavButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-14 w-20 flex-col items-center justify-center gap-1 rounded-full text-xs font-medium transition-colors',
        active ? 'text-primary' : 'text-muted-foreground',
      )}
    >
      {children}
      {label}
    </button>
  )
}
