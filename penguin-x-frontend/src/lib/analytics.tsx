import React from 'react'
import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals'

interface AnalyticsEvent {
  name: string
  value: number
  delta: number
  id: string
  navigationType: string
  timestamp: number
}

interface ErrorReport {
  message: string
  stack?: string
  url: string
  line?: number
  column?: number
  timestamp: number
  userAgent: string
  userId?: string
  sessionId: string
}

class Analytics {
  private sessionId: string
  private userId?: string
  private apiEndpoint: string
  private isDevelopment: boolean

  constructor() {
    this.sessionId = this.generateSessionId()
    this.apiEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT || ''
    this.isDevelopment = import.meta.env.NODE_ENV === 'development'
    
    // Initialize web vitals monitoring
    this.initWebVitals()
    
    // Initialize error tracking
    this.initErrorTracking()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  private initWebVitals() {
    // Collect Core Web Vitals
    onCLS(this.handleMetric.bind(this))
    onINP(this.handleMetric.bind(this)) // FID has been replaced with INP (Interaction to Next Paint)
    onFCP(this.handleMetric.bind(this))
    onLCP(this.handleMetric.bind(this))
    onTTFB(this.handleMetric.bind(this))
  }

  private handleMetric(metric: Metric) {
    const event: AnalyticsEvent = {
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType || 'unknown',
      timestamp: Date.now()
    }

    // Log in development
    if (this.isDevelopment) {
      console.log('Web Vital:', event)
    }

    // Send to analytics service (implement based on your backend)
    this.sendEvent('web-vital', event)
  }

  private initErrorTracking() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        userId: this.userId,
        sessionId: this.sessionId
      })
    })

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        userId: this.userId,
        sessionId: this.sessionId
      })
    })

    // React error boundary integration
    this.setupReactErrorTracking()
  }

  private setupReactErrorTracking() {
    // This will be called by error boundaries
    (window as any).__PENGUIN_X_ERROR_TRACKER__ = (error: Error, errorInfo: any) => {
      this.handleError({
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        userId: this.userId,
        sessionId: this.sessionId
      })
    }
  }

  private handleError(errorReport: ErrorReport) {
    // Filter out PII from error messages
    const sanitizedReport = this.sanitizeErrorReport(errorReport)

    // Log in development
    if (this.isDevelopment) {
      console.error('Error tracked:', sanitizedReport)
    }

    // Send to error tracking service
    this.sendEvent('error', sanitizedReport)
  }

  private sanitizeErrorReport(report: ErrorReport): ErrorReport {
    // Remove potential PII from error messages
    const piiPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // emails
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // credit cards
      /\b\d{3}-?\d{2}-?\d{4}\b/g, // SSN
      /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, // IP addresses
    ]

    let sanitizedMessage = report.message
    piiPatterns.forEach(pattern => {
      sanitizedMessage = sanitizedMessage.replace(pattern, '[REDACTED]')
    })

    return {
      ...report,
      message: sanitizedMessage
    }
  }

  private async sendEvent(type: string, data: any) {
    if (!this.apiEndpoint) {
      // No analytics endpoint configured
      return
    }

    try {
      await fetch(`${this.apiEndpoint}/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data,
          sessionId: this.sessionId,
          userId: this.userId,
          timestamp: Date.now(),
          url: window.location.href,
          referrer: document.referrer
        }),
      })
    } catch (error) {
      // Silently fail to avoid infinite error loops
      if (this.isDevelopment) {
        console.warn('Failed to send analytics event:', error)
      }
    }
  }

  // Custom event tracking
  trackEvent(name: string, properties?: Record<string, any>) {
    const event = {
      name,
      properties: properties || {},
      timestamp: Date.now(),
      url: window.location.href
    }

    if (this.isDevelopment) {
      console.log('Custom event:', event)
    }

    this.sendEvent('custom', event)
  }

  // Performance tracking
  trackTiming(name: string, startTime: number, endTime?: number) {
    const duration = (endTime || performance.now()) - startTime
    
    this.trackEvent('timing', {
      name,
      duration,
      startTime,
      endTime: endTime || performance.now()
    })
  }

  // Page view tracking
  trackPageView(path?: string) {
    this.trackEvent('page_view', {
      path: path || window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      title: document.title
    })
  }
}

// Singleton instance
export const analytics = new Analytics()

// React Error Boundary component
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Report to analytics
    if ((window as any).__PENGUIN_X_ERROR_TRACKER__) {
      (window as any).__PENGUIN_X_ERROR_TRACKER__(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-destructive">Something went wrong</h2>
            <p className="text-muted-foreground mt-2">
              We've been notified about this error and are working to fix it.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default analytics
