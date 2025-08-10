import { Link, useLocation } from "react-router-dom"
import { Home, DollarSign, BookOpen, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Overview", href: "/dashboard/overview", icon: Home, enabled: true },
  { name: "Finance", href: "/dashboard/finance", icon: DollarSign, enabled: true },
  { name: "Academy", href: "/dashboard/academy", icon: BookOpen, enabled: false },
  { name: "Invest", href: "/dashboard/invest", icon: TrendingUp, enabled: true },
]

export function MobileNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:hidden">
      <div className="grid grid-cols-4 h-16">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <div key={item.name} className="relative">
              {item.enabled ? (
                <Link
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center h-full px-1 transition-all duration-200 ease-smooth focus-ring relative",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 mb-1 transition-all duration-200 ease-smooth",
                    isActive && "animate-bounce-gentle"
                  )} />
                  <span className={cn(
                    "text-xs font-medium transition-all duration-200 ease-smooth",
                    isActive ? "opacity-100" : "opacity-70"
                  )}>
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full animate-slide-down" />
                  )}
                </Link>
              ) : (
                <div className="flex flex-col items-center justify-center h-full px-1 text-muted-foreground/50 cursor-not-allowed relative">
                  <item.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium opacity-50">
                    {item.name}
                  </span>
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] px-1 py-0.5 rounded-full leading-none">
                    Dev
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
