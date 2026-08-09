'use client'

import { useEffect, useRef, useState } from 'react'
import { GlassWater, Milk, Minus, Plus, X } from 'lucide-react'
import {
  entryTotal,
  formatNumber,
  formatTime,
  type Entry,
} from '@/lib/data'
import { useStore } from '@/components/store'
import { UserAvatar } from '@/components/user-avatar'
import { cn } from '@/lib/utils'

export type SheetState =
  | { mode: 'add' }
  | { mode: 'edit'; entry: Entry }

export function EntryFormSheet({
  state,
  onClose,
  onSave,
}: {
  state: SheetState | null
  onClose: () => void
  onSave: (input: { pet: number; glass: number }) => void
}) {
  const { currentUser, resolveUser } = useStore()
  const [pet, setPet] = useState(0)
  const [glass, setGlass] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef<number | null>(null)
  const open = state !== null

  // Reset fields whenever the sheet opens
  useEffect(() => {
    if (!state) return
    if (state.mode === 'edit') {
      setPet(state.entry.pet)
      setGlass(state.entry.glass)
    } else {
      setPet(0)
      setGlass(0)
    }
  }, [state])

  useEffect(() => {
    if (open) return
    setDragOffset(0)
    setIsDragging(false)
    dragStartY.current = null
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const isEdit = state?.mode === 'edit'
  const creator = isEdit ? resolveUser(state.entry.userId) : currentUser
  const total = entryTotal({ pet, glass })

  const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!open) return
    dragStartY.current = event.clientY
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartY.current === null) return
    setDragOffset(Math.max(0, event.clientY - dragStartY.current))
  }

  const handleDragEnd = () => {
    if (dragStartY.current === null) return
    const shouldClose = dragOffset > 110
    dragStartY.current = null
    setIsDragging(false)
    if (shouldClose) {
      setDragOffset(0)
      onClose()
    } else {
      setDragOffset(0)
    }
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-40 flex items-end justify-center transition-opacity duration-200 sm:items-center',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Bezárás"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Bejegyzés szerkesztése' : 'Új bejegyzés'}
        className={cn(
          'relative w-full max-w-md rounded-t-3xl bg-card p-5 pb-8 shadow-2xl transition-transform duration-300 ease-out sm:rounded-3xl sm:pb-5',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
        style={{
          transform: open ? `translateY(${dragOffset}px)` : undefined,
          transition: isDragging ? 'none' : undefined,
        }}
      >
        <div
          aria-hidden="true"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          className="mx-auto mb-4 h-6 w-16 touch-none cursor-grab select-none rounded-full py-2 active:cursor-grabbing sm:hidden"
        />

        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-card-foreground">
              {isEdit ? 'Bejegyzés szerkesztése' : 'Új bejegyzés'}
            </h2>
            <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
              <UserAvatar user={creator} size="sm" className="size-6 text-xs" />
              <span>
                {isEdit ? (
                  <>
                    {creator.firstName} · {formatTime(state.entry.createdAt)}
                  </>
                ) : (
                  <>
                    {creator.firstName} ·{' '}
                    {formatTime(new Date().toISOString())}
                  </>
                )}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Bezárás"
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-3">
          <NumberField
            label="PET / ALU"
            icon={<Milk className="size-5" />}
            tone="pet"
            value={pet}
            onChange={setPet}
          />
          <NumberField
            label="Törhető üveg"
            icon={<GlassWater className="size-5" />}
            tone="glass"
            value={glass}
            onChange={setGlass}
          />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-secondary px-4 py-3">
          <span className="text-sm font-medium text-muted-foreground">
            Összesen
          </span>
          <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
            {formatNumber(total)}{' '}
            <span className="text-base font-medium text-muted-foreground">
              db
            </span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => onSave({ pet, glass })}
          className="mt-4 flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:translate-y-px active:scale-[0.99]"
        >
          {isEdit ? 'Módosítások mentése' : 'Bejegyzés mentése'}
        </button>
      </div>
    </div>
  )
}

function NumberField({
  label,
  icon,
  tone,
  value,
  onChange,
}: {
  label: string
  icon: React.ReactNode
  tone: 'pet' | 'glass'
  value: number
  onChange: (n: number) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const toneText = tone === 'pet' ? 'text-pet' : 'text-glass'
  const toneBg = tone === 'pet' ? 'bg-pet-soft' : 'bg-glass-soft'

  const clamp = (n: number) => Math.max(0, Math.min(9999, n))

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-lg',
            toneBg,
            toneText,
          )}
        >
          {icon}
        </span>
        <span className="font-semibold text-card-foreground">{label}</span>
      </div>

      <div className="flex items-center gap-3">
        <StepButton
          label={`${label} csökkentése`}
          onClick={() => onChange(clamp(value - 1))}
        >
          <Minus className="size-5" />
        </StepButton>

        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value === 0 ? '' : String(value)}
          placeholder="0"
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^0-9]/g, '')
            onChange(clamp(digits === '' ? 0 : Number.parseInt(digits, 10)))
          }}
          className={cn(
            'min-w-0 flex-1 rounded-xl py-2 text-center font-mono text-4xl font-bold tabular-nums outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground/40',
            toneBg,
            toneText,
          )}
          aria-label={`${label} darabszám`}
        />

        <StepButton
          label={`${label} növelése`}
          onClick={() => onChange(clamp(value + 1))}
        >
          <Plus className="size-5" />
        </StepButton>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[2, 4, 6].map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => onChange(clamp(value + amount))}
            className={cn(
              'h-9 rounded-xl text-sm font-semibold transition-colors active:translate-y-px',
              toneBg,
              toneText,
              'hover:brightness-95 dark:hover:brightness-110',
            )}
          >
            +{amount}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-secondary active:translate-y-px"
    >
      {children}
    </button>
  )
}
