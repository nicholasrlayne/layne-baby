import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { getMyCaregiver, listCaregivers, listChildren } from '../lib/api'
import type { Caregiver, Child, Family } from '../lib/types'

interface AppData {
  session: Session | null
  authLoading: boolean
  caregiver: Caregiver | null
  family: Family | null
  caregivers: Caregiver[]
  children: Child[]
  activeChildId: string | null
  activeChild: Child | null
  setActiveChildId: (id: string) => void
  bootstrapLoading: boolean
  activitiesVersion: number
  refreshCaregiver: () => Promise<void>
  refreshChildren: () => Promise<void>
  refreshCaregivers: () => Promise<void>
}

const AppDataCtx = createContext<AppData | null>(null)

export function AppDataProvider({ children: reactChildren }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [caregiver, setCaregiver] = useState<(Caregiver & { families: Family | null }) | null>(null)
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [childrenList, setChildrenList] = useState<Child[]>([])
  const [activeChildId, setActiveChildId] = useState<string | null>(null)
  const [bootstrapLoading, setBootstrapLoading] = useState(true)
  const [activitiesVersion, setActivitiesVersion] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const refreshCaregiver = useCallback(async () => {
    if (!session) {
      setCaregiver(null)
      return
    }
    const row = await getMyCaregiver()
    setCaregiver(row as (Caregiver & { families: Family | null }) | null)
  }, [session])

  const refreshChildren = useCallback(async () => {
    const familyId = caregiver?.family_id
    if (!familyId) {
      setChildrenList([])
      return
    }
    const rows = await listChildren(familyId)
    setChildrenList(rows)
  }, [caregiver?.family_id])

  const refreshCaregivers = useCallback(async () => {
    const familyId = caregiver?.family_id
    if (!familyId) {
      setCaregivers([])
      return
    }
    const rows = await listCaregivers(familyId)
    setCaregivers(rows)
  }, [caregiver?.family_id])

  useEffect(() => {
    if (!session) {
      setBootstrapLoading(false)
      return
    }
    setBootstrapLoading(true)
    refreshCaregiver().finally(() => setBootstrapLoading(false))
  }, [session, refreshCaregiver])

  useEffect(() => {
    if (caregiver?.family_id) {
      refreshChildren()
      refreshCaregivers()
    } else {
      setChildrenList([])
      setCaregivers([])
    }
  }, [caregiver?.family_id, refreshChildren, refreshCaregivers])

  useEffect(() => {
    if (childrenList.length && !activeChildId) {
      setActiveChildId(childrenList[0].id)
    }
    if (activeChildId && !childrenList.find((c) => c.id === activeChildId)) {
      setActiveChildId(childrenList[0]?.id ?? null)
    }
  }, [childrenList, activeChildId])

  const familyId = caregiver?.family_id ?? null

  useEffect(() => {
    if (!familyId) return
    const channel = supabase
      .channel(`family-${familyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities', filter: `family_id=eq.${familyId}` },
        () => setActivitiesVersion((v) => v + 1),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'children', filter: `family_id=eq.${familyId}` },
        () => refreshChildren(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'caregivers', filter: `family_id=eq.${familyId}` },
        () => refreshCaregivers(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [familyId, refreshChildren, refreshCaregivers])

  const activeChild = useMemo(
    () => childrenList.find((c) => c.id === activeChildId) ?? null,
    [childrenList, activeChildId],
  )

  const value: AppData = {
    session,
    authLoading,
    caregiver,
    family: caregiver?.families ?? null,
    caregivers,
    children: childrenList,
    activeChildId,
    activeChild,
    setActiveChildId,
    bootstrapLoading,
    activitiesVersion,
    refreshCaregiver,
    refreshChildren,
    refreshCaregivers,
  }

  return <AppDataCtx.Provider value={value}>{reactChildren}</AppDataCtx.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataCtx)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
