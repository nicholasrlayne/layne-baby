import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProgressDots } from '../../components/ProgressDots'
import { Button } from '../../components/Button'
import { joinFamily } from '../../lib/api'
import { useAppData } from '../../app/AppDataContext'

function formatCode(code: string) {
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  return clean.length > 3 ? `${clean.slice(0, 3)}-${clean.slice(3)}` : clean
}

export function FamilyCode() {
  const navigate = useNavigate()
  const { family, refreshCaregiver } = useAppData()
  const [joinInput, setJoinInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [copied, setCopied] = useState(false)

  const hasFamily = !!family

  async function tryJoin(code: string) {
    const clean = code.replace(/[^A-Z0-9]/gi, '')
    if (clean.length !== 6 || joining) return
    setError(null)
    setJoining(true)
    try {
      await joinFamily(clean)
      await refreshCaregiver()
      navigate('/onboarding/baby')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That code did not work.')
      setJoining(false)
    }
  }

  async function handleCopy() {
    if (!family) return
    try {
      await navigator.clipboard.writeText(family.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  async function handleShare() {
    if (!family) return
    const text = `Join our family on Layne Baby with code ${family.invite_code}`
    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch {
        /* user cancelled */
      }
    } else {
      handleCopy()
    }
  }

  return (
    <div className="lb-screen">
      <div className="lb-screen__body" style={{ paddingTop: 'calc(var(--space-2xl) + env(safe-area-inset-top))' }}>
        <ProgressDots step={3} />
        <div style={{ marginTop: 16 }}>
          <h1 className="display">{hasFamily ? 'Your family code' : 'Join a family'}</h1>
          <p className="body-lg" style={{ marginTop: 10, color: 'var(--text-secondary)' }}>
            {hasFamily ? 'Send this to anyone who logs for your baby.' : 'Enter the code your partner shared with you.'}
          </p>
        </div>

        {hasFamily && (
          <div className="lb-card" style={{ padding: '28px 16px', textAlign: 'center' }}>
            <div className="serif tabular" style={{ fontSize: 40, lineHeight: 1.1, letterSpacing: '.12em', color: 'var(--text-primary)' }}>
              {formatCode(family.invite_code)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 18 }}>
              <Button variant="secondary" size="sm" icon="copy" onClick={handleCopy}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="secondary" size="sm" icon="share-2" onClick={handleShare}>
                Share
              </Button>
            </div>
          </div>
        )}

        {hasFamily && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            <span className="label">or join one</span>
            <span style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="lb-input">
            <input
              value={joinInput}
              onChange={(e) => {
                const formatted = formatCode(e.target.value)
                setJoinInput(formatted)
                tryJoin(formatted)
              }}
              placeholder="Enter a code"
              style={{ letterSpacing: '.12em', fontVariantNumeric: 'tabular-nums', textTransform: 'uppercase' }}
              autoCapitalize="characters"
              disabled={joining}
            />
          </div>
          <span className="caption">Continues automatically at 6 characters.</span>
          {error && <p className="caption" style={{ color: 'var(--status-danger)' }}>{error}</p>}
        </div>

        {hasFamily && (
          <div style={{ marginTop: 'auto' }}>
            <Button size="lg" fullWidth onClick={() => navigate('/onboarding/baby')}>
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
