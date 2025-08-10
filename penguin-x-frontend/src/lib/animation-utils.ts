/**
 * Animation Utilities
 * 
 * Centralized animation helpers with proper reduced motion support,
 * natural easing curves, and context-aware durations.
 */

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Animation durations following natural motion principles
export const DURATIONS = {
  // Quick interactions (buttons, toggles)
  instant: '100ms',
  quick: '150ms',
  
  // Standard UI transitions
  short: '200ms',
  medium: '250ms',
  
  // Emphasis and complex transitions
  long: '300ms',
  
  // Special cases (loading, complex choreography)
  extended: '400ms',
} as const

// Natural easing curves based on physical motion
export const EASINGS = {
  // For entrances and reveals
  naturalOut: 'cubic-bezier(0, 0, 0.2, 1)',
  
  // For exits and dismissals
  naturalIn: 'cubic-bezier(0.4, 0, 1, 1)',
  
  // Standard ease-in-out
  natural: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Gentle spring effect for delightful interactions
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  
  // Gentle motion for subtle effects
  gentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
} as const

// Animation configurations for common UI patterns
export const ANIMATION_CONFIGS = {
  // Button interactions
  button: {
    hover: {
      duration: DURATIONS.quick,
      easing: EASINGS.naturalOut,
    },
    active: {
      duration: DURATIONS.instant,
      easing: EASINGS.naturalIn,
    },
  },
  
  // Card interactions
  card: {
    hover: {
      duration: DURATIONS.short,
      easing: EASINGS.naturalOut,
    },
    focus: {
      duration: DURATIONS.short,
      easing: EASINGS.naturalOut,
    },
  },
  
  // Modal and overlay transitions
  modal: {
    enter: {
      duration: DURATIONS.medium,
      easing: EASINGS.naturalOut,
    },
    exit: {
      duration: DURATIONS.short,
      easing: EASINGS.naturalIn,
    },
  },
  
  // Page transitions
  page: {
    enter: {
      duration: DURATIONS.short,
      easing: EASINGS.naturalOut,
    },
    exit: {
      duration: DURATIONS.quick,
      easing: EASINGS.naturalIn,
    },
  },
  
  // List and stagger animations
  list: {
    item: {
      duration: DURATIONS.short,
      easing: EASINGS.spring,
      stagger: 50, // ms between items
    },
  },
} as const

// Utility class generator for animations
export const createAnimationClasses = (
  type: keyof typeof ANIMATION_CONFIGS,
  state: 'enter' | 'exit' | 'hover' | 'active' | 'focus' | 'item' = 'enter'
) => {
  const config = ANIMATION_CONFIGS[type]
  
  if (!config || !(state in config)) {
    return ''
  }
  
  const animConfig = config[state as keyof typeof config] as any
  
  return `duration-[${animConfig.duration}] ease-[${animConfig.easing}]`
}

// Reduced motion utilities
export const withReducedMotion = (
  animatedClasses: string,
  fallbackClasses: string = ''
): string => {
  if (prefersReducedMotion()) {
    return fallbackClasses
  }
  return animatedClasses
}

// Create a reduced motion aware transition class
export const createTransition = (
  duration: keyof typeof DURATIONS = 'short',
  easing: keyof typeof EASINGS = 'naturalOut',
  properties: string[] = ['all']
): string => {
  if (prefersReducedMotion()) {
    return 'transition-none'
  }
  
  const propertyClass = properties.includes('all') 
    ? 'transition-all' 
    : `transition-[${properties.join(',')}]`
  
  return `${propertyClass} duration-[${DURATIONS[duration]}] ease-[${EASINGS[easing]}]`
}

// Stagger delay calculator for list animations
export const calculateStaggerDelay = (
  index: number,
  baseDelay: number = 50,
  maxItems: number = 5
): number => {
  // Reduce stagger for many items to avoid long delays
  const adjustedDelay = baseDelay * Math.min(1, maxItems / (index + 1))
  return Math.max(adjustedDelay, 20) // Minimum 20ms
}

// Animation state management for complex sequences
export class AnimationSequence {
  private timers: NodeJS.Timeout[] = []
  
  add(callback: () => void, delay: number): this {
    if (prefersReducedMotion()) {
      // Execute immediately for reduced motion
      callback()
      return this
    }
    
    const timer = setTimeout(callback, delay)
    this.timers.push(timer)
    return this
  }
  
  clear(): void {
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers = []
  }
}

// Hook for managing reduced motion state
export const useReducedMotion = () => {
  if (typeof window === 'undefined') return false
  
  const [reducedMotion, setReducedMotion] = React.useState(prefersReducedMotion())
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])
  
  return reducedMotion
}

// Animation performance utilities
export const optimizeForPerformance = {
  // Use transform and opacity for GPU acceleration
  gpuOptimized: 'transform-gpu will-change-transform',
  
  // Disable animations during resize for performance
  disableOnResize: () => {
    let resizeTimer: NodeJS.Timeout
    
    const handleResize = () => {
      document.body.classList.add('resize-animation-stopper')
      clearTimeout(resizeTimer)
      
      resizeTimer = setTimeout(() => {
        document.body.classList.remove('resize-animation-stopper')
      }, 400)
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer)
    }
  },
}

// Add React import for the hook
import React from 'react'

export default {
  DURATIONS,
  EASINGS,
  ANIMATION_CONFIGS,
  createAnimationClasses,
  withReducedMotion,
  createTransition,
  calculateStaggerDelay,
  AnimationSequence,
  useReducedMotion,
  optimizeForPerformance,
  prefersReducedMotion,
}
