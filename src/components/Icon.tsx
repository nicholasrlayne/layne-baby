import {
  X,
  Plus,
  Minus,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Users,
  KeyRound,
  Copy,
  Share2,
  CalendarDays,
  Check,
  Settings,
  Activity,
  TrendingUp,
  User,
  Pencil,
  Trash2,
  Clock,
  LogOut,
  Milk,
  Droplets,
  Moon,
  Baby,
  Search,
  type LucideProps,
} from 'lucide-react'
import type { ComponentType } from 'react'

const ICONS: Record<string, ComponentType<LucideProps>> = {
  x: X,
  plus: Plus,
  minus: Minus,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  users: Users,
  'key-round': KeyRound,
  copy: Copy,
  'share-2': Share2,
  'calendar-days': CalendarDays,
  check: Check,
  settings: Settings,
  activity: Activity,
  'trending-up': TrendingUp,
  user: User,
  pencil: Pencil,
  'trash-2': Trash2,
  clock: Clock,
  'log-out': LogOut,
  milk: Milk,
  droplets: Droplets,
  moon: Moon,
  baby: Baby,
  search: Search,
}

export type IconName = keyof typeof ICONS

interface IconProps {
  name: string
  size?: number
  color?: string
  strokeWidth?: number
  className?: string
}

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 2, className }: IconProps) {
  const Cmp = ICONS[name]
  if (!Cmp) return null
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} className={className} />
}

export function trackerIcon(tracker: string): string {
  switch (tracker) {
    case 'feed':
      return 'milk'
    case 'pump':
      return 'droplets'
    case 'diaper':
      return 'baby'
    default:
      return 'moon'
  }
}
