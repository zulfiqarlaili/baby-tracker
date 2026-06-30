import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import type { KickEvent } from '../types'
import { Icon } from './Icon'

interface HistoryViewProps {
  events: KickEvent[]
  activeDay: string
  backupMessage: string | null
  onExport: () => Promise<void>
  onRestore: (file: File) => Promise<void>
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const

export function HistoryView({
  events,
  activeDay,
  backupMessage,
  onExport,
  onRestore,
}: HistoryViewProps) {
  const activeDate = parseISO(activeDay)
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(activeDate))
  const [selectedDay, setSelectedDay] = useState<string | null>(activeDay)

  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, KickEvent[]>()
    for (const event of events) {
      const dayEvents = grouped.get(event.trackingDay) ?? []
      dayEvents.push(event)
      grouped.set(event.trackingDay, dayEvents)
    }
    for (const dayEvents of grouped.values()) {
      dayEvents.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
    }
    return grouped
  }, [events])

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(visibleMonth)
    const monthEnd = endOfMonth(visibleMonth)
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 1 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
    })
  }, [visibleMonth])

  const selectedEvents = selectedDay ? eventsByDay.get(selectedDay) ?? [] : []
  const canGoForward = visibleMonth < startOfMonth(activeDate)

  function changeMonth(amount: number) {
    setVisibleMonth((month) => addMonths(month, amount))
    setSelectedDay(null)
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) await onRestore(file)
    event.target.value = ''
  }

  return (
    <section className="history-view" aria-labelledby="history-title">
      <header className="view-header history-header">
        <div>
          <p className="eyebrow">Your shared story</p>
          <h1 id="history-title">Movement history</h1>
        </div>
        <details className="history-menu" aria-label="Backup and restore menu">
          <summary className="brand-mark brand-mark-peach" aria-label="Backup and restore menu">
            <Icon name="more-horizontal" size={27} />
          </summary>
          <section className="history-menu-panel" aria-labelledby="backup-title">
            <p className="eyebrow">Keep a copy</p>
            <h2 id="backup-title">Backup & restore</h2>
            <p className="history-menu-description">
              Move your private history between devices with a JSON backup file.
            </p>
            <div className="backup-actions">
              <button className="secondary-button" type="button" onClick={() => void onExport()}>
                <Icon name="download" size={19} /> Export
              </button>
              <label className="secondary-button file-button">
                <Icon name="upload" size={19} /> Restore
                <input type="file" accept="application/json,.json" onChange={(event) => void handleFileChange(event)} />
              </label>
            </div>
            {backupMessage && <p className="backup-message" role="status">{backupMessage}</p>}
          </section>
        </details>
      </header>

      <div className="calendar-card">
        <div className="calendar-toolbar">
          <button className="icon-button" type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">
            <Icon name="chevron-left" size={22} />
          </button>
          <h2>{format(visibleMonth, 'MMMM yyyy')}</h2>
          <button
            className="icon-button"
            type="button"
            onClick={() => changeMonth(1)}
            disabled={!canGoForward}
            aria-label="Next month"
          >
            <Icon name="chevron-right" size={22} />
          </button>
        </div>

        <div className="calendar-weekdays" aria-hidden="true">
          {WEEKDAYS.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
        </div>

        <div className="calendar-grid" aria-label={`${format(visibleMonth, 'MMMM yyyy')} movement calendar`}>
          {calendarDays.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const inMonth = isSameMonth(day, visibleMonth)
            const isFuture = key > activeDay
            const count = eventsByDay.get(key)?.length ?? 0
            const isSelected = selectedDay === key

            if (!inMonth) return <span className="calendar-spacer" key={key} aria-hidden="true" />

            return (
              <button
                className={`calendar-day ${isSelected ? 'is-selected' : ''} ${count >= 10 ? 'has-milestone' : ''}`}
                key={key}
                type="button"
                disabled={isFuture}
                aria-label={`${format(day, 'd MMMM')}, ${count} ${count === 1 ? 'movement' : 'movements'}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedDay(key)}
              >
                <span className="calendar-date">{format(day, 'd')}</span>
                {count > 0 && <span className="calendar-count">{count}</span>}
                {count >= 10 && <span className="calendar-sparkle" aria-hidden="true">✦</span>}
              </button>
            )
          })}
        </div>
      </div>

      <section className="day-detail" aria-live="polite">
        {selectedDay ? (
          <>
            <div className="day-detail-heading">
              <div>
                <p>{format(parseISO(selectedDay), 'EEEE, d MMMM')}</p>
                <h2>{selectedEvents.length} {selectedEvents.length === 1 ? 'movement' : 'movements'}</h2>
              </div>
              {selectedEvents.length >= 10 && (
                <span className="detail-milestone"><Icon name="sparkle" size={16} /> Milestone</span>
              )}
            </div>

            {selectedEvents.length > 0 ? (
              <ol className="movement-times">
                {selectedEvents.map((event, index) => (
                  <li key={event.id}>
                    <span>{index + 1}</span>
                    <time dateTime={event.occurredAt}>{format(new Date(event.occurredAt), 'h:mm a')}</time>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="empty-day">
                <span aria-hidden="true">☁</span>
                <p>No movements logged on this tracking day.</p>
              </div>
            )}
          </>
        ) : (
          <div className="empty-day compact">
            <Icon name="calendar" size={28} />
            <p>Choose a day to see its movement times.</p>
          </div>
        )}
      </section>

    </section>
  )
}
