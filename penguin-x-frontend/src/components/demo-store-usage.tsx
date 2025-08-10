import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore, useUser, useTheme } from "@/store/app-store"

export function DemoStoreUsage() {
  // Using the main store hook
  const { currentUser, isAuthenticated, theme, setUser, logout, toggleTheme } = useAppStore()
  
  // Using specialized hooks
  const userHook = useUser()
  const themeHook = useTheme()

  const handleSetDemoUser = () => {
    const demoUser = {
      id: "demo-123",
      email: "demo@penguinx.com",
      firstName: "Demo",
      lastName: "User",
      avatar: "/avatars/demo.png",
      role: "admin"
    }
    setUser(demoUser)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Zustand Store Demo</CardTitle>
        <CardDescription>
          Test the global state management functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User State Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">User State</h3>
          <div className="p-4 bg-muted rounded-lg">
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            {currentUser ? (
              <div className="mt-2">
                <p><strong>Name:</strong> {currentUser.firstName} {currentUser.lastName}</p>
                <p><strong>Email:</strong> {currentUser.email}</p>
                <p><strong>Role:</strong> {currentUser.role}</p>
                <p><strong>ID:</strong> {currentUser.id}</p>
              </div>
            ) : (
              <p className="mt-2 text-muted-foreground">No user logged in</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSetDemoUser} disabled={isAuthenticated}>
              Set Demo User
            </Button>
            <Button variant="outline" onClick={handleLogout} disabled={!isAuthenticated}>
              Logout
            </Button>
          </div>
        </div>

        {/* Theme State Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Theme State</h3>
          <div className="p-4 bg-muted rounded-lg">
            <p><strong>Current Theme:</strong> {theme}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={toggleTheme}>
              Toggle Theme
            </Button>
            <Button variant="outline" onClick={() => themeHook.setTheme('light')}>
              Set Light
            </Button>
            <Button variant="outline" onClick={() => themeHook.setTheme('dark')}>
              Set Dark
            </Button>
          </div>
        </div>

        {/* Store Persistence Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Persistence</h3>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              State is automatically persisted to localStorage with key 'penguin-x-storage'.
              Refresh the page to test persistence!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
