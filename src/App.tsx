import { BrowserRouter, Navigate, Route, Routes, useSearchParams } from 'react-router-dom'
import { ThemeProvider } from './app/ThemeContext'
import { AppDataProvider, useAppData } from './app/AppDataContext'
import { AppShell } from './app/AppShell'
import { SignIn } from './screens/auth/SignIn'
import { SignUp } from './screens/auth/SignUp'
import { CreateOrJoinFamily } from './screens/auth/CreateOrJoinFamily'
import { FamilyCode } from './screens/auth/FamilyCode'
import { AddBaby } from './screens/auth/AddBaby'
import { FamilyHub } from './screens/hub/FamilyHub'
import { ActivityDashboard } from './screens/activity/ActivityDashboard'
import { EditActivities } from './screens/activity/EditActivities'
import { History } from './screens/history/History'
import { Trends } from './screens/trends/Trends'
import { Account } from './screens/account/Account'
import { FeedLogger } from './screens/loggers/FeedLogger'
import { PumpLogger } from './screens/loggers/PumpLogger'
import { DiaperLogger } from './screens/loggers/DiaperLogger'
import { SleepLogger } from './screens/loggers/SleepLogger'

function FullScreenLoading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', background: 'var(--bg-base)' }}>
      <span className="serif" style={{ fontSize: 28, color: 'var(--text-primary)' }}>Layne</span>
    </div>
  )
}

function Gate() {
  const { session, authLoading, caregiver, bootstrapLoading, children } = useAppData()

  if (authLoading || (session && bootstrapLoading)) return <FullScreenLoading />

  if (!session) return <Navigate to="/sign-in" replace />
  if (!caregiver?.family_id) return <Navigate to="/onboarding/family" replace />
  if (children.length === 0) return <Navigate to="/onboarding/baby" replace />
  return <Navigate to="/app/activity" replace />
}

function RequireOnboarded({ children: node }: { children: React.ReactNode }) {
  const { session, authLoading, caregiver, bootstrapLoading, children: kids } = useAppData()
  if (authLoading || (session && bootstrapLoading)) return <FullScreenLoading />
  if (!session) return <Navigate to="/sign-in" replace />
  if (!caregiver?.family_id) return <Navigate to="/onboarding/family" replace />
  if (kids.length === 0) return <Navigate to="/onboarding/baby" replace />
  return <>{node}</>
}

// Guards the "create or join a family" chooser: a returning user who already has a
// family (e.g. their PWA icon or browser reopened straight to this URL from history)
// should never see it again — skip straight to wherever they actually belong. Does NOT
// guard the family-code screen, which is legitimately visited with a family_id already
// set (it's shown right after create_family succeeds, to display the new invite code).
function RequireNoFamilyYet({ children: node }: { children: React.ReactNode }) {
  const { session, authLoading, caregiver, bootstrapLoading, children: kids } = useAppData()
  if (authLoading || (session && bootstrapLoading)) return <FullScreenLoading />
  if (!session) return <Navigate to="/sign-in" replace />
  if (caregiver?.family_id) {
    return <Navigate to={kids.length === 0 ? '/onboarding/baby' : '/app/activity'} replace />
  }
  return <>{node}</>
}

function RequireAuth({ children: node }: { children: React.ReactNode }) {
  const { session, authLoading } = useAppData()
  if (authLoading) return <FullScreenLoading />
  if (!session) return <Navigate to="/sign-in" replace />
  return <>{node}</>
}

// Guards the "add a baby" onboarding step: a returning user who already has a child
// should be sent to the dashboard instead, unless they explicitly opened this screen
// from within the app to add another child (returnTo is only ever set by that flow).
function RequireNoChildYet({ children: node }: { children: React.ReactNode }) {
  const { session, authLoading, caregiver, bootstrapLoading, children: kids } = useAppData()
  const [params] = useSearchParams()
  const addingAnother = params.has('returnTo')
  if (authLoading || (session && bootstrapLoading)) return <FullScreenLoading />
  if (!session) return <Navigate to="/sign-in" replace />
  if (!caregiver?.family_id) return <Navigate to="/onboarding/family" replace />
  if (!addingAnother && kids.length > 0) return <Navigate to="/app/activity" replace />
  return <>{node}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Gate />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route
        path="/onboarding/family"
        element={
          <RequireNoFamilyYet>
            <CreateOrJoinFamily />
          </RequireNoFamilyYet>
        }
      />
      <Route
        path="/onboarding/family/code"
        element={
          <RequireAuth>
            <FamilyCode />
          </RequireAuth>
        }
      />
      <Route
        path="/onboarding/baby"
        element={
          <RequireNoChildYet>
            <AddBaby />
          </RequireNoChildYet>
        }
      />

      <Route
        path="/app"
        element={
          <RequireOnboarded>
            <AppShell />
          </RequireOnboarded>
        }
      >
        <Route index element={<Navigate to="activity" replace />} />
        <Route path="activity" element={<ActivityDashboard />} />
        <Route path="history" element={<History />} />
        <Route path="trends" element={<Trends />} />
        <Route path="account" element={<Account />} />
      </Route>

      <Route
        path="/app/hub"
        element={
          <RequireOnboarded>
            <FamilyHub />
          </RequireOnboarded>
        }
      />
      <Route
        path="/app/activities/edit"
        element={
          <RequireOnboarded>
            <EditActivities />
          </RequireOnboarded>
        }
      />
      <Route
        path="/app/log/feed"
        element={
          <RequireOnboarded>
            <FeedLogger />
          </RequireOnboarded>
        }
      />
      <Route
        path="/app/log/pump"
        element={
          <RequireOnboarded>
            <PumpLogger />
          </RequireOnboarded>
        }
      />
      <Route
        path="/app/log/diaper"
        element={
          <RequireOnboarded>
            <DiaperLogger />
          </RequireOnboarded>
        }
      />
      <Route
        path="/app/log/sleep"
        element={
          <RequireOnboarded>
            <SleepLogger />
          </RequireOnboarded>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppDataProvider>
          <AppRoutes />
        </AppDataProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
