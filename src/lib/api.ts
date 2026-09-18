import { supabase } from './supabase'
import type {
  ActivityData,
  ActivityType,
  ActivityWithCaregiver,
} from './types'
import type { TablesInsert, TablesUpdate } from './database.types'

// --- Auth ---

export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// --- Caregiver / family ---

export async function getMyCaregiver() {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return null
  const { data, error } = await supabase
    .from('caregivers')
    .select('*, families(*)')
    .eq('id', user.user.id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createFamily(familyName: string) {
  const { data, error } = await supabase.rpc('create_family', { family_name: familyName })
  if (error) throw error
  return data
}

export async function joinFamily(code: string) {
  const { data, error } = await supabase.rpc('join_family', { code })
  if (error) throw error
  return data
}

export async function updateDisplayName(newName: string) {
  const { error } = await supabase.rpc('update_display_name', { new_name: newName })
  if (error) throw error
}

export async function listCaregivers(familyId: string) {
  const { data, error } = await supabase
    .from('caregivers')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

// --- Children ---

export async function listChildren(familyId: string) {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function addChild(child: TablesInsert<'children'>) {
  const { data, error } = await supabase.from('children').insert(child).select().single()
  if (error) throw error
  return data
}

export async function updateChild(id: string, patch: TablesUpdate<'children'>) {
  const { data, error } = await supabase.from('children').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}

// --- Foods ---

export async function listFoods(familyId: string) {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .or(`family_id.is.null,family_id.eq.${familyId}`)
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

// --- Activities ---

const ACTIVITY_SELECT = '*, caregivers(display_name)'

export async function listActivitiesForChild(
  childId: string,
  opts: { types?: ActivityType[]; since?: string; limit?: number } = {},
): Promise<ActivityWithCaregiver[]> {
  let query = supabase
    .from('activities')
    .select(ACTIVITY_SELECT)
    .eq('child_id', childId)
    .order('started_at', { ascending: false })

  if (opts.types?.length) query = query.in('type', opts.types)
  if (opts.since) query = query.gte('started_at', opts.since)
  if (opts.limit) query = query.limit(opts.limit)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as ActivityWithCaregiver[]
}

export async function getLastActivity(
  childId: string,
  types: ActivityType[],
): Promise<ActivityWithCaregiver | null> {
  const { data, error } = await supabase
    .from('activities')
    .select(ACTIVITY_SELECT)
    .eq('child_id', childId)
    .in('type', types)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as unknown as ActivityWithCaregiver | null
}

export async function getActivityById(id: string): Promise<ActivityWithCaregiver | null> {
  const { data, error } = await supabase
    .from('activities')
    .select(ACTIVITY_SELECT)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as unknown as ActivityWithCaregiver | null
}

export async function getRunningActivity(
  childId: string,
  types: ActivityType[],
): Promise<ActivityWithCaregiver | null> {
  const { data, error } = await supabase
    .from('activities')
    .select(ACTIVITY_SELECT)
    .eq('child_id', childId)
    .in('type', types)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as unknown as ActivityWithCaregiver | null
}

export interface NewActivity {
  family_id: string
  child_id: string
  caregiver_id: string
  type: ActivityType
  started_at: string
  ended_at?: string | null
  notes?: string | null
  data?: ActivityData
}

export async function createActivity(activity: NewActivity) {
  const { data, error } = await supabase
    .from('activities')
    .insert(activity as TablesInsert<'activities'>)
    .select(ACTIVITY_SELECT)
    .single()
  if (error) throw error
  return data as unknown as ActivityWithCaregiver
}

export async function updateActivity(id: string, patch: TablesUpdate<'activities'>) {
  const { data, error } = await supabase
    .from('activities')
    .update(patch)
    .eq('id', id)
    .select(ACTIVITY_SELECT)
    .single()
  if (error) throw error
  return data as unknown as ActivityWithCaregiver
}

export async function deleteActivity(id: string) {
  const { error } = await supabase.from('activities').delete().eq('id', id)
  if (error) throw error
}

export async function countTodayDiapers(childId: string) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const { count, error } = await supabase
    .from('activities')
    .select('id', { count: 'exact', head: true })
    .eq('child_id', childId)
    .eq('type', 'diaper')
    .gte('started_at', start.toISOString())
  if (error) throw error
  return count ?? 0
}
