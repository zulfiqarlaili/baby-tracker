import { Icon } from './Icon'

interface InstallCardProps {
  mode: 'prompt' | 'ios'
  onDismiss: () => void
  onInstall: () => void
}

export function InstallCard({ mode, onDismiss, onInstall }: InstallCardProps) {
  return (
    <aside className="install-card" aria-label="Install Baby Kick Counter">
      <div className="install-card-icon">
        <Icon name="share" size={22} />
      </div>
      <div className="install-card-copy">
        <strong>Keep Kicks close</strong>
        {mode === 'ios' ? (
          <p>
            Tap <span aria-label="Share">Share</span>, then <strong>Add to Home Screen</strong>.
          </p>
        ) : (
          <p>Install the app for quick, full-screen access—even offline.</p>
        )}
        {mode === 'prompt' && (
          <button className="text-button" type="button" onClick={onInstall}>
            Install app
          </button>
        )}
      </div>
      <button className="icon-button install-dismiss" type="button" onClick={onDismiss} aria-label="Dismiss install tip">
        <Icon name="x" size={19} />
      </button>
    </aside>
  )
}
