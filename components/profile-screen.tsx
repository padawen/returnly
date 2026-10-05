'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Check,
  LogOut,
  RotateCcw,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import { entryTotal, formatNumber } from '@/lib/data'
import { useStore } from '@/components/store'
import { UserAvatar } from '@/components/user-avatar'
import { AppHeader } from '@/components/app-header'
import { publicErrorMessage } from '@/lib/errors'
import type { ReturnEvent } from '@/lib/contracts'
import { ReturnConfirmDialog } from '@/components/return-confirm-dialog'
import { ReturnHistoryCard } from '@/components/return-history-card'
import { EntryPagination } from '@/components/entry-pagination'

const RETURNS_PER_PAGE = 2

export function ProfileScreen({
  onLogout,
  onMarkReturned,
  onRestoreReturn,
  onHome,
  darkMode,
  onToggleDarkMode,
}: {
  onLogout: () => Promise<void>
  onMarkReturned: () => Promise<void>
  onRestoreReturn: (eventId: string) => Promise<void>
  onHome: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
}) {
  const {
    allTotals,
    currentUser,
    entries,
    returnEvents,
    resolveUser,
    grantAdmin,
    revokeAdmin,
    isAdmin,
    nickname,
    setNickname,
    team,
    totals,
  } = useStore()
  const [draft, setDraft] = useState(nickname)
  const [justSaved, setJustSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [returning, setReturning] = useState(false)
  const [confirmReturnOpen, setConfirmReturnOpen] = useState(false)
  const [returnError, setReturnError] = useState<string | null>(null)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [promotingId, setPromotingId] = useState<string | null>(null)
  const isMainAdmin = isAdmin && currentUser.isMainAdmin
  const [logoutPending, setLogoutPending] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const [historyPage, setHistoryPage] = useState(1)
  const [restoreEvent, setRestoreEvent] = useState<ReturnEvent | null>(null)
  const [restoring, setRestoring] = useState(false)
  const [restoreError, setRestoreError] = useState<string | null>(null)
  const restoringRef = useRef(false)
  const historyPageCount = Math.max(1, Math.ceil(returnEvents.length / RETURNS_PER_PAGE))
  const currentHistoryPage = Math.min(historyPage, historyPageCount)
  const visibleReturns = returnEvents.slice(
    (currentHistoryPage - 1) * RETURNS_PER_PAGE,
    currentHistoryPage * RETURNS_PER_PAGE,
  )

  useEffect(() => {
    setHistoryPage(page => Math.min(page, historyPageCount))
  }, [historyPageCount])

  const confirmRestore = async () => {
    if (!restoreEvent || restoringRef.current) return
    restoringRef.current = true
    setRestoring(true)
    setRestoreError(null)
    try {
      await onRestoreReturn(restoreEvent.id)
      setRestoreEvent(null)
    } catch (error) {
      setRestoreError(publicErrorMessage(error, 'A visszaállítás nem sikerült.'))
    } finally {
      restoringRef.current = false
      setRestoring(false)
    }
  }

  const myEntries = entries.filter((entry) => entry.userId === currentUser.id)
  const myTotal = myEntries.reduce((sum, entry) => sum + entryTotal(entry), 0)
  const dirty = draft.trim() !== nickname.trim()

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      await setNickname(draft)
      setJustSaved(true)
      window.setTimeout(() => setJustSaved(false), 1600)
    } catch (error) {
      setSaveError(publicErrorMessage(error, 'A becenév mentése nem sikerült.'))
    } finally {
      setSaving(false)
    }
  }

  const handleReturn = async () => {
    if (totals.total === 0 || returning) return
    setReturnError(null)
    setConfirmReturnOpen(true)
  }

  const confirmReturn = async () => {
    if (totals.total === 0 || returning) return
    setReturning(true)
    setReturnError(null)
    try {
      await onMarkReturned()
      setConfirmReturnOpen(false)
    } catch (error) {
      setReturnError(
        publicErrorMessage(error, 'A visszavitel rögzítése nem sikerült.'),
      )
    } finally {
      setReturning(false)
    }
  }

  const handleGrantAdmin = async (userId: string) => {
    setPromotingId(userId)
    setAdminError(null)
    try {
      await grantAdmin(userId)
    } catch (error) {
      setAdminError(publicErrorMessage(error, 'Az adminjog megadása nem sikerült.'))
    } finally {
      setPromotingId(null)
    }
  }

  const handleRevokeAdmin = async (userId: string, name: string) => {
    if (promotingId || !window.confirm(`Elveszed ${name} adminjogát?`)) return
    setPromotingId(userId)
    setAdminError(null)
    try { await revokeAdmin(userId) }
    catch { setAdminError('Az adminjog elvétele nem sikerült.') }
    finally { setPromotingId(null) }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-32 pt-10">
      <div className="mb-8">
        <AppHeader
          currentUser={currentUser}
          darkMode={darkMode}
          onHome={onHome}
          onToggleDarkMode={onToggleDarkMode}
        />
      </div>
      <header className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {currentUser.name}
        </h1>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
          {currentUser.email}
        </p>
      </header>

      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
        <label
          htmlFor="nickname"
          className="text-sm font-semibold text-card-foreground"
        >
          Becenév
        </label>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Ez a név jelenik meg a bejegyzéseknél a teljes Google-fiók neved
          helyett.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            id="nickname"
            type="text"
            value={draft}
            maxLength={24}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={currentUser.firstName}
            className="min-w-0 flex-1 rounded-xl border border-border bg-secondary px-4 py-3 text-base font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground/50"
          />
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={(!dirty && !justSaved) || saving}
            className="flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition-all active:translate-y-px disabled:opacity-40"
          >
            {justSaved ? <Check className="size-4.5" /> : null}
            {justSaved ? 'Mentve' : saving ? 'Mentés…' : 'Mentés'}
          </button>
        </div>
        {saveError && (
          <p role="alert" className="mt-3 text-sm font-medium text-destructive">
            {saveError}
          </p>
        )}
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard label="Összes bejegyzéseim" value={myEntries.length} />
        <StatCard label="Összes darabszámom" value={myTotal} />
      </div>

      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-card-foreground">
              Jelenlegi készlet
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              A lezárás új ciklust indít, a bejegyzések és az előzmények nem
              törlődnek.
            </p>
          </div>
          <span className="shrink-0 whitespace-nowrap font-mono text-2xl font-bold tabular-nums text-foreground">
            {formatNumber(totals.total)} db
          </span>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => void handleReturn()}
            disabled={totals.total === 0 || returning || restoring}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="size-4" />
            {returning ? 'Rögzítés…' : 'Visszavitték'}
          </button>
        )}
      </section>

      <section className="mt-8" aria-labelledby="return-history-title">
        <h2 id="return-history-title" className="mb-3 text-lg font-semibold text-foreground">Visszaviteli előzmények</h2>
        {returnEvents.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
            Még nem történt visszavitel. Az első lezárás után itt látod az előzményeket.
          </p>
        ) : (
          <ol className="space-y-3">
            {visibleReturns.map(event => (
              <ReturnHistoryCard
                key={event.id}
                event={event}
                entries={entries.filter(entry => entry.returnEventId === event.id)}
                user={resolveUser(event.performedBy)}
                pending={returning || restoring}
                onRestore={isAdmin ? () => { setRestoreError(null); setRestoreEvent(event) } : undefined}
              />
            ))}
          </ol>
        )}
        <EntryPagination
          page={currentHistoryPage}
          pageCount={historyPageCount}
          onPrevious={() => setHistoryPage(currentHistoryPage - 1)}
          onNext={() => setHistoryPage(currentHistoryPage + 1)}
        />
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Csapat</h2>
        </div>
        {adminError && (
          <p
            role="alert"
            className="mb-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
          >
            {adminError}
          </p>
        )}
        <ul className="overflow-hidden rounded-2xl border border-border bg-card">
          {team.map((member, index) => (
            <li
              key={member.id}
              className={`flex items-center gap-3 px-4 py-3 ${
                index !== 0 ? 'border-t border-border' : ''
              }`}
            >
              <UserAvatar user={member} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-medium text-card-foreground">
                  <span className="truncate">{member.name}</span>
                  {member.isAdmin && (
                    <span className="inline-flex shrink-0 text-pet"
                      title={member.isMainAdmin ? 'Főadmin' : 'Admin'}>
                      <ShieldCheck className="size-3.5" aria-hidden="true" />
                      <span className="sr-only">{member.isMainAdmin ? 'Főadmin' : 'Admin'}</span>
                    </span>
                  )}
                  {member.id === currentUser.id && (
                    <span className="shrink-0 rounded-full bg-pet-soft px-2 py-0.5 text-xs font-medium text-pet">
                      Te
                    </span>
                  )}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {member.email}
                </p>
              </div>
              {member.isAdmin ? (
                isMainAdmin && !member.isMainAdmin && (
                  <button type="button" disabled={promotingId !== null}
                    onClick={() => void handleRevokeAdmin(member.id, member.name)}
                    className="shrink-0 rounded-full border border-destructive/30 px-2.5 py-1 text-xs font-semibold text-destructive disabled:opacity-50">
                    {promotingId === member.id ? 'Mentés…' : 'Admin elvétele'}
                  </button>
                )
              ) : isAdmin ? (
                <button
                  type="button"
                  onClick={() => void handleGrantAdmin(member.id)}
                  disabled={promotingId !== null}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  <UserPlus className="size-3.5" />
                  {promotingId === member.id ? 'Mentés…' : 'Adminná tesz'}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="mt-3 px-1 text-center text-xs leading-relaxed text-muted-foreground">
          A teljes történetben {formatNumber(allTotals.total)} db szerepel.
        </p>
      </section>

      <button
        type="button"
        disabled={logoutPending}
        onClick={async () => {
          setLogoutPending(true)
          setLogoutError(null)
          try { await onLogout() }
          catch { setLogoutError('A kijelentkezés nem sikerült. Próbáld újra.') }
          finally { setLogoutPending(false) }
        }}
        className="mt-8 flex h-13 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card font-semibold text-foreground transition-colors hover:bg-secondary active:translate-y-px"
      >
        <LogOut className="size-4.5" />
        Kijelentkezés
      </button>
      {logoutError && <p role="alert" className="mt-3 text-sm text-destructive">{logoutError}</p>}

      {restoreEvent && (
        <ReturnConfirmDialog
          totals={restoreEvent}
          returnedAt={restoreEvent.returnedAt}
          pending={restoring}
          error={restoreError}
          onClose={() => { if (!restoringRef.current) setRestoreEvent(null) }}
          onConfirm={() => void confirmRestore()}
        />
      )}

      {confirmReturnOpen && (
        <ReturnConfirmDialog
          totals={totals}
          pending={returning}
          error={returnError}
          onClose={() => setConfirmReturnOpen(false)}
          onConfirm={() => void confirmReturn()}
        />
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="font-mono text-3xl font-bold tabular-nums text-foreground">
        {formatNumber(value)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground text-pretty">{label}</p>
    </div>
  )
}
