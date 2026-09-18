import { accentVars } from './accent'
import { formatElapsed, useElapsedSeconds } from '../lib/useElapsed'
import type { Tracker } from '../lib/types'

interface TimerDisplayProps {
  label: string
  startedAt: string
  running: boolean
  accent: Tracker
}

export function TimerDisplay({ label, startedAt, running, accent }: TimerDisplayProps) {
  const elapsed = useElapsedSeconds(startedAt, running)

  return (
    <div className="lb-timer" style={accentVars(accent)}>
      <span className="lb-timer__label">{label}</span>
      <span className="lb-timer__value">{formatElapsed(elapsed)}</span>
    </div>
  )
}
