import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface FieldRowProps {
  label: string
  value?: string
  placeholder?: string
  chevron?: boolean
  onClick?: () => void
  trailing?: ReactNode
}

export function FieldRow({ label, value, placeholder, chevron, onClick, trailing }: FieldRowProps) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className="lb-fieldrow" onClick={onClick} type={onClick ? 'button' : undefined}>
      <span className="lb-fieldrow__label">{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
        {value ? (
          <span className="lb-fieldrow__value">{value}</span>
        ) : placeholder ? (
          <span className="lb-fieldrow__value lb-fieldrow__value--placeholder">{placeholder}</span>
        ) : null}
        {trailing}
        {chevron && <Icon name="chevron-right" size={20} color="var(--text-muted)" />}
      </span>
    </Tag>
  )
}
