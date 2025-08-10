import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const location = useLocation()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentChildren, setCurrentChildren] = useState(children)

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      setCurrentChildren(children)
      return
    }

    // Start transition
    setIsTransitioning(true)
    
    // Wait for exit animation, then update content
    const exitTimer = setTimeout(() => {
      setCurrentChildren(children)
      setIsTransitioning(false)
    }, 150)

    return () => clearTimeout(exitTimer)
  }, [location.pathname])

  useEffect(() => {
    setCurrentChildren(children)
  }, [children])

  return (
    <div 
      className={cn(
        "transition-all duration-200 ease-natural-out",
        isTransitioning 
          ? "opacity-0 translate-y-1" 
          : "opacity-100 translate-y-0",
        className
      )}
    >
      {currentChildren}
    </div>
  )
}

// For individual component animations with origin-aware motion
export function AnimatedCard({ 
  children, 
  className,
  delay = 0,
  origin = 'bottom',
  ...props 
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  origin?: 'top' | 'bottom' | 'left' | 'right'
} & React.HTMLAttributes<HTMLDivElement>) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const originClasses = {
    bottom: isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
    top: isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3",
    left: isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3",
    right: isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-3",
  }

  return (
    <div
      className={cn(
        "transition-all duration-250 ease-natural-out",
        originClasses[origin],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Modal animation wrapper
export function AnimatedModal({
  children,
  isOpen,
  className,
}: {
  children: React.ReactNode
  isOpen: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "transition-all duration-250 ease-natural-out",
        isOpen
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-[0.96] translate-y-2",
        className
      )}
    >
      {children}
    </div>
  )
}
