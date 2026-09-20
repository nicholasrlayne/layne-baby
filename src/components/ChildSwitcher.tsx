import { Icon } from './Icon'

interface ChildSwitcherProps {
  name: string
  date: string
  /** Tapping the name/date switches to the next child in the family. */
  onSwitch?: () => void
  /** Tapping the chevron opens the full children menu (Family Hub). */
  onOpenMenu?: () => void
  multiple?: boolean
}

export function ChildSwitcher({ name, date, onSwitch, onOpenMenu, multiple }: ChildSwitcherProps) {
  const NameTag = multiple && onSwitch ? 'button' : 'div'
  return (
    <div className="lb-childswitcher">
      <NameTag
        className="lb-childswitcher__row"
        onClick={multiple ? onSwitch : undefined}
        type={multiple && onSwitch ? 'button' : undefined}
      >
        <span className="lb-childswitcher__name">{name}</span>
        <span className="lb-childswitcher__date" style={{ display: 'block' }}>{date}</span>
      </NameTag>
      {multiple && (
        <button
          className="lb-childswitcher__chevron"
          type="button"
          onClick={onOpenMenu}
          aria-label="Manage children"
        >
          <Icon name="chevron-right" size={20} color="var(--text-muted)" />
        </button>
      )}
    </div>
  )
}
