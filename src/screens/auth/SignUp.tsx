import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ProgressDots } from '../../components/ProgressDots'
import { TextField } from '../../components/TextField'
import { Button } from '../../components/Button'
import { signUp } from '../../lib/api'
import { useAppData } from '../../app/AppDataContext'

export function SignUp() {
  const { session, authLoading } = useAppData()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)

  if (!authLoading && session) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await signUp(email, password, name.trim())
      if (!data.session) setCheckEmail(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account.')
    } finally {
      setLoading(false)
    }
  }

  if (checkEmail) {
    return (
      <div className="lb-screen">
        <div className="lb-screen__body" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <h1 className="display">Check your email</h1>
          <p className="body-lg" style={{ color: 'var(--text-secondary)' }}>
            We sent a confirmation link to {email}. Follow it to finish creating your account, then come back and log in.
          </p>
          <Link to="/sign-in" style={{ width: '100%', marginTop: 12 }}>
            <Button type="button" size="lg" fullWidth>
              Back to log in
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="lb-screen">
      <form className="lb-screen__body" style={{ paddingTop: 'calc(var(--space-2xl) + env(safe-area-inset-top))' }} onSubmit={handleSubmit}>
        <ProgressDots step={1} />
        <div style={{ marginTop: 24 }}>
          <h1 className="display">Create your account</h1>
          <p className="body-lg" style={{ marginTop: 10, color: 'var(--text-secondary)' }}>
            Your name appears on every entry you log, so caregivers always know who did what.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TextField value={name} onChange={setName} placeholder="Your name" autoComplete="name" required />
          <TextField value={email} onChange={setEmail} type="email" placeholder="sam@example.com" autoComplete="email" required />
          <TextField value={password} onChange={setPassword} type="password" placeholder="Password" autoComplete="new-password" required minLength={6} />
        </div>
        {error && <p className="caption" style={{ color: 'var(--status-danger)', textAlign: 'center' }}>{error}</p>}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
          <Link to="/sign-in" style={{ width: '100%' }}>
            <Button type="button" variant="ghost" size="md" fullWidth>
              I already have an account
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
