import type { EntryInput, Theme } from '../contracts'

export class PublicError extends Error {}

export function validId(value: unknown): string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new PublicError('Érvénytelen azonosító.')
  }
  return value
}

export function validEntry(value: EntryInput): EntryInput {
  if (!value || !Number.isInteger(value.pet) || !Number.isInteger(value.glass) ||
      value.pet < 0 || value.glass < 0 || value.pet > 9999 || value.glass > 9999 ||
      value.pet + value.glass === 0) {
    throw new PublicError('Adj meg 1–9999 közötti darabszámot legalább egy kategóriában.')
  }
  return { pet: value.pet, glass: value.glass }
}

export function validNickname(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length > 24) {
    throw new PublicError('A becenév legfeljebb 24 karakter lehet.')
  }
  return value.trim()
}

export function validTheme(value: unknown): Theme {
  if (value !== 'light' && value !== 'dark') throw new PublicError('Érvénytelen téma.')
  return value
}
