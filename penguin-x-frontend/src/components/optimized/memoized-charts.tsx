import React, { memo, useMemo, useCallback } from 'react'
import { 
  PortfolioPerformanceChart,
  RiskReturnScatter,
  AssetAllocationTreemap,
  CashflowWaterfall,
  DrawdownCurve,
  BenchmarkCompare
} from '@/components/charts'

// Memoized chart components with deep equality checks
interface BaseChartProps {
  loading?: boolean
  error?: string | null
  className?: string
}

// Portfolio Performance Chart with memoization
interface MemoizedPortfolioPerformanceProps extends BaseChartProps {
  data: any[]
}

export const MemoizedPortfolioPerformanceChart = memo<MemoizedPortfolioPerformanceProps>(
  ({ data, loading, error, className }) => {
    const memoizedData = useMemo(() => data, [data])
    
    return (
      <PortfolioPerformanceChart
        data={memoizedData}
        loading={loading}
        error={error}
        className={className}
      />
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison function for better performance
    return (
      prevProps.loading === nextProps.loading &&
      prevProps.error === nextProps.error &&
      prevProps.className === nextProps.className &&
      JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
    )
  }
)

MemoizedPortfolioPerformanceChart.displayName = 'MemoizedPortfolioPerformanceChart'

// Risk Return Scatter with memoization
interface MemoizedRiskReturnScatterProps extends BaseChartProps {
  data: any[]
}

export const MemoizedRiskReturnScatter = memo<MemoizedRiskReturnScatterProps>(
  ({ data, loading, error, className }) => {
    const memoizedData = useMemo(() => data, [data])
    
    return (
      <RiskReturnScatter
        data={memoizedData}
        loading={loading}
        error={error}
        className={className}
      />
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.loading === nextProps.loading &&
      prevProps.error === nextProps.error &&
      prevProps.className === nextProps.className &&
      prevProps.data.length === nextProps.data.length &&
      JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
    )
  }
)

MemoizedRiskReturnScatter.displayName = 'MemoizedRiskReturnScatter'

// Asset Allocation Treemap with memoization
interface MemoizedAssetAllocationTreemapProps extends BaseChartProps {
  data: any[]
}

export const MemoizedAssetAllocationTreemap = memo<MemoizedAssetAllocationTreemapProps>(
  ({ data, loading, error, className }) => {
    const memoizedData = useMemo(() => data, [data])
    
    return (
      <AssetAllocationTreemap
        data={memoizedData}
        loading={loading}
        error={error}
        className={className}
      />
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.loading === nextProps.loading &&
      prevProps.error === nextProps.error &&
      prevProps.className === nextProps.className &&
      JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
    )
  }
)

MemoizedAssetAllocationTreemap.displayName = 'MemoizedAssetAllocationTreemap'

// Cashflow Waterfall with memoization
interface MemoizedCashflowWaterfallProps extends BaseChartProps {
  data: any[]
}

export const MemoizedCashflowWaterfall = memo<MemoizedCashflowWaterfallProps>(
  ({ data, loading, error, className }) => {
    const memoizedData = useMemo(() => data, [data])
    
    return (
      <CashflowWaterfall
        data={memoizedData}
        loading={loading}
        error={error}
        className={className}
      />
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.loading === nextProps.loading &&
      prevProps.error === nextProps.error &&
      prevProps.className === nextProps.className &&
      JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
    )
  }
)

MemoizedCashflowWaterfall.displayName = 'MemoizedCashflowWaterfall'

// Drawdown Curve with memoization
interface MemoizedDrawdownCurveProps extends BaseChartProps {
  data: any[]
}

export const MemoizedDrawdownCurve = memo<MemoizedDrawdownCurveProps>(
  ({ data, loading, error, className }) => {
    const memoizedData = useMemo(() => data, [data])
    
    return (
      <DrawdownCurve
        data={memoizedData}
        loading={loading}
        error={error}
        className={className}
      />
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.loading === nextProps.loading &&
      prevProps.error === nextProps.error &&
      prevProps.className === nextProps.className &&
      JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
    )
  }
)

MemoizedDrawdownCurve.displayName = 'MemoizedDrawdownCurve'

// Benchmark Compare with memoization
interface MemoizedBenchmarkCompareProps extends BaseChartProps {
  data: any[]
  benchmarkNames?: {
    portfolio: string
    benchmark1: string
    benchmark2?: string
  }
}

export const MemoizedBenchmarkCompare = memo<MemoizedBenchmarkCompareProps>(
  ({ data, loading, error, className, benchmarkNames }) => {
    const memoizedData = useMemo(() => data, [data])
    const memoizedBenchmarkNames = useMemo(() => benchmarkNames, [benchmarkNames])
    
    return (
      <BenchmarkCompare
        data={memoizedData}
        loading={loading}
        error={error}
        className={className}
        benchmarkNames={memoizedBenchmarkNames}
      />
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.loading === nextProps.loading &&
      prevProps.error === nextProps.error &&
      prevProps.className === nextProps.className &&
      JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
      JSON.stringify(prevProps.benchmarkNames) === JSON.stringify(nextProps.benchmarkNames)
    )
  }
)

MemoizedBenchmarkCompare.displayName = 'MemoizedBenchmarkCompare'

// Hook for optimized chart rendering
export function useOptimizedChartsState() {
  const [renderCount, setRenderCount] = React.useState(0)
  
  const incrementRenderCount = useCallback(() => {
    setRenderCount(prev => prev + 1)
  }, [])
  
  const resetRenderCount = useCallback(() => {
    setRenderCount(0)
  }, [])
  
  // Monitor performance
  const [performanceMetrics, setPerformanceMetrics] = React.useState({
    totalRenderTime: 0,
    averageRenderTime: 0,
    lastRenderTime: 0
  })
  
  const recordRenderTime = useCallback((time: number) => {
    setPerformanceMetrics(prev => ({
      totalRenderTime: prev.totalRenderTime + time,
      averageRenderTime: (prev.totalRenderTime + time) / (renderCount + 1),
      lastRenderTime: time
    }))
  }, [renderCount])
  
  return {
    renderCount,
    incrementRenderCount,
    resetRenderCount,
    performanceMetrics,
    recordRenderTime
  }
}

// HOC for adding performance monitoring
export function withPerformanceMonitoring<T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  const MemoizedComponent = memo(Component)
  
  return React.forwardRef<any, T>((props, ref) => {
    const startTime = React.useRef<number>()
    
    React.useEffect(() => {
      startTime.current = performance.now()
    })
    
    React.useEffect(() => {
      if (startTime.current) {
        const endTime = performance.now()
        const renderTime = endTime - startTime.current
        
        // Log performance in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`)
        }
        
        // Store in performance observer if available
        if ('PerformanceObserver' in window) {
          try {
            performance.mark(`${componentName}-render-end`)
            performance.measure(
              `${componentName}-render`,
              `${componentName}-render-start`,
              `${componentName}-render-end`
            )
          } catch (error) {
            // Silently ignore performance measurement errors
          }
        }
      }
    })
    
    React.useEffect(() => {
      if ('PerformanceObserver' in window) {
        performance.mark(`${componentName}-render-start`)
      }
    }, [])
    
    return <MemoizedComponent {...props} ref={ref} />
  })
}

