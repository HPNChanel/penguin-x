import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry'
import { analytics } from './analytics'

// Sensitive data patterns to scrub from logs
const SENSITIVE_PATTERNS = [
  // Authentication tokens
  /bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi,
  /token["\s]*[:=]["\s]*[a-zA-Z0-9\-._~+/]+=*/gi,
  
  // API keys
  /api[_-]?key["\s]*[:=]["\s]*[a-zA-Z0-9\-._~+/]+=*/gi,
  /secret["\s]*[:=]["\s]*[a-zA-Z0-9\-._~+/]+=*/gi,
  
  // Personal information
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // emails
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // credit cards
  /\b\d{3}-?\d{2}-?\d{4}\b/g, // SSN
  
  // Passwords
  /password["\s]*[:=]["\s]*["'][^"']*["']/gi,
  /passwd["\s]*[:=]["\s]*["'][^"']*["']/gi,
  
  // Session IDs
  /session[_-]?id["\s]*[:=]["\s]*[a-zA-Z0-9\-._~+/]+=*/gi,
  /jsessionid["\s]*[:=]["\s]*[a-zA-Z0-9\-._~+/]+=*/gi,
]

interface SecureApiConfig {
  baseURL?: string
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
  enableLogging?: boolean
  rateLimitEnabled?: boolean
  rateLimitWindow?: number
  rateLimitMaxRequests?: number
}

interface RateLimitState {
  requests: number[]
  blocked: boolean
  resetTime?: number
}

class SecureApiClient {
  private axiosInstance: AxiosInstance
  private config: Required<SecureApiConfig>
  private rateLimitState: RateLimitState = {
    requests: [],
    blocked: false
  }

