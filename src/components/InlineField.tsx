import type { InputHTMLAttributes } from 'react'

interface InlineFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string
  value: string
  onChange: (value: string) => void
}

export function InlineField({ label, value, onChange, ...rest }: InlineFieldProps) {
  return (
    <div className="lb-fieldrow">
      <span className="lb-fieldrow__label">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: 16, fontFamily: 'var(--font-sans)' }}
        {...rest}
      />
    </div>
  )
}

function toLocalInputValue(iso: string): string {
  const d = new Date(iso)
  const offsetMs = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16)
}

function fromLocalInputValue(local: string): string {
  return new Date(local).toISOString()
}

function toLocalDateValue(iso: string): string {
  return toLocalInputValue(iso).slice(0, 10)
}

function toLocalTimeValue(iso: string): string {
  return toLocalInputValue(iso).slice(11, 16)
}

function combineLocalDateTime(dateStr: string, timeStr: string): string {
  return fromLocalInputValue(`${dateStr}T${timeStr}`)
}

const DAY_LABEL_OPTS: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }

/**
 * Resolves a new time-of-day into a full ISO timestamp without a date field to ask the user.
 *
 * - Anchor-less fields (e.g. a start time): keep the existing value's calendar date; if the
 *   result would land in the future, it must actually mean "yesterday" (a logged time can't be
 *   ahead of now), so the date rolls back a day.
 * - Anchored fields (e.g. a sleep end time, anchored to its start): use the anchor's calendar
 *   date; if the result would land at or before the anchor, it crossed midnight, so the date
 *   rolls forward a day (a 10pm start with a 6am end is next-day morning).
 */
function resolveTimeEdit(prevIso: string | null, timeStr: string, anchorIso?: string): string {
  if (anchorIso) {
    const anchorDate = toLocalDateValue(anchorIso)
    let combined = combineLocalDateTime(anchorDate, timeStr)
    if (new Date(combined).getTime() < new Date(anchorIso).getTime()) {
      const rolled = new Date(combined)
      rolled.setDate(rolled.getDate() + 1)
      combined = rolled.toISOString()
    }
    return combined
  }

  const basisIso = prevIso ?? new Date().toISOString()
  const datePart = toLocalDateValue(basisIso)
  let combined = combineLocalDateTime(datePart, timeStr)
  if (new Date(combined).getTime() > Date.now()) {
    const rolled = new Date(combined)
    rolled.setDate(rolled.getDate() - 1)
    combined = rolled.toISOString()
  }
  return combined
}

interface TimeFieldProps {
  label: string
  value: string | null
  onChange: (iso: string) => void
  disabled?: boolean
  emptyHint?: string
  /** ISO of a related start time this field is relative to (e.g. a sleep end time). */
  anchor?: string
}

export function TimeField({ label, value, onChange, disabled, emptyHint, anchor }: TimeFieldProps) {
  const timeVal = value ? toLocalTimeValue(value) : ''
  const isToday = value ? toLocalDateValue(value) === toLocalDateValue(new Date().toISOString()) : true
  const dayLabel = value && !isToday ? new Date(value).toLocaleDateString(undefined, DAY_LABEL_OPTS) : null

  function handleChange(newTime: string) {
    if (!newTime) return
    onChange(resolveTimeEdit(value, newTime, anchor))
  }

  return (
    <div>
      <div className="lb-fieldrow">
        <span className="lb-fieldrow__label">{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {dayLabel && <span className="caption">{dayLabel}</span>}
          <input
            type="time"
            value={timeVal}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: 16, fontFamily: 'var(--font-sans)' }}
          />
        </span>
      </div>
      {!value && emptyHint && (
        <p className="caption" style={{ margin: '8px 4px 0' }}>
          {emptyHint}
        </p>
      )}
    </div>
  )
}
