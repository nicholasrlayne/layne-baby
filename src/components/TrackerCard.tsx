import type { KeyboardEvent, MouseEvent } from 'react'
import { accentVars, TRACKER_LABEL } from './accent'
import { IconButton } from './IconButton'
import type { Tracker } from '../lib/types'

interface TrackerCardProps {
  tracker: Tracker
  label: string
  sublabel: string
  value: string
  unit?: string
  onAdd: () => void
  /** Opens the most recent entry for editing when tapping the card itself. */
  onOpen?: () => void
}

export function TrackerCard({ tracker, label, sublabel, value, unit, onAdd, onOpen }: TrackerCardProps) {
  function handleAdd(e: MouseEvent) {
    e.stopPropagation()
    onAdd()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!onOpen) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen()
    }
  }

  return (
    <div
      className="lb-trackercard"
      style={{ ...accentVars(tracker), cursor: onOpen ? 'pointer' : undefined }}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
    >
      <div className="lb-trackercard__header">
        <span className="heading">{TRACKER_LABEL[tracker]}</span>
      </div>
      <div className="lb-trackercard__body">
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="lb-trackercard__label">{label}</span>
          <span className="lb-trackercard__value">
            {value}
            {unit && <span className="lb-trackercard__unit">{unit}</span>}
          </span>
          <span className="lb-trackercard__sublabel">{sublabel}</span>
        </span>
        <IconButton icon="plus" label={`Add ${TRACKER_LABEL[tracker].toLowerCase()}`} variant="solid" size="md" onClick={handleAdd} />
      </div>
    </div>
  )
}
