import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { TabBar } from '../components/TabBar'

const TAB_ITEMS = [
  { id: 'activity', label: 'Activity', icon: 'activity' },
  { id: 'history', label: 'History', icon: 'calendar-days' },
  { id: 'trends', label: 'Trends', icon: 'trending-up' },
  { id: 'account', label: 'Account', icon: 'user' },
]

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const active = TAB_ITEMS.find((t) => location.pathname.startsWith(`/app/${t.id}`))?.id ?? 'activity'

  return (
    <div className="lb-screen">
      <div
        className="lb-screen__body"
        style={{
          paddingTop: 'calc(var(--space-lg) + env(safe-area-inset-top))',
          paddingBottom: 'calc(74px + var(--space-lg) + env(safe-area-inset-bottom))',
        }}
      >
        <Outlet />
      </div>
      <TabBar items={TAB_ITEMS} value={active} onChange={(id) => navigate(`/app/${id}`)} />
    </div>
  )
}
