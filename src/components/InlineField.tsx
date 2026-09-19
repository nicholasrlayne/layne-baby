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

export function toLocalInputValue(iso: string): string {
  const d = new Date(iso)
  const offsetMs = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16)
}

export function fromLocalInputValue(local: string): string {
  return new Date(local).toISOString()
}

export function toLocalDateValue(iso: string): string {
  return toLocalInputValue(iso).slice(0, 10)
}

export function toLocalTimeValue(iso: string): string {
  return toLocalInputValue(iso).slice(11, 16)
}

export function combineLocalDateTime(dateStr: string, timeStr: string): string {
  return fromLocalInputValue(`${dateStr}T${timeStr}`)
}

interface DateTimeFieldProps {
  dateLabel: string
  timeLabel: string
  value: string | null
  onChange: (iso: string) => void
  disabled?: boolean
  emptyHint?: string
}

const inputStyle = { textAlign: 'right' as const, color: 'var(--text-secondary)', fontSize: 16, fontFamily: 'var(--font-sans)' }

export function DateTimeField({ dateLabel, timeLabel, value, onChange, disabled, emptyHint }: DateTimeFieldProps) {
  const now = () => new Date().toISOString()
  const dateVal = value ? toLocalDateValue(value) : ''
  const timeVal = value ? toLocalTimeValue(value) : ''

  function handleDateChange(newDate: string) {
    if (!newDate) return
    onChange(combineLocalDateTime(newDate, timeVal || toLocalTimeValue(now())))
  }

  function handleTimeChange(newTime: string) {
    if (!newTime) return
    onChange(combineLocalDateTime(dateVal || toLocalDateValue(now()), newTime))
  }

  return (
    <div>
      <div className="lb-fieldrow">
        <span className="lb-fieldrow__label">{dateLabel}</span>
        <input type="date" value={dateVal} onChange={(e) => handleDateChange(e.target.value)} disabled={disabled} style={inputStyle} />
      </div>
      <div className="lb-fieldrow">
        <span className="lb-fieldrow__label">{timeLabel}</span>
        <input type="time" value={timeVal} onChange={(e) => handleTimeChange(e.target.value)} disabled={disabled} style={inputStyle} />
      </div>
      {!value && emptyHint && (
        <p className="caption" style={{ margin: '8px 4px 0' }}>
          {emptyHint}
        </p>
      )}
    </div>
  )
}
