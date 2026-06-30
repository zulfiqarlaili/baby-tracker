import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

export interface InstallPromptState {
  mode: 'prompt' | 'ios' | null
  install: () => Promise<void>
}

export function useInstallPrompt(): InstallPromptState {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as NavigatorWithStandalone).standalone === true
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent)

  useEffect(() => {
    const handlePrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handlePrompt)
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt)
  }, [])

  const mode = isStandalone ? null : installEvent ? 'prompt' : isIos ? 'ios' : null

  async function install() {
    if (!installEvent) return
    await installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
  }

  return { mode, install }
}
