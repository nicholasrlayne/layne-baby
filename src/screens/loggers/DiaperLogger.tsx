import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoggerHeader } from '../../components/LoggerHeader'
import { SegmentedControl } from '../../components/SegmentedControl'
import { Chip } from '../../components/Chip'
import { InlineField, TimeField } from '../../components/InlineField'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { useAppData } from '../../app/AppDataContext'
import { createActivity, deleteActivity, getActivityById, updateActivity } from '../../lib/api'

type DiaperKind = 'Wet' | 'Dirty' | 'Both'
const FLAGS = ['Blowout', 'Rash', 'Leak']
const TEXTURES = ['Seedy', 'Pasty', 'Solid', 'Runny', 'Mucousy']
const COLORS: { name: string; hex: string }[] = [
  { name: 'Yellow', hex: '#E8B563' },
  { name: 'Brown', hex: '#8A6242' },
  { name: 'Green', hex: '#7A9A6B' },
  { name: 'Black', hex: '#3A332C' },
  { name: 'Red', hex: '#C0655A' },
]

export function DiaperLogger() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const entryId = params.get('entryId')
  const { activeChild, caregiver } = useAppData()

  const [time, setTime] = useState(() => new Date().toISOString())
  const [kind, setKind] = useState<DiaperKind>('Wet')
  const [flags, setFlags] = useState<string[]>([])
  const [expanded, setExpanded] = useState(false)
  const [texture, setTexture] = useState<string | undefined>(undefined)
  const [color, setColor] = useState<string | undefined>(undefined)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(!!entryId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!entryId) return
    getActivityById(entryId).then((a) => {
      if (!a) return
      setTime(a.started_at)
      setNotes(a.notes ?? '')
      const d = a.data as Record<string, unknown>
      setKind(d.wet && d.dirty ? 'Both' : d.dirty ? 'Dirty' : 'Wet')
      setFlags((d.flags as string[]) ?? [])
      setTexture(d.texture as string | undefined)
      setColor(d.color as string | undefined)
      if (d.texture || d.color) setExpanded(true)
      setLoading(false)
    })
  }, [entryId])

  function toggleFlag(flag: string) {
    setFlags((prev) => (prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]))
  }

  async function handleSave() {
    if (!activeChild || !caregiver?.family_id || !caregiver.id) return
    setSaving(true)
    setError(null)
    try {
      const data = {
        wet: kind === 'Wet' || kind === 'Both',
        dirty: kind === 'Dirty' || kind === 'Both',
        flags,
        texture,
        color,
      }
      if (entryId) {
        await updateActivity(entryId, { started_at: time, notes: notes || null, data })
      } else {
        await createActivity({
          family_id: caregiver.family_id,
          child_id: activeChild.id,
          caregiver_id: caregiver.id,
          type: 'diaper',
          started_at: time,
          notes: notes || null,
          data,
        })
      }
      navigate(-1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this change.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!entryId) return
    setSaving(true)
    try {
      await deleteActivity(entryId)
      navigate(-1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete this entry.')
      setSaving(false)
    }
  }

  return (
    <div className="lb-screen lb-screen--modal">
      <LoggerHeader tracker="diaper" title="Diaper" onClose={() => navigate(-1)} onSave={handleSave} saveDisabled={saving || loading} saveLabel="Save" />
      <div className="lb-screen__body">
        {loading ? (
          <div className="lb-empty-state">Loading…</div>
        ) : (
          <>
            <TimeField label="Time" value={time} onChange={setTime} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="label">Type</span>
              <SegmentedControl options={['Wet', 'Dirty', 'Both'] as DiaperKind[]} value={kind} onChange={setKind} accent="diaper" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="label">Flags</span>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {FLAGS.map((flag) => (
                  <Chip key={flag} active={flags.includes(flag)} accent="diaper" onClick={() => toggleFlag(flag)}>
                    {flag}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <button type="button" className="lb-input" style={{ justifyContent: 'space-between', width: '100%' }} onClick={() => setExpanded((v) => !v)}>
                <span className="heading">Texture and colour</span>
                <Icon name={expanded ? 'chevron-down' : 'chevron-right'} size={20} color="var(--text-muted)" />
              </button>
              {!expanded ? (
                <p className="caption" style={{ margin: '8px 4px 0' }}>Collapsed by default. Most changes do not need it.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                  <div>
                    <span className="label">Texture</span>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                      {TEXTURES.map((t) => (
                        <Chip key={t} active={texture === t} accent="diaper" onClick={() => setTexture(texture === t ? undefined : t)}>
                          {t}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="label">Colour</span>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                      {COLORS.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          className={`lb-chip${color === c.name ? ' lb-chip--active' : ''}`}
                          onClick={() => setColor(color === c.name ? undefined : c.name)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                        >
                          <span style={{ width: 12, height: 12, borderRadius: '50%', background: c.hex, flex: 'none' }} />
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <InlineField label="Notes" value={notes} onChange={setNotes} placeholder="Add a note" />

            {error && <p className="caption" style={{ color: 'var(--status-danger)', textAlign: 'center' }}>{error}</p>}

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <span className="caption">Saves as logged by {caregiver?.display_name}</span>
              <Button size="lg" accent="diaper" fullWidth onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save change'}
              </Button>
              {entryId && (
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
