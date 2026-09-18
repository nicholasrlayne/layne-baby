import { Icon } from './Icon'

export interface TabItem {
  id: string
  label: string
  icon: string
}

interface TabBarProps {
  items: TabItem[]
  value: string
  onChange: (id: string) => void
}

export function TabBar({ items, value, onChange }: TabBarProps) {
  return (
    <nav className="lb-tabbar">
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            className={`lb-tabbar__item${active ? ' lb-tabbar__item--active' : ''}`}
            onClick={() => onChange(item.id)}
          >
            <Icon name={item.icon} size={22} />
            <span className="lb-tabbar__label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
