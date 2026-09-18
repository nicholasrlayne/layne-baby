import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ProgressDots } from '../../components/ProgressDots'
import { TextField } from '../../components/TextField'
import { SegmentedControl } from '../../components/SegmentedControl'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { addChild } from '../../lib/api'
import { useAppData } from '../../app/AppDataContext'
import { useTheme } from '../../app/ThemeContext'

type SexOption = 'Boy' | 'Girl' | 'Not set'
const SEX_TO_DB: Record<SexOption, string> = { Boy: 'boy', Girl: 'girl', 'Not set': 'none' }

export function AddBaby() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = params.get('returnTo') ?? '/app/activity'
  const { caregiver, children, refreshChildren } = useAppData()
  const { theme } = useTheme()
  const isFirstChild = children.length === 0

  const [name, setName] = useState('')
  const [sex, setSex] = useState<SexOption>('Not set')
  const [birthdate, setBirthdate] = useState('')
  const [adjustedAge, setAdjustedAge] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!caregiver?.family_id) return
    setError(null)
    setLoading(true)
    try {
      await addChild({
        family_id: caregiver.family_id,
        first_name: name.trim(),
        sex: SEX_TO_DB[sex],
        birthdate: birthdate || null,
        use_adjusted_age: adjustedAge,
      })
      await refreshChildren()
      navigate(returnTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add your baby.')
      setLoading(false)
    }
  }

  return (
    <div className="lb-screen">
      <form className="lb-screen__body" style={{ paddingTop: 'calc(var(--space-2xl) + env(safe-area-inset-top))' }} onSubmit={handleSubmit}>
        {isFirstChild && <ProgressDots step={4} />}
        <h1 className="display" style={{ marginTop: isFirstChild ? 16 : 0 }}>
          {isFirstChild ? 'Add your baby' : 'Add a child'}
        </h1>
        <TextField label="Name" value={name} onChange={setName} placeholder="Emma" required />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="label">Sex</span>
          <SegmentedControl options={['Boy', 'Girl', 'Not set'] as SexOption[]} value={sex} onChange={setSex} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="label">Birthdate</span>
          <div className="lb-input" style={{ justifyContent: 'space-between' }}>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              style={{ colorScheme: theme }}
            />
            <Icon name="calendar-days" size={20} color="var(--text-muted)" />
          </div>
        </div>
        <button type="button" className="lb-check-card" onClick={() => setAdjustedAge((v) => !v)}>
          <span className={`lb-check-box${adjustedAge ? ' lb-check-box--checked' : ''}`}>
            {adjustedAge && <Icon name="check" size={16} color="var(--text-on-accent)" />}
          </span>
          <span>
            <span className="body-text" style={{ display: 'block', fontWeight: 600, color: 'var(--text-primary)' }}>
              Track adjusted age
            </span>
            <span className="caption" style={{ display: 'block' }}>For babies born before 37 weeks.</span>
          </span>
        </button>
        {error && <p className="caption" style={{ color: 'var(--status-danger)', textAlign: 'center' }}>{error}</p>}
        <div style={{ marginTop: 'auto' }}>
          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading ? 'Saving…' : isFirstChild ? 'Finish setup' : 'Add child'}
          </Button>
        </div>
      </form>
    </div>
  )
}
