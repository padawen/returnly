'use client'

import { useState } from 'react'
import {
  Check,
  GlassWater,
  LogOut,
  Milk,
  RotateCcw,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { formatNumber } from '@/lib/data'
import { useStore } from '@/components/store'
import { UserAvatar } from '@/components/user-avatar'
import { AppHeader } from '@/components/app-header'
import { publicErrorMessage } from '@/lib/errors'

export function ProfileScreen({
  onLogout,
  onMarkReturned,
  onHome,
  darkMode,
  onToggleDarkMode,
}: {
  onLogout: () => Promise<void>
  onMarkReturned: () => Promise<void>
  onHome: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
}) {
  const {
    allTotals,
    currentUser,
    entries,
    grantAdmin,
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
            disabled={totals.total === 0 || returning}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="size-4" />
            {returning ? 'Rögzítés…' : 'Visszavitték'}
          </button>
        )}
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
                <p className="truncate font-medium text-card-foreground">
                  {member.name}
                  {member.id === currentUser.id && (
                    <span className="ml-2 rounded-full bg-pet-soft px-2 py-0.5 text-xs font-medium text-pet">
                      Te
                    </span>
                  )}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {member.email}
                </p>
              </div>
              {member.isAdmin ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-pet-soft px-2.5 py-1 text-xs font-semibold text-pet">
                  <ShieldCheck className="size-3.5" />
                  Admin
                </span>
              ) : isAdmin ? (
                <button
                  type="button"
                  onClick={() => void handleGrantAdmin(member.id)}
                  disabled={promotingId === member.id}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  <UserPlus className="size-3.5" />
                  {promotingId === member.id ? 'Mentés…' : 'Adminná tesz'}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="mt-3 px-1 text-xs leading-relaxed text-muted-foreground">
          A csapat minden tagja láthatja és szerkesztheti az összes bejegyzést.
          A teljes történetben {formatNumber(allTotals.total)} db szerepel.
        </p>
      </section>

      <button
        type="button"
        onClick={() => void onLogout()}
        className="mt-8 flex h-13 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card font-semibold text-foreground transition-colors hover:bg-secondary active:translate-y-px"
      >
        <LogOut className="size-4.5" />
        Kijelentkezés
      </button>

      {confirmReturnOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Bezárás"
            onClick={() => setConfirmReturnOpen(false)}
            className="absolute inset-0 bg-foreground/45 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-confirm-title"
            className="relative w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setConfirmReturnOpen(false)}
              aria-label="Bezárás"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
            >
              <X className="size-5" />
            </button>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-pet-soft text-pet">
              <RotateCcw className="size-6" />
            </div>
            <h2
              id="return-confirm-title"
              className="mt-5 text-2xl font-bold tracking-tight text-card-foreground"
            >
              Biztosan elvitték?
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A jelenlegi készlet lezárul, és új gyűjtési ciklus indul. Az eddigi
              bejegyzések és az előzmények megmaradnak.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <ConfirmStat label="Összesen" value={totals.total} />
              <ConfirmStat
                icon={<Milk className="size-4" />}
                label="PET / ALU"
                value={totals.pet}
                tone="pet"
              />
              <ConfirmStat
                icon={<GlassWater className="size-4" />}
                label="Törhető üveg"
                value={totals.glass}
                tone="glass"
              />
            </div>

            {returnError && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
              >
                {returnError}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmReturnOpen(false)}
                disabled={returning}
                className="h-12 rounded-xl border border-border bg-secondary px-4 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-50"
              >
                Mégse
              </button>
              <button
                type="button"
                onClick={() => void confirmReturn()}
                disabled={returning}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <RotateCcw className="size-4" />
                {returning ? 'Rögzítés…' : 'Visszavitték'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ConfirmStat({
  icon,
  label,
  value,
  tone,
}: {
  icon?: React.ReactNode
  label: string
  value: number
  tone?: 'pet' | 'glass'
}) {
  const toneClass =
    tone === 'pet'
      ? 'bg-pet-soft text-pet'
      : tone === 'glass'
        ? 'bg-glass-soft text-glass'
        : 'bg-secondary text-foreground'

  return (
    <div className={`rounded-2xl px-3 py-3 ${toneClass}`}>
      <div className="flex items-center gap-1.5 text-xs font-medium opacity-75">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1 font-mono text-xl font-bold tabular-nums">
        {formatNumber(value)}
      </p>
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

function entryTotal(entry: { pet: number; glass: number }) {
  return entry.pet + entry.glass
}
