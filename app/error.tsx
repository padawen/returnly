'use client'

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-card-foreground">
          Valami hiba történt.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Próbáld újra később, vagy töltsd újra az oldalt.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 h-12 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Újrapróbálás
        </button>
      </div>
    </main>
  )
}
