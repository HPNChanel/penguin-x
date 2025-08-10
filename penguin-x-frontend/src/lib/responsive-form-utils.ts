import { useState, useEffect } from 'react'

// Breakpoint definitions for responsive forms
export const breakpoints = {
  xs: '(max-width: 475px)',
  sm: '(max-width: 640px)',
  md: '(max-width: 768px)',
  lg: '(max-width: 1024px)',
  xl: '(max-width: 1280px)',
  '2xl': '(max-width: 1536px)'
} as const

export type Breakpoint = keyof typeof breakpoints

// Hook for responsive form behavior
export function useResponsiveForm() {
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg')
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth

      if (width < 476) {
        setScreenSize('xs')
        setIsMobile(true)
        setIsTablet(false)
        setIsDesktop(false)
      } else if (width < 641) {
        setScreenSize('sm')
        setIsMobile(true)
        setIsTablet(false)
        setIsDesktop(false)
      } else if (width < 769) {
        setScreenSize('md')
        setIsMobile(false)
        setIsTablet(true)
        setIsDesktop(false)
      } else if (width < 1025) {
        setScreenSize('lg')
        setIsMobile(false)
        setIsTablet(true)
        setIsDesktop(false)
      } else if (width < 1281) {
        setScreenSize('xl')
        setIsMobile(false)
        setIsTablet(false)
        setIsDesktop(true)
      } else {
        setScreenSize('2xl')
        setIsMobile(false)
        setIsTablet(false)
        setIsDesktop(true)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return {
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    breakpoint: screenSize
  }
}

// Hook for detecting touch devices
export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      )
    }

    checkTouchDevice()
  }, [])

  return isTouchDevice
}

// Responsive form layout utilities
export const responsiveFormLayouts = {
  // Single column on mobile, two columns on tablet+
  adaptive: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-2'
  },
  
  // Single column on mobile, grid on desktop
  progressive: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-3 xl:grid-cols-4'
  },
  
  // Always single column
  stacked: {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-1',
    desktop: 'grid-cols-1'
  },
  
  // Responsive grid that adapts to content
  fluid: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]'
  }
}

// Generate responsive grid classes
export function getResponsiveGridClasses(layout: keyof typeof responsiveFormLayouts) {
  const config = responsiveFormLayouts[layout]
  return `grid ${config.mobile} ${config.tablet} ${config.desktop} gap-4`
}

// Form field sizing for different devices
export const responsiveFieldSizes = {
  input: {
    mobile: 'h-12 text-base', // Larger touch targets on mobile
    tablet: 'h-10 text-sm',
    desktop: 'h-9 text-sm'
  },
  
  button: {
    mobile: 'h-12 px-4 text-base min-w-[44px]', // 44px minimum touch target
    tablet: 'h-10 px-4 text-sm',
    desktop: 'h-9 px-3 text-sm'
  },
  
  select: {
    mobile: 'h-12 text-base',
    tablet: 'h-10 text-sm',
    desktop: 'h-9 text-sm'
  },
  
  textarea: {
    mobile: 'min-h-[120px] text-base p-4',
    tablet: 'min-h-[100px] text-sm p-3',
    desktop: 'min-h-[80px] text-sm p-3'
  }
}

// Get responsive field size classes
export function getResponsiveFieldSize(
  element: keyof typeof responsiveFieldSizes,
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
) {
  const sizes = responsiveFieldSizes[element]
  
  if (screenSize === 'xs' || screenSize === 'sm') {
    return sizes.mobile
  } else if (screenSize === 'md') {
    return sizes.tablet
  } else {
    return sizes.desktop
  }
}

// Form spacing utilities
export const responsiveSpacing = {
  section: {
    mobile: 'space-y-4',
    tablet: 'space-y-5',
    desktop: 'space-y-6'
  },
  
  field: {
    mobile: 'space-y-2',
    tablet: 'space-y-2',
    desktop: 'space-y-2'
  },
  
  form: {
    mobile: 'p-4',
    tablet: 'p-6',
    desktop: 'p-8'
  }
}

