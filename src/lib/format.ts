import {
  differenceInCalendarDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInYears,
  format,
  isToday,
  isYesterday,
} from 'date-fns'
import type { Child } from './types'

export function formatChildAge(child: Pick<Child, 'birthdate'>): string {
  if (!child.birthdate) return ''
  const birth = new Date(child.birthdate)
  const years = differenceInYears(new Date(), birth)
  if (years >= 2) return `${years} years`
  const months = differenceInMonths(new Date(), birth)
  if (months >= 1) return `${months} month${months === 1 ? '' : 's'}`
  const days = differenceInCalendarDays(new Date(), birth)
  return `${days} day${days === 1 ? '' : 's'}`
}

export function formatClockTime(iso: string): string {
  return format(new Date(iso), 'h:mmaaa').replace('AM', 'am').replace('PM', 'pm')
}

export function formatDateHeader(date: Date = new Date()): string {
  return format(date, 'EEE, MMM d')
}

export function formatDayGroup(iso: string): string {
  const d = new Date(iso)
  const yearSuffix = d.getFullYear() !== new Date().getFullYear() ? `, ${d.getFullYear()}` : ''
  if (isToday(d)) return `Today, ${format(d, 'MMM d')}${yearSuffix}`
  if (isYesterday(d)) return `Yesterday, ${format(d, 'MMM d')}${yearSuffix}`
  return `${format(d, 'EEEE, MMM d')}${yearSuffix}`
}

export function formatCompactDate(iso: string): string {
  const d = new Date(iso)
  if (isToday(d)) return ''
  if (isYesterday(d)) return 'Yesterday'
  const yearSuffix = d.getFullYear() !== new Date().getFullYear() ? `, ${d.getFullYear()}` : ''
  return `${format(d, 'MMM d')}${yearSuffix}`
}

export function timeAgo(iso: string): string {
  const now = new Date()
  const then = new Date(iso)
  const mins = differenceInMinutes(now, then)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = differenceInHours(now, then)
  const remMins = mins - hours * 60
  if (hours < 24) return remMins > 0 ? `${hours}h ${remMins}m ago` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function formatDuration(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes}m`
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function formatOz(oz: number): string {
  return Number.isInteger(oz) ? String(oz) : oz.toFixed(1)
}
