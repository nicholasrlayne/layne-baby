interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`lb-switch${checked ? ' lb-switch--on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="lb-switch__thumb" />
    </button>
  )
}
