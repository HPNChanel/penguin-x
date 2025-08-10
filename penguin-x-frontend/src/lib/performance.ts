// Performance monitoring and optimization utilities

// Web Vitals tracking
export interface WebVitals {
  FCP: number | null // First Contentful Paint
  LCP: number | null // Largest Contentful Paint
  FID: number | null // First Input Delay
  CLS: number | null // Cumulative Layout Shift
  TTFB: number | null // Time to First Byte
}

class PerformanceMonitor {
  private vitals: WebVitals = {
    FCP: null,
    LCP: null,
    FID: null,
    CLS: null,
    TTFB: null
  }

  private observers: PerformanceObserver[] = []

  constructor() {
    this.initializeObservers()
  }

  private initializeObservers() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          this.vitals.LCP = lastEntry.startTime
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)
      } catch (e) {
        console.warn('LCP observer not supported')
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            this.vitals.FID = entry.processingStart - entry.startTime
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)
      } catch (e) {
        console.warn('FID observer not supported')
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          this.vitals.CLS = clsValue
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch (e) {
        console.warn('CLS observer not supported')
      }
    }

    // First Contentful Paint
    this.measureFCP()

    // Time to First Byte
    this.measureTTFB()
  }

  private measureFCP() {
    const paintEntries = performance.getEntriesByType('paint')
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    if (fcpEntry) {
      this.vitals.FCP = fcpEntry.startTime
    }
  }

  private measureTTFB() {
    const navigationEntries = performance.getEntriesByType('navigation')
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0] as PerformanceNavigationTiming
      this.vitals.TTFB = nav.responseStart - nav.requestStart
    }
  }

  getVitals(): WebVitals {
    return { ...this.vitals }
  }

  // Report vitals to analytics service
  reportVitals(callback?: (vitals: WebVitals) => void) {
    if (callback) {
      callback(this.getVitals())
    }
    
    // In production, you'd send this to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.table(this.getVitals())
    }
  }

  // Clean up observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Bundle size monitoring
export function getBundleSize(): Promise<number> {
  return new Promise((resolve) => {
    if ('navigator' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        resolve(estimate.usage || 0)
      }).catch(() => resolve(0))
    } else {
      resolve(0)
    }
  })
}

// Memory usage monitoring
export function getMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit
    }
  }
  return null
}

// Resource timing analysis
export function analyzeResourceTiming() {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  
  const analysis = {
    totalResources: resources.length,
    totalSize: 0,
    slowestResource: null as PerformanceResourceTiming | null,
    fastestResource: null as PerformanceResourceTiming | null,
    byType: {} as Record<string, { count: number; totalTime: number; avgTime: number }>
  }

  resources.forEach(resource => {
    const duration = resource.responseEnd - resource.startTime
    const type = resource.initiatorType || 'other'
    
    // Track by type
    if (!analysis.byType[type]) {
      analysis.byType[type] = { count: 0, totalTime: 0, avgTime: 0 }
    }
    analysis.byType[type].count++
    analysis.byType[type].totalTime += duration
    
    // Find slowest/fastest
    if (!analysis.slowestResource || duration > (analysis.slowestResource.responseEnd - analysis.slowestResource.startTime)) {
      analysis.slowestResource = resource
    }
    if (!analysis.fastestResource || duration < (analysis.fastestResource.responseEnd - analysis.fastestResource.startTime)) {
      analysis.fastestResource = resource
    }

    // Estimate size (not always available)
    if (resource.transferSize) {
      analysis.totalSize += resource.transferSize
    }
  })

  // Calculate averages
  Object.keys(analysis.byType).forEach(type => {
    const typeData = analysis.byType[type]
    typeData.avgTime = typeData.totalTime / typeData.count
  })

  return analysis
}

// Long task monitoring
export function monitorLongTasks(callback: (tasks: PerformanceEntry[]) => void) {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const tasks = list.getEntries()
        callback(tasks)
      })
      observer.observe({ entryTypes: ['longtask'] })
      return observer
    } catch (e) {
      console.warn('Long task observer not supported')
    }
  }
  return null
}

// Frame rate monitoring
export class FrameRateMonitor {
  private frameCount = 0
  private lastTime = performance.now()
  private fps = 0
  private animationId: number | null = null

  start() {
    const measure = (currentTime: number) => {
      this.frameCount++
      
      if (currentTime - this.lastTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime))
        this.frameCount = 0
        this.lastTime = currentTime
      }
      
      this.animationId = requestAnimationFrame(measure)
    }
    
    this.animationId = requestAnimationFrame(measure)
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  getFPS() {
    return this.fps
  }
}

// React performance utilities
export function measureRenderTime(componentName: string) {
  return {
    start: () => performance.mark(`${componentName}-render-start`),
    end: () => {
      performance.mark(`${componentName}-render-end`)
      performance.measure(
        `${componentName}-render`,
        `${componentName}-render-start`,
        `${componentName}-render-end`
      )
      
      const measures = performance.getEntriesByName(`${componentName}-render`)
      const lastMeasure = measures[measures.length - 1]
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${lastMeasure.duration.toFixed(2)}ms`)
      }
      
      return lastMeasure.duration
    }
  }
}

// Preload critical resources
export function preloadResource(href: string, as: string, type?: string) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  if (type) link.type = type
  document.head.appendChild(link)
}

// Prefetch future resources
export function prefetchResource(href: string) {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  document.head.appendChild(link)
}

// Critical CSS inlining
export function inlineCriticalCSS(css: string) {
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
}

// Service Worker utilities
export function registerServiceWorker(swPath: string = '/sw.js') {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.register(swPath)
      .then(registration => {
        console.log('SW registered:', registration)
        return registration
      })
      .catch(error => {
        console.log('SW registration failed:', error)
        return null
      })
  }
  return Promise.resolve(null)
}

// Performance budget checking
export function checkPerformanceBudget(budgets: {
  bundleSize?: number // KB
  loadTime?: number // ms
  fcp?: number // ms
  lcp?: number // ms
  cls?: number
}) {
  const vitals = performanceMonitor.getVitals()
  const results: Record<string, { passed: boolean; actual: number | null; budget: number }> = {}

  if (budgets.fcp !== undefined) {
    results.fcp = {
      passed: vitals.FCP !== null && vitals.FCP <= budgets.fcp,
      actual: vitals.FCP,
      budget: budgets.fcp
    }
  }

  if (budgets.lcp !== undefined) {
    results.lcp = {
      passed: vitals.LCP !== null && vitals.LCP <= budgets.lcp,
      actual: vitals.LCP,
      budget: budgets.lcp
    }
  }

  if (budgets.cls !== undefined) {
    results.cls = {
      passed: vitals.CLS !== null && vitals.CLS <= budgets.cls,
      actual: vitals.CLS,
      budget: budgets.cls
    }
  }

  return results
}

// Export for cleanup
export function cleanupPerformanceMonitoring() {
  performanceMonitor.disconnect()
}
