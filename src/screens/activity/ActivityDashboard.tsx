import { useEffect, useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppData } from '../../app/AppDataContext'
import { ChildSwitcher } from '../../components/ChildSwitcher'
import { TrackerCard } from '../../components/TrackerCard'
import { IconButton } from '../../components/IconButton'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { accentVars, TRACKER_LABEL } from '../../components/accent'
import { formatElapsed, useElapsedSeconds } from '../../lib/useElapsed'
import { formatChildAge, formatClockTime, formatDateHeader, timeAgo } from '../../lib/format'
import { summarizeActivity } from '../../lib/activitySummary'
import { caregiverName, trackerForType, type ActivityWithCaregiver, type Tracker } from '../../lib/types'
import { countTodayDiapers, getLastActivity, getRunningActivity, updateActivity } from '../../lib/api'

const TRACKER_TYPES: Record<Tracker, string[]> = {
  feed: ['feed_breastfeed', 'feed_bottle', 'feed_solids', 'feed_combo'],
  pump: ['pump'],
  sleep: ['sleep'],
  diaper: ['diaper'],
}

function RunningCard({ activity, onStopped }: { activity: ActivityWithCaregiver; onStopped: () => void }) {
  const navigate = useNavigate()
  const tracker = trackerForType(activity.type as never)
  const elapsed = useElapsedSeconds(activity.started_at, true)
  const [stopping, setStopping] = useState(false)

  function openLogger() {
    navigate(`/app/log/${tracker}`)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openLogger()
    }
  }

  async function handleStop(e: MouseEvent) {
    e.stopPropagation()
    setStopping(true)
    try {
      await updateActivity(activity.id, { ended_at: new Date().toISOString() })
      onStopped()
    } finally {
      setStopping(false)
    }
  }

  return (
    <div
      className="lb-card"
      style={{ ...accentVars(tracker), overflow: 'hidden', cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      onClick={openLogger}
      onKeyDown={handleKeyDown}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: 'var(--accent-fill)', color: 'var(--text-on-accent)', padding: '8px 16px' }}>
        <span className="heading" style={{ color: 'var(--text-on-accent)' }}>{TRACKER_LABEL[tracker]}</span>
        <span className="sans" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>Running</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px' }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="serif tabular" style={{ display: 'block', fontSize: 36, lineHeight: 1, color: 'var(--accent-ink)' }}>
            {formatElapsed(elapsed)}
          </span>
          <span className="body-text" style={{ display: 'block', marginTop: 6 }}>
            started {formatClockTime(activity.started_at)} · {caregiverName(activity)}
          </span>
        </span>
        <Button size="md" accent={tracker} onClick={handleStop} disabled={stopping}>
          {stopping ? 'Stopping…' : 'Stop'}
        </Button>
      </div>
    </div>
  )
}

