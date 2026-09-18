import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProgressDots } from '../../components/ProgressDots'
import { Icon } from '../../components/Icon'
import { createFamily } from '../../lib/api'
import { useAppData } from '../../app/AppDataContext'

export function CreateOrJoinFamily() {
  const navigate = useNavigate()
  const { refreshCaregiver } = useAppData()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    setError(null)
    setLoading(true)
    try {
      await createFamily('Our family')
      await refreshCaregiver()
      navigate('/onboarding/family/code')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create a family.')
      setLoading(false)
    }
  }

  return (
    <div className="lb-screen">
      <div className="lb-screen__body" style={{ paddingTop: 'calc(var(--space-2xl) + env(safe-area-inset-top))' }}>
        <ProgressDots step={2} />
        <div style={{ marginTop: 16 }}>
          <h1 className="display">Set up your family</h1>
          <p className="body-lg" style={{ marginTop: 10, color: 'var(--text-secondary)' }}>
            Everyone in a family sees the same entries, and every entry names who logged it.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="lb-tappable-card" onClick={handleCreate} disabled={loading} type="button">
            <span style={{ width: 48, height: 48, flex: 'none', borderRadius: 999, background: 'var(--track-feed-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="users" size={24} color="var(--track-feed-ink)" />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="heading" style={{ display: 'block' }}>Create a family</span>
              <span className="body-text" style={{ display: 'block' }}>You get a code to share</span>
            </span>
            <Icon name="chevron-right" size={20} color="var(--text-muted)" />
          </button>
          <button className="lb-tappable-card" onClick={() => navigate('/onboarding/family/code')} type="button">
            <span style={{ width: 48, height: 48, flex: 'none', borderRadius: 999, background: 'var(--track-sleep-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="key-round" size={24} color="var(--track-sleep-ink)" />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="heading" style={{ display: 'block' }}>Join with a code</span>
              <span className="body-text" style={{ display: 'block' }}>Your partner already started one</span>
            </span>
            <Icon name="chevron-right" size={20} color="var(--text-muted)" />
          </button>
        </div>
        {error && <p className="caption" style={{ color: 'var(--status-danger)', textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  )
}
