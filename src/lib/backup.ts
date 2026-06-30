import { format } from 'date-fns'
import type { KickBackupV1, KickEvent, KickStoreV1 } from '../types'
import { isKickEvent } from './storage'

export interface MergeResult {
  store: KickStoreV1
  added: number
  duplicates: number
}

export function createBackup(events: KickEvent[], now = new Date()): KickBackupV1 {
  return {
    schemaVersion: 1,
    exportedAt: now.toISOString(),
    events: [...events],
  }
}

export function parseBackup(raw: string): KickBackupV1 {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('That file is not valid JSON.')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('That file is not a Baby Kick Counter backup.')
  }

  const candidate = parsed as Partial<KickBackupV1>
  if (candidate.schemaVersion !== 1) {
    throw new Error('This backup version is not supported.')
  }
  if (
    typeof candidate.exportedAt !== 'string' ||
    Number.isNaN(Date.parse(candidate.exportedAt)) ||
    !Array.isArray(candidate.events) ||
    !candidate.events.every(isKickEvent)
  ) {
    throw new Error('This backup is incomplete or damaged.')
  }

  return {
    schemaVersion: 1,
    exportedAt: candidate.exportedAt,
    events: [...candidate.events],
  }
}

export function mergeBackup(current: KickEvent[], incoming: KickEvent[]): MergeResult {
  const knownIds = new Set(current.map((event) => event.id))
  const additions: KickEvent[] = []
  let duplicates = 0

  for (const event of incoming) {
    if (knownIds.has(event.id)) {
      duplicates += 1
      continue
    }
    knownIds.add(event.id)
    additions.push(event)
  }

  const events = [...current, ...additions].sort((a, b) =>
    a.occurredAt.localeCompare(b.occurredAt),
  )

  return {
    store: { version: 1, events },
    added: additions.length,
    duplicates,
  }
}

export async function exportBackup(events: KickEvent[]): Promise<void> {
  const now = new Date()
  const backup = createBackup(events, now)
  const file = new File([JSON.stringify(backup, null, 2)], `baby-kicks-${format(now, 'yyyy-MM-dd')}.json`, {
    type: 'application/json',
  })

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: 'Baby Kick Counter backup',
      text: 'My Baby Kick Counter backup',
      files: [file],
    })
    return
  }

  const url = URL.createObjectURL(file)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = file.name
  anchor.click()
  URL.revokeObjectURL(url)
}
