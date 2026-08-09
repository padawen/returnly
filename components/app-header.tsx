import { Moon, Sun } from 'lucide-react'
import type { User } from '@/lib/data'
import { BrandMark } from '@/components/brand-mark'
import { UserAvatar } from '@/components/user-avatar'

export function AppHeader({
  currentUser,
  darkMode,
  onHome,
  onProfile,
  onToggleDarkMode,
}: {
  currentUser: User
  darkMode: boolean
  onHome: () => void
  onProfile?: () => void
  onToggleDarkMode: () => void
}) {
  return (
    <header className="flex items-center justify-between">
      <button
        type="button"
        onClick={onHome}
        aria-label="Vissza a kezdőlapra"
        className="rounded-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-95"
      >
        <BrandMark iconOnly />
      </button>

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

        {onProfile ? (
          <button
            type="button"
            onClick={onProfile}
            aria-label="Profil megnyitása"
            className="rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-95"
          >
            <UserAvatar user={currentUser} />
          </button>
        ) : (
          <div className="rounded-full">
            <UserAvatar user={currentUser} />
          </div>
        )}
      </div>
    </header>
  )
}
