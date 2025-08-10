/**
 * Content Security Policy (CSP) Configuration
 * 
 * This file defines the Content Security Policy for the Penguin X frontend application.
 * CSP helps prevent XSS attacks by controlling which resources can be loaded and executed.
 */

export interface CSPConfig {
  'default-src'?: string[]
  'script-src'?: string[]
  'style-src'?: string[]
  'img-src'?: string[]
  'font-src'?: string[]
  'connect-src'?: string[]
  'media-src'?: string[]
  'object-src'?: string[]
  'frame-src'?: string[]
  'worker-src'?: string[]
  'child-src'?: string[]
  'form-action'?: string[]
  'frame-ancestors'?: string[]
  'base-uri'?: string[]
  'upgrade-insecure-requests'?: boolean
  'block-all-mixed-content'?: boolean
  'require-trusted-types-for'?: string[]
  'trusted-types'?: string[]
}

// Development CSP - More permissive for development tools
export const developmentCSP: CSPConfig = {
  'default-src': ["'self'"],
  
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite HMR
    "'unsafe-eval'", // Required for Vite development
    'blob:', // For worker scripts
    'localhost:*',
    '127.0.0.1:*',
    'ws:', // WebSocket for HMR
    'wss:',
    // Add specific domains for development tools
    'vitejs.dev',
    '*.vitejs.dev'
  ],
  
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for CSS-in-JS and dynamic styles
    'fonts.googleapis.com',
    'cdn.jsdelivr.net'
  ],
  
  'img-src': [
    "'self'",
    'data:', // For base64 encoded images
    'blob:', // For generated images
    'localhost:*',
    '127.0.0.1:*',
    'https:', // Allow HTTPS images in development
    // Placeholder image services
    'picsum.photos',
    'via.placeholder.com',
    'placehold.co'
  ],
  
  'font-src': [
    "'self'",
    'data:',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdn.jsdelivr.net'
  ],
  
  'connect-src': [
    "'self'",
    'localhost:*',
    '127.0.0.1:*',
    'ws:', // WebSocket connections
    'wss:',
    // API endpoints (replace with your actual API domain)
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    // Analytics and monitoring
    '*.analytics.com',
    '*.sentry.io'
  ],
  
  'media-src': [
    "'self'",
    'data:',
    'blob:'
  ],
  
  'object-src': ["'none'"], // Prevent embedding of objects
  
  'frame-src': [
    "'self'",
    // Add specific domains if you need to embed iframes
  ],
  
  'worker-src': [
    "'self'",
    'blob:'
  ],
  
  'child-src': [
    "'self'",
    'blob:'
  ],
  
  'form-action': [
    "'self'"
    // Add specific domains if forms submit to external services
  ],
  
  'frame-ancestors': [
    "'none'" // Prevent clickjacking
  ],
  
  'base-uri': [
    "'self'"
  ],
  
  'upgrade-insecure-requests': false, // Set to true in production
  'block-all-mixed-content': false // Set to true in production
}

// Production CSP - Strict security policies
export const productionCSP: CSPConfig = {
  'default-src': ["'self'"],
  
  'script-src': [
    "'self'",
    // Specific hashes for inline scripts (you'll need to generate these)
    // "'sha256-...'",
    // External script domains (be very specific)
    'cdn.jsdelivr.net',
    // Analytics (if using)
    'www.google-analytics.com',
    'www.googletagmanager.com',
    // Remove 'unsafe-inline' and 'unsafe-eval' in production
  ],
  
  'style-src': [
    "'self'",
    // Specific hashes for inline styles (you'll need to generate these)
    // "'sha256-...'",
    'fonts.googleapis.com',
    'cdn.jsdelivr.net'
    // Consider removing 'unsafe-inline' and using hashes/nonces
  ],
  
  'img-src': [
    "'self'",
    'data:',
    'https:', // Allow HTTPS images from any domain
    // Be more specific in production:
    // 'images.example.com',
    // 'cdn.example.com'
  ],
  
  'font-src': [
    "'self'",
    'data:',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdn.jsdelivr.net'
  ],
  
  'connect-src': [
    "'self'",
    // Your API domain (replace with actual domain)
    'https://api.penguin-x.com',
    'https://api.example.com',
    // Analytics endpoints
    'www.google-analytics.com',
    'analytics.google.com',
    // Error reporting
    'sentry.io',
    '*.sentry.io'
  ],
  
  'media-src': [
    "'self'",
    'data:',
    'blob:'
  ],
  
  'object-src': ["'none'"],
  
  'frame-src': [
    "'none'"
    // Add specific domains if you need to embed trusted iframes
  ],
  
  'worker-src': [
    "'self'",
    'blob:'
  ],
  
  'child-src': [
    "'self'",
    'blob:'
  ],
  
  'form-action': [
    "'self'"
    // Add specific domains for form submissions if needed
  ],
  
  'frame-ancestors': [
    "'none'" // Prevent all framing
  ],
  
  'base-uri': [
    "'self'"
  ],
  
  'upgrade-insecure-requests': true,
  'block-all-mixed-content': true,
  
  // Trusted Types (if supported)
  'require-trusted-types-for': ["'script'"],
  'trusted-types': [
    "'none'"
    // Add specific trusted type policies if needed
  ]
}