// Optimized grid layout for charts
interface OptimizedChartGridProps {
  children: React.ReactNode
  columns?: number
  gap?: number
  className?: string
}

export const OptimizedChartGrid = memo<OptimizedChartGridProps>(
  ({ children, columns = 2, gap = 6, className = '' }) => {
    const gridStyle = useMemo(() => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: `${gap * 0.25}rem`,
    }), [columns, gap])
    
    return (
      <div 
        className={`${className}`}
        style={gridStyle}
      >
        {children}
      </div>
    )
  }
)

OptimizedChartGrid.displayName = 'OptimizedChartGrid'

// Intersection Observer hook for lazy rendering
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  threshold: number = 0.1,
  rootMargin: string = '50px'
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false)
  const [hasIntersected, setHasIntersected] = React.useState(false)
  
  React.useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      { threshold, rootMargin }
    )
    
    observer.observe(element)
    
    return () => observer.disconnect()
  }, [threshold, rootMargin, hasIntersected])
  
  return { isIntersecting, hasIntersected }
}

// Lazy chart wrapper that only renders when visible
interface LazyChartWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

export const LazyChartWrapper = memo<LazyChartWrapperProps>(
  ({ children, fallback, className = '' }) => {
    const ref = React.useRef<HTMLDivElement>(null)
    const { hasIntersected } = useIntersectionObserver(ref, 0.1, '100px')
    
    return (
      <div ref={ref} className={className}>
        {hasIntersected ? children : (fallback || <div className="h-96 bg-muted/10 animate-pulse rounded" />)}
      </div>
    )
  }
)

LazyChartWrapper.displayName = 'LazyChartWrapper'
