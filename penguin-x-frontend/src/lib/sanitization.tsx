
import React from 'react'
import DOMPurify from 'dompurify'

// DOMPurify configuration for different contexts
const sanitizationConfigs = {
  // Strict: Only basic text formatting
  strict: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
  },

  // Basic: Common formatting tags
  basic: {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
  },

  // Extended: More formatting options
  extended: {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'h1', 'h2', 'h3',
      'h4', 'h5', 'h6', 'div', 'span', 'a', 'img'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src', 'width', 'height', 'class'
    ],
    ALLOWED_SCHEMES: ['http', 'https', 'mailto'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
  },

  // None: Strip all HTML tags
  none: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  }
}

export type SanitizationLevel = keyof typeof sanitizationConfigs

interface SanitizationResult {
  clean: string
  original: string
  modified: boolean
  removedTags: string[]
  removedAttributes: string[]
}

class HtmlSanitizer {
  private static instance: HtmlSanitizer
  private purify: DOMPurify.DOMPurifyI

  constructor() {
    this.purify = DOMPurify
    this.setupHooks()
  }

  static getInstance(): HtmlSanitizer {
    if (!HtmlSanitizer.instance) {
      HtmlSanitizer.instance = new HtmlSanitizer()
    }
    return HtmlSanitizer.instance
  }

  private setupHooks(): void {
    let removedTags: string[] = []
    let removedAttributes: string[] = []

    // Track removed elements
    this.purify.addHook('uponSanitizeElement', (node, data) => {
      if (data.allowedTags[data.tagName] === false) {
        removedTags.push(data.tagName)
      }
    })

    // Track removed attributes
    this.purify.addHook('uponSanitizeAttribute', (node, data) => {
      if (!data.allowedAttributes[data.attrName]) {
        removedAttributes.push(`${node.tagName.toLowerCase()}.${data.attrName}`)
      }
    })

    // Store tracking data for retrieval
    this.purify.addHook('beforeSanitizeElements', () => {
      removedTags = []
      removedAttributes = []
    })

    this.purify.addHook('afterSanitizeElements', () => {
      // Data is available for retrieval
    })
  }

  /**
   * Sanitize HTML content based on the specified level
   */
  sanitize(
    dirty: string, 
    level: SanitizationLevel = 'basic',
    customConfig?: Partial<DOMPurify.Config>
  ): SanitizationResult {
    if (!dirty || typeof dirty !== 'string') {
      return {
        clean: '',
        original: dirty || '',
        modified: false,
        removedTags: [],
        removedAttributes: []
      }
    }

    const config = {
      ...sanitizationConfigs[level],
      ...customConfig
    }

    const original = dirty
    const clean = this.purify.sanitize(dirty, config)
    const modified = original !== clean

    return {
      clean,
      original,
      modified,
      removedTags: [], // Would need more complex tracking
      removedAttributes: []
    }
  }

  /**
   * Sanitize and validate user input
   */
  sanitizeUserInput(input: string): string {
    // First, trim whitespace
    const trimmed = input.trim()
    
    // Remove all HTML tags for user input
    const result = this.sanitize(trimmed, 'none')
    
    // Additional security measures
    return this.escapeSpecialCharacters(result.clean)
  }

  /**
   * Sanitize rich text content (like from a WYSIWYG editor)
   */
  sanitizeRichText(html: string): SanitizationResult {
    return this.sanitize(html, 'extended', {
      // Additional security for rich text
      ADD_TAGS: [], // Don't add any extra tags
      ADD_ATTR: [], // Don't add any extra attributes
      FORCE_BODY: false,
      SANITIZE_NAMED_PROPS: true,
    })
  }

  /**
   * Sanitize HTML for display in tooltips or notifications
   */
  sanitizeForDisplay(html: string): string {
    const result = this.sanitize(html, 'basic')
    return result.clean
  }

