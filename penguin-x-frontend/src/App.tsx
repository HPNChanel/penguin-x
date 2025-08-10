import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { lazy, Suspense } from "react"
import { ThemeProvider } from "@/context/theme-provider"
import { Toaster } from "sonner"

// Initialize i18n
import "@/lib/i18n"

// Components
import { ProtectedRoute } from "@/components/protected-route"
import { LoadingBar } from "@/components/ui/loading-bar"
import { PageTransition } from "@/components/ui/page-transition"

// Layouts
import { DashboardLayout } from "@/layouts/dashboard-layout"

// Lazy load pages for better performance
import { LandingPage } from "@/pages/landing"
import { LoginPage } from "@/pages/login"
import { RegisterPage } from "@/pages/register"

// Lazy loaded dashboard pages
const DashboardOverview = lazy(() => import("@/pages/dashboard-overview").then(m => ({ default: m.DashboardOverview })))
const FinancePage = lazy(() => import("@/pages/finance").then(m => ({ default: m.FinancePage })))
const AcademyPage = lazy(() => import("@/pages/academy").then(m => ({ default: m.AcademyPage })))
const InvestPage = lazy(() => import("@/pages/invest").then(m => ({ default: m.InvestPage })))
const ChartsPage = lazy(() => import("@/pages/charts").then(m => ({ default: m.ChartsPage })))

// Store
import { useLoading } from "@/store/app-store"

function App() {
  const { isLoading } = useLoading()

  return (
    <ThemeProvider defaultTheme="dark" storageKey="penguin-x-theme">
      <Router>
        <LoadingBar loading={isLoading} />
        <PageTransition>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Dashboard Routes - Protected */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard/overview" replace />} />
              <Route path="overview" element={
                <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
                  <DashboardOverview />
                </Suspense>
              } />
              <Route path="finance" element={
                <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
                  <FinancePage />
                </Suspense>
              } />
              <Route path="academy" element={
                <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
                  <AcademyPage />
                </Suspense>
              } />
              <Route path="invest" element={
                <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
                  <InvestPage />
                </Suspense>
              } />
              <Route path="charts" element={
                <Suspense fallback={<div className="flex items-center justify-center h-64">Loading Charts...</div>}>
                  <ChartsPage />
                </Suspense>
              } />
            </Route>

            {/* Catch all route - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
        <Toaster 
          position="top-right" 
          className="pointer-events-auto"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
            classNames: {
              toast: 'animate-slide-down',
              title: 'text-sm font-medium',
              description: 'text-xs text-muted-foreground',
              actionButton: 'bg-primary text-primary-foreground',
              cancelButton: 'bg-muted text-muted-foreground',
              closeButton: 'bg-muted text-muted-foreground hover:bg-muted/80',
            },
          }}
          expand
          richColors
          closeButton
        />
      </Router>
    </ThemeProvider>
  )
}

export default App