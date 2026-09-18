import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { BrandMark } from '../../components/BrandMark'
import { ProgressDots } from '../../components/ProgressDots'
import { TextField } from '../../components/TextField'
import { Button } from '../../components/Button'
import { supabase } from '../../lib/supabase'
import { useAppData } from '../../app/AppDataContext'

export function SignIn() {
  const { session, authLoading } = useAppData()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!authLoading && session) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lb-screen">
      <form className="lb-screen__body" style={{ paddingTop: 'calc(var(--space-2xl) + env(safe-area-inset-top))' }} onSubmit={handleSubmit}>
        <ProgressDots step={1} />
        <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <BrandMark />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
          <TextField
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="sam@example.com"
            autoComplete="email"
            required
          />
          <TextField
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            required
          />
        </div>
        {error && <p className="caption" style={{ color: 'var(--status-danger)', textAlign: 'center' }}>{error}</p>}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </Button>
          <Link to="/sign-up" style={{ width: '100%' }}>
            <Button type="button" variant="ghost" size="md" fullWidth>
              Create an account
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
