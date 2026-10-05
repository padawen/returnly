type ErrorDetails = {
  code?: unknown
}

function detailsOf(error: unknown): ErrorDetails {
  if (typeof error !== 'object' || error === null) return {}

  const value = error as ErrorDetails
  return {
    code: typeof value.code === 'string' ? value.code : undefined,
  }
}

/** Maps internal/Auth/DB failures to messages that are safe to show publicly. */
export function publicErrorMessage(
  error: unknown,
  fallback = 'A művelet nem sikerült. Próbáld újra később.',
): string {
  const { code } = detailsOf(error)

  switch (code) {
    case '42501':
      return 'Nincs jogosultságod ehhez a művelethez.'
    case '23505':
      return 'Ez az adat már létezik.'
    case '23503':
    case '23514':
    case '22P02':
      return 'A megadott adat nem érvényes.'
  }

  return fallback
}
