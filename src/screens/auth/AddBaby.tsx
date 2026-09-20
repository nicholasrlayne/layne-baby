import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ProgressDots } from '../../components/ProgressDots'
import { TextField } from '../../components/TextField'
import { SegmentedControl } from '../../components/SegmentedControl'
import { Button } from '../../components/Button'
import { addChild } from '../../lib/api'
import { useAppData } from '../../app/AppDataContext'

type SexOption = 'Boy' | 'Girl' | 'Not set'
const SEX_TO_DB: Record<SexOption, string> = { Boy: 'boy', Girl: 'girl', 'Not set': 'none' }

export function AddBaby() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = params.get('returnTo') ?? '/app/activity'
  const { caregiver, children, refreshChildren } = useAppData()
  const isFirstChild = children.length === 0

  const [name, setName] = useState('')
  const [sex, setSex] = useState<SexOption>('Not set')
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
        birthdate: null,
        use_adjusted_age: false,
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
