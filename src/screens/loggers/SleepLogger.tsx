import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoggerHeader } from '../../components/LoggerHeader'
import { TimerDisplay } from '../../components/TimerDisplay'
import { DateTimeField, InlineField } from '../../components/InlineField'
import { Button } from '../../components/Button'
import { useAppData } from '../../app/AppDataContext'
import {
  createActivity,
  deleteActivity,
  getActivityById,
  getRunningActivity,
  updateActivity,
} from '../../lib/api'
import { formatClockTime } from '../../lib/format'

export function SleepLogger() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const entryId = params.get('entryId')
  const { activeChild, caregiver } = useAppData()

  const [runningId, setRunningId] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [startTime, setStartTime] = useState(() => new Date().toISOString())
  const [endTime, setEndTime] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!activeChild) return
    async function load() {
      if (entryId) {
        const a = await getActivityById(entryId)
        if (a) {
          setStartTime(a.started_at)
          setEndTime(a.ended_at)
          setNotes(a.notes ?? '')
          if (!a.ended_at) {
            setRunning(true)
            setRunningId(a.id)
          }
        }
      } else {
        const r = await getRunningActivity(activeChild!.id, ['sleep'])
        if (r) {
          setRunningId(r.id)
          setStartTime(r.started_at)
          setRunning(true)
        }
      }
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChild, entryId])

  async function handleStart() {
    if (!activeChild || !caregiver?.family_id || !caregiver.id) return
    setSaving(true)
    setError(null)
    try {
      const now = new Date().toISOString()
      const a = await createActivity({
        family_id: caregiver.family_id,
        child_id: activeChild.id,
        caregiver_id: caregiver.id,
        type: 'sleep',
        started_at: now,
        data: {},
      })
      setRunningId(a.id)
      setStartTime(now)
      setRunning(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the timer.')
    } finally {
      setSaving(false)
    }
  }

  async function handleStartTimeChange(iso: string) {
    setStartTime(iso)
    const targetId = entryId ?? runningId
    if (!targetId) return
    try {
      await updateActivity(targetId, { started_at: iso })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the start time.')
    }
  }

  async function handleStop() {
    if (!runningId) return
    setSaving(true)
    setError(null)
    try {
      const now = new Date().toISOString()
      await updateActivity(runningId, { ended_at: now })
      setEndTime(now)
      setRunning(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not stop the timer.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSave() {
    if (!activeChild || !caregiver?.family_id || !caregiver.id) return
    setSaving(true)
    setError(null)
    try {
      const targetId = entryId ?? runningId
      if (targetId) {
        await updateActivity(targetId, { started_at: startTime, ended_at: endTime, notes: notes || null })
      } else if (endTime) {
        await createActivity({
          family_id: caregiver.family_id,
          child_id: activeChild.id,
          caregiver_id: caregiver.id,
          type: 'sleep',
          started_at: startTime,
          ended_at: endTime,
          notes: notes || null,
          data: {},
        })
      }
      navigate(-1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this sleep.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    const targetId = entryId ?? runningId
    if (!targetId) return
    setSaving(true)
    try {
      await deleteActivity(targetId)
      navigate(-1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete this entry.')
      setSaving(false)
    }
  }

  const targetId = entryId ?? runningId
  const canSave = !!targetId || (!!startTime && !!endTime)

  return (
    <div className="lb-screen">
      <LoggerHeader
        tracker="sleep"
        title="Sleep"
        onClose={() => navigate(-1)}
        onSave={handleSave}
        saveDisabled={saving || loading || !canSave}
      />
      <div className="lb-screen__body">
        {loading ? (
          <div className="lb-empty-state">Loading…</div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '36px 0 28px', borderBottom: '1px solid var(--border-subtle)' }}>
              <TimerDisplay
                label={running ? `Asleep since ${formatClockTime(startTime)}` : endTime ? 'Nap logged' : 'Not started'}
                startedAt={startTime}
                running={running}
                accent="sleep"
              />
              {running ? (
                <Button size="lg" accent="sleep" onClick={handleStop} disabled={saving}>
                  Stop timer
                </Button>
              ) : (
                !entryId && (
                  <Button size="lg" accent="sleep" onClick={handleStart} disabled={saving}>
                    Start timer
                  </Button>
                )
              )}
            </div>

            <div>
              <DateTimeField dateLabel="Start date" timeLabel="Start time" value={startTime} onChange={handleStartTimeChange} />
              <DateTimeField
                dateLabel="End date"
                timeLabel="End time"
                value={endTime}
                onChange={setEndTime}
                disabled={running}
                emptyHint="Set on stop"
              />
              <InlineField label="Notes" value={notes} onChange={setNotes} placeholder="Add a note" />
            </div>

            {error && <p className="caption" style={{ color: 'var(--status-danger)', textAlign: 'center' }}>{error}</p>}

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <span className="caption">Saves as logged by {caregiver?.display_name}</span>
              {!running && canSave && (
                <Button size="lg" accent="sleep" fullWidth onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : entryId ? 'Save changes' : 'Save without stopping'}
                </Button>
              )}
              {(entryId || runningId) && (
                <Button variant="danger" size="md" onClick={handleDelete} disabled={saving}>
                  Delete entry
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
