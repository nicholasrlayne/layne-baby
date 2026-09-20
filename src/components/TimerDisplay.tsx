import { accentVars } from './accent'
import { formatElapsed, useElapsedSeconds } from '../lib/useElapsed'
import type { Tracker } from '../lib/types'

interface TimerDisplayProps {
  label: string
  startedAt: string
  /** When stopped, shows the fixed duration to this point instead of drifting with the clock. */
  endedAt?: string | null
  running: boolean
  accent: Tracker
}

export function TimerDisplay({ label, startedAt, endedAt, running, accent }: TimerDisplayProps) {
  const liveElapsed = useElapsedSeconds(startedAt, running)
  const elapsed = !running && endedAt
    ? Math.max(0, Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000))
    : liveElapsed

  return (
    <div className="lb-timer" style={accentVars(accent)}>
      <span className="lb-timer__label">{label}</span>
      <span className="lb-timer__value">{formatElapsed(elapsed)}</span>
    </div>
  )
}
