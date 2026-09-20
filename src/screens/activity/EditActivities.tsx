import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppData } from '../../app/AppDataContext'
import { FieldRow } from '../../components/FieldRow'
import { Switch } from '../../components/Switch'
import { TRACKER_LABEL } from '../../components/accent'
import { TRACKERS } from '../../lib/types'
import { updateChild } from '../../lib/api'

export function EditActivities() {
  const navigate = useNavigate()
  const { activeChild, refreshChildren } = useAppData()
  const [visible, setVisible] = useState<Set<string>>(() => new Set(activeChild?.visible_trackers ?? TRACKERS))
  const [saving, setSaving] = useState(false)

  if (!activeChild) return null

  function toggle(tracker: string) {
    setVisible((prev) => {
      const next = new Set(prev)
      if (next.has(tracker)) next.delete(tracker)
      else next.add(tracker)
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateChild(activeChild!.id, { visible_trackers: Array.from(visible) })
      await refreshChildren()
      navigate(-1)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="lb-screen">
      <div className="lb-header-bar lb-header-bar--plain">
        <button className="lb-header-bar__action" onClick={() => navigate(-1)} type="button">
          Cancel
        </button>
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span className="lb-header-bar__title">Edit Activities</span>
          <span className="caption">{activeChild.first_name}</span>
        </span>
        <button
          className="lb-header-bar__action"
          onClick={handleSave}
          disabled={saving}
          style={{ opacity: saving ? 0.5 : 1 }}
          type="button"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      <div className="lb-screen__body">
        <p className="caption">Choose which activity cards show on {activeChild.first_name}'s dashboard.</p>
        <div className="lb-card">
          {TRACKERS.map((tracker) => (
            <FieldRow
              key={tracker}
              label={TRACKER_LABEL[tracker]}
              trailing={
                <Switch checked={visible.has(tracker)} onChange={() => toggle(tracker)} label={TRACKER_LABEL[tracker]} />
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
