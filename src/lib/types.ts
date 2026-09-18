import type { Tables } from './database.types'

export type Family = Tables<'families'>
export type Caregiver = Tables<'caregivers'>
export type Child = Tables<'children'>
export type Food = Tables<'foods'>
export type ActivityRow = Tables<'activities'>

export type ActivityType =
  | 'feed_breastfeed'
  | 'feed_bottle'
  | 'feed_solids'
  | 'feed_combo'
  | 'pump'
  | 'diaper'
  | 'sleep'

export type Tracker = 'feed' | 'pump' | 'diaper' | 'sleep'

export const TRACKERS: Tracker[] = ['feed', 'pump', 'sleep', 'diaper']

export function trackerForType(type: ActivityType): Tracker {
  if (type.startsWith('feed')) return 'feed'
  if (type === 'pump') return 'pump'
  if (type === 'diaper') return 'diaper'
  return 'sleep'
}

export interface BreastfeedData {
  left_min: number
  right_min: number
  last_side?: 'left' | 'right'
}

export interface BottleData {
  amount_oz: number
  formula_type?: string
}

export interface SolidsData {
  meal_type?: string
  foods: string[]
}

export interface ComboData extends BreastfeedData, BottleData {}

export interface PumpData {
  left_oz: number
  right_oz: number
}

export interface DiaperData {
  wet: boolean
  dirty: boolean
  flags: string[]
  texture?: string
  color?: string
}

export type ActivityData =
  | BreastfeedData
  | BottleData
  | SolidsData
  | ComboData
  | PumpData
  | DiaperData
  | Record<string, never>

export interface ActivityWithCaregiver extends ActivityRow {
  caregivers: { display_name: string } | null
}

export function caregiverName(activity: ActivityWithCaregiver | null | undefined): string {
  return activity?.caregivers?.display_name ?? 'Unknown'
}
