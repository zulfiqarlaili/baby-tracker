import { describe, expect, it, vi } from 'vitest'
import type { KickStoreV1 } from '../types'
import { loadKickStore, saveKickStore, STORE_KEY, StorageWriteError } from './storage'

describe('kick storage', () => {
  it('loads a valid store and safely ignores corrupt data', () => {
    const store: KickStoreV1 = {
      version: 1,
      events: [{
        id: 'kick-1',
        occurredAt: '2026-06-30T02:00:00.000Z',
        trackingDay: '2026-06-30',
      }],
    }
    localStorage.setItem(STORE_KEY, JSON.stringify(store))
    expect(loadKickStore()).toEqual(store)

    localStorage.setItem(STORE_KEY, '{broken')
    expect(loadKickStore()).toEqual({ version: 1, events: [] })
  })

  it('surfaces quota failures without mutating application state', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    })

    expect(() => saveKickStore({ version: 1, events: [] })).toThrow(StorageWriteError)
  })
})