export function ActivityDashboard() {
  const navigate = useNavigate()
  const { activeChild, children, activitiesVersion } = useAppData()
  const [lastFeed, setLastFeed] = useState<ActivityWithCaregiver | null>(null)
  const [lastPump, setLastPump] = useState<ActivityWithCaregiver | null>(null)
  const [lastSleep, setLastSleep] = useState<ActivityWithCaregiver | null>(null)
  const [lastDiaper, setLastDiaper] = useState<ActivityWithCaregiver | null>(null)
  const [runningPump, setRunningPump] = useState<ActivityWithCaregiver | null>(null)
  const [runningSleep, setRunningSleep] = useState<ActivityWithCaregiver | null>(null)
  const [diaperCount, setDiaperCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  useEffect(() => {
    if (!activeChild) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      getLastActivity(activeChild.id, TRACKER_TYPES.feed as never[]),
      getLastActivity(activeChild.id, TRACKER_TYPES.pump as never[]),
      getLastActivity(activeChild.id, TRACKER_TYPES.sleep as never[]),
      getLastActivity(activeChild.id, TRACKER_TYPES.diaper as never[]),
      getRunningActivity(activeChild.id, TRACKER_TYPES.pump as never[]),
      getRunningActivity(activeChild.id, TRACKER_TYPES.sleep as never[]),
      countTodayDiapers(activeChild.id),
    ]).then(([feed, pump, sleep, diaper, runPump, runSleep, count]) => {
      if (cancelled) return
      setLastFeed(feed)
      setLastPump(pump)
      setLastSleep(sleep)
      setLastDiaper(diaper)
      setRunningPump(runPump)
      setRunningSleep(runSleep)
      setDiaperCount(count)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [activeChild, activitiesVersion])

  if (!activeChild) return null

  const running = runningPump ?? runningSleep
  const runningTracker = running ? trackerForType(running.type as never) : null
  const trackerOrder: Tracker[] = ['feed', 'pump', 'sleep', 'diaper']

  return (
    <>
      <ChildSwitcher
        name={activeChild.first_name}
        date={`${formatDateHeader()} · ${formatChildAge(activeChild)}`}
        multiple
        onClick={() => navigate('/app/hub')}
      />

      {running && (
        <RunningCard
          activity={running}
          onStopped={() => {
            setRunningPump(null)
            setRunningSleep(null)
          }}
        />
      )}

      {loading ? (
        <div className="lb-empty-state">Loading…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {trackerOrder
            .filter((t) => t !== runningTracker)
            .map((tracker) => {
              if (tracker === 'feed') {
                const summary = lastFeed ? summarizeActivity(lastFeed) : null
                return (
                  <TrackerCard
                    key="feed"
                    tracker="feed"
                    label={lastFeed ? 'Last feed' : 'No feeds yet'}
                    sublabel={lastFeed ? `${formatClockTime(lastFeed.started_at)} · ${summary!.title.toLowerCase()} · ${caregiverName(lastFeed)}` : 'Log the first one'}
                    value={summary?.value ?? '—'}
                    unit={summary?.unit}
                    onAdd={() => navigate('/app/log/feed')}
                    onOpen={lastFeed ? () => navigate(`/app/log/feed?entryId=${lastFeed.id}`) : undefined}
                  />
                )
              }
              if (tracker === 'pump') {
                const summary = lastPump ? summarizeActivity(lastPump) : null
                return (
                  <TrackerCard
                    key="pump"
                    tracker="pump"
                    label={lastPump ? 'Last pump' : 'No pumps yet'}
                    sublabel={lastPump ? `${formatClockTime(lastPump.started_at)} · ${summary!.meta ?? ''} · ${caregiverName(lastPump)}` : 'Log the first one'}
                    value={summary?.value ?? '—'}
                    unit={summary?.unit}
                    onAdd={() => navigate('/app/log/pump')}
                    onOpen={lastPump ? () => navigate(`/app/log/pump?entryId=${lastPump.id}`) : undefined}
                  />
                )
              }
              if (tracker === 'sleep') {
                const summary = lastSleep ? summarizeActivity(lastSleep) : null
                return (
                  <TrackerCard
                    key="sleep"
                    tracker="sleep"
                    label={lastSleep ? 'Last sleep' : 'No sleep logged yet'}
                    sublabel={lastSleep ? `${formatClockTime(lastSleep.started_at)} · ${caregiverName(lastSleep)}` : 'Log the first one'}
                    value={summary?.value ?? '—'}
                    onAdd={() => navigate('/app/log/sleep')}
                    onOpen={lastSleep ? () => navigate(`/app/log/sleep?entryId=${lastSleep.id}`) : undefined}
                  />
                )
              }
              return (
                <TrackerCard
                  key="diaper"
                  tracker="diaper"
                  label={`${diaperCount} change${diaperCount === 1 ? '' : 's'} today`}
                  sublabel={lastDiaper ? `${formatClockTime(lastDiaper.started_at)} · ${timeAgo(lastDiaper.started_at)} · ${caregiverName(lastDiaper)}` : 'Log the first one'}
                  value={lastDiaper ? summarizeActivity(lastDiaper).title : '—'}
                  onAdd={() => navigate('/app/log/diaper')}
                  onOpen={lastDiaper ? () => navigate(`/app/log/diaper?entryId=${lastDiaper.id}`) : undefined}
                />
              )
            })}
        </div>
      )}

      {children.length > 0 && (
        <>
          {quickAddOpen && (
            <button
              aria-label="Close quick add"
              onClick={() => setQuickAddOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'var(--sheet-scrim)', border: 'none', zIndex: 20 }}
            />
          )}
          <div style={{ position: 'fixed', right: 20, bottom: 'calc(74px + 22px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, zIndex: 21 }}>
            {quickAddOpen &&
              (['sleep', 'diaper', 'pump', 'feed'] as Tracker[]).map((tracker) => (
                <div key={tracker} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Badge tone="neutral">{TRACKER_LABEL[tracker]}</Badge>
                  <IconButton
                    icon="plus"
                    label={`Log ${TRACKER_LABEL[tracker]}`}
                    variant="solid"
                    size="md"
                    style={accentVars(tracker)}
                    onClick={() => {
                      setQuickAddOpen(false)
                      navigate(`/app/log/${tracker}`)
                    }}
                  />
                </div>
              ))}
            <IconButton
              icon="plus"
              label="Log an entry"
              variant="solid"
              size="fab"
              onClick={() => setQuickAddOpen((v) => !v)}
              style={{ transform: quickAddOpen ? 'rotate(45deg)' : undefined, transition: 'transform var(--motion-base) var(--motion-ease)' }}
            />
          </div>
        </>
      )}
    </>
  )
}
