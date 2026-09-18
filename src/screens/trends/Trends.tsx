import { useEffect, useMemo, useState } from 'react'
import { format, isToday, startOfDay, subDays } from 'date-fns'
import { useAppData } from '../../app/AppDataContext'
import { SegmentedControl } from '../../components/SegmentedControl'
import { Badge } from '../../components/Badge'
import { TRACKER_LABEL } from '../../components/accent'
import { listActivitiesForChild } from '../../lib/api'
import { formatDuration, formatOz } from '../../lib/format'
import type { ActivityWithCaregiver, Tracker } from '../../lib/types'

const TRACKERS: Tracker[] = ['feed', 'pump', 'diaper', 'sleep']
const RANGE_OPTIONS = ['1d', '7d', '14d'] as const
type RangeOption = (typeof RANGE_OPTIONS)[number]
const RANGE_DAYS: Record<RangeOption, number> = { '1d': 1, '7d': 7, '14d': 14 }

function trackerOf(type: string): Tracker {
  if (type.startsWith('feed')) return 'feed'
  if (type === 'pump') return 'pump'
  if (type === 'diaper') return 'diaper'
  return 'sleep'
}

export function Trends() {
  const { activeChild, activitiesVersion } = useAppData()
  const [range, setRange] = useState<RangeOption>('7d')
  const [activeTracker, setActiveTracker] = useState<Tracker>('feed')
  const [entries, setEntries] = useState<ActivityWithCaregiver[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeChild) return
    setLoading(true)
    const since = startOfDay(subDays(new Date(), 13)).toISOString()
    listActivitiesForChild(activeChild.id, { since, limit: 1000 }).then((rows) => {
      setEntries(rows)
      setLoading(false)
    })
  }, [activeChild, activitiesVersion])

  const rangeDays = RANGE_DAYS[range]
  const rangeStart = useMemo(() => startOfDay(subDays(new Date(), rangeDays - 1)), [rangeDays])
  const inRange = useMemo(() => entries.filter((e) => new Date(e.started_at) >= rangeStart), [entries, rangeStart])

  const counts = useMemo(() => {
    const byTracker: Record<Tracker, ActivityWithCaregiver[]> = { feed: [], pump: [], diaper: [], sleep: [] }
    for (const e of inRange) byTracker[trackerOf(e.type)].push(e)
    return byTracker
  }, [inRange])

  const last7Days = useMemo(() => Array.from({ length: 7 }).map((_, i) => startOfDay(subDays(new Date(), 6 - i))), [])

  const dailyCounts = useMemo(() => {
    const activeEntries = entries.filter((e) => trackerOf(e.type) === activeTracker)
    return last7Days.map((day) => {
      const count = activeEntries.filter((e) => startOfDay(new Date(e.started_at)).getTime() === day.getTime()).length
      return { day, count }
    })
  }, [entries, activeTracker, last7Days])

  const maxCount = Math.max(1, ...dailyCounts.map((d) => d.count))

  function counterValue(tracker: Tracker): string {
    const list = counts[tracker]
    if (tracker === 'sleep') {
      const totalMin = list.reduce((sum, e) => {
        if (!e.ended_at) return sum
        return sum + Math.round((new Date(e.ended_at).getTime() - new Date(e.started_at).getTime()) / 60000)
      }, 0)
      return formatDuration(totalMin)
    }
    return String(list.length)
  }

  function badgesFor(tracker: Tracker) {
    const list = counts[tracker]
    if (tracker === 'feed') {
      const bottle = list.filter((e) => e.type === 'feed_bottle').length
      const breast = list.filter((e) => e.type === 'feed_breastfeed').length
      const total = breast + bottle || 1
      return [
        `${list.length} feed${list.length === 1 ? '' : 's'}`,
        `Breast ${Math.round((breast / total) * 100)}%`,
        `Bottle ${Math.round((bottle / total) * 100)}%`,
      ]
    }
    if (tracker === 'pump') {
      const totalOz = list.reduce((sum, e) => {
        const d = e.data as Record<string, unknown>
        return sum + Number(d.left_oz ?? 0) + Number(d.right_oz ?? 0)
      }, 0)
      return [`${list.length} pumps`, `${formatOz(totalOz)} oz total`]
    }
    if (tracker === 'diaper') {
      const wet = list.filter((e) => (e.data as Record<string, unknown>).wet).length
      const dirty = list.filter((e) => (e.data as Record<string, unknown>).dirty).length
      return [`${list.length} changes`, `${wet} wet`, `${dirty} dirty`]
    }
    return [`${list.length} naps`, counterValue('sleep')]
  }

  const avgLabel = useMemo(() => {
    const list = counts[activeTracker]
    if (activeTracker === 'sleep') {
      const totalMin = list.reduce((sum, e) => {
        if (!e.ended_at) return sum
        return sum + Math.round((new Date(e.ended_at).getTime() - new Date(e.started_at).getTime()) / 60000)
      }, 0)
      return `Averaged ${formatDuration(Math.round(totalMin / rangeDays))} of sleep per day.`
    }
    const avg = (list.length / rangeDays).toFixed(1)
    return `Averaged ${avg} ${TRACKER_LABEL[activeTracker].toLowerCase()}${Number(avg) === 1 ? '' : 's'} per day.`
  }, [counts, activeTracker, rangeDays])

  if (loading) return <div className="lb-empty-state">Loading…</div>

  return (
    <>
      <h1 className="heading-lg">Trends</h1>
      <SegmentedControl options={[...RANGE_OPTIONS]} value={range} onChange={setRange} />

      <div className="lb-card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--border-subtle)' }}>
          {TRACKERS.map((tracker) => (
            <button
              key={tracker}
              onClick={() => setActiveTracker(tracker)}
              style={{
                padding: '12px 4px',
                textAlign: 'center',
                borderBottom: `2px solid ${tracker === activeTracker ? `var(--track-${tracker}-fill)` : 'transparent'}`,
              }}
            >
              <span
                className="sans"
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  color: tracker === activeTracker ? `var(--track-${tracker}-ink)` : 'var(--text-muted)',
                }}
              >
                {TRACKER_LABEL[tracker]}
              </span>
              <span
                className="serif tabular"
                style={{ display: 'block', marginTop: 3, fontSize: 22, color: tracker === activeTracker ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              >
                {counterValue(tracker)}
              </span>
            </button>
          ))}
        </div>

        <div style={{ padding: '20px 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 150 }} className="tabular">
            {dailyCounts.map(({ day, count }, i) => (
              <span key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                <span
                  style={{
                    width: '100%',
                    borderRadius: '4px 4px 0 0',
                    height: `${Math.max(4, (count / maxCount) * 100)}%`,
                    background: isToday(day) ? `var(--track-${activeTracker}-fill)` : `var(--track-${activeTracker}-tint)`,
                  }}
                />
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {dailyCounts.map(({ day }, i) => (
              <span
                key={i}
                className="sans"
                style={{ flex: 1, textAlign: 'center', fontSize: 12, color: isToday(day) ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: isToday(day) ? 600 : 400 }}
              >
                {format(day, 'EE').slice(0, 2)}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '0 16px 16px' }}>
          {badgesFor(activeTracker).map((label, i) => (
            <Badge key={label} tone={i === 0 ? 'accent' : 'neutral'} accent={i === 0 ? activeTracker : undefined}>
              {label}
            </Badge>
          ))}
        </div>
      </div>
      <p className="caption" style={{ margin: 0 }}>{avgLabel}</p>
    </>
  )
}