// Mobile-first form optimization
export const mobileFormOptimizations = {
  // Prevent zoom on iOS when focusing inputs
  preventZoom: {
    fontSize: '16px' // Minimum font size to prevent zoom
  },
  
  // Optimize input types for mobile keyboards
  inputTypes: {
    email: 'email',
    phone: 'tel',
    number: 'number',
    url: 'url',
    search: 'search'
  },
  
  // Mobile-friendly input modes
  inputModes: {
    numeric: 'numeric',
    decimal: 'decimal',
    email: 'email',
    tel: 'tel',
    url: 'url',
    search: 'search'
  }
}

// Performance optimizations for mobile forms
export function optimizeForMobile(isMobile: boolean, isTouchDevice: boolean) {
  return {
    // Use transform instead of changing layout for animations
    useTransform: isMobile,
    
    // Reduce animation complexity on mobile
    reduceMotion: isMobile && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    
    // Optimize touch interactions
    touchOptimizations: isTouchDevice ? {
      minTouchTarget: '44px',
      touchAction: 'manipulation', // Disable double-tap zoom
      userSelect: 'none' // Prevent text selection on buttons
    } : {},
    
    // Lazy load complex components on mobile
    lazyLoad: isMobile,
    
    // Reduce visual effects on low-end devices
    simplifiedEffects: isMobile && navigator.hardwareConcurrency <= 4
  }
}

// Form validation timing for different devices
export const responsiveValidationTiming = {
  mobile: {
    debounceDelay: 500, // Longer delay on mobile for typing
    validateOnBlur: true,
    validateOnChange: false // Avoid too many validations while typing
  },
  
  desktop: {
    debounceDelay: 300,
    validateOnBlur: true,
    validateOnChange: true
  }
}

// Keyboard navigation helpers
export function enhanceKeyboardNavigation(isMobile: boolean) {
  if (isMobile) {
    return {
      // Mobile devices may not have physical keyboards
      skipKeyboardShortcuts: true,
      focusManagement: 'basic'
    }
  }
  
  return {
    skipKeyboardShortcuts: false,
    focusManagement: 'enhanced',
    
    // Common keyboard shortcuts
    shortcuts: {
      submit: ['Enter'],
      reset: ['Escape'],
      nextField: ['Tab'],
      previousField: ['Shift+Tab'],
      selectAll: ['Ctrl+A', 'Cmd+A']
    }
  }
}

// Viewport utilities for form positioning
export function useViewportAwarePositioning() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  })

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  const isSmallViewport = viewport.height < 600
  const isNarrowViewport = viewport.width < 400

  return {
    viewport,
    isSmallViewport,
    isNarrowViewport,
    
    // Adjust modal/dropdown positioning for small viewports
    getModalPosition: () => ({
      maxHeight: isSmallViewport ? '80vh' : '90vh',
      margin: isNarrowViewport ? '1rem' : '2rem'
    }),
    
    // Adjust form layout for viewport constraints
    getFormConstraints: () => ({
      maxWidth: isNarrowViewport ? '100%' : '600px',
      padding: isNarrowViewport ? '1rem' : '2rem'
    })
  }
}

// Device-specific form enhancements
export function getDeviceEnhancements(userAgent: string) {
  const isIOS = /iPad|iPhone|iPod/.test(userAgent)
  const isAndroid = /Android/.test(userAgent)
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
  
  return {
    // iOS-specific optimizations
    ios: isIOS ? {
      // Fix iOS Safari viewport units
      useViewportFix: true,
      // Prevent zoom on input focus
      preventInputZoom: true,
      // Handle safe area insets
      useSafeArea: true
    } : null,
    
    // Android-specific optimizations
    android: isAndroid ? {
      // Handle Android keyboard behavior
      keyboardBehavior: 'resize',
      // Optimize for various screen densities
      densityOptimization: true
    } : null,
    
    // Safari-specific fixes
    safari: isSafari ? {
      // Fix flexbox issues
      flexboxFixes: true,
      // Handle date input limitations
      dateInputFallback: true
    } : null
  }
}

export type ResponsiveFormConfig = {
  layout: keyof typeof responsiveFormLayouts
  enableTouchOptimizations: boolean
  mobileFirst: boolean
  adaptiveValidation: boolean
  keyboardEnhancements: boolean
}
