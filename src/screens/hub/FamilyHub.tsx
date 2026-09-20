import { useNavigate } from 'react-router-dom'
import { useAppData } from '../../app/AppDataContext'
import { Icon } from '../../components/Icon'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { IconButton } from '../../components/IconButton'
import { accentVars } from '../../components/accent'
import { formatChildAge, timeAgo } from '../../lib/format'
import { useEffect, useState } from 'react'
import { getLastActivity } from '../../lib/api'
import { caregiverName, type ActivityWithCaregiver, type Tracker } from '../../lib/types'

const ALL_TYPES = ['feed_breastfeed', 'feed_bottle', 'feed_solids', 'feed_combo', 'pump', 'diaper', 'sleep']
const TRACKER_TINT: Record<number, Tracker> = { 0: 'feed', 1: 'pump', 2: 'diaper', 3: 'sleep' }

function ChildSummaryLine({ childId }: { childId: string }) {
  const [last, setLast] = useState<ActivityWithCaregiver | null | undefined>(undefined)

  useEffect(() => {
    getLastActivity(childId, ALL_TYPES as never[]).then(setLast)
  }, [childId])

  if (last === undefined) return <span className="body-text" style={{ display: 'block' }}>Loading…</span>
  if (!last) return <span className="body-text" style={{ display: 'block' }}>No entries yet</span>

  const isRunning = !last.ended_at && (last.type === 'pump' || last.type === 'sleep')
  return (
    <>
      <span className="body-text" style={{ display: 'block' }}>
        {isRunning ? `${last.type === 'sleep' ? 'nap' : 'pump'} running` : `last ${last.type.replace('feed_', '').replace('_', ' ')} ${timeAgo(last.started_at)}`}
      </span>
      <span className="caption" style={{ display: 'block' }}>logged by {caregiverName(last)}</span>
    </>
  )
}

export function FamilyHub() {
  const navigate = useNavigate()
  const { children, caregivers, setActiveChildId } = useAppData()

  return (
    <div className="lb-screen lb-screen--modal">
      <div className="lb-screen__body" style={{ paddingTop: 'calc(var(--space-lg) + env(safe-area-inset-top))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconButton icon="chevron-left" label="Back" size="sm" onClick={() => navigate(-1)} />
            <h1 className="heading-lg">Family</h1>
          </span>
          <IconButton icon="settings" label="Settings" size="sm" onClick={() => navigate('/app/account')} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {children.map((child, i) => {
            const tracker = TRACKER_TINT[i % 4]
            return (
              <button
                key={child.id}
                className="lb-tappable-card"
                style={accentVars(tracker)}
                onClick={() => {
                  setActiveChildId(child.id)
                  navigate('/app/activity')
                }}
                type="button"
              >
                <span
                  style={{
                    width: 56,
                    height: 56,
                    flex: 'none',
                    borderRadius: 999,
                    background: 'var(--accent-tint)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 26,
                    color: 'var(--accent-ink)',
                  }}
                >
                  {child.first_name.charAt(0).toUpperCase()}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="heading" style={{ display: 'block' }}>{child.first_name}</span>
                  {formatChildAge(child) && (
                    <span className="body-text" style={{ display: 'block' }}>{formatChildAge(child)}</span>
                  )}
                  <ChildSummaryLine childId={child.id} />
                </span>
                <Icon name="chevron-right" size={20} color="var(--text-muted)" />
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span className="label">Caregivers</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {caregivers.map((c) => (
              <Badge key={c.id} tone="neutral">{c.display_name}</Badge>
            ))}
          </div>
          <Button variant="secondary" size="lg" fullWidth icon="plus" onClick={() => navigate('/onboarding/baby?returnTo=/app/hub')}>
            Add child
          </Button>
        </div>
      </div>
    </div>
  )
}
