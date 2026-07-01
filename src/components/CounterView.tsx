import { format, parseISO } from 'date-fns'
import type { KickEvent } from '../types'
import { isBeforeDailyReset } from '../lib/trackingDay'
import { Icon } from './Icon'
import { InstallCard } from './InstallCard'

interface CounterViewProps {
  count: number
  currentEvents: KickEvent[]
  trackingDay: string
  now: Date
  celebrating: boolean
  installMode: 'prompt' | 'ios' | null
  onAdd: () => void
  onDismissInstall: () => void
  onInstall: () => void
  onUndo: () => void
}

export function CounterView({
  count,
  currentEvents,
  trackingDay,
  now,
  celebrating,
  installMode,
  onAdd,
  onDismissInstall,
  onInstall,
  onUndo,
}: CounterViewProps) {
  const latest = currentEvents.at(-1)
  const dayDate = parseISO(trackingDay)
  const dayLabel = isBeforeDailyReset(now)
    ? `Still counting ${format(dayDate, 'EEEE')} until 9:00am`
    : format(dayDate, 'EEEE, d MMMM')

  return (
    <section className={`counter-view ${celebrating ? 'is-celebrating' : ''}`} aria-labelledby="counter-title">
      <header className="view-header counter-header">
        <div>
          <p className="eyebrow">Your little rhythm</p>
          <h1 id="counter-title">Baby Kicks</h1>
        </div>
        <div className="brand-mark" aria-hidden="true">
          <Icon name="baby" size={30} />
        </div>
      </header>

      <p className="day-label">{dayLabel}</p>

      <div className="counter-primary">
        <div className="count-stage">
          <span className="cloud cloud-left" aria-hidden="true" />
          <span className="cloud cloud-right" aria-hidden="true" />
          <span className="floating-star floating-star-one" aria-hidden="true">✦</span>
          <span className="floating-star floating-star-two" aria-hidden="true">✧</span>

          <div className="count-copy" aria-live="polite" aria-atomic="true">
            <span className="count-number">{count}</span>
            <span className="count-label">{count === 1 ? 'movement' : 'movements'} logged</span>
          </div>

          {count >= 10 && (
            <div className="milestone-pill" role="status">
              <Icon name="sparkle" size={17} />
              10 movement milestone
            </div>
          )}

          <div className="star-burst" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => (
              <span key={index}>✦</span>
            ))}
          </div>
        </div>

        <button className="kick-button" type="button" onClick={onAdd}>
          <span className="kick-button-heart"><Icon name="heart" size={28} /></span>
          <span className="kick-button-label">Log a movement</span>
          <span className="kick-button-hint">kick, roll, flutter or swish</span>
        </button>
      </div>

      <div className="today-details">
        <div className="detail-card detail-card-with-action">
          <Icon name="clock" size={21} />
          <div>
            <span>Last movement</span>
            <strong>{latest ? format(new Date(latest.occurredAt), 'h:mm a') : 'Not logged yet'}</strong>
          </div>
          {latest && (
            <button className="inline-undo" type="button" onClick={onUndo} aria-label="Undo last movement">
              <Icon name="undo" size={16} />
              Undo
            </button>
          )}
        </div>
      </div>

      {installMode && (
        <InstallCard
          mode={installMode}
          onDismiss={onDismissInstall}
          onInstall={onInstall}
        />
      )}

      <p className="privacy-note">Private by design · Saved only on this device</p>
    </section>
  )
}
