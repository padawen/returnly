import { cn } from '@/lib/utils'
import type { User } from '@/lib/data'

const COLOR_MAP: Record<string, string> = {
  pet: 'bg-pet-soft text-pet',
  glass: 'bg-glass-soft text-glass',
  neutral: 'bg-secondary text-secondary-foreground',
}

const SIZE_MAP = {
  sm: 'size-9 text-sm',
  md: 'size-11 text-base',
  lg: 'size-24 text-3xl',
} as const

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function UserAvatar({
  user,
  size = 'md',
  className,
}: {
  user: User
  size?: keyof typeof SIZE_MAP
  className?: string
}) {
  if (user.photoUrl) {
    return (
      <img
        src={user.photoUrl || '/placeholder.svg'}
        alt={`${user.name} profilképe`}
        className={cn(
          'shrink-0 rounded-full object-cover ring-1 ring-inset ring-black/5',
          SIZE_MAP[size],
          className,
        )}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-inset ring-black/5',
        COLOR_MAP[user.color] ?? COLOR_MAP.neutral,
        SIZE_MAP[size],
        className,
      )}
    >
      {initials(user.name)}
    </div>
  )
}