// Helper function to generate CSP header string
export const generateCSPHeader = (config: CSPConfig): string => {
  const directives: string[] = []

  for (const [directive, values] of Object.entries(config)) {
    if (Array.isArray(values)) {
      if (values.length > 0) {
        directives.push(`${directive} ${values.join(' ')}`)
      }
    } else if (typeof values === 'boolean' && values) {
      directives.push(directive)
    }
  }

  return directives.join('; ')
}

// Environment-specific CSP
export const getCSPConfig = (): CSPConfig => {
  const isDevelopment = import.meta.env.NODE_ENV === 'development'
  return isDevelopment ? developmentCSP : productionCSP
}

// Generate CSP header for current environment
export const getCSPHeader = (): string => {
  const config = getCSPConfig()
  return generateCSPHeader(config)
}

// CSP violation reporting endpoint
export const CSP_REPORT_URI = '/api/csp-violation-report'

// Enhanced CSP with reporting
export const getCSPWithReporting = (reportUri?: string): CSPConfig => {
  const config = getCSPConfig()
  
  if (reportUri) {
    return {
      ...config,
      'report-uri': [reportUri],
      'report-to': ['csp-endpoint']
    }
  }
  
  return config
}

// CSP nonce generation (for use in server-side rendering or build time)
export const generateCSPNonce = (): string => {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// CSP hash generation helper (for inline scripts/styles)
export const generateCSPHash = async (content: string, algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha256'): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest(algorithm.toUpperCase(), data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')
  return `'${algorithm}-${btoa(hashHex)}'`
}

// CSP violation handler for client-side reporting
export const handleCSPViolation = (violationReport: any) => {
  // Log violation for debugging
  console.warn('CSP Violation:', violationReport)
  
  // Send to analytics/monitoring service
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.trackEvent('csp_violation', {
      blockedURI: violationReport.blockedURI,
      documentURI: violationReport.documentURI,
      effectiveDirective: violationReport.effectiveDirective,
      originalPolicy: violationReport.originalPolicy,
      referrer: violationReport.referrer,
      violatedDirective: violationReport.violatedDirective,
      sourceFile: violationReport.sourceFile,
      lineNumber: violationReport.lineNumber,
      columnNumber: violationReport.columnNumber
    })
  }
  
  // Send to server for analysis (implement based on your backend)
  fetch('/api/csp-violation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      violation: violationReport,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })
  }).catch(error => {
    console.error('Failed to report CSP violation:', error)
  })
}

// Initialize CSP violation reporting
export const initCSPReporting = () => {
  if (typeof window !== 'undefined') {
    document.addEventListener('securitypolicyviolation', (event) => {
      handleCSPViolation({
        blockedURI: event.blockedURI,
        columnNumber: event.columnNumber,
        documentURI: event.documentURI,
        effectiveDirective: event.effectiveDirective,
        lineNumber: event.lineNumber,
        originalPolicy: event.originalPolicy,
        referrer: event.referrer,
        sourceFile: event.sourceFile,
        violatedDirective: event.violatedDirective
      })
    })
  }
}

// CSP meta tag for HTML injection
export const getCSPMetaTag = (): string => {
  const header = getCSPHeader()
  return `<meta http-equiv="Content-Security-Policy" content="${header}">`
}

// Default export
export default {
  developmentCSP,
  productionCSP,
  getCSPConfig,
  getCSPHeader,
  generateCSPHeader,
  generateCSPNonce,
  generateCSPHash,
  handleCSPViolation,
  initCSPReporting,
  getCSPMetaTag
}
