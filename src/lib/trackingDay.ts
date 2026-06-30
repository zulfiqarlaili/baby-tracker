import { format } from 'date-fns'

export const RESET_HOUR = 9

export function getTrackingDay(date: Date): string {
  const trackingDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - (date.getHours() < RESET_HOUR ? 1 : 0),
  )

  return format(trackingDate, 'yyyy-MM-dd')
}

export function getNextReset(date: Date): Date {
  const reset = new Date(date.getFullYear(), date.getMonth(), date.getDate(), RESET_HOUR)
  if (date >= reset) {
    reset.setDate(reset.getDate() + 1)
  }
  return reset
}

export function isBeforeDailyReset(date: Date): boolean {
  return date.getHours() < RESET_HOUR
}
