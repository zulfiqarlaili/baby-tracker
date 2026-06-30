import { describe, expect, it } from 'vitest'
import type { KickEvent } from '../types'
import { createBackup, mergeBackup, parseBackup } from './backup'

const event: KickEvent = {
  id: 'kick-1',
  occurredAt: '2026-06-30T02:00:00.000Z',
  trackingDay: '2026-06-30',
}

describe('backup', () => {
  it('round-trips a versioned backup', () => {
    const backup = createBackup([event], new Date('2026-06-30T10:00:00.000Z'))
    expect(parseBackup(JSON.stringify(backup))).toEqual(backup)
  })

  it('merges new events and ignores duplicate ids', () => {
    const second = { ...event, id: 'kick-2', occurredAt: '2026-06-30T03:00:00.000Z' }
    const result = mergeBackup([event], [event, second, second])

    expect(result.added).toBe(1)
    expect(result.duplicates).toBe(2)
    expect(result.store.events).toEqual([event, second])
  })

  it('rejects malformed and unsupported files before merging', () => {
    expect(() => parseBackup('{nope')).toThrow('not valid JSON')
    expect(() => parseBackup(JSON.stringify({ schemaVersion: 2, events: [] }))).toThrow(
      'not supported',
    )
    expect(() => parseBackup(JSON.stringify({
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      events: [{ id: 'broken' }],
    }))).toThrow('incomplete or damaged')
  })
})
