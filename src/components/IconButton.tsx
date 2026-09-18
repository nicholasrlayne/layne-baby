import type { ButtonHTMLAttributes } from 'react'
import { Icon } from './Icon'

type Size = 'sm' | 'md' | 'lg' | 'fab'
type Variant = 'ghost' | 'solid' | 'on-accent'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  icon: string
  label: string
  size?: Size
  variant?: Variant
  iconSize?: number
}

const SIZE_ICON: Record<Size, number> = { sm: 18, md: 20, lg: 22, fab: 26 }

export function IconButton({
  icon,
  label,
  size = 'md',
  variant = 'ghost',
  iconSize,
  className,
  ...rest
}: IconButtonProps) {
  const classes = ['lb-iconbutton', `lb-iconbutton--${size}`, `lb-iconbutton--${variant}`, className ?? '']
    .filter(Boolean)
    .join(' ')
  return (
    <button className={classes} aria-label={label} {...rest}>
      <Icon name={icon} size={iconSize ?? SIZE_ICON[size]} />
    </button>
  )
}
