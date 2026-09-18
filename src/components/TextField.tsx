import type { InputHTMLAttributes } from 'react'
import { Icon } from './Icon'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  value: string
  onChange: (value: string) => void
  trailingIcon?: string
}

export function TextField({ label, value, onChange, trailingIcon, ...rest }: TextFieldProps) {
  const input = (
    <div className="lb-input">
      <input value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      {trailingIcon && <Icon name={trailingIcon} size={20} color="var(--text-muted)" />}
    </div>
  )
  if (!label) return input
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span className="label">{label}</span>
      {input}
    </div>
  )
}
