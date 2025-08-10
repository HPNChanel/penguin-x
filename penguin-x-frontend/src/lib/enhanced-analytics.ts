import React from 'react'
import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals'

// Enhanced event tracking types
export interface UserEvent {
  name: string
  properties?: Record<string, any>
  timestamp: number
  sessionId: string
  userId?: string
  metadata?: {
    page: string
    component?: string
    feature?: string
    userAgent: string
    viewport: string
  }
}

export interface ConsentSettings {
  analytics: boolean
  performance: boolean
  functional: boolean
  marketing: boolean
  lastUpdated: number
}

// Event map for standardized tracking
export const EVENT_MAP = {
  // Navigation events
  PAGE_VIEW: 'page_view',
  ROUTE_CHANGE: 'route_change',
  
  // Dashboard events
  VIEW_DASHBOARD: 'view_dashboard',
  DASHBOARD_TAB_CHANGE: 'dashboard_tab_change',
  WIDGET_INTERACT: 'widget_interact',
  
  // Financial events
  ADD_TRANSACTION: 'add_transaction',
  EDIT_TRANSACTION: 'edit_transaction',
  DELETE_TRANSACTION: 'delete_transaction',
  VIEW_TRANSACTION_DETAILS: 'view_transaction_details',
  EXPORT_TRANSACTIONS: 'export_transactions',
  
  // Investment events
  VIEW_PORTFOLIO: 'view_portfolio',
  ADD_INVESTMENT: 'add_investment',
  UPDATE_INVESTMENT: 'update_investment',
  VIEW_INVESTMENT_DETAILS: 'view_investment_details',
  
  // Academy events
  VIEW_ACADEMY: 'view_academy',
  START_LESSON: 'start_lesson',
  COMPLETE_LESSON: 'complete_lesson',
  DOWNLOAD_RESOURCE: 'download_resource',
  
  // UI/UX events
  CHANGE_THEME: 'change_theme',
  TOGGLE_SIDEBAR: 'toggle_sidebar',
  MOBILE_NAV_TOGGLE: 'mobile_nav_toggle',
  SEARCH_QUERY: 'search_query',
  
  // Authentication events
  LOGIN_ATTEMPT: 'login_attempt',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  LOGOUT: 'logout',
  REGISTER_ATTEMPT: 'register_attempt',
  REGISTER_SUCCESS: 'register_success',
  
  // Error events
  ERROR_BOUNDARY: 'error_boundary',
  API_ERROR: 'api_error',
  FORM_VALIDATION_ERROR: 'form_validation_error',
  
  // Performance events
  SLOW_COMPONENT_RENDER: 'slow_component_render',
  LARGE_BUNDLE_LOAD: 'large_bundle_load',
  
  // Engagement events
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  FEATURE_DISCOVERY: 'feature_discovery',
  HELP_ACCESSED: 'help_accessed',
  
  // Privacy events
  CONSENT_UPDATED: 'consent_updated',
  PRIVACY_SETTINGS_VIEWED: 'privacy_settings_viewed'
} as const

export type EventName = typeof EVENT_MAP[keyof typeof EVENT_MAP]

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

class EnhancedAnalytics {
  private sessionId: string
  private userId?: string
  private apiEndpoint: string
  private isDevelopment: boolean
  private consentSettings: ConsentSettings
  private sessionStartTime: number
  private lastActivityTime: number
  private eventBuffer: UserEvent[] = []
  private bufferFlushInterval: number = 5000 // 5 seconds

  constructor() {
    this.sessionId = this.generateSessionId()
    this.apiEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT || ''
    this.isDevelopment = import.meta.env.NODE_ENV === 'development'
    this.sessionStartTime = Date.now()
    this.lastActivityTime = Date.now()
    
    // Load consent settings
    this.consentSettings = this.loadConsentSettings()
    
    // Initialize only if consent is given
    if (this.hasAnalyticsConsent()) {
      this.initWebVitals()
      this.initErrorTracking()
      this.initSessionTracking()
      this.initBufferFlush()
    }

    // Track session start
    this.trackEvent(EVENT_MAP.SESSION_START, {
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
  }

  private loadConsentSettings(): ConsentSettings {
    const stored = localStorage.getItem('penguin-x-analytics-consent')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.warn('Failed to parse consent settings, using defaults')
      }
    }
    
    // Default to minimal consent
    return {
      analytics: false,
      performance: true, // Essential for app function
      functional: true,  // Essential for app function
      marketing: false,
      lastUpdated: Date.now()
    }
  }

  public updateConsent(settings: Partial<ConsentSettings>) {
    this.consentSettings = {
      ...this.consentSettings,
      ...settings,
      lastUpdated: Date.now()
    }
    
    localStorage.setItem('penguin-x-analytics-consent', JSON.stringify(this.consentSettings))
    
    // Track consent update (always allowed)
    this.trackEvent(EVENT_MAP.CONSENT_UPDATED, {
      settings: this.consentSettings,
      previousSettings: this.loadConsentSettings()
    }, true) // Force track
    
    // Initialize analytics if consent was just given
    if (settings.analytics && this.hasAnalyticsConsent()) {
      this.initWebVitals()
      this.initErrorTracking()
    }
  }

  public getConsentSettings(): ConsentSettings {
    return { ...this.consentSettings }
  }

  private hasAnalyticsConsent(): boolean {
    return this.consentSettings.analytics
  }

