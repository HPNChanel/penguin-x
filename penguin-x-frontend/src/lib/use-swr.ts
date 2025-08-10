import { useState, useEffect, useCallback, useRef } from 'react'
import useSWR, { SWRConfiguration, mutate as globalMutate } from 'swr'
import axios, { AxiosRequestConfig } from 'axios'

// Custom fetcher that works with our API instance
const fetcher = async (url: string, config?: AxiosRequestConfig) => {
  const response = await axios.get(url, {
    ...config,
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      ...config?.headers,
    },
  })
  return response.data
}

// Enhanced SWR hook with stale-while-revalidate
export function useEnhancedSWR<T = any>(
  key: string | null,
  config?: SWRConfiguration & {
    fallbackData?: T
    enableStaleWhileRevalidate?: boolean
    cacheTime?: number
    staleTime?: number
  }
) {
  const {
    enableStaleWhileRevalidate = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 30 * 1000, // 30 seconds
    fallbackData,
    ...swrConfig
  } = config || {}

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      fallbackData,
      ...swrConfig,
    }
  )

  return {
    data: data as T,
    error,
    isLoading,
    isValidating,
    mutate,
    refresh: () => mutate(),
  }
}

// Charts-specific hooks with optimized caching
export function usePortfolioPerformance(timeRange?: string) {
  const key = timeRange ? `/charts/portfolio-performance?timeRange=${timeRange}` : '/charts/portfolio-performance'
  
  return useEnhancedSWR(key, {
    fallbackData: [],
    staleTime: 60000, // 1 minute - performance data updates frequently
    cacheTime: 300000, // 5 minutes
  })
}

export function useRiskReturnData() {
  return useEnhancedSWR('/charts/risk-return', {
    fallbackData: [],
    staleTime: 300000, // 5 minutes - risk metrics don't change as often
    cacheTime: 900000, // 15 minutes
  })
}

export function useAssetAllocation() {
  return useEnhancedSWR('/charts/asset-allocation', {
    fallbackData: [],
    staleTime: 300000, // 5 minutes
    cacheTime: 900000, // 15 minutes
  })
}

export function useCashflowData(period?: string) {
  const key = period ? `/charts/cashflow?period=${period}` : '/charts/cashflow'
  
  return useEnhancedSWR(key, {
    fallbackData: [],
    staleTime: 180000, // 3 minutes
    cacheTime: 600000, // 10 minutes
  })
}

export function useDrawdownData(timeRange?: string) {
  const key = timeRange ? `/charts/drawdown?timeRange=${timeRange}` : '/charts/drawdown'
  
  return useEnhancedSWR(key, {
    fallbackData: [],
    staleTime: 120000, // 2 minutes
    cacheTime: 600000, // 10 minutes
  })
}

export function useBenchmarkData(timeRange?: string, benchmarks?: string[]) {
  let key = '/charts/benchmark-comparison'
  const params = new URLSearchParams()
  if (timeRange) params.append('timeRange', timeRange)
  if (benchmarks) benchmarks.forEach(b => params.append('benchmarks', b))
  
  if (params.toString()) {
    key += `?${params.toString()}`
  }
  
  return useEnhancedSWR(key, {
    fallbackData: [],
    staleTime: 180000, // 3 minutes
    cacheTime: 600000, // 10 minutes
  })
}

// Cache management utilities
export const cacheUtils = {
  // Clear all chart caches
  clearChartCaches: () => {
    globalMutate(
      key => typeof key === 'string' && key.startsWith('/charts/'),
      undefined,
      { revalidate: false }
    )
  },

  // Preload chart data
  preloadChartData: async () => {
    const endpoints = [
      '/charts/portfolio-performance',
      '/charts/risk-return',
      '/charts/asset-allocation',
      '/charts/cashflow',
      '/charts/drawdown',
      '/charts/benchmark-comparison'
    ]

    const preloadPromises = endpoints.map(endpoint => 
      globalMutate(endpoint, fetcher(endpoint), { revalidate: false })
    )

    try {
      await Promise.allSettled(preloadPromises)
    } catch (error) {
      console.warn('Failed to preload some chart data:', error)
    }
  },

  // Refresh specific chart data
  refreshChart: (chartType: string) => {
    globalMutate(key => typeof key === 'string' && key.includes(chartType))
  },

  // Get cache statistics
  getCacheStats: () => {
    // This would require access to SWR's internal cache
    // For now, return a placeholder
    return {
      entries: 0,
      size: 0,
      hitRate: 0
    }
  }
}

// Background refresh hook for keeping data fresh
export function useBackgroundRefresh(interval: number = 300000) { // 5 minutes default
  const intervalRef = useRef<NodeJS.Timeout>()

  const startBackgroundRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      // Only refresh if the user is active and page is visible
      if (!document.hidden && document.hasFocus()) {
        cacheUtils.refreshChart('portfolio-performance')
        
        // Stagger other refreshes to avoid overwhelming the server
        setTimeout(() => cacheUtils.refreshChart('drawdown'), 1000)
        setTimeout(() => cacheUtils.refreshChart('benchmark'), 2000)
      }
    }, interval)
  }, [interval])

  const stopBackgroundRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    startBackgroundRefresh()
    
    // Listen for visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopBackgroundRefresh()
      } else {
        startBackgroundRefresh()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopBackgroundRefresh()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [startBackgroundRefresh, stopBackgroundRefresh])

  return {
    startBackgroundRefresh,
    stopBackgroundRefresh
  }
}

// Hook for optimistic updates
export function useOptimisticUpdate() {
  return useCallback(async (
    key: string,
    updateFn: (current: any) => any,
    revalidate: boolean = true
  ) => {
    try {
      await globalMutate(
        key,
        async (current) => {
          const updated = updateFn(current)
          return updated
        },
        { revalidate }
      )
    } catch (error) {
      console.error('Optimistic update failed:', error)
      // Revert by revalidating
      globalMutate(key)
    }
  }, [])
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  })

  const recordLoadTime = useCallback((time: number) => {
    setMetrics(prev => ({ ...prev, loadTime: time }))
  }, [])

  const recordRenderTime = useCallback((time: number) => {
    setMetrics(prev => ({ ...prev, renderTime: time }))
  }, [])

  const recordCacheHit = useCallback(() => {
    setMetrics(prev => ({ ...prev, cacheHits: prev.cacheHits + 1 }))
  }, [])

  const recordCacheMiss = useCallback(() => {
    setMetrics(prev => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }))
  }, [])

  return {
    metrics,
    recordLoadTime,
    recordRenderTime,
    recordCacheHit,
    recordCacheMiss
  }
}
