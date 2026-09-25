import { differenceInMinutes } from 'date-fns'
import type {
  ActivityWithCaregiver,
  BottleData,
  BreastfeedData,
  ComboData,
  DiaperData,
  PumpData,
  SolidsData,
} from './types'
import { formatDuration, formatOz } from './format'

export interface ActivitySummary {
  title: string
  meta?: string
  value: string
  unit?: string
}

/**
 * Nights run long and often start in the evening; naps are short and happen
 * mid-day. Either signal alone can be wrong (a late catnap, an unusually
 * long afternoon nap), so a session counts as overnight if it starts in the
 * evening/night window or simply runs long enough to be a night's sleep.
 */
export function classifySleepType(startedAt: string, endedAt: string): 'Overnight Sleep' | 'Nap' {
  const startHour = new Date(startedAt).getHours()
  const isNightStart = startHour >= 18 || startHour < 6
  const isLongStretch = differenceInMinutes(new Date(endedAt), new Date(startedAt)) >= 300
  return isNightStart || isLongStretch ? 'Overnight Sleep' : 'Nap'
}

export function summarizeActivity(activity: ActivityWithCaregiver): ActivitySummary {
  const data = activity.data as Record<string, unknown>

  switch (activity.type) {
    case 'feed_breastfeed': {
      const d = data as unknown as BreastfeedData
      const total = (d.left_min ?? 0) + (d.right_min ?? 0)
      return {
        title: 'Breast',
        meta: d.left_min && d.right_min ? 'left · right' : d.left_min ? 'left side' : 'right side',
        value: formatDuration(total),
      }
    }
    case 'feed_bottle': {
      const d = data as unknown as BottleData
      return {
        title: 'Bottle',
        meta: d.formula_type || undefined,
        value: formatOz(d.amount_oz ?? 0),
        unit: 'oz',
      }
    }
    case 'feed_solids': {
      const d = data as unknown as SolidsData
      const foods = d.foods ?? []
      return {
        title: 'Solids',
        meta: foods.length ? foods.slice(0, 3).join(', ') : d.meal_type,
        value: foods.length ? String(foods.length) : '0',
        unit: foods.length === 1 ? 'food' : 'foods',
      }
    }
    case 'feed_combo': {
      const d = data as unknown as ComboData
      const total = (d.left_min ?? 0) + (d.right_min ?? 0)
      return {
        title: 'Combo',
        meta: `${formatDuration(total)} breast + ${formatOz(d.amount_oz ?? 0)} oz`,
        value: formatOz(d.amount_oz ?? 0),
        unit: 'oz',
      }
    }
    case 'pump': {
      const d = data as unknown as PumpData
      const total = (d.left_oz ?? 0) + (d.right_oz ?? 0)
      return {
        title: 'Pump',
        meta: d.left_oz && d.right_oz ? 'both sides' : d.left_oz ? 'left side' : 'right side',
        value: formatOz(total),
        unit: 'oz',
      }
    }
    case 'diaper': {
      const d = data as unknown as DiaperData
      const title = d.wet && d.dirty ? 'Both' : d.dirty ? 'Dirty' : 'Wet'
      return {
        title,
        meta: d.flags?.length ? d.flags.join(', ') : undefined,
        value: '',
      }
    }
    case 'sleep': {
      if (!activity.ended_at) {
        return { title: 'Sleep', meta: 'in progress', value: '' }
      }
      const mins = differenceInMinutes(new Date(activity.ended_at), new Date(activity.started_at))
      return { title: 'Sleep', value: formatDuration(mins) }
    }
    default:
      return { title: activity.type, value: '' }
  }
}