  private hasPerformanceConsent(): boolean {
    return this.consentSettings.performance
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  private initWebVitals() {
    if (!this.hasPerformanceConsent()) return
    
    // Collect Core Web Vitals
    getCLS(this.handleMetric.bind(this))
    getFID(this.handleMetric.bind(this))
    getFCP(this.handleMetric.bind(this))
    getLCP(this.handleMetric.bind(this))
    getTTFB(this.handleMetric.bind(this))
  }

  private handleMetric(metric: Metric) {
    if (!this.hasPerformanceConsent()) return
    
    const event: AnalyticsEvent = {
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType || 'unknown',
      timestamp: Date.now()
    }

    if (this.isDevelopment) {
      console.log('Web Vital:', event)
    }

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

    this.setupReactErrorTracking()
  }

  private initSessionTracking() {
    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    activityEvents.forEach(event => {
      document.addEventListener(event, () => {
        this.lastActivityTime = Date.now()
      }, { passive: true })
    })

    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - this.sessionStartTime
      this.trackEvent(EVENT_MAP.SESSION_END, {
        duration: sessionDuration,
        lastActivity: this.lastActivityTime
      }, true) // Force immediate send
    })

    // Check for idle sessions
    setInterval(() => {
      const idleTime = Date.now() - this.lastActivityTime
      if (idleTime > 30 * 60 * 1000) { // 30 minutes idle
        this.trackEvent(EVENT_MAP.SESSION_END, {
          reason: 'idle',
          idleTime,
          duration: Date.now() - this.sessionStartTime
        })
      }
    }, 60000) // Check every minute
  }

  private initBufferFlush() {
    // Flush event buffer periodically
    setInterval(() => {
      this.flushEventBuffer()
    }, this.bufferFlushInterval)
  }

  private setupReactErrorTracking() {
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
    const sanitizedReport = this.sanitizeErrorReport(errorReport)

    if (this.isDevelopment) {
      console.error('Error tracked:', sanitizedReport)
    }

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
      if (this.isDevelopment) {
        console.log(`[Analytics] ${type}:`, data)
      }
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
      if (this.isDevelopment) {
        console.warn('Failed to send analytics event:', error)
      }
    }
  }

  // Enhanced event tracking with buffering
  trackEvent(name: EventName, properties?: Record<string, any>, forceImmediate = false) {
    // Check consent based on event type
    if (!this.shouldTrackEvent(name)) {
      return
    }

    const event: UserEvent = {
      name,
      properties: this.sanitizeProperties(properties || {}),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      metadata: {
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      }
    }

    if (this.isDevelopment) {
      console.log('Custom event:', event)
    }

    if (forceImmediate) {
      this.sendEvent('custom', event)
    } else {
      this.eventBuffer.push(event)
      
      // Flush buffer if it gets too large
      if (this.eventBuffer.length >= 50) {
        this.flushEventBuffer()
      }
    }
  }

  private shouldTrackEvent(name: EventName): boolean {
    // Always allow essential events
    const essentialEvents = [
      EVENT_MAP.SESSION_START,
      EVENT_MAP.SESSION_END,
      EVENT_MAP.CONSENT_UPDATED,
      EVENT_MAP.ERROR_BOUNDARY,
      EVENT_MAP.API_ERROR
    ]

    if (essentialEvents.includes(name)) {
      return true
    }

    // Check analytics consent for other events
    return this.hasAnalyticsConsent()
  }

  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized = { ...properties }
    
    // Remove sensitive data patterns
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'ssn', 'credit']
    
    Object.keys(sanitized).forEach(key => {
      const lowerKey = key.toLowerCase()
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]'
      }
      
      // Sanitize string values
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = this.sanitizeString(sanitized[key])
      }
    })
    
    return sanitized
  }

  private sanitizeString(str: string): string {
    const piiPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // emails
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // credit cards
      /\b\d{3}-?\d{2}-?\d{4}\b/g, // SSN
    ]

    let sanitized = str
    piiPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]')
    })
    
    return sanitized
  }

  private flushEventBuffer() {
    if (this.eventBuffer.length === 0) return
    
    const events = [...this.eventBuffer]
    this.eventBuffer = []
    
    this.sendEvent('batch', { events })
  }

  // Performance tracking
  trackTiming(name: string, startTime: number, endTime?: number) {
    if (!this.hasPerformanceConsent()) return
    
    const duration = (endTime || performance.now()) - startTime
    
    this.trackEvent('timing' as EventName, {
      name,
      duration,
      startTime,
      endTime: endTime || performance.now()
    })
  }

  // Page view tracking with enhanced data
  trackPageView(path?: string) {
    this.trackEvent(EVENT_MAP.PAGE_VIEW, {
      path: path || window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      title: document.title,
      referrer: document.referrer,
      loadTime: performance.now()
    })
  }

  // Feature usage tracking
  trackFeatureUsage(feature: string, action: string, properties?: Record<string, any>) {
    this.trackEvent(EVENT_MAP.FEATURE_DISCOVERY, {
      feature,
      action,
      ...properties
    })
  }

  // Component interaction tracking
  trackComponentInteraction(component: string, action: string, properties?: Record<string, any>) {
    this.trackEvent(EVENT_MAP.WIDGET_INTERACT, {
      component,
      action,
      ...properties
    })
  }
}

// Singleton instance
export const enhancedAnalytics = new EnhancedAnalytics()

// React hooks for analytics
export function useAnalytics() {
  return {
    trackEvent: enhancedAnalytics.trackEvent.bind(enhancedAnalytics),
    trackPageView: enhancedAnalytics.trackPageView.bind(enhancedAnalytics),
    trackFeatureUsage: enhancedAnalytics.trackFeatureUsage.bind(enhancedAnalytics),
    trackComponentInteraction: enhancedAnalytics.trackComponentInteraction.bind(enhancedAnalytics),
    updateConsent: enhancedAnalytics.updateConsent.bind(enhancedAnalytics),
    getConsentSettings: enhancedAnalytics.getConsentSettings.bind(enhancedAnalytics)
  }
}

export default enhancedAnalytics
