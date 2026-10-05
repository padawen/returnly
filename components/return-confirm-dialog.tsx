'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, LoaderCircle, RotateCcw, ShieldCheck, X } from 'lucide-react'
import { formatEntryDateTime, formatNumber } from '@/lib/data'
import { BottleBreakdown } from '@/components/bottle-breakdown'

export function ReturnConfirmDialog({
  totals,
  pending,
  error,
  onClose,
  onConfirm,
  returnedAt,
}: {
  totals: { pet: number; glass: number; total: number }
  pending: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => void
  returnedAt?: string
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const restoring = returnedAt !== undefined
  const [finalConfirmation, setFinalConfirmation] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    dialog?.querySelector<HTMLButtonElement>('[data-cancel]')?.focus()
    return () => dialog?.close()
  }, [finalConfirmation])

  const focusStyle = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card'

  return (
    <dialog
      key={finalConfirmation ? 'final' : 'review'}
      ref={dialogRef}
      aria-labelledby="return-confirm-title"
      aria-describedby="return-confirm-description"
      onCancel={(event) => { event.preventDefault(); if (!pending) onClose() }}
      onClick={(event) => {
        if (event.target !== event.currentTarget || pending) return
        const bounds = event.currentTarget.getBoundingClientRect()
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div aria-hidden="true" className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {finalConfirmation ? <ShieldCheck className="size-5" /> : restoring ? <RotateCcw className="size-5" /> : <Check className="size-5" strokeWidth={2.5} />}
        </div>
        {restoring && <time dateTime={returnedAt} className="mr-auto text-xs font-medium text-muted-foreground">{formatEntryDateTime(returnedAt)}</time>}
        <button type="button" onClick={onClose} disabled={pending} aria-label="Bezárás"
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50 ${focusStyle}`}>
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <h2 id="return-confirm-title" className="mt-4 text-[22px] font-bold leading-tight tracking-tight sm:text-2xl">
        {finalConfirmation ? 'Biztosan visszaállítod?' : restoring ? 'Visszaállítod a készletet?' : 'Biztosan visszavitték?'}
      </h2>
      <p id="return-confirm-description" className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {finalConfirmation
          ? `Az „Igen, visszaállítom” gombbal ${formatNumber(totals.total)} db visszakerül a készletbe, és ez a visszavitel eltűnik az előzményekből.`
          : restoring
          ? 'A tételek visszakerülnek a készletbe, és újra szerkeszthetők. Ez a visszavitel eltűnik az előzményekből.'
          : 'A készlet lezárul, új gyűjtés indul. A bejegyzések és az előzmények megmaradnak.'}
      </p>

      <div className="mt-5 rounded-2xl border border-border bg-secondary/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="text-sm font-medium text-muted-foreground">{restoring ? 'Készletbe kerül' : 'Összesen'}</span>
          <p className="flex items-baseline gap-1.5 font-mono text-3xl font-bold tabular-nums tracking-tight">
            {formatNumber(totals.total)}
            <span className="font-sans text-sm font-medium text-muted-foreground">db</span>
          </p>
        </div>
      </div>

      {!finalConfirmation && <div className="mt-3">
        <BottleBreakdown pet={totals.pet} glass={totals.glass} />
      </div>}

      {error && <p role="alert" className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>}

      <div className={`mt-5 grid gap-2.5 ${finalConfirmation ? 'grid-cols-1' : 'grid-cols-[1fr_1.4fr]'}`}>
        <button type="button" data-cancel autoFocus onClick={onClose} disabled={pending}
          className={`h-12 rounded-xl border border-border px-3 text-sm font-semibold transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50 ${focusStyle}`}>
          Mégse
        </button>
        <button type="button" onClick={() => {
          if (pending || totals.total === 0) return
          if (restoring && !finalConfirmation) setFinalConfirmation(true)
          else onConfirm()
        }} disabled={pending || totals.total === 0}
          className={`flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 ${focusStyle}`}>
          {pending ? <LoaderCircle className="size-4 shrink-0 motion-safe:animate-spin" aria-hidden="true" /> : restoring ? <RotateCcw className="size-4 shrink-0" aria-hidden="true" /> : <Check className="size-4 shrink-0" aria-hidden="true" />}
          {pending ? (restoring ? 'Visszaállítás…' : 'Rögzítés…') : (finalConfirmation ? 'Igen, visszaállítom' : restoring ? 'Visszaállítás' : 'Visszavitték')}
        </button>
      </div>
    </dialog>
  )
}
