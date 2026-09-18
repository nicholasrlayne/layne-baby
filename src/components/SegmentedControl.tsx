import { accentVars } from './accent'
import type { Tracker } from '../lib/types'

interface SegmentedControlProps<T extends string> {
  options: T[]
  value: T
  onChange: (value: T) => void
  accent?: Tracker
  height?: number
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accent,
  height = 48,
}: SegmentedControlProps<T>) {
  return (
    <div className="lb-segmented" style={{ height, ...accentVars(accent) }} role="tablist">
      {options.map((opt) => (
        <button
          key={opt}
          role="tab"
          aria-selected={opt === value}
          className={`lb-segmented__opt${opt === value ? ' lb-segmented__opt--active' : ''}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
