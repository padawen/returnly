'use client'

import { useEffect } from 'react'
import { CircleCheck } from 'lucide-react'
import { formatNumber } from '@/lib/data'
import { cn } from '@/lib/utils'

export type ToastData = {
  id: number
  title: string
  pet: number
  glass: number
  total: number
}

export function SuccessToast({
  toast,
  onDismiss,
}: {
  toast: ToastData | null
  onDismiss: () => void
}) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, 3200)
    return () => clearTimeout(t)
  }, [toast, onDismiss])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'flex w-full max-w-md items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-xl shadow-black/10 transition-all duration-300',
          toast
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-6 opacity-0',
        )}
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-pet-soft text-pet">
          <CircleCheck className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-card-foreground">
            {toast?.title ?? 'Bejegyzés mentve'}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {formatNumber(toast?.pet ?? 0)} PET/ALU ·{' '}
            {formatNumber(toast?.glass ?? 0)} üveg ·{' '}
            <span className="font-medium text-foreground">
              {formatNumber(toast?.total ?? 0)} összesen
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
