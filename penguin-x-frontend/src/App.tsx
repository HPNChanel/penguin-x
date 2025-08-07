import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/context/theme-provider"

// Layouts
import { DashboardLayout } from "@/layouts/dashboard-layout"

// Pages
import { LandingPage } from "@/pages/landing"
import { LoginPage } from "@/pages/login"
import { RegisterPage } from "@/pages/register"
import { DashboardOverview } from "@/pages/dashboard-overview"
import { FinancePage } from "@/pages/finance"
import { AcademyPage } from "@/pages/academy"
import { InvestPage } from "@/pages/invest"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="penguin-x-theme">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="academy" element={<AcademyPage />} />
            <Route path="invest" element={<InvestPage />} />
          </Route>

          {/* Catch all route - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App