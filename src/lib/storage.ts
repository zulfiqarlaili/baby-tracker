import type { KickEvent, KickStoreV1, UiPreferences } from '../types'

export const STORE_KEY = 'baby-kick-counter:store:v1'
export const UI_KEY = 'baby-kick-counter:ui:v1'

const EMPTY_STORE: KickStoreV1 = { version: 1, events: [] }
const DEFAULT_UI: UiPreferences = {
  onboardingComplete: false,
  installPromptDismissed: false,
}

export class StorageWriteError extends Error {
  constructor() {
    super('Your browser could not save this change. Your existing history is untouched.')
    this.name = 'StorageWriteError'
  }
}

export function isKickEvent(value: unknown): value is KickEvent {
  if (!value || typeof value !== 'object') return false
  const event = value as Partial<KickEvent>
  return (
    typeof event.id === 'string' &&
    event.id.length > 0 &&
    typeof event.occurredAt === 'string' &&
    !Number.isNaN(Date.parse(event.occurredAt)) &&
    typeof event.trackingDay === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(event.trackingDay)
  )
}

export function loadKickStore(): KickStoreV1 {
  const raw = localStorage.getItem(STORE_KEY)
  if (!raw) return EMPTY_STORE

  try {
    const parsed = JSON.parse(raw) as Partial<KickStoreV1>
    if (parsed.version !== 1 || !Array.isArray(parsed.events) || !parsed.events.every(isKickEvent)) {
      return EMPTY_STORE
    }
    return { version: 1, events: [...parsed.events] }
  } catch {
    return EMPTY_STORE
  }
}

export function saveKickStore(store: KickStoreV1): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store))
  } catch {
    throw new StorageWriteError()
  }
}

export function loadUiPreferences(): UiPreferences {
  const raw = localStorage.getItem(UI_KEY)
  if (!raw) return DEFAULT_UI

  try {
    const parsed = JSON.parse(raw) as Partial<UiPreferences>
    return {
      onboardingComplete: parsed.onboardingComplete === true,
      installPromptDismissed: parsed.installPromptDismissed === true,
    }
  } catch {
    return DEFAULT_UI
  }
}

export function saveUiPreferences(preferences: UiPreferences): void {
  try {
    localStorage.setItem(UI_KEY, JSON.stringify(preferences))
  } catch {
    // The counter still works if nonessential interface preferences cannot persist.
  }
}
