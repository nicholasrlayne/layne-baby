import { Icon } from './Icon'
import { accentVars } from './accent'
import type { Tracker } from '../lib/types'

interface LoggerHeaderProps {
  tracker: Tracker
  title: string
  onClose: () => void
  onSave?: () => void
  saveLabel?: string
  saveDisabled?: boolean
}

export function LoggerHeader({ tracker, title, onClose, onSave, saveLabel = 'Save', saveDisabled }: LoggerHeaderProps) {
  return (
    <div className="lb-header-bar" style={{ ...accentVars(tracker), background: 'var(--accent-fill)' }}>
      <button className="lb-header-bar__action" onClick={onClose} aria-label="Close" style={{ paddingRight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44 }}>
        <Icon name="x" size={22} color="var(--text-on-accent)" />
      </button>
      <span className="lb-header-bar__title">{title}</span>
      {onSave ? (
        <button className="lb-header-bar__action" onClick={onSave} disabled={saveDisabled} style={{ opacity: saveDisabled ? 0.5 : 1 }}>
          {saveLabel}
        </button>
      ) : (
        <span style={{ width: 44 }} />
      )}
    </div>
  )
}
