'use client'

import { useEffect, useRef, useState } from 'react'
import type { Theme } from '@/lib/contracts'

type Choice = { userId: string; theme: Theme; request: number; settled: boolean }

export function useThemePreference({
  userId, savedTheme, save, refresh, onError,
}: {
  userId: string | undefined
  savedTheme: Theme
  save: (theme: Theme) => Promise<void>
  refresh: () => Promise<void>
  onError: () => void
}) {
  const [choice, setChoice] = useState<Choice | null>(null)
  const latest = useRef<Choice | null>(null)
  const confirmed = useRef<Theme | null>(null)
  const activeUser = useRef(userId)
  const queue = useRef(Promise.resolve())
  const sequence = useRef(0)
  const session = useRef(0)

  useEffect(() => {
    activeUser.current = userId
    const activeSession = ++session.current
    latest.current = null
    confirmed.current = null
    return () => { activeUser.current = undefined; session.current = activeSession + 1 }
  }, [userId])

  useEffect(() => {
    if (!choice || choice.userId !== userId) {
      confirmed.current = savedTheme
    } else if (choice.settled && choice.theme === savedTheme && latest.current?.request === choice.request) {
      confirmed.current = savedTheme
      latest.current = null
      setChoice(null)
    }
  }, [choice, savedTheme, userId])

  const toggleTheme = () => {
    if (!userId) return
    const activeSession = session.current
    const current = latest.current?.userId === userId ? latest.current.theme : savedTheme
    const next: Choice = {
      userId, theme: current === 'dark' ? 'light' : 'dark', request: ++sequence.current, settled: false,
    }
    confirmed.current ??= savedTheme
    latest.current = next
    setChoice(next)

    // Serialize writes so rapid clicks cannot persist in the wrong order.
    queue.current = queue.current.then(async () => {
      if (activeUser.current !== userId || session.current !== activeSession) return
      try {
        await save(next.theme)
      } catch {
        if (activeUser.current === userId && session.current === activeSession && latest.current?.request === next.request) {
          const rollback: Choice = { ...next, theme: confirmed.current ?? savedTheme, settled: true }
          latest.current = rollback
          setChoice(rollback)
          onError()
        }
        return
      }
      if (activeUser.current !== userId || session.current !== activeSession) return
      confirmed.current = next.theme
      if (latest.current?.request === next.request) {
        const settled = { ...next, settled: true }
        latest.current = settled
        setChoice(settled)
        await refresh()
      }
    }).catch(() => {
      if (activeUser.current === userId && session.current === activeSession) onError()
    })
  }

  return { theme: choice && choice.userId === userId ? choice.theme : savedTheme, toggleTheme }
}
