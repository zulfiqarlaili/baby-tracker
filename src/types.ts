export interface KickEvent {
  id: string
  occurredAt: string
  trackingDay: string
}

export interface KickStoreV1 {
  version: 1
  events: KickEvent[]
}

export interface KickBackupV1 {
  schemaVersion: 1
  exportedAt: string
  events: KickEvent[]
}

export interface UiPreferences {
  onboardingComplete: boolean
  installPromptDismissed: boolean
}
