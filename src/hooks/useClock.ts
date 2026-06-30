import { useEffect, useState } from 'react'
import { getNextReset } from '../lib/trackingDay'

export function useClock(): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const update = () => setNow(new Date())
    const intervalId = window.setInterval(update, 30_000)
    let resetTimerId: number

    const scheduleReset = () => {
      const delay = Math.max(0, getNextReset(new Date()).getTime() - Date.now() + 50)
      resetTimerId = window.setTimeout(() => {
        update()
        scheduleReset()
      }, delay)
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') update()
    }

    scheduleReset()
    window.addEventListener('focus', update)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.clearInterval(intervalId)
      window.clearTimeout(resetTimerId)
      window.removeEventListener('focus', update)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return now
}