  /**
   * Escape special characters that could be dangerous
   */
  private escapeSpecialCharacters(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  /**
   * Validate and sanitize URL inputs
   */
  sanitizeUrl(url: string): string | null {
    if (!url || typeof url !== 'string') {
      return null
    }

    // Remove whitespace
    const cleaned = url.trim()

    // Check for allowed protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:']
    
    try {
      const urlObj = new URL(cleaned)
      if (!allowedProtocols.includes(urlObj.protocol)) {
        return null
      }
      return urlObj.toString()
    } catch {
      // If URL parsing fails, treat as relative URL
      // Only allow relative URLs that don't start with dangerous schemes
      if (cleaned.match(/^(javascript:|data:|vbscript:|file:|about:)/i)) {
        return null
      }
      
      // Basic validation for relative URLs
      if (cleaned.startsWith('/') || cleaned.startsWith('./') || cleaned.startsWith('../')) {
        return cleaned
      }
      
      // For other cases, prepend https://
      try {
        const urlWithProtocol = new URL(`https://${cleaned}`)
        return urlWithProtocol.toString()
      } catch {
        return null
      }
    }
  }

  /**
   * Sanitize JSON data to prevent XSS in API responses
   */
  sanitizeJsonValues(obj: any, level: SanitizationLevel = 'strict'): any {
    if (obj === null || obj === undefined) {
      return obj
    }

    if (typeof obj === 'string') {
      const result = this.sanitize(obj, level)
      return result.clean
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeJsonValues(item, level))
    }

    if (typeof obj === 'object') {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(obj)) {
        // Sanitize both keys and values
        const cleanKey = this.sanitizeUserInput(key)
        sanitized[cleanKey] = this.sanitizeJsonValues(value, level)
      }
      return sanitized
    }

    return obj
  }

  /**
   * Check if content is safe (no modifications needed)
   */
  isSafe(content: string, level: SanitizationLevel = 'basic'): boolean {
    const result = this.sanitize(content, level)
    return !result.modified
  }

  /**
   * Get sanitization statistics
   */
  getSanitizationStats(content: string, level: SanitizationLevel = 'basic') {
    const result = this.sanitize(content, level)
    
    return {
      originalLength: result.original.length,
      cleanLength: result.clean.length,
      bytesRemoved: result.original.length - result.clean.length,
      modified: result.modified,
      safetyLevel: level,
      timestamp: new Date().toISOString()
    }
  }
}

// Export singleton instance and utilities
export const htmlSanitizer = HtmlSanitizer.getInstance()

// Convenience functions
export const sanitizeHtml = (html: string, level: SanitizationLevel = 'basic') => 
  htmlSanitizer.sanitize(html, level)

export const sanitizeUserInput = (input: string) => 
  htmlSanitizer.sanitizeUserInput(input)

export const sanitizeRichText = (html: string) => 
  htmlSanitizer.sanitizeRichText(html)

export const sanitizeUrl = (url: string) => 
  htmlSanitizer.sanitizeUrl(url)

export const sanitizeForDisplay = (html: string) => 
  htmlSanitizer.sanitizeForDisplay(html)

export const sanitizeJsonValues = (obj: any, level: SanitizationLevel = 'strict') => 
  htmlSanitizer.sanitizeJsonValues(obj, level)

// React hook for sanitizing content
export const useSanitizedContent = (content: string, level: SanitizationLevel = 'basic') => {
  const [sanitized, setSanitized] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(true)
  const [stats, setStats] = React.useState<any>(null)

  React.useEffect(() => {
    setIsLoading(true)
    
    // Sanitize in next tick to prevent blocking
    const timeoutId = setTimeout(() => {
      const result = htmlSanitizer.sanitize(content, level)
      const sanitizationStats = htmlSanitizer.getSanitizationStats(content, level)
      
      setSanitized(result.clean)
      setStats(sanitizationStats)
      setIsLoading(false)
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [content, level])

  return { sanitized, isLoading, stats }
}

// React component for safely rendering HTML
interface SafeHtmlProps {
  html: string
  level?: SanitizationLevel
  className?: string
  component?: keyof JSX.IntrinsicElements
}

export const SafeHtml: React.FC<SafeHtmlProps> = ({ 
  html, 
  level = 'basic', 
  className, 
  component: Component = 'div' 
}) => {
  const { sanitized, isLoading } = useSanitizedContent(html, level)

  if (isLoading) {
    return <Component className={className}>Loading...</Component>
  }

  return (
    <Component 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}


