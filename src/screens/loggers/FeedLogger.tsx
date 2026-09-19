import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoggerHeader } from '../../components/LoggerHeader'
import { SegmentedControl } from '../../components/SegmentedControl'
import { StepperRow } from '../../components/Stepper'
import { DateTimeField, InlineField } from '../../components/InlineField'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { Chip } from '../../components/Chip'
import { useAppData } from '../../app/AppDataContext'
import { createActivity, deleteActivity, getActivityById, listFoods, updateActivity } from '../../lib/api'
import { formatDuration } from '../../lib/format'
import type { ActivityType, Food } from '../../lib/types'

type FeedType = 'Breast' | 'Bottle' | 'Solids' | 'Combo'
const TYPE_TO_DB: Record<FeedType, ActivityType> = {
  Breast: 'feed_breastfeed',
  Bottle: 'feed_bottle',
  Solids: 'feed_solids',
  Combo: 'feed_combo',
}
const DB_TO_TYPE: Record<string, FeedType> = {
  feed_breastfeed: 'Breast',
  feed_bottle: 'Bottle',
  feed_solids: 'Solids',
  feed_combo: 'Combo',
}

export function FeedLogger() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const entryId = params.get('entryId')
  const { activeChild, caregiver } = useAppData()

  const [feedType, setFeedType] = useState<FeedType>('Breast')
  const [leftMin, setLeftMin] = useState(0)
  const [rightMin, setRightMin] = useState(0)
  const [amountOz, setAmountOz] = useState(4)
  const [formulaType, setFormulaType] = useState<'Formula' | 'Breast milk'>('Formula')
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Snack')
  const [foods, setFoods] = useState<Food[]>([])
  const [selectedFoods, setSelectedFoods] = useState<string[]>([])
  const [foodSearch, setFoodSearch] = useState('')
  const [startTime, setStartTime] = useState(() => new Date().toISOString())
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(!!entryId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (caregiver?.family_id) listFoods(caregiver.family_id).then(setFoods)
  }, [caregiver?.family_id])

  useEffect(() => {
    if (!entryId) return
    getActivityById(entryId).then((a) => {
      if (!a) return
      setFeedType(DB_TO_TYPE[a.type] ?? 'Breast')
      setStartTime(a.started_at)
      setNotes(a.notes ?? '')
      const d = a.data as Record<string, unknown>
      if (a.type === 'feed_breastfeed' || a.type === 'feed_combo') {
        setLeftMin(Number(d.left_min ?? 0))
        setRightMin(Number(d.right_min ?? 0))
      }
      if (a.type === 'feed_bottle' || a.type === 'feed_combo') {
        setAmountOz(Number(d.amount_oz ?? 4))
        setFormulaType((d.formula_type as 'Formula' | 'Breast milk') ?? 'Formula')
      }
      if (a.type === 'feed_solids') {
        setSelectedFoods((d.foods as string[]) ?? [])
        setMealType((d.meal_type as typeof mealType) ?? 'Snack')
      }
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId])

  function toggleFood(name: string) {
    setSelectedFoods((prev) => (prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]))
  }

  async function handleSave() {
    if (!activeChild || !caregiver?.family_id || !caregiver.id) return
    setSaving(true)
    setError(null)
    try {
      let data
      if (feedType === 'Breast') {
        data = { left_min: leftMin, right_min: rightMin, last_side: (rightMin >= leftMin ? 'right' : 'left') as 'left' | 'right' }
      } else if (feedType === 'Bottle') {
        data = { amount_oz: amountOz, formula_type: formulaType }
      } else if (feedType === 'Solids') {
        data = { meal_type: mealType, foods: selectedFoods }
      } else {
        data = { left_min: leftMin, right_min: rightMin, amount_oz: amountOz, formula_type: formulaType }
      }

      if (entryId) {
        await updateActivity(entryId, { started_at: startTime, notes: notes || null, data, type: TYPE_TO_DB[feedType] })
      } else {
        await createActivity({
          family_id: caregiver.family_id,
          child_id: activeChild.id,
          caregiver_id: caregiver.id,
          type: TYPE_TO_DB[feedType],
          started_at: startTime,
          notes: notes || null,
          data,
        })
      }
      navigate(-1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this feed.')
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

  const total = leftMin + rightMin

  return (
    <div className="lb-screen">
      <LoggerHeader tracker="feed" title="Feed" onClose={() => navigate(-1)} onSave={handleSave} saveDisabled={saving || loading} />
      <div className="lb-screen__body">
        {loading ? (
          <div className="lb-empty-state">Loading…</div>
        ) : (
          <>
            <SegmentedControl options={['Breast', 'Bottle', 'Solids', 'Combo'] as FeedType[]} value={feedType} onChange={setFeedType} accent="feed" />

            {(feedType === 'Breast' || feedType === 'Combo') && (
              <div>
                <StepperRow label="Left" value={leftMin} unit="min" onChange={setLeftMin} />
                <StepperRow label="Right" value={rightMin} unit="min" onChange={setRightMin} />
                <div className="lb-total-tile" style={{ marginTop: 12 }}>
                  <span className="body-text" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
                  <span className="lb-total-tile__value">{formatDuration(total)}</span>
                </div>
              </div>
            )}

            {(feedType === 'Bottle' || feedType === 'Combo') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span className="label">Formula</span>
                  <SegmentedControl options={['Formula', 'Breast milk'] as const} value={formulaType} onChange={setFormulaType} accent="feed" />
                </div>
                <TextField
                  label="Amount"
                  value={String(amountOz)}
                  onChange={(v) => setAmountOz(Number(v) || 0)}
                  type="number"
                  inputMode="decimal"
                  step={0.5}
                  min={0}
                />
              </div>
            )}

            {feedType === 'Solids' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span className="label">Meal</span>
                  <SegmentedControl options={['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const} value={mealType} onChange={setMealType} accent="feed" />
                </div>
                <TextField value={foodSearch} onChange={setFoodSearch} placeholder="Search foods" trailingIcon="search" />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {foods
                    .filter((f) => f.name.toLowerCase().includes(foodSearch.toLowerCase()))
                    .map((f) => (
                      <Chip key={f.id} active={selectedFoods.includes(f.name)} accent="feed" onClick={() => toggleFood(f.name)}>
                        {f.name}
                      </Chip>
                    ))}
                </div>
                {selectedFoods.length > 0 && (
                  <span className="caption">{selectedFoods.length} food{selectedFoods.length === 1 ? '' : 's'} selected</span>
                )}
              </div>
            )}

            <div>
              <DateTimeField dateLabel="Start date" timeLabel="Start time" value={startTime} onChange={setStartTime} />
              <InlineField label="Notes" value={notes} onChange={setNotes} placeholder="Add a note" />
            </div>

            {error && <p className="caption" style={{ color: 'var(--status-danger)', textAlign: 'center' }}>{error}</p>}

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <span className="caption">Saves as logged by {caregiver?.display_name}</span>
              <Button size="lg" accent="feed" fullWidth onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : entryId ? 'Save changes' : 'Save feed'}
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

