import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppData } from '../../app/AppDataContext'
import { useTheme } from '../../app/ThemeContext'
import { FieldRow } from '../../components/FieldRow'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { formatChildAge } from '../../lib/format'
import { signOut } from '../../lib/api'
import { supabase } from '../../lib/supabase'

export function Account() {
  const navigate = useNavigate()
  const { caregiver, caregivers, family, children } = useAppData()
  const { theme, toggleTheme } = useTheme()
  const [copied, setCopied] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)

  async function handleShareCode() {
    if (!family) return
    const text = `Join our family on Layne Baby with code ${family.invite_code}`
    if (navigator.share) {
      try {
        await navigator.share({ text })
        return
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(family.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  async function handlePasswordSave() {
    setPwError(null)
    setPwSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPwSuccess(true)
      setNewPassword('')
      setTimeout(() => {
        setChangingPassword(false)
        setPwSuccess(false)
      }, 1200)
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Could not update your password.')
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <>
      <h1 className="heading-lg">Account</h1>

      <div>
        <span className="label" style={{ display: 'block', padding: '0 0 6px' }}>Family</span>
        <div className="lb-card">
          <FieldRow label="Caregivers" value={String(caregivers.length)} chevron onClick={() => navigate('/app/hub')} />
          <FieldRow label="Invite code" value={copied ? 'Copied' : family?.invite_code ?? '—'} chevron onClick={handleShareCode} />
        </div>
      </div>

      <div>
        <span className="label" style={{ display: 'block', padding: '0 0 6px' }}>Children</span>
        <div className="lb-card">
          {children.map((child) => (
            <FieldRow key={child.id} label={child.first_name} value={formatChildAge(child) || '—'} chevron onClick={() => navigate('/app/hub')} />
          ))}
          <FieldRow label="Add child" placeholder="Add" onClick={() => navigate('/onboarding/baby?returnTo=/app/account')} />
        </div>
      </div>

      <div>
        <span className="label" style={{ display: 'block', padding: '0 0 6px' }}>Account</span>
        <div className="lb-card">
          <FieldRow label="Units" value="oz · °F" />
          <FieldRow label="Theme" value={theme === 'dark' ? 'Dark' : 'Light'} chevron onClick={toggleTheme} />
          <FieldRow label="Password" placeholder={changingPassword ? undefined : 'Change'} onClick={() => setChangingPassword((v) => !v)} />
        </div>
        {changingPassword && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            <TextField
              value={newPassword}
              onChange={setNewPassword}
              type="password"
              placeholder="New password"
              autoComplete="new-password"
              minLength={6}
            />
            {pwError && <p className="caption" style={{ color: 'var(--status-danger)' }}>{pwError}</p>}
            {pwSuccess && <p className="caption" style={{ color: 'var(--status-success)' }}>Password updated.</p>}
            <Button size="md" onClick={handlePasswordSave} disabled={pwSaving || newPassword.length < 6}>
              {pwSaving ? 'Saving…' : 'Save password'}
            </Button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
        <Button variant="danger" size="md" onClick={() => signOut()}>
          Log out
        </Button>
      </div>

      <span className="caption" style={{ textAlign: 'center' }}>Logged in as {caregiver?.display_name}</span>
    </>
  )
}
