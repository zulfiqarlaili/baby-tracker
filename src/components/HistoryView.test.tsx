import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { KickEvent } from '../types'
import { HistoryView } from './HistoryView'

const events: KickEvent[] = [
  {
    id: 'kick-1',
    occurredAt: '2026-06-30T02:30:00.000Z',
    trackingDay: '2026-06-30',
  },
]

describe('HistoryView', () => {
  it('shows daily counts and timestamped detail', () => {
    render(
      <HistoryView
        activeDay="2026-06-30"
        backupMessage={null}
        events={events}
        onExport={vi.fn()}
        onRestore={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: '30 June, 1 movement' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { name: '1 movement' })).toBeVisible()
    expect(screen.getByText(new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(events[0].occurredAt)))).toBeVisible()
  })

  it('navigates backward and prevents browsing into future months', async () => {
    const user = userEvent.setup()
    render(
      <HistoryView
        activeDay="2026-06-30"
        backupMessage={null}
        events={events}
        onExport={vi.fn()}
        onRestore={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(screen.getByRole('heading', { name: 'May 2026' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Next month' })).toBeEnabled()
    expect(screen.getByText('Choose a day to see its movement times.')).toBeVisible()
  })

  it('disables tracking days that have not started yet', () => {
    render(
      <HistoryView
        activeDay="2026-06-15"
        backupMessage={null}
        events={[]}
        onExport={vi.fn()}
        onRestore={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: '15 June, 0 movements' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '16 June, 0 movements' })).toBeDisabled()
  })

  it('keeps backup controls tucked inside the history menu', async () => {
    const user = userEvent.setup()
    render(
      <HistoryView
        activeDay="2026-06-30"
        backupMessage={null}
        events={events}
        onExport={vi.fn()}
        onRestore={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Backup & restore' })).not.toBeVisible()
    expect(screen.queryByText('No account · No cloud · No tracking')).not.toBeInTheDocument()

    await user.click(screen.getByLabelText('Backup and restore menu', { selector: 'summary' }))

    expect(screen.getByRole('heading', { name: 'Backup & restore' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Export' })).toBeVisible()
  })
})
