import { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { CounterView } from './components/CounterView'
import { HistoryView } from './components/HistoryView'
import { Onboarding } from './components/Onboarding'
import { useClock } from './hooks/useClock'
import { useInstallPrompt } from './hooks/useInstallPrompt'
import { exportBackup, mergeBackup, parseBackup } from './lib/backup'
import {
  loadKickStore,
  loadUiPreferences,
  saveKickStore,
  saveUiPreferences,
} from './lib/storage'
import { getTrackingDay } from './lib/trackingDay'
import type { KickEvent, KickStoreV1, UiPreferences } from './types'
import { useSwipeable } from 'react-swipeable'

type ViewName = 'today' | 'history'

function createEventId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function App() {
  const [store, setStore] = useState<KickStoreV1>(() => loadKickStore())
  const [preferences, setPreferences] = useState<UiPreferences>(() => loadUiPreferences())
  const [view, setView] = useState<ViewName>('today')
  const [celebrating, setCelebrating] = useState(false)
  const [appMessage, setAppMessage] = useState<string | null>(null)
  const [backupMessage, setBackupMessage] = useState<string | null>(null)
  const celebrationTimerRef = useRef<number | null>(null)
  const now = useClock()
  const activeDay = getTrackingDay(now)
  const installPrompt = useInstallPrompt()

  const currentEvents = useMemo(
    () => store.events
      .filter((event) => event.trackingDay === activeDay)
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)),
    [activeDay, store.events],
  )

  function changeViewWithTransition(nextView: ViewName) {
    if (view === nextView) return;

    const direction = nextView === 'history' ? 'forward' : 'backward';
    const doc = document as unknown as { startViewTransition?: (options: { update: () => void, types: string[] }) => void };

    if (!doc.startViewTransition) {
      setView(nextView);
      return;
    }

    doc.startViewTransition({
      update: () => flushSync(() => setView(nextView)),
      types: [direction],
    });
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => changeViewWithTransition('history'),
    onSwipedRight: () => changeViewWithTransition('today'),
  })

  useEffect(() => () => {
    if (celebrationTimerRef.current) window.clearTimeout(celebrationTimerRef.current)
  }, [])

  function persist(nextStore: KickStoreV1): boolean {
    try {
      saveKickStore(nextStore)
      setStore(nextStore)
      setAppMessage(null)
      return true
    } catch (error) {
      setAppMessage(error instanceof Error ? error.message : 'This change could not be saved.')
      return false
    }
  }

  function addMovement() {
    const occurredAt = new Date()
    const event: KickEvent = {
      id: createEventId(),
      occurredAt: occurredAt.toISOString(),
      trackingDay: getTrackingDay(occurredAt),
    }
    const previousCount = store.events.filter(
      (item) => item.trackingDay === event.trackingDay,
    ).length
    const nextStore: KickStoreV1 = {
      version: 1,
      events: [...store.events, event],
    }

    if (!persist(nextStore)) return

    if (previousCount === 9) {
      setCelebrating(true)
      navigator.vibrate?.(35)
      if (celebrationTimerRef.current) window.clearTimeout(celebrationTimerRef.current)
      celebrationTimerRef.current = window.setTimeout(() => setCelebrating(false), 2_200)
    }
  }

  function undoMovement() {
    const latestEvent = currentEvents.at(-1)
    if (!latestEvent) return
    const nextStore: KickStoreV1 = {
      version: 1,
      events: store.events.filter((event) => event.id !== latestEvent.id),
    }
    persist(nextStore)
  }

  function completeOnboarding() {
    const nextPreferences = { ...preferences, onboardingComplete: true }
    setPreferences(nextPreferences)
    saveUiPreferences(nextPreferences)
  }

  function dismissInstallPrompt() {
    const nextPreferences = { ...preferences, installPromptDismissed: true }
    setPreferences(nextPreferences)
    saveUiPreferences(nextPreferences)
  }

  async function installApp() {
    await installPrompt.install()
    dismissInstallPrompt()
  }

  async function handleExport() {
    try {
      await exportBackup(store.events)
      setBackupMessage(`Backup prepared with ${store.events.length} movements.`)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setBackupMessage('The backup could not be exported. Please try again.')
    }
  }

  async function handleRestore(file: File) {
    try {
      const backup = parseBackup(await file.text())
      const result = mergeBackup(store.events, backup.events)
      if (!persist(result.store)) {
        setBackupMessage('Nothing was restored because the updated history could not be saved.')
        return
      }
      setBackupMessage(
        `Restored ${result.added} new ${result.added === 1 ? 'movement' : 'movements'}. ${result.duplicates} ${result.duplicates === 1 ? 'duplicate was' : 'duplicates were'} skipped.`,
      )
    } catch (error) {
      setBackupMessage(error instanceof Error ? error.message : 'That backup could not be restored.')
    }
  }

  if (!preferences.onboardingComplete) {
    return <Onboarding onContinue={completeOnboarding} />
  }

  const visibleInstallMode = preferences.installPromptDismissed ? null : installPrompt.mode

  return (
    <div className="app-shell" {...swipeHandlers}>
      <main className="app-main">
        {view === 'today' ? (
          <CounterView
            celebrating={celebrating}
            count={currentEvents.length}
            currentEvents={currentEvents}
            installMode={visibleInstallMode}
            now={now}
            trackingDay={activeDay}
            onAdd={addMovement}
            onDismissInstall={dismissInstallPrompt}
            onInstall={() => void installApp()}
            onUndo={undoMovement}
          />
        ) : (
          <HistoryView
            key={activeDay}
            activeDay={activeDay}
            backupMessage={backupMessage}
            events={store.events}
            onExport={handleExport}
            onRestore={handleRestore}
          />
        )}
      </main>

      <div className="swipe-indicators" aria-hidden="true">
        <div className={`swipe-dot ${view === 'today' ? 'is-active' : ''}`} />
        <div className={`swipe-dot ${view === 'history' ? 'is-active' : ''}`} />
      </div>

      {appMessage && <div className="app-alert" role="alert">{appMessage}</div>}
    </div>
  )
}
