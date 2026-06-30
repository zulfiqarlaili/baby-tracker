import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { InstallCard } from './InstallCard'

describe('InstallCard', () => {
  it('gives the native install action when a browser prompt is available', async () => {
    const user = userEvent.setup()
    const onInstall = vi.fn()
    render(<InstallCard mode="prompt" onDismiss={vi.fn()} onInstall={onInstall} />)

    await user.click(screen.getByRole('button', { name: 'Install app' }))
    expect(onInstall).toHaveBeenCalledOnce()
  })

  it('explains the iOS Add to Home Screen path', () => {
    render(<InstallCard mode="ios" onDismiss={vi.fn()} onInstall={vi.fn()} />)

    expect(screen.getByText('Add to Home Screen')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Install app' })).not.toBeInTheDocument()
  })
})
