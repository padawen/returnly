import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-card-foreground">
          Az oldal nem található.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A keresett oldal nem létezik vagy már nem érhető el.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-12 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Vissza a kezdőlapra
        </Link>
      </div>
    </main>
  )
}
