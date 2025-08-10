import { z } from 'zod'

// Smart formatting functions
export const smartFormatters = {
  // Currency formatting with locale support
  currency: (value: string | number, options?: {
    currency?: string
    locale?: string
    decimals?: number
    symbol?: boolean
  }) => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value
    if (isNaN(num)) return ''

    const opts = {
      currency: 'USD',
      locale: 'en-US',
      decimals: 2,
      symbol: true,
      ...options
    }

    if (opts.symbol) {
      return new Intl.NumberFormat(opts.locale, {
        style: 'currency',
        currency: opts.currency,
        minimumFractionDigits: opts.decimals,
        maximumFractionDigits: opts.decimals
      }).format(num)
    } else {
      return new Intl.NumberFormat(opts.locale, {
        minimumFractionDigits: opts.decimals,
        maximumFractionDigits: opts.decimals
      }).format(num)
    }
  },

  // Percentage formatting
  percentage: (value: string | number, decimals: number = 2) => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value
    if (isNaN(num)) return ''
    return `${num.toFixed(decimals)}%`
  },

  // Phone number formatting for different regions
  phone: (value: string, format: 'US' | 'INTL' = 'US') => {
    const cleaned = value.replace(/\D/g, '')
    
    if (format === 'US') {
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
      } else if (cleaned.length === 11 && cleaned[0] === '1') {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
      }
    }
    
    return value
  },

  // Credit card formatting
  creditCard: (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const groups = cleaned.match(/.{1,4}/g) || []
    return groups.join(' ').substr(0, 19) // Max 16 digits + 3 spaces
  },

  // SSN formatting
  ssn: (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 9) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`
    } else if (cleaned.length >= 5) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`
    } else if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    }
    return cleaned
  },

  // Date formatting
  date: (value: string | Date, format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' = 'MM/DD/YYYY') => {
    const date = typeof value === 'string' ? new Date(value) : value
    if (isNaN(date.getTime())) return ''

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString()

    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`
      default:
        return `${month}/${day}/${year}`
    }
  },

  // Number with thousands separator
  number: (value: string | number, options?: {
    decimals?: number
    thousandsSeparator?: boolean
    prefix?: string
    suffix?: string
  }) => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value
    if (isNaN(num)) return ''

    const opts = {
      decimals: 0,
      thousandsSeparator: true,
      prefix: '',
      suffix: '',
      ...options
    }

    let formatted = opts.decimals > 0 
      ? num.toFixed(opts.decimals)
      : Math.round(num).toString()

    if (opts.thousandsSeparator) {
      formatted = parseFloat(formatted).toLocaleString()
    }

    return `${opts.prefix}${formatted}${opts.suffix}`
  },

  // Capitalize text
  capitalize: (value: string, type: 'first' | 'words' | 'all' = 'words') => {
    switch (type) {
      case 'first':
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
      case 'all':
        return value.toUpperCase()
      case 'words':
      default:
        return value.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )
    }
  }
}

// Real-time validation utilities
export const realTimeValidators = {
  // Email validation with suggestions
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailRegex.test(value)
    
    const suggestions: string[] = []
    if (value.includes('@') && !isValid) {
      const [local, domain] = value.split('@')
      const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
      
      if (domain && domain.length > 0) {
        const similarDomains = commonDomains.filter(d => 
          d.toLowerCase().includes(domain.toLowerCase()) || 
          domain.toLowerCase().includes(d.toLowerCase())
        )
        suggestions.push(...similarDomains.map(d => `${local}@${d}`))
      }
    }

    return {
      isValid,
      suggestions,
      error: !isValid && value.length > 0 ? 'Please enter a valid email address' : null
    }
  },

  // Password strength validation
  password: (value: string) => {
    const checks = {
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(value)
    }

    const score = Object.values(checks).filter(Boolean).length
    const strength = score <= 2 ? 'weak' : score <= 3 ? 'medium' : score <= 4 ? 'strong' : 'very-strong'
    
    const suggestions: string[] = []
    if (!checks.length) suggestions.push('Use at least 8 characters')
    if (!checks.uppercase) suggestions.push('Add an uppercase letter')
    if (!checks.lowercase) suggestions.push('Add a lowercase letter')
    if (!checks.number) suggestions.push('Add a number')
    if (!checks.special) suggestions.push('Add a special character')

    return {
      strength,
      score,
      checks,
      suggestions,
      isValid: score >= 3
    }
  },

  // Phone number validation
  phone: (value: string, format: 'US' | 'INTL' = 'US') => {
    const cleaned = value.replace(/\D/g, '')
    
    let isValid = false
    let formatted = value
    let suggestions: string[] = []

    if (format === 'US') {
      isValid = cleaned.length === 10 || (cleaned.length === 11 && cleaned[0] === '1')
      if (cleaned.length === 10) {
        formatted = smartFormatters.phone(value, 'US')
      }
      if (cleaned.length > 0 && cleaned.length < 10) {
        suggestions.push('US phone numbers need 10 digits')
      }
    }

    return {
      isValid,
      formatted,
      suggestions,
      error: !isValid && cleaned.length > 0 ? 'Please enter a valid phone number' : null
    }
  },

  // Credit card validation
  creditCard: (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    
    // Luhn algorithm for credit card validation
    const luhnCheck = (num: string) => {
      let sum = 0
      let isEven = false
      
      for (let i = num.length - 1; i >= 0; i--) {
        let digit = parseInt(num[i])
        
        if (isEven) {
          digit *= 2
          if (digit > 9) digit -= 9
        }
        
        sum += digit
        isEven = !isEven
      }
      
      return sum % 10 === 0
    }

    const cardTypes = {
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      mastercard: /^5[1-5][0-9]{14}$/,
      amex: /^3[47][0-9]{13}$/,
      discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/
    }

    let cardType = ''
    for (const [type, pattern] of Object.entries(cardTypes)) {
      if (pattern.test(cleaned)) {
        cardType = type
        break
      }
    }

    const isValid = cleaned.length >= 13 && cleaned.length <= 19 && luhnCheck(cleaned)
    const formatted = smartFormatters.creditCard(value)

    return {
      isValid,
      formatted,
      cardType,
      suggestions: cleaned.length > 0 && !isValid ? ['Please enter a valid credit card number'] : [],
      error: !isValid && cleaned.length > 0 ? 'Invalid credit card number' : null
    }
  },

  // URL validation
  url: (value: string) => {
    try {
      new URL(value.startsWith('http') ? value : `https://${value}`)
      return {
        isValid: true,
        formatted: value.startsWith('http') ? value : `https://${value}`,
        suggestions: [],
        error: null
      }
    } catch {
      return {
        isValid: false,
        formatted: value,
        suggestions: value.length > 0 ? ['Make sure to include http:// or https://'] : [],
        error: value.length > 0 ? 'Please enter a valid URL' : null
      }
    }
  }
}

