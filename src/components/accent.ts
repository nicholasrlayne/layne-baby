import type { CSSProperties } from 'react'
import type { Tracker } from '../lib/types'

export function accentVars(tracker?: Tracker): CSSProperties {
  if (!tracker) return {}
  return {
    '--accent-color': `var(--track-${tracker}-fill)`,
    '--accent-hover': `var(--track-${tracker}-fill)`,
    '--accent-fill': `var(--track-${tracker}-fill)`,
    '--accent-ink': `var(--track-${tracker}-ink)`,
    '--accent-tint': `var(--track-${tracker}-tint)`,
  } as CSSProperties
}

export const TRACKER_LABEL: Record<Tracker, string> = {
  feed: 'Feed',
  pump: 'Pump',
  diaper: 'Diaper',
  sleep: 'Sleep',
}
