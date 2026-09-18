import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppData } from '../../app/AppDataContext'
import { SegmentedControl } from '../../components/SegmentedControl'
import { EntryRow } from '../../components/EntryRow'
import { listActivitiesForChild } from '../../lib/api'
import { formatClockTime, formatDayGroup, formatDuration, formatOz } from '../../lib/format'
import { summarizeActivity } from '../../lib/activitySummary'
import { caregiverName, type ActivityWithCaregiver, type Tracker } from '../../lib/types'

const FILTER_TYPES: Record<Tracker, string[]> = {
  feed: ['feed_breastfeed', 'feed_bottle', 'feed_solids', 'feed_combo'],
  pump: ['pump'],
  diaper: ['diaper'],
  sleep: ['sleep'],
}

const FILTERS = ['Feed', 'Pump', 'Diaper', 'Sleep'] as const
type FilterLabel = (typeof FILTERS)[number]
const LABEL_TO_TRACKER: Record<FilterLabel, Tracker> = { Feed: 'feed', Pump: 'pump', Diaper: 'diaper', Sleep: 'sleep' }

function loggerPath(type: string): string {
  if (type.startsWith('feed')) return 'feed'
  return type
}

function dayKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function summarizeDay(tracker: Tracker, entries: ActivityWithCaregiver[]): string {
  const count = entries.length
  if (tracker === 'diaper') return `${count} change${count === 1 ? '' : 's'}`
  if (tracker === 'sleep') {
    const totalMin = entries.reduce((sum, e) => {
      if (!e.ended_at) return sum
      return sum + Math.round((new Date(e.ended_at).getTime() - new Date(e.started_at).getTime()) / 60000)
    }, 0)
    return `${count} nap${count === 1 ? '' : 's'} · ${formatDuration(totalMin)}`
  }
  if (tracker === 'pump') {
    const totalOz = entries.reduce((sum, e) => {
      const d = e.data as Record<string, unknown>
      return sum + Number(d.left_oz ?? 0) + Number(d.right_oz ?? 0)
    }, 0)
    return `${count} pump${count === 1 ? '' : 's'} · ${formatOz(totalOz)} oz`
  }
  const totalOz = entries.reduce((sum, e) => {
    const d = e.data as Record<string, unknown>
    return sum + Number(d.amount_oz ?? 0)
  }, 0)
  return totalOz > 0 ? `${count} feed${count === 1 ? '' : 's'} · ${formatOz(totalOz)} oz` : `${count} feed${count === 1 ? '' : 's'}`
}

export function History() {
  const navigate = useNavigate()
  const { activeChild, activitiesVersion } = useAppData()
  const [filter, setFilter] = useState<FilterLabel>('Feed')
  const [entries, setEntries] = useState<ActivityWithCaregiver[]>([])
  const [loading, setLoading] = useState(true)

  const tracker = LABEL_TO_TRACKER[filter]

  useEffect(() => {
    if (!activeChild) return
    setLoading(true)
    listActivitiesForChild(activeChild.id, { types: FILTER_TYPES[tracker] as never[], limit: 200 }).then((rows) => {
      setEntries(rows)
      setLoading(false)
    })
  }, [activeChild, tracker, activitiesVersion])

  const groups = useMemo(() => {
    const map = new Map<string, ActivityWithCaregiver[]>()
    for (const e of entries) {
      const key = dayKey(e.started_at)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }
    return Array.from(map.entries())
  }, [entries])

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h1 className="heading-lg">History</h1>
        <SegmentedControl options={[...FILTERS]} value={filter} onChange={setFilter} accent={tracker} />
      </div>

      {loading ? (
        <div className="lb-empty-state">Loading…</div>
      ) : groups.length === 0 ? (
        <div className="lb-empty-state">No {filter.toLowerCase()} entries logged yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {groups.map(([key, dayEntries]) => (
            <div key={key}>
              <div style={{ padding: '10px 0 6px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span className="label">{formatDayGroup(dayEntries[0].started_at)}</span>
                <span className="caption">{summarizeDay(tracker, dayEntries)}</span>
              </div>
              <div className="lb-card">
                {dayEntries.map((entry) => {
                  const summary = summarizeActivity(entry)
                  return (
                    <EntryRow
                      key={entry.id}
                      tracker={tracker}
                      title={summary.title}
                      meta={summary.meta}
                      time={formatClockTime(entry.started_at)}
                      value={summary.value ? `${summary.value}${summary.unit ? ` ${summary.unit}` : ''}` : entry.ended_at ? '' : 'running'}
                      caregiver={caregiverName(entry)}
                      onClick={() => navigate(`/app/log/${loggerPath(entry.type)}?entryId=${entry.id}`)}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
