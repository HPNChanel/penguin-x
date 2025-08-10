import { analytics } from './analytics'

/**
 * Promise Manager - Ensures all promises are properly handled
 * and no uncaught promise rejections occur
 */

interface PromiseOptions {
  timeout?: number
  retries?: number
  onRetry?: (attempt: number, error: Error) => void
  onError?: (error: Error) => void
  suppressErrors?: boolean
  context?: string
}

class PromiseManager {
  private static instance: PromiseManager
  private activePromises = new Set<Promise<any>>()
  private promiseTimeouts = new Map<Promise<any>, NodeJS.Timeout>()
  
  static getInstance(): PromiseManager {
    if (!PromiseManager.instance) {
      PromiseManager.instance = new PromiseManager()
    }
    return PromiseManager.instance
  }

  constructor() {
    this.setupGlobalHandlers()
  }

  private setupGlobalHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledRejection(event)
    })

    // Handle handled rejections (for logging)
    window.addEventListener('rejectionhandled', (event) => {
      this.handleRejectionHandled(event)
    })
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    console.error('Unhandled promise rejection:', event.reason)
    
    // Track the error
    analytics.trackEvent('unhandled_promise_rejection', {
      reason: event.reason?.toString() || 'Unknown error',
      stack: event.reason?.stack || '',
      timestamp: new Date().toISOString(),
      url: window.location.href
    })

    // Prevent default browser behavior (console error)
    event.preventDefault()

    // You might want to show a user-friendly error message
    this.showUserError('An unexpected error occurred. Our team has been notified.')
  }

  private handleRejectionHandled(event: PromiseRejectionEvent): void {
    // Log that a previously unhandled rejection was handled
    console.log('Promise rejection was handled:', event.reason)
  }

  private showUserError(message: string): void {
    // Show a user-friendly error message
    // This could integrate with your toast/notification system
    if (window.showToast) {
      window.showToast({ type: 'error', message })
    } else {
      // Fallback to alert if no toast system
      console.error('User Error:', message)
    }
  }

  /**
   * Wrap a promise with proper error handling and optional features
   */
  async wrapPromise<T>(
    promiseFactory: () => Promise<T>,
    options: PromiseOptions = {}
  ): Promise<T> {
    const {
      timeout = 30000,
      retries = 0,
      onRetry,
      onError,
      suppressErrors = false,
      context = 'unknown'
    } = options

    let lastError: Error | undefined
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const promise = this.withTimeout(promiseFactory(), timeout, context)
        this.trackPromise(promise)
        
        const result = await promise
        this.untrackPromise(promise)
        return result
        
      } catch (error) {
        lastError = error as Error
        
        if (attempt < retries) {
          onRetry?.(attempt + 1, lastError)
          // Exponential backoff
          await this.delay(Math.min(1000 * Math.pow(2, attempt), 10000))
        }
      }
    }

    // All retries failed
    if (lastError) {
      onError?.(lastError)
      
      if (!suppressErrors) {
        analytics.trackEvent('promise_failure', {
          context,
          error: lastError.message,
          stack: lastError.stack,
          attempts: retries + 1,
          timestamp: new Date().toISOString()
        })
      }
      
      throw lastError
    }

    throw new Error('Promise failed without error details')
  }

  /**
   * Add timeout to a promise
   */
  private withTimeout<T>(
    promise: Promise<T>, 
    timeoutMs: number, 
    context: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Promise timeout after ${timeoutMs}ms in context: ${context}`))
      }, timeoutMs)

      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeoutId))
    })
  }

  /**
   * Track active promises
   */
  private trackPromise(promise: Promise<any>): void {
    this.activePromises.add(promise)
    
    promise.finally(() => {
      this.activePromises.delete(promise)
      const timeout = this.promiseTimeouts.get(promise)
      if (timeout) {
        clearTimeout(timeout)
        this.promiseTimeouts.delete(promise)
      }
    })
  }

  /**
   * Remove promise from tracking
   */
  private untrackPromise(promise: Promise<any>): void {
    this.activePromises.delete(promise)
    const timeout = this.promiseTimeouts.get(promise)
    if (timeout) {
      clearTimeout(timeout)
      this.promiseTimeouts.delete(timeout)
    }
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Safe promise execution - always resolves, errors are handled
   */
  async safeExecute<T>(
    promiseFactory: () => Promise<T>,
    fallbackValue: T,
    options: Omit<PromiseOptions, 'suppressErrors'> = {}
  ): Promise<T> {
    try {
      return await this.wrapPromise(promiseFactory, {
        ...options,
        suppressErrors: true
      })
    } catch (error) {
      console.warn('Safe promise execution failed, using fallback:', error)
      return fallbackValue
    }
  }

  /**
   * Execute multiple promises with individual error handling
   */
  async executeAll<T>(
    promises: Array<() => Promise<T>>,
    options: PromiseOptions = {}
  ): Promise<Array<T | Error>> {
    const results = await Promise.allSettled(
      promises.map(factory => this.wrapPromise(factory, options))
    )

    return results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return result.reason
      }
    })
  }

  /**
   * Race with timeout and fallback
   */
  async raceWithFallback<T>(
    promises: Array<() => Promise<T>>,
    fallbackValue: T,
    timeout: number = 5000
  ): Promise<T> {
    try {
      const racePromises = promises.map(factory => 
        this.wrapPromise(factory, { timeout })
      )
      
      return await Promise.race(racePromises)
    } catch (error) {
      console.warn('Promise race failed, using fallback:', error)
      return fallbackValue
    }
  }

  /**
   * Get status of active promises
   */
  getActivePromiseCount(): number {
    return this.activePromises.size
  }

  /**
   * Wait for all active promises to complete
   */
  async waitForAllPromises(timeout: number = 30000): Promise<void> {
    const start = Date.now()
    
    while (this.activePromises.size > 0 && Date.now() - start < timeout) {
      await this.delay(100)
    }

    if (this.activePromises.size > 0) {
      console.warn(`${this.activePromises.size} promises still active after timeout`)
    }
  }

  /**
   * Cancel all active promises (if possible)
   */
  cancelAllPromises(): void {
    // Clear timeouts
    this.promiseTimeouts.forEach(timeout => clearTimeout(timeout))
    this.promiseTimeouts.clear()
    
    // Clear tracking
    this.activePromises.clear()
  }
}

// Singleton instance
export const promiseManager = PromiseManager.getInstance()

// Convenience functions
export const safePromise = <T>(
  promiseFactory: () => Promise<T>,
  options?: PromiseOptions
): Promise<T> => {
  return promiseManager.wrapPromise(promiseFactory, options)
}

export const safeExecute = <T>(
  promiseFactory: () => Promise<T>,
  fallbackValue: T,
  options?: Omit<PromiseOptions, 'suppressErrors'>
): Promise<T> => {
  return promiseManager.safeExecute(promiseFactory, fallbackValue, options)
}

export const executeAll = <T>(
  promises: Array<() => Promise<T>>,
  options?: PromiseOptions
): Promise<Array<T | Error>> => {
  return promiseManager.executeAll(promises, options)
}

export const raceWithFallback = <T>(
  promises: Array<() => Promise<T>>,
  fallbackValue: T,
  timeout?: number
): Promise<T> => {
  return promiseManager.raceWithFallback(promises, fallbackValue, timeout)
}

// React hooks for promise management
export const usePromise = <T>(
  promiseFactory: () => Promise<T>,
  dependencies: any[] = [],
  options: PromiseOptions & { initialValue?: T } = {}
) => {
  const [state, setState] = React.useState<{
    data: T | undefined
    error: Error | null
    loading: boolean
  }>({
    data: options.initialValue,
    error: null,
    loading: false
  })

  React.useEffect(() => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    safePromise(promiseFactory, {
      ...options,
      onError: (error) => {
        setState(prev => ({ ...prev, error, loading: false }))
        options.onError?.(error)
      }
    })
    .then(data => {
      setState({ data, error: null, loading: false })
    })
    .catch(error => {
      setState(prev => ({ ...prev, error, loading: false }))
    })
  }, dependencies)

  return state
}

export const useAsyncCallback = <T extends any[], R>(
  callback: (...args: T) => Promise<R>,
  options: PromiseOptions = {}
) => {
  const [state, setState] = React.useState<{
    data: R | undefined
    error: Error | null
    loading: boolean
  }>({
    data: undefined,
    error: null,
    loading: false
  })

  const execute = React.useCallback(async (...args: T) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await safePromise(() => callback(...args), options)
      setState({ data: result, error: null, loading: false })
      return result
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error, loading: false }))
      throw error
    }
  }, [callback, options])

  return { ...state, execute }
}

// Types
export type { PromiseOptions }

import React from 'react'
