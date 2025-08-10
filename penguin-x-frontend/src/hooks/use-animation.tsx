/**
 * Animation Hook
 * 
 * Provides context-aware animations with automatic reduced motion support,
 * performance optimization, and natural motion curves.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  prefersReducedMotion, 
  DURATIONS, 
  EASINGS, 
  createTransition,
  calculateStaggerDelay,
  AnimationSequence 
} from '@/lib/animation-utils'

export interface AnimationOptions {
  duration?: keyof typeof DURATIONS
  easing?: keyof typeof EASINGS
  delay?: number
  stagger?: number
  reduce?: boolean // Force reduced motion
}

export interface AnimationState {
  isVisible: boolean
  isAnimating: boolean
  hasAnimated: boolean
}

// Main animation hook
export function useAnimation(options: AnimationOptions = {}) {
  const {
    duration = 'short',
    easing = 'naturalOut',
    delay = 0,
    stagger = 0,
    reduce = false
  } = options

  const [state, setState] = useState<AnimationState>({
    isVisible: false,
    isAnimating: false,
    hasAnimated: false
  })

  const timeoutRef = useRef<NodeJS.Timeout>()
  const reducedMotion = prefersReducedMotion() || reduce

  const trigger = useCallback((visible = true) => {
    if (reducedMotion) {
      setState({
        isVisible: visible,
        isAnimating: false,
        hasAnimated: true
      })
      return
    }

    setState(prev => ({
      ...prev,
      isAnimating: true
    }))

    const effectiveDelay = delay + stagger

    timeoutRef.current = setTimeout(() => {
      setState({
        isVisible: visible,
        isAnimating: false,
        hasAnimated: true
      })
    }, effectiveDelay)
  }, [delay, stagger, reducedMotion])

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setState({
      isVisible: false,
      isAnimating: false,
      hasAnimated: false
    })
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const transitionClasses = createTransition(duration, easing)

  return {
    ...state,
    trigger,
    reset,
    transitionClasses,
    reducedMotion
  }
}

// List animation hook with intelligent staggering
export function useListAnimation<T>(
  items: T[],
  options: AnimationOptions & { 
    keyExtractor?: (item: T, index: number) => string | number
    maxStagger?: number
  } = {}
) {
  const {
    duration = 'short',
    easing = 'spring',
    delay = 0,
    stagger = 50,
    maxStagger = 5,
    keyExtractor = (_, index) => index,
    reduce = false
  } = options

  const [visibleItems, setVisibleItems] = useState<Set<string | number>>(new Set())
  const [removingItems, setRemovingItems] = useState<Set<string | number>>(new Set())
  const sequenceRef = useRef<AnimationSequence>()
  const reducedMotion = prefersReducedMotion() || reduce

  useEffect(() => {
    if (reducedMotion) {
      // Skip animations, show all items immediately
      setVisibleItems(new Set(items.map(keyExtractor)))
      return
    }

    // Clear any existing sequence
    if (sequenceRef.current) {
      sequenceRef.current.clear()
    }
    sequenceRef.current = new AnimationSequence()

    const currentKeys = new Set(items.map(keyExtractor))
    const newKeys = [...currentKeys].filter(key => !visibleItems.has(key))
    
    if (newKeys.length > 0) {
      // Calculate intelligent stagger delays
      newKeys.forEach((key, index) => {
        const staggerDelay = calculateStaggerDelay(index, stagger, maxStagger)
        
        sequenceRef.current!.add(() => {
          setVisibleItems(prev => new Set([...prev, key]))
        }, delay + staggerDelay)
      })
    }

    // Handle item removal
    const keysToRemove = [...visibleItems].filter(key => !currentKeys.has(key))
    if (keysToRemove.length > 0) {
      setRemovingItems(new Set(keysToRemove))
      
      // Clean up after animation completes
      const cleanupDelay = duration === 'quick' ? 150 : 200
      sequenceRef.current.add(() => {
        setVisibleItems(prev => {
          const newSet = new Set(prev)
          keysToRemove.forEach(key => newSet.delete(key))
          return newSet
        })
        setRemovingItems(new Set())
      }, cleanupDelay)
    }

    return () => {
      if (sequenceRef.current) {
        sequenceRef.current.clear()
      }
    }
  }, [items, delay, stagger, maxStagger, duration, keyExtractor, visibleItems, reducedMotion])

  const getItemState = useCallback((item: T, index: number) => {
    const key = keyExtractor(item, index)
    const isVisible = visibleItems.has(key)
    const isRemoving = removingItems.has(key)

    return {
      isVisible,
      isRemoving,
      key,
      transitionClasses: createTransition(duration, easing)
    }
  }, [visibleItems, removingItems, keyExtractor, duration, easing])

  return {
    getItemState,
    visibleItems,
    removingItems,
    reducedMotion
  }
}

// Page transition hook
export function usePageTransition(pathname: string) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const reducedMotion = prefersReducedMotion()

  useEffect(() => {
    if (reducedMotion) {
      return
    }

    setIsTransitioning(true)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setIsTransitioning(false)
    }, 150)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [pathname, reducedMotion])

  return {
    isTransitioning,
    reducedMotion,
    transitionClasses: createTransition('short', 'naturalOut')
  }
}

// Modal animation hook
export function useModalAnimation(isOpen: boolean) {
  const [state, setState] = useState({
    shouldRender: false,
    isAnimating: false
  })
  const timeoutRef = useRef<NodeJS.Timeout>()
  const reducedMotion = prefersReducedMotion()

  useEffect(() => {
    if (isOpen) {
      setState({ shouldRender: true, isAnimating: true })
      
      if (!reducedMotion) {
        timeoutRef.current = setTimeout(() => {
          setState(prev => ({ ...prev, isAnimating: false }))
        }, 50) // Small delay for mounting
      } else {
        setState(prev => ({ ...prev, isAnimating: false }))
      }
    } else {
      setState(prev => ({ ...prev, isAnimating: true }))
      
      const exitDelay = reducedMotion ? 0 : 200
      timeoutRef.current = setTimeout(() => {
        setState({ shouldRender: false, isAnimating: false })
      }, exitDelay)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isOpen, reducedMotion])

  const overlayClasses = reducedMotion 
    ? (isOpen ? 'opacity-100' : 'opacity-0')
    : createTransition('short', isOpen ? 'naturalOut' : 'naturalIn') + 
      (isOpen && !state.isAnimating ? ' opacity-100' : ' opacity-0')

  const contentClasses = reducedMotion
    ? (isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-96 translate-y-2')
    : createTransition('medium', isOpen ? 'naturalOut' : 'naturalIn') + 
      (isOpen && !state.isAnimating 
        ? ' opacity-100 scale-100 translate-y-0' 
        : ' opacity-0 scale-[0.96] translate-y-2')

  return {
    shouldRender: state.shouldRender,
    isAnimating: state.isAnimating,
    overlayClasses,
    contentClasses,
    reducedMotion
  }
}

// Performance-aware animation hook that disables animations during high load
export function usePerformantAnimation(
  baseOptions: AnimationOptions = {},
  performanceThreshold = 16.67 // 60fps
) {
  const [isHighLoad, setIsHighLoad] = useState(false)
  const frameTimeRef = useRef<number[]>([])
  const animationHook = useAnimation({
    ...baseOptions,
    reduce: baseOptions.reduce || isHighLoad
  })

  useEffect(() => {
    let animationFrameId: number
    let lastTime = performance.now()

    const checkPerformance = (currentTime: number) => {
      const frameTime = currentTime - lastTime
      lastTime = currentTime

      frameTimeRef.current.push(frameTime)
      
      // Keep only last 30 frames
      if (frameTimeRef.current.length > 30) {
        frameTimeRef.current.shift()
      }

      // Calculate average frame time
      const avgFrameTime = frameTimeRef.current.reduce((a, b) => a + b, 0) / frameTimeRef.current.length
      
      setIsHighLoad(avgFrameTime > performanceThreshold)
      
      animationFrameId = requestAnimationFrame(checkPerformance)
    }

    animationFrameId = requestAnimationFrame(checkPerformance)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [performanceThreshold])

  return {
    ...animationHook,
    isHighLoad,
    adaptiveReduce: isHighLoad
  }
}

export default {
  useAnimation,
  useListAnimation,
  usePageTransition,
  useModalAnimation,
  usePerformantAnimation
}
