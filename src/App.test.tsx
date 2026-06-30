import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { STORE_KEY } from './lib/storage'
import type { KickStoreV1 } from './types'

async function finishOnboarding() {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Start counting' }))
  return user
}

describe('Baby Kick Counter', () => {
  it('shows safety guidance once, then reveals an obvious counter', async () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Meet your baby’s little rhythm' })).toBeVisible()
    expect(screen.getByText(/Ten movements is a logging milestone/)).toBeVisible()

    await finishOnboarding()

    expect(screen.getByRole('button', { name: /Log a movement/ })).toBeVisible()
    expect(screen.getByText('0', { selector: '.count-number' })).toBeVisible()
    expect(screen.queryByText(/proof that baby is well/)).not.toBeInTheDocument()
  })

  it('logs, persists, and undoes the exact latest movement', async () => {
    const { unmount } = render(<App />)
    const user = await finishOnboarding()
    await user.click(screen.getByRole('button', { name: /Log a movement/ }))

    expect(screen.getByText('1', { selector: '.count-number' })).toBeVisible()
    expect(screen.queryByText('Movement logged')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Undo last movement' }))
    expect(screen.getByText('0', { selector: '.count-number' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Undo last movement' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Log a movement/ }))
    const stored = JSON.parse(localStorage.getItem(STORE_KEY)!) as KickStoreV1
    expect(stored.events).toHaveLength(1)

    unmount()
    render(<App />)
    expect(screen.getByText('1', { selector: '.count-number' })).toBeVisible()
  })

  it('celebrates ten without stopping further logging', async () => {
    render(<App />)
    const user = await finishOnboarding()
    const addButton = screen.getByRole('button', { name: /Log a movement/ })

    for (let count = 0; count < 10; count += 1) await user.click(addButton)

    expect(screen.getByText('10', { selector: '.count-number' })).toBeVisible()
    expect(screen.getByText('10 movement milestone')).toBeVisible()
    expect(navigator.vibrate).toHaveBeenCalledWith(35)

    await user.click(addButton)
    expect(screen.getByText('11', { selector: '.count-number' })).toBeVisible()
  })

  it('does not change the visible count when storage fails', async () => {
    render(<App />)
    const user = await finishOnboarding()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    })

    await user.click(screen.getByRole('button', { name: /Log a movement/ }))

    expect(screen.getByText('0', { selector: '.count-number' })).toBeVisible()
    expect(screen.getByRole('alert')).toHaveTextContent('could not save')
  })
})
