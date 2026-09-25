import { useEffect, useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppData } from '../../app/AppDataContext'
import { ChildSwitcher } from '../../components/ChildSwitcher'
import { TrackerCard } from '../../components/TrackerCard'
import { Button } from '../../components/Button'
import { accentVars, TRACKER_LABEL } from '../../components/accent'
import { formatElapsed, useElapsedSeconds } from '../../lib/useElapsed'
import { formatChildAge, formatClockTime, formatCompactDate, formatDateHeader, formatDuration, timeAgo } from '../../lib/format'
import { classifySleepType, summarizeActivity } from '../../lib/activitySummary'
import { caregiverName, trackerForType, type ActivityWithCaregiver, type Tracker } from '../../lib/types'
import { countTodayDiapers, getLastActivity, getRecentSleepSessions, getRunningActivity, updateActivity } from '../../lib/api'

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

function SleepHistoryRow({ session, onClick }: { session: ActivityWithCaregiver; onClick: () => void }) {
  function handleClick(e: MouseEvent) {
    e.stopPropagation()
    onClick()
  }

  const date = formatCompactDate(session.ended_at!)
  const wokeAt = formatClockTime(session.ended_at!)
  return (
    <button type="button" className="lb-sleeprow" onClick={handleClick}>
      <span className="lb-sleeprow__type">{classifySleepType(session.started_at, session.ended_at!)}</span>
      <span className="lb-sleeprow__value">{summarizeActivity(session).value}</span>
      <span className="lb-sleeprow__meta">{date ? `${date} · ${wokeAt}` : wokeAt}</span>
    </button>
  )
}

function SleepStatusCard({
  runningSleep,
  lastSleep,
  history,
  onAdd,
  onOpen,
  onOpenSession,
}: {
  runningSleep: ActivityWithCaregiver | null
  lastSleep: ActivityWithCaregiver | null
  history: ActivityWithCaregiver[]
  onAdd: () => void
  onOpen: () => void
  onOpenSession: (session: ActivityWithCaregiver) => void
}) {
  const anchor = runningSleep ? runningSleep.started_at : lastSleep?.ended_at ?? new Date().toISOString()
  const elapsedSeconds = useElapsedSeconds(anchor, true)

  let label: string
  let sublabel: string
  let value: string
  if (runningSleep) {
    label = 'Sleeping'
    sublabel = `started ${formatClockTime(runningSleep.started_at)} · ${caregiverName(runningSleep)}`
    value = formatDuration(Math.floor(elapsedSeconds / 60))
  } else if (lastSleep?.ended_at) {
    label = 'Woke up'
    sublabel = `${formatClockTime(lastSleep.ended_at)} · ${caregiverName(lastSleep)}`
    value = timeAgo(lastSleep.ended_at)
  } else {
    label = 'No sleep logged yet'
    sublabel = 'Log the first one'
    value = '—'
  }

  return (
    <TrackerCard
      tracker="sleep"
      label={label}
      sublabel={sublabel}
      value={value}
      running={!!runningSleep}
      onAdd={onAdd}
      onOpen={runningSleep || lastSleep ? onOpen : undefined}
    >
      {history.map((session) => (
        <SleepHistoryRow key={session.id} session={session} onClick={() => onOpenSession(session)} />
      ))}
    </TrackerCard>
  )
}

