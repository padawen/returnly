'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="hu">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#f7faf8',
          color: '#10231b',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <main style={{ maxWidth: 420, padding: 24, textAlign: 'center' }}>
          <h1>Váratlan hiba történt.</h1>
          <p>Próbáld újra később, vagy töltsd újra az oldalt.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 16,
              border: 0,
              borderRadius: 12,
              padding: '12px 20px',
              background: '#009f6b',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Újrapróbálás
          </button>
        </main>
      </body>
    </html>
  )
}
