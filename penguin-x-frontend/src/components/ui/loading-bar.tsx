import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface LoadingBarProps {
  loading: boolean
  className?: string
}

export function LoadingBar({ loading, className }: LoadingBarProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (loading) {
      setIsVisible(true)
    } else {
      // Add a small delay before hiding to ensure smooth transition
      const timer = setTimeout(() => setIsVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [loading])

  if (!isVisible) return null

  return (
    <div className={cn("loading-bar", className)}>
      <div className="h-full bg-primary animate-loading-bar" />
    </div>
  )
}

// Global loading bar hook
export function useLoadingBar() {
  const [isLoading, setIsLoading] = useState(false)

  const startLoading = () => setIsLoading(true)
  const stopLoading = () => setIsLoading(false)

  return { isLoading, startLoading, stopLoading }
}
