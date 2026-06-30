import { describe, expect, it } from 'vitest'
import { getNextReset, getTrackingDay, isBeforeDailyReset } from './trackingDay'

describe('tracking day', () => {
  it('uses the previous calendar day before 9am', () => {
    expect(getTrackingDay(new Date(2026, 5, 30, 8, 59, 59))).toBe('2026-06-29')
    expect(isBeforeDailyReset(new Date(2026, 5, 30, 8, 59))).toBe(true)
  })

  it('rolls over exactly at 9am', () => {
    expect(getTrackingDay(new Date(2026, 5, 30, 9, 0, 0))).toBe('2026-06-30')
    expect(isBeforeDailyReset(new Date(2026, 5, 30, 9, 0))).toBe(false)
  })

  it('finds the next reset before and after the boundary', () => {
    expect(getNextReset(new Date(2026, 5, 30, 8, 0))).toEqual(new Date(2026, 5, 30, 9, 0))
    expect(getNextReset(new Date(2026, 5, 30, 10, 0))).toEqual(new Date(2026, 6, 1, 9, 0))
  })
})
