import { useState, useEffect } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import { 
  Menu, 
  Home, 
  DollarSign, 
  BookOpen, 
  TrendingUp,
  User,
  LogOut
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { SkipLink } from "@/components/ui/skip-link"
import { PageTransition } from "@/components/ui/page-transition"
import { MobileNav } from "@/components/ui/mobile-nav"
import { useUser, useLoading } from "@/store/app-store"
import { cn } from "@/lib/utils"

export function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useUser()
  const { setLoading } = useLoading()
  const { t } = useTranslation()

  const navigation = [
    { name: t('nav.overview'), href: "/dashboard/overview", icon: Home, enabled: true },
    { name: t('nav.finance'), href: "/dashboard/finance", icon: DollarSign, enabled: true },
    { name: t('nav.academy'), href: "/dashboard/academy", icon: BookOpen, enabled: false },
    { name: t('nav.invest'), href: "/dashboard/invest", icon: TrendingUp, enabled: true },
    { name: t('nav.charts'), href: "/dashboard/charts", icon: TrendingUp, enabled: true },
  ]

  // Simulate loading on route change
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [location.pathname, setLoading])

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Skip Links for accessibility */}
      <SkipLink href="#main-content">{t('nav.skipToMain')}</SkipLink>
      
      {/* Top Navigation Bar */}
      <header 
        className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        role="banner"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-bold">Penguin X</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav 
              className="hidden md:flex md:space-x-8"
              role="navigation"
              aria-label={t('a11y.navigation')}
            >
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <div key={item.name} className="relative">
                    {item.enabled ? (
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-smooth hover-glow focus-visible-ring",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent hover:shadow-sm"
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    ) : (
                      <div className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground/50 cursor-not-allowed relative">
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          Dev
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-x-4">
              <LanguageSwitcher />
              <ThemeToggle />
              
              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-10 w-10 rounded-full hover-scale focus-visible-ring"
                    aria-label={t('a11y.userMenu')}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentUser?.avatar} alt={`@${currentUser?.firstName}`} />
                      <AvatarFallback>
                        {currentUser && currentUser.firstName && currentUser.lastName ? 
                          `${currentUser.firstName[0].toUpperCase()}${currentUser.lastName[0].toUpperCase()}` : 
                          currentUser && currentUser.firstName ?
                          currentUser.firstName[0].toUpperCase() :
                          'UN'
                        }
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Guest User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser?.email || 'guest@example.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="focus-visible-ring">
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('nav.profile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      logout()
                      navigate('/login')
                    }}
                    className="focus-visible-ring"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('nav.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="md:hidden focus-visible-ring"
                    aria-label={t('nav.openMenu')}
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">{t('nav.openMenu')}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="mt-6 space-y-2">
                    {navigation.map((item) => {
                      const isActive = location.pathname === item.href
                      return (
                        <div key={item.name}>
                          {item.enabled ? (
                            <Link
                              to={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                              )}
                            >
                              <item.icon className="h-5 w-5" />
                              <span>{item.name}</span>
                            </Link>
                          ) : (
                            <div className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground/50 cursor-not-allowed relative">
                              <item.icon className="h-5 w-5" />
                              <span>{item.name}</span>
                              <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                                Under Development
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        id="main-content"
        className="py-6" 
        role="main"
        aria-label={t('a11y.mainContent')}
        tabIndex={-1}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}
