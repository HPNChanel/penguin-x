import { useEffect, useState } from "react"
import { Moon, Sun, Monitor, Contrast, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEnhancedTheme } from "@/store/app-store"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { 
    theme, 
    systemTheme, 
    highContrast, 
    setTheme, 
    setSystemTheme, 
    setHighContrast 
  } = useEnhancedTheme()
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (systemTheme) {
        setTheme(mediaQuery.matches ? "dark" : "light")
      }
    }
    
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [systemTheme, setTheme])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="hover-scale">
        <div className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const currentTheme = systemTheme 
    ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    : theme

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="hover-scale focus-ring">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 ease-smooth dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 ease-smooth dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 animate-scale-in">
        <DropdownMenuLabel>Theme Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => {
            setSystemTheme(false)
            setTheme("light")
          }}
          className="hover-glow focus-ring"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {!systemTheme && currentTheme === "light" && (
            <Check className="ml-auto h-4 w-4 text-primary" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => {
            setSystemTheme(false)
            setTheme("dark")
          }}
          className="hover-glow focus-ring"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {!systemTheme && currentTheme === "dark" && (
            <Check className="ml-auto h-4 w-4 text-primary" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => {
            setSystemTheme(true)
            const systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
            setTheme(systemPreference)
          }}
          className="hover-glow focus-ring"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {systemTheme && (
            <Check className="ml-auto h-4 w-4 text-primary" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => setHighContrast(!highContrast)}
          className={cn(
            "hover-glow focus-ring",
            highContrast && "bg-accent"
          )}
        >
          <Contrast className="mr-2 h-4 w-4" />
          <span>High Contrast</span>
          {highContrast && (
            <Check className="ml-auto h-4 w-4 text-primary" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
