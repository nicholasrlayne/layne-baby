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
