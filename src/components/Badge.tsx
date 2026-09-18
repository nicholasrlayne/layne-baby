import type { ReactNode } from 'react'
import { accentVars } from './accent'
import type { Tracker } from '../lib/types'

interface BadgeProps {
  tone?: 'neutral' | 'accent'
  accent?: Tracker
  children: ReactNode
}

export function Badge({ tone = 'neutral', accent, children }: BadgeProps) {
  return (
    <span className={`lb-badge lb-badge--${tone}`} style={accentVars(accent)}>
      {children}
    </span>
  )
}