export function ActivityDashboard() {
  const navigate = useNavigate()
  const { activeChild, activeChildId, children, setActiveChildId, activitiesVersion } = useAppData()
  const [lastFeed, setLastFeed] = useState<ActivityWithCaregiver | null>(null)
  const [lastPump, setLastPump] = useState<ActivityWithCaregiver | null>(null)
  const [lastSleep, setLastSleep] = useState<ActivityWithCaregiver | null>(null)
  const [lastDiaper, setLastDiaper] = useState<ActivityWithCaregiver | null>(null)
  const [runningPump, setRunningPump] = useState<ActivityWithCaregiver | null>(null)
  const [runningSleep, setRunningSleep] = useState<ActivityWithCaregiver | null>(null)
  const [sleepHistory, setSleepHistory] = useState<ActivityWithCaregiver[]>([])
  const [diaperCount, setDiaperCount] = useState(0)
  const [loading, setLoading] = useState(true)

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
      getRecentSleepSessions(activeChild.id, 2),
      countTodayDiapers(activeChild.id),
    ]).then(([feed, pump, sleep, diaper, runPump, runSleep, sleepSessions, count]) => {
      if (cancelled) return
      setLastFeed(feed)
      setLastPump(pump)
      setLastSleep(sleep)
      setLastDiaper(diaper)
      setRunningPump(runPump)
      setRunningSleep(runSleep)
      setSleepHistory(sleepSessions)
      setDiaperCount(count)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [activeChild, activitiesVersion])

  if (!activeChild) return null

  const running = runningPump
  const runningTracker = running ? trackerForType(running.type as never) : null
  const trackerOrder: Tracker[] = ['feed', 'pump', 'sleep', 'diaper']
  const visibleTrackers = new Set(activeChild.visible_trackers ?? trackerOrder)

  function handleSwitchChild() {
    if (children.length < 2) return
    const idx = children.findIndex((c) => c.id === activeChildId)
    const next = children[(idx + 1) % children.length]
    setActiveChildId(next.id)
  }

  return (
    <>
      <ChildSwitcher
        name={activeChild.first_name}
        date={[formatDateHeader(), formatChildAge(activeChild)].filter(Boolean).join(' · ')}
        multiple={children.length > 1}
        onSwitch={handleSwitchChild}
        onOpenMenu={() => navigate('/app/hub')}
      />

      {running && (
        <div className="lb-stagger-in">
          <RunningCard
            activity={running}
            onStopped={() => {
              setRunningPump(null)
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="lb-empty-state">Loading…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {trackerOrder
            .filter((t) => t !== runningTracker && visibleTrackers.has(t))
            .map((tracker, index) => {
              let card
              if (tracker === 'feed') {
                const summary = lastFeed ? summarizeActivity(lastFeed) : null
                card = (
                  <TrackerCard
                    tracker="feed"
                    label={lastFeed ? 'Last feed' : 'No feeds yet'}
                    sublabel={lastFeed ? `${formatClockTime(lastFeed.started_at)} · ${summary!.title.toLowerCase()} · ${caregiverName(lastFeed)}` : 'Log the first one'}
                    value={summary?.value ?? '—'}
                    unit={summary?.unit}
                    onAdd={() => navigate('/app/log/feed')}
                    onOpen={lastFeed ? () => navigate(`/app/log/feed?entryId=${lastFeed.id}`) : undefined}
                  />
                )
              } else if (tracker === 'pump') {
                const summary = lastPump ? summarizeActivity(lastPump) : null
                card = (
                  <TrackerCard
                    tracker="pump"
                    label={lastPump ? 'Last pump' : 'No pumps yet'}
                    sublabel={lastPump ? `${formatClockTime(lastPump.started_at)} · ${summary!.meta ?? ''} · ${caregiverName(lastPump)}` : 'Log the first one'}
                    value={summary?.value ?? '—'}
                    unit={summary?.unit}
                    onAdd={() => navigate('/app/log/pump')}
                    onOpen={lastPump ? () => navigate(`/app/log/pump?entryId=${lastPump.id}`) : undefined}
                  />
                )
              } else if (tracker === 'sleep') {
                card = (
                  <SleepStatusCard
                    runningSleep={runningSleep}
                    lastSleep={lastSleep}
                    history={sleepHistory}
                    onAdd={() => navigate('/app/log/sleep')}
                    onOpen={
                      runningSleep
                        ? () => navigate('/app/log/sleep')
                        : lastSleep
                          ? () => navigate(`/app/log/sleep?entryId=${lastSleep.id}`)
                          : () => navigate('/app/log/sleep')
                    }
                    onOpenSession={(session) => navigate(`/app/log/sleep?entryId=${session.id}`)}
                  />
                )
              } else {
                card = (
                  <TrackerCard
                    tracker="diaper"
                    label={`${diaperCount} change${diaperCount === 1 ? '' : 's'} today`}
                    sublabel={lastDiaper ? `${formatClockTime(lastDiaper.started_at)} · ${timeAgo(lastDiaper.started_at)} · ${caregiverName(lastDiaper)}` : 'Log the first one'}
                    value={lastDiaper ? summarizeActivity(lastDiaper).title : '—'}
                    onAdd={() => navigate('/app/log/diaper')}
                    onOpen={lastDiaper ? () => navigate(`/app/log/diaper?entryId=${lastDiaper.id}`) : undefined}
                  />
                )
              }
              return (
                <div key={tracker} className="lb-stagger-in" style={{ animationDelay: `${index * 40}ms` }}>
                  {card}
                </div>
              )
            })}
        </div>
      )}

      <Button variant="ghost" icon="pencil" fullWidth onClick={() => navigate('/app/activities/edit')}>
        Edit Activities
      </Button>
    </>
  )
}
