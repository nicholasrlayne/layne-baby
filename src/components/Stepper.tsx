import { IconButton } from './IconButton'

interface StepperRowProps {
  label: string
  value: number
  unit: string
  onChange: (next: number) => void
  step?: number
  min?: number
}

export function StepperRow({ label, value, unit, onChange, step = 1, min = 0 }: StepperRowProps) {
  return (
    <div className="lb-stepper-row">
      <span className="heading">{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <IconButton icon="minus" label={`Less ${label}`} size="sm" onClick={() => onChange(Math.max(min, value - step))} />
        <span className="lb-stepper-value tabular">
          {value}
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginLeft: 3 }}>
            {unit}
          </span>
        </span>
        <IconButton icon="plus" label={`More ${label}`} size="sm" onClick={() => onChange(value + step)} />
      </span>
    </div>
  )
}
