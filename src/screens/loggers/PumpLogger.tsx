import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoggerHeader } from '../../components/LoggerHeader'
import { TimerDisplay } from '../../components/TimerDisplay'
import { Button } from '../../components/Button'
import { DateTimeField, InlineField } from '../../components/InlineField'
import { useAppData } from '../../app/AppDataContext'
import {
  createActivity,
  deleteActivity,
  getActivityById,
  getRunningActivity,
  updateActivity,
} from '../../lib/api'
import { formatOz } from '../../lib/format'

export function PumpLogger() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const entryId = params.get('entryId')
  const { activeChild, caregiver } = useAppData()

  const [runningId, setRunningId] = useState<string | null>(null)
  const [startTime, setStartTime] = useState(() => new Date().toISOString())
  const [endTime, setEndTime] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [leftOz, setLeftOz] = useState(0)
  const [rightOz, setRightOz] = useState(0)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState<'left' | 'right' | null>(null)

  useEffect(() => {
    if (!activeChild) return
    async function load() {
      if (entryId) {
        const a = await getActivityById(entryId)
        if (a) {
          setStartTime(a.started_at)
          setEndTime(a.ended_at)
          setNotes(a.notes ?? '')
          const d = a.data as Record<string, unknown>
          setLeftOz(Number(d.left_oz ?? 0))
          setRightOz(Number(d.right_oz ?? 0))
          setRunning(!a.ended_at)
          if (!a.ended_at) setRunningId(a.id)
        }
      } else {
        const r = await getRunningActivity(activeChild!.id, ['pump'])
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

  async function handleStartStop() {
    if (!activeChild || !caregiver?.family_id || !caregiver.id) return
    setError(null)
    if (!running) {
      setSaving(true)
      try {
        const now = new Date().toISOString()
        const a = await createActivity({
          family_id: caregiver.family_id,
          child_id: activeChild.id,
          caregiver_id: caregiver.id,
          type: 'pump',
          started_at: now,
          data: { left_oz: 0, right_oz: 0 },
        })
        setRunningId(a.id)
        setStartTime(now)
        setRunning(true)
        setFocused('left')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not start the timer.')
      } finally {
        setSaving(false)
      }
    } else {
      setSaving(true)
      try {
        const now = new Date().toISOString()
        if (runningId) {
          await updateActivity(runningId, { ended_at: now })
        }
        setEndTime(now)
        setRunning(false)
        setFocused('left')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not stop the timer.')
      } finally {
        setSaving(false)
      }
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

  async function handleSave() {
    if (!activeChild || !caregiver?.family_id || !caregiver.id) return
    setSaving(true)
    setError(null)
    try {
      const data = { left_oz: leftOz, right_oz: rightOz }
      const targetId = entryId ?? runningId
      if (targetId) {
        await updateActivity(targetId, { started_at: startTime, notes: notes || null, data, ended_at: running ? null : endTime ?? new Date().toISOString() })
      } else {
        await createActivity({
          family_id: caregiver.family_id,
          child_id: activeChild.id,
          caregiver_id: caregiver.id,
          type: 'pump',
          started_at: startTime,
          ended_at: new Date().toISOString(),
          notes: notes || null,
          data,
        })
      }
      navigate(-1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this pump.')
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

  const total = leftOz + rightOz

  return (
    <div className="lb-screen">
      <LoggerHeader tracker="pump" title="Pump" onClose={() => navigate(-1)} onSave={handleSave} saveDisabled={saving || loading} />
      <div className="lb-screen__body">
        {loading ? (
          <div className="lb-empty-state">Loading…</div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '24px 0 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <TimerDisplay label={running ? 'Running' : 'Stopped'} startedAt={startTime} running={running} accent="pump" />
              <Button size="lg" accent="pump" onClick={handleStartStop} disabled={saving}>
                {running ? 'Stop timer' : 'Start timer'}
              </Button>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div className={`lb-amount-tile${focused === 'left' ? ' lb-amount-tile--focused' : ''}`} onClick={() => setFocused('left')}>
                <div className="label">Left</div>
                <div className="lb-amount-tile__value">
                  <input
                    type="number"
                    inputMode="decimal"
                    step={0.5}
                    min={0}
                    value={leftOz}
                    onFocus={() => setFocused('left')}
                    onChange={(e) => setLeftOz(Number(e.target.value) || 0)}
                    style={{ width: 56, fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}
                  />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginLeft: 4 }}>oz</span>
                </div>
              </div>
              <div className={`lb-amount-tile${focused === 'right' ? ' lb-amount-tile--focused' : ''}`} onClick={() => setFocused('right')}>
                <div className="label">Right</div>
                <div className="lb-amount-tile__value">
                  <input
                    type="number"
                    inputMode="decimal"
                    step={0.5}
                    min={0}
                    value={rightOz}
                    onFocus={() => setFocused('right')}
                    onChange={(e) => setRightOz(Number(e.target.value) || 0)}
                    style={{ width: 56, fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}
                  />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginLeft: 4 }}>oz</span>
                </div>
              </div>
            </div>

            <div className="lb-total-tile">
              <span className="body-text" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
              <span className="lb-total-tile__value">{formatOz(total)} oz</span>
            </div>

            <div>
              <DateTimeField dateLabel="Start date" timeLabel="Start time" value={startTime} onChange={handleStartTimeChange} />
              <InlineField label="Notes" value={notes} onChange={setNotes} placeholder="Add a note" />
            </div>

            {error && <p className="caption" style={{ color: 'var(--status-danger)', textAlign: 'center' }}>{error}</p>}

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <span className="caption">Saves as logged by {caregiver?.display_name}</span>
              {!running && (
                <Button size="lg" accent="pump" fullWidth onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : entryId ? 'Save changes' : 'Save pump'}
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
