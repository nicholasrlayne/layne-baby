import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/global.css'
import './styles/components.css'
import App from './App.tsx'

// registerType: 'autoUpdate' only takes effect through this registration call — it
// silently activates a new service worker and reloads the page once one is found.
// Without this, the app can keep serving an old cached build indefinitely even after
// a fresh deploy, since nothing ever asks the browser to check for one.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return
    const checkForUpdate = () => registration.update().catch(() => {})
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdate()
    })
    setInterval(checkForUpdate, 60 * 60 * 1000)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
