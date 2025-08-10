import { useEffect } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useUser } from "@/store/app-store"
import { authAPI } from "@/lib/api"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser, isAuthenticated, setUser, logout } = useUser()
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token')
      
      if (token && !currentUser) {
        try {
          // Try to get current user from backend
          const user = await authAPI.getCurrentUser()
          
          // Split full_name into firstName and lastName
          const nameParts = user.full_name?.split(' ') || ['', '']
          const firstName = nameParts[0] || ''
          const lastName = nameParts.slice(1).join(' ') || ''
          
          setUser({
            id: user.id,
            email: user.email,
            firstName: firstName,
            lastName: lastName,
            avatar: user.avatar_url,
            role: user.role || "user"
          })
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('access_token')
          logout()
        }
      }
    }

    checkAuth()
  }, [currentUser, setUser, logout])

  if (!isAuthenticated && !localStorage.getItem('access_token')) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Show loading state while checking authentication
  if (localStorage.getItem('access_token') && !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
