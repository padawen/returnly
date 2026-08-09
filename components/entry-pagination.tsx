import { ChevronLeft, ChevronRight } from 'lucide-react'

export function EntryPagination({
  page,
  pageCount,
  onPrevious,
  onNext,
}: {
  page: number
  pageCount: number
  onPrevious: () => void
  onNext: () => void
}) {
  if (pageCount <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-card px-3 py-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={page === 1}
        aria-label="Előző oldal"
        className="flex size-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronLeft className="size-5" />
      </button>
      <span className="text-sm font-medium text-muted-foreground">
        {page}. / {pageCount}. oldal
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={page === pageCount}
        aria-label="Következő oldal"
        className="flex size-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  )
}
