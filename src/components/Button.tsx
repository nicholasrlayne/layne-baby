import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon } from './Icon'
import { accentVars } from './accent'
import type { Tracker } from '../lib/types'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'fab'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: Variant
  size?: Size
  accent?: Tracker
  fullWidth?: boolean
  icon?: string
  children?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  accent,
  fullWidth,
  icon,
  children,
  className,
  style,
  ...rest
}: ButtonProps) {
  const classes = [
    'lb-button',
    `lb-button--${variant}`,
    `lb-button--${size}`,
    fullWidth ? 'lb-button--full' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} style={{ ...accentVars(accent), ...style }} {...rest}>
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  )
}
