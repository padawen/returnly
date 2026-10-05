import type { Entry } from './data'

export const COLLECTION_TIME_ZONE = 'Europe/Budapest'

const calendarDate = new Intl.DateTimeFormat('en-US', {
  timeZone: COLLECTION_TIME_ZONE,
  year: 'numeric', month: 'numeric', day: 'numeric',
})

function calendarDay(timestamp: number) {
  const parts = calendarDate.formatToParts(timestamp)
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value)
  return Date.UTC(value('year'), value('month') - 1, value('day')) / 86_400_000
}

export function returnStatistics(entries: Pick<Entry, 'createdAt'>[], total: number) {
  if (entries.length === 0) return null
  let first = Infinity
  let last = -Infinity
  for (const entry of entries) {
    const timestamp = Date.parse(entry.createdAt)
    if (!Number.isFinite(timestamp)) return null
    first = Math.min(first, timestamp)
    last = Math.max(last, timestamp)
  }
  // Inclusive calendar days, including days without entries; DST adds no extra day.
  const days = calendarDay(last) - calendarDay(first) + 1
  return {
    firstAt: new Date(first).toISOString(),
    lastAt: new Date(last).toISOString(),
    days,
    dailyAverage: total / days,
  }
}

export function formatCollectionDate(iso: string) {
  return new Date(iso).toLocaleDateString('hu-HU', {
    timeZone: COLLECTION_TIME_ZONE,
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
