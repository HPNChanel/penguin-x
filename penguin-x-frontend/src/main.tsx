import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize analytics and error tracking
import { analytics, ErrorBoundary } from './lib/analytics'

// Initialize security features
import { initCSPReporting } from './security/csp-config'
import { promiseManager } from './lib/promise-manager'

// Track initial page view
analytics.trackPageView()

// Set document language from i18n
const savedLanguage = localStorage.getItem('penguin-x-language') || 'en'
document.documentElement.lang = savedLanguage

// Initialize CSP reporting
initCSPReporting()

// Initialize promise manager (sets up global handlers)
promiseManager

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
