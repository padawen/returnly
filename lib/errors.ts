type ErrorDetails = {
  code?: unknown
  message?: unknown
}

function detailsOf(error: unknown): ErrorDetails {
  if (typeof error !== 'object' || error === null) return {}

  const value = error as ErrorDetails
  return {
    code: typeof value.code === 'string' ? value.code : undefined,
    message: typeof value.message === 'string' ? value.message : undefined,
  }
}

/** Maps internal/Auth/DB failures to messages that are safe to show publicly. */
export function publicErrorMessage(
  error: unknown,
  fallback = 'A művelet nem sikerült. Próbáld újra később.',
): string {
  const { code, message } = detailsOf(error)

  switch (code) {
    case '42501':
      return 'Nincs jogosultságod ehhez a művelethez.'
    case '23505':
      return 'Ez az adat már létezik.'
    case '23503':
    case '23514':
    case '22P02':
      return 'A megadott adat nem érvényes.'
    case 'over_request_rate_limit':
      return 'Túl sok próbálkozás történt. Próbáld újra később.'
  }

  switch (message) {
    case 'not_admin':
      return 'Ezt a műveletet csak admin végezheti el.'
    case 'nothing_to_return':
      return 'Nincs visszavitelre váró készlet.'
  }

  return fallback
}