// Advanced validation schemas
export const advancedSchemas = {
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .refine(
      (email) => !email.includes('+'), 
      'Email aliases with + are not allowed'
    ),

  strongPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/, 'Password must contain at least one special character'),

  phone: z.string()
    .regex(/^\(\d{3}\) \d{3}-\d{4}$|^\+1 \(\d{3}\) \d{3}-\d{4}$/, 'Invalid phone number format'),

  currency: z.number()
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount too large'),

  percentage: z.number()
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100%'),

  creditCard: z.string()
    .regex(/^\d{4} \d{4} \d{4} \d{4}$|^\d{4} \d{6} \d{5}$/, 'Invalid credit card format'),

  ssn: z.string()
    .regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN must be in format 123-45-6789'),

  zipCode: z.string()
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),

  url: z.string()
    .url('Invalid URL format')
    .refine(
      (url) => url.startsWith('https://') || url.startsWith('http://'),
      'URL must include protocol (http:// or https://)'
    )
}

// Field dependency utilities
export const fieldDependencies = {
  // Create conditional validation based on other fields
  createConditionalValidation: <T>(
    condition: (formData: T) => boolean,
    schema: z.ZodSchema<any>,
    fallbackSchema?: z.ZodSchema<any>
  ) => {
    return z.any().superRefine((value, ctx) => {
      const formData = ctx.path.length > 0 ? 
        ctx.path.reduce((obj: any, key) => obj?.[key], ctx.root) : 
        ctx.root

      if (condition(formData as T)) {
        const result = schema.safeParse(value)
        if (!result.success) {
          result.error.issues.forEach(issue => {
            ctx.addIssue(issue)
          })
        }
      } else if (fallbackSchema) {
        const result = fallbackSchema.safeParse(value)
        if (!result.success) {
          result.error.issues.forEach(issue => {
            ctx.addIssue(issue)
          })
        }
      }
    })
  },

  // Cross-field validation
  createCrossFieldValidation: <T>(
    fields: (keyof T)[],
    validator: (values: Partial<T>) => string | null
  ) => {
    return z.any().superRefine((_, ctx) => {
      const formData = ctx.root as T
      const fieldValues = fields.reduce((obj, field) => {
        obj[field] = formData[field]
        return obj
      }, {} as Partial<T>)

      const error = validator(fieldValues)
      if (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error,
          path: [fields[0] as string] // Attach error to first field
        })
      }
    })
  }
}

// Auto-suggest utilities
export const autoSuggest = {
  // Common field suggestions
  emailDomains: ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'],
  
  countries: ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France'],
  
  states: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut'],
  
  // Generate suggestions based on input
  generateSuggestions: (input: string, options: string[], maxSuggestions = 5) => {
    if (!input || input.length < 2) return []
    
    const lowerInput = input.toLowerCase()
    return options
      .filter(option => option.toLowerCase().includes(lowerInput))
      .slice(0, maxSuggestions)
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(lowerInput)
        const bStarts = b.toLowerCase().startsWith(lowerInput)
        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1
        return a.localeCompare(b)
      })
  }
}

// Form analytics and tracking
export const formAnalytics = {
  trackFieldInteraction: (fieldName: string, action: 'focus' | 'blur' | 'change' | 'error') => {
    // Implementation would depend on analytics service
    console.log(`Field Analytics: ${fieldName} - ${action}`)
  },

  trackFormCompletion: (formId: string, timeSpent: number, errors: string[]) => {
    console.log(`Form Analytics: ${formId} completed in ${timeSpent}ms with ${errors.length} errors`)
  },

  calculateCompletionRate: (totalFields: number, completedFields: number) => {
    return Math.round((completedFields / totalFields) * 100)
  }
}

export type ValidationResult = {
  isValid: boolean
  formatted?: string
  suggestions: string[]
  error: string | null
}

export type FormatterOptions = {
  currency?: string
  locale?: string
  decimals?: number
  symbol?: boolean
  prefix?: string
  suffix?: string
  thousandsSeparator?: boolean
}
