import { accentVars } from './accent'
import type { Tracker } from '../lib/types'

interface ChipProps {
  active?: boolean
  accent?: Tracker
  onClick?: () => void
  children: string
}

export function Chip({ active, accent, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      className={`lb-chip${active ? ' lb-chip--active' : ''}`}
      style={accentVars(accent)}
      onClick={onClick}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}
