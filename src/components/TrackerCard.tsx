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
}

export function TrackerCard({ tracker, label, sublabel, value, unit, onAdd }: TrackerCardProps) {
  return (
    <div className="lb-trackercard" style={accentVars(tracker)}>
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
        <IconButton icon="plus" label={`Add ${TRACKER_LABEL[tracker].toLowerCase()}`} variant="solid" size="md" onClick={onAdd} />
      </div>
    </div>
  )
}
