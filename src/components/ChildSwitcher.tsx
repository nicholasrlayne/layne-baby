import { Icon } from './Icon'

interface ChildSwitcherProps {
  name: string
  date: string
  onClick?: () => void
  multiple?: boolean
}

export function ChildSwitcher({ name, date, onClick, multiple }: ChildSwitcherProps) {
  const Tag = onClick && multiple ? 'button' : 'div'
  return (
    <Tag className="lb-childswitcher" onClick={onClick} type={onClick ? 'button' : undefined}>
      <span>
        <span className="lb-childswitcher__name">{name}</span>
        <span className="lb-childswitcher__date" style={{ display: 'block' }}>{date}</span>
      </span>
      {multiple && <Icon name="chevron-right" size={20} color="var(--text-muted)" />}
    </Tag>
  )
}