  constructor(config: SecureApiConfig = {}) {
    this.config = {
      baseURL: config.baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
      timeout: config.timeout || 30000, // 30 seconds
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      enableLogging: config.enableLogging ?? true,
      rateLimitEnabled: config.rateLimitEnabled ?? true,
      rateLimitWindow: config.rateLimitWindow || 60000, // 1 minute
      rateLimitMaxRequests: config.rateLimitMaxRequests || 100
    }

    this.axiosInstance = this.createAxiosInstance()
    this.setupInterceptors()
    this.setupRetryPolicy()
  }

  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      // Security headers
      withCredentials: false, // Prevent CSRF unless specifically needed
    })
  }

  private setupRetryPolicy(): void {
    const retryConfig: IAxiosRetryConfig = {
      retries: this.config.retryAttempts,
      retryDelay: (retryCount) => {
        return Math.min(this.config.retryDelay * Math.pow(2, retryCount - 1), 10000)
      },
      retryCondition: (error) => {
        // Retry on network errors or 5xx status codes
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
               (error.response?.status ? error.response.status >= 500 : false)
      },
      onRetry: (retryCount, error, requestConfig) => {
        this.logApiEvent('retry', {
          retryCount,
          url: requestConfig.url,
          method: requestConfig.method,
          error: this.scrubSensitiveData(error.message)
        })
      }
    }

    axiosRetry(this.axiosInstance, retryConfig)
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Rate limiting check
        if (this.config.rateLimitEnabled && this.isRateLimited()) {
          return Promise.reject(new Error('Rate limit exceeded. Please try again later.'))
        }

        // Add request timestamp
        config.metadata = { startTime: Date.now() }

        // Add authentication token if available
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add request ID for tracking
        const requestId = this.generateRequestId()
        config.headers['X-Request-ID'] = requestId

        // Log request (scrubbed)
        this.logApiEvent('request', {
          requestId,
          method: config.method?.toUpperCase(),
          url: this.scrubSensitiveData(config.url || ''),
          headers: this.scrubSensitiveHeaders(config.headers)
        })

        // Track rate limiting
        if (this.config.rateLimitEnabled) {
          this.trackRequest()
        }

        return config
      },
      (error) => {
        this.logApiEvent('request_error', {
          error: this.scrubSensitiveData(error.message)
        })
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        const duration = Date.now() - (response.config.metadata?.startTime || 0)
        const requestId = response.config.headers['X-Request-ID']

        this.logApiEvent('response_success', {
          requestId,
          status: response.status,
          duration,
          url: this.scrubSensitiveData(response.config.url || ''),
          size: JSON.stringify(response.data).length
        })

        // Check for rate limit headers
        this.handleRateLimitHeaders(response.headers)

        return response
      },
      (error: AxiosError) => {
        const duration = Date.now() - (error.config?.metadata?.startTime || 0)
        const requestId = error.config?.headers?.['X-Request-ID']

        // Handle different error types
        if (error.response) {
          // Server responded with error status
          this.logApiEvent('response_error', {
            requestId,
            status: error.response.status,
            duration,
            url: this.scrubSensitiveData(error.config?.url || ''),
            error: this.scrubSensitiveData(error.message),
            data: this.scrubSensitiveData(JSON.stringify(error.response.data))
          })

          // Handle specific error codes
          this.handleErrorResponse(error)
        } else if (error.request) {
          // Network error
          this.logApiEvent('network_error', {
            requestId,
            duration,
            url: this.scrubSensitiveData(error.config?.url || ''),
            error: 'Network error or timeout'
          })
        } else {
          // Request setup error
          this.logApiEvent('request_setup_error', {
            error: this.scrubSensitiveData(error.message)
          })
        }

        return Promise.reject(this.enhanceError(error))
      }
    )
  }

  private isRateLimited(): boolean {
    if (!this.config.rateLimitEnabled) return false

    const now = Date.now()
    
    // Remove old requests outside the window
    this.rateLimitState.requests = this.rateLimitState.requests.filter(
      timestamp => now - timestamp < this.config.rateLimitWindow
    )

    // Check if blocked and reset time has passed
    if (this.rateLimitState.blocked && this.rateLimitState.resetTime) {
      if (now > this.rateLimitState.resetTime) {
        this.rateLimitState.blocked = false
        this.rateLimitState.resetTime = undefined
      }
    }

    return this.rateLimitState.blocked || 
           this.rateLimitState.requests.length >= this.config.rateLimitMaxRequests
  }

  private trackRequest(): void {
    const now = Date.now()
    this.rateLimitState.requests.push(now)

    // Check if we've exceeded the limit
    if (this.rateLimitState.requests.length >= this.config.rateLimitMaxRequests) {
      this.rateLimitState.blocked = true
      this.rateLimitState.resetTime = now + this.config.rateLimitWindow
      
      this.logApiEvent('rate_limit_exceeded', {
        requests: this.rateLimitState.requests.length,
        resetTime: this.rateLimitState.resetTime
      })
    }
  }

  private handleRateLimitHeaders(headers: any): void {
    const remaining = parseInt(headers['x-ratelimit-remaining'] || '0')
    const resetTime = parseInt(headers['x-ratelimit-reset'] || '0')

    if (remaining === 0 && resetTime > 0) {
      this.rateLimitState.blocked = true
      this.rateLimitState.resetTime = resetTime * 1000
    }
  }

  private handleErrorResponse(error: AxiosError): void {
    const status = error.response?.status

    switch (status) {
      case 401:
        // Unauthorized - clear auth token and redirect to login
        this.clearAuthToken()
        window.location.href = '/login'
        break
      
      case 403:
        // Forbidden - show permission error
        analytics.trackEvent('api_forbidden', {
          url: error.config?.url,
          method: error.config?.method
        })
        break
      
      case 429:
        // Rate limited by server
        this.rateLimitState.blocked = true
        const retryAfter = error.response.headers['retry-after']
        if (retryAfter) {
          this.rateLimitState.resetTime = Date.now() + (parseInt(retryAfter) * 1000)
        }
        break
      
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors - track for monitoring
        analytics.trackEvent('api_server_error', {
          status,
          url: error.config?.url,
          method: error.config?.method
        })
        break
    }
  }

  private enhanceError(error: AxiosError): Error {
    // Create user-friendly error messages
    let message = 'An unexpected error occurred'

    if (error.response) {
      const status = error.response.status
      switch (status) {
        case 400:
          message = 'Invalid request. Please check your input.'
          break
        case 401:
          message = 'Please log in to continue.'
          break
        case 403:
          message = 'You do not have permission to perform this action.'
          break
        case 404:
          message = 'The requested resource was not found.'
          break
        case 429:
          message = 'Too many requests. Please try again later.'
          break
        case 500:
          message = 'Server error. Please try again later.'
          break
        default:
          message = `Request failed with status ${status}`
      }
    } else if (error.request) {
      message = 'Network error. Please check your connection.'
    }

    const enhancedError = new Error(message)
    ;(enhancedError as any).originalError = error
    ;(enhancedError as any).status = error.response?.status
    ;(enhancedError as any).isNetworkError = !error.response

    return enhancedError
  }

  private scrubSensitiveData(data: string): string {
    let scrubbed = data

    SENSITIVE_PATTERNS.forEach(pattern => {
      scrubbed = scrubbed.replace(pattern, '[REDACTED]')
    })

    return scrubbed
  }

  private scrubSensitiveHeaders(headers: any): any {
    const scrubbed = { ...headers }
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token']

    sensitiveHeaders.forEach(header => {
      if (scrubbed[header]) {
        scrubbed[header] = '[REDACTED]'
      }
    })

    return scrubbed
  }

  private logApiEvent(type: string, data: any): void {
    if (!this.config.enableLogging) return

    analytics.trackEvent(`api_${type}`, {
      ...data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    })

    // Also log to console in development
    if (import.meta.env.NODE_ENV === 'development') {
      console.log(`[API ${type.toUpperCase()}]`, data)
    }
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('access_token')
  }

  private clearAuthToken(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  // Public API methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config)
    return response.data
  }

  // Rate limit status
  getRateLimitStatus() {
    return {
      blocked: this.rateLimitState.blocked,
      requestsInWindow: this.rateLimitState.requests.length,
      maxRequests: this.config.rateLimitMaxRequests,
      resetTime: this.rateLimitState.resetTime
    }
  }

  // Reset rate limit (for testing or manual intervention)
  resetRateLimit(): void {
    this.rateLimitState = {
      requests: [],
      blocked: false
    }
  }
}

// Create singleton instance
export const secureApi = new SecureApiClient()

// Export types for use in other modules
export type { SecureApiConfig, RateLimitState }
export { SecureApiClient }
