import { accentVars } from './accent'
import type { Tracker } from '../lib/types'

interface EntryRowProps {
  tracker: Tracker
  title: string
  meta?: string
  time: string
  value: string
  caregiver: string
  onClick?: () => void
}

export function EntryRow({ tracker, title, meta, time, value, caregiver, onClick }: EntryRowProps) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className="lb-entryrow" style={accentVars(tracker)} onClick={onClick} type={onClick ? 'button' : undefined}>
      <span className="lb-entryrow__bar" />
      <span className="lb-entryrow__main">
        <span className="lb-entryrow__title">{title}</span>
        {meta && <span className="lb-entryrow__meta">{meta}</span>}
        <span className="lb-entryrow__caregiver">logged by {caregiver}</span>
      </span>
      <span className="lb-entryrow__trailing">
        <span className="lb-entryrow__value">{value}</span>
        <span className="lb-entryrow__time">{time}</span>
      </span>
    </Tag>
  )
}
