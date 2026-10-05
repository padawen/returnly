'use client'
import { useState } from 'react'
import Image from 'next/image'
import { BrandMark } from '@/components/brand-mark'
import { publicErrorMessage } from '@/lib/errors'
export function LoginScreen({
  onLogin,
  sessionError,
}: {
  onLogin: () => Promise<void>
  sessionError?: string | null
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const handleLogin = async () => {
    setPending(true)
    setError(null)
    try {
      await onLogin()
    } catch (loginError) {
      setError(publicErrorMessage(loginError, 'A bejelentkezés nem sikerült.'))
      setPending(false)
    }
  }
  return (
    <div className="flex min-h-dvh flex-col bg-background px-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="relative mb-8">
          <div
            aria-hidden="true"
            className="absolute -inset-6 rounded-full bg-pet-soft blur-2xl"
          />
          <div className="relative overflow-hidden rounded-3xl shadow-lg shadow-primary/25">
            <Image
              src="/returnly-wine-icon-512.png"
              alt="Returnly logó"
              width={128}
              height={128}
              className="size-32"
            />
          </div>
        </div>

        <BrandMark className="justify-center text-lg" />
        <p className="mt-3 max-w-xs text-pretty leading-relaxed text-muted-foreground">
          Kövesd nyomon minden visszaváltott palackot és flakont, amit a csapatod feldolgoz – valós időben.
        </p>
      </div>

      <div className="pb-10">
        <button
          type="button"
          onClick={() => void handleLogin()}
          disabled={pending}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card text-base font-semibold text-foreground shadow-sm transition-all active:translate-y-px active:bg-secondary disabled:opacity-60"
        >
          <GoogleGlyph />
          {pending ? 'Átirányítás…' : 'Belépés Google-fiókkal'}
        </button>
        {(error || sessionError) && (
          <p role="alert" className="mt-3 text-center text-xs text-destructive">{error || sessionError}</p>
        )}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Csak csapattagoknak. Minden bejegyzés közös a csapaton belül.
        </p>
      </div>
    </div>
  )
}
function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.15-4.05 1.15-3.12 0-5.76-2.11-6.7-4.94H1.29v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6v-3.1H1.29a12 12 0 0 0 0 10.8l4.01-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.29 6.6l4.01 3.1C6.24 6.86 8.88 4.75 12 4.75Z"
      />
    </svg>
  )
}
