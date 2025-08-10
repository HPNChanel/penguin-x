import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { sanitizeUserInput } from './sanitization.tsx'

// Security-focused validation schemas
export const securityValidators = {
  // Email validation with domain restrictions if needed
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' })
    .max(254, { message: 'Email must be less than 254 characters' })
    .refine(
      (email) => {
        // Additional security checks
        const sanitized = sanitizeUserInput(email)
        return email === sanitized
      },
      { message: 'Email contains invalid characters' }
    )
    .refine(
      (email) => {
        // Check for dangerous patterns
        const dangerousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+=/i,
          /data:/i
        ]
        return !dangerousPatterns.some(pattern => pattern.test(email))
      },
      { message: 'Email contains potentially dangerous content' }
    ),

  // Strong password validation
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(128, { message: 'Password must be less than 128 characters' })
    .refine(
      (password) => /[a-z]/.test(password),
      { message: 'Password must contain at least one lowercase letter' }
    )
    .refine(
      (password) => /[A-Z]/.test(password),
      { message: 'Password must contain at least one uppercase letter' }
    )
    .refine(
      (password) => /\d/.test(password),
      { message: 'Password must contain at least one number' }
    )
    .refine(
      (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      { message: 'Password must contain at least one special character' }
    )
    .refine(
      (password) => {
        // Check for common weak passwords
        const commonPasswords = [
          'password', '123456', 'password123', 'admin', 'qwerty',
          'letmein', 'welcome', 'monkey', '1234567890'
        ]
        return !commonPasswords.some(common => 
          password.toLowerCase().includes(common.toLowerCase())
        )
      },
      { message: 'Password contains common weak patterns' }
    ),

  // Secure text input (prevents XSS)
  secureText: z
    .string()
    .max(1000, { message: 'Text must be less than 1000 characters' })
    .refine(
      (text) => {
        const sanitized = sanitizeUserInput(text)
        return text === sanitized
      },
      { message: 'Text contains invalid or potentially dangerous characters' }
    ),

  // URL validation with protocol restrictions
  secureUrl: z
    .string()
    .url({ message: 'Please enter a valid URL' })
    .refine(
      (url) => {
        try {
          const urlObj = new URL(url)
          const allowedProtocols = ['http:', 'https:']
          return allowedProtocols.includes(urlObj.protocol)
        } catch {
          return false
        }
      },
      { message: 'Only HTTP and HTTPS URLs are allowed' }
    )
    .refine(
      (url) => {
        // Block common dangerous domains
        const blockedDomains = [
          'localhost',
          '127.0.0.1',
          '0.0.0.0',
          'file://',
          'javascript:',
          'data:'
        ]
        return !blockedDomains.some(domain => url.includes(domain))
      },
      { message: 'URL points to a restricted domain' }
    ),

  // Phone number validation
  phoneNumber: z
    .string()
    .min(1, { message: 'Phone number is required' })
    .regex(
      /^[+]?[(]?[\d\s\-\(\)]{10,20}$/,
      { message: 'Please enter a valid phone number' }
    )
    .refine(
      (phone) => {
        const sanitized = sanitizeUserInput(phone)
        return phone === sanitized
      },
      { message: 'Phone number contains invalid characters' }
    ),

  // File name validation
  fileName: z
    .string()
    .min(1, { message: 'File name is required' })
    .max(255, { message: 'File name must be less than 255 characters' })
    .refine(
      (fileName) => {
        // Block dangerous file extensions
        const dangerousExtensions = [
          '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs',
          '.js', '.jar', '.php', '.py', '.pl', '.sh', '.ps1'
        ]
        const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
        return !dangerousExtensions.includes(extension)
      },
      { message: 'File type is not allowed for security reasons' }
    )
    .refine(
      (fileName) => {
        // Block path traversal attempts
        const pathTraversalPatterns = ['../', '..\\', '../', '..\\']
        return !pathTraversalPatterns.some(pattern => fileName.includes(pattern))
      },
      { message: 'File name contains invalid path characters' }
    ),

  // Name validation (for user names, etc.)
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .max(100, { message: 'Name must be less than 100 characters' })
    .regex(
      /^[a-zA-Z\s\-'\.]+$/,
      { message: 'Name can only contain letters, spaces, hyphens, apostrophes, and periods' }
    )
    .refine(
      (name) => {
        const sanitized = sanitizeUserInput(name)
        return name === sanitized
      },
      { message: 'Name contains invalid characters' }
    ),

  // Username validation
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .max(30, { message: 'Username must be less than 30 characters' })
    .regex(
      /^[a-zA-Z0-9_\-]+$/,
      { message: 'Username can only contain letters, numbers, underscores, and hyphens' }
    )
    .refine(
      (username) => {
        // Block reserved usernames
        const reservedNames = [
          'admin', 'administrator', 'root', 'system', 'guest',
          'user', 'test', 'demo', 'api', 'www', 'mail', 'support'
        ]
        return !reservedNames.includes(username.toLowerCase())
      },
      { message: 'This username is reserved and cannot be used' }
    ),

  // Amount/currency validation
  amount: z
    .number()
    .min(0, { message: 'Amount must be positive' })
    .max(999999999.99, { message: 'Amount is too large' })
    .refine(
      (amount) => {
        // Check for reasonable decimal places
        const decimalPlaces = (amount.toString().split('.')[1] || '').length
        return decimalPlaces <= 2
      },
      { message: 'Amount can have at most 2 decimal places' }
    ),

  // Date validation with reasonable bounds
  date: z
    .date()
    .refine(
      (date) => {
        const now = new Date()
        const minDate = new Date(1900, 0, 1)
        const maxDate = new Date(now.getFullYear() + 10, 11, 31)
        return date >= minDate && date <= maxDate
      },
      { message: 'Please enter a valid date within reasonable bounds' }
    )
}

// Common form schemas
export const formSchemas = {
  login: z.object({
    email: securityValidators.email,
    password: z.string().min(1, { message: 'Password is required' }),
    rememberMe: z.boolean().optional()
  }),

  register: z.object({
    firstName: securityValidators.name,
    lastName: securityValidators.name,
    email: securityValidators.email,
    username: securityValidators.username,
    password: securityValidators.password,
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and conditions'
    })
  }).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword']
    }
  ),

  changePassword: z.object({
    currentPassword: z.string().min(1, { message: 'Current password is required' }),
    newPassword: securityValidators.password,
    confirmPassword: z.string()
  }).refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword']
    }
  ).refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      message: 'New password must be different from current password',
      path: ['newPassword']
    }
  ),

  profile: z.object({
    firstName: securityValidators.name,
    lastName: securityValidators.name,
    email: securityValidators.email,
    phoneNumber: securityValidators.phoneNumber.optional(),
    website: securityValidators.secureUrl.optional()
  }),

  transaction: z.object({
    amount: securityValidators.amount,
    description: securityValidators.secureText,
    category: securityValidators.secureText,
    date: securityValidators.date
  }),

  investment: z.object({
    symbol: z.string()
      .min(1, { message: 'Symbol is required' })
      .max(10, { message: 'Symbol must be less than 10 characters' })
      .regex(/^[A-Z0-9]+$/, { message: 'Symbol must be uppercase letters and numbers only' }),
    quantity: z.number()
      .min(0.000001, { message: 'Quantity must be positive' })
      .max(999999999, { message: 'Quantity is too large' }),
    price: securityValidators.amount,
    date: securityValidators.date
  })
}

// Rate limiting for form submissions
interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs: number
}

class FormRateLimiter {
  private attempts: Map<string, number[]> = new Map()
  private blocked: Map<string, number> = new Map()

  isRateLimited(formId: string, config: RateLimitConfig): boolean {
    const now = Date.now()
    const key = formId

    // Check if currently blocked
    const blockedUntil = this.blocked.get(key)
    if (blockedUntil && now < blockedUntil) {
      return true
    }

    // Clean up old attempts
    const attempts = this.attempts.get(key) || []
    const validAttempts = attempts.filter(timestamp => 
      now - timestamp < config.windowMs
    )

    // Check if exceeding rate limit
    if (validAttempts.length >= config.maxAttempts) {
      this.blocked.set(key, now + config.blockDurationMs)
      return true
    }

    // Record this attempt
    validAttempts.push(now)
    this.attempts.set(key, validAttempts)

    return false
  }

  getRemainingTime(formId: string): number {
    const blockedUntil = this.blocked.get(formId)
    if (!blockedUntil) return 0
    
    const remaining = blockedUntil - Date.now()
    return Math.max(0, remaining)
  }

  reset(formId: string): void {
    this.attempts.delete(formId)
    this.blocked.delete(formId)
  }
}

export const formRateLimiter = new FormRateLimiter()

// Common rate limit configurations
export const rateLimitConfigs = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000, blockDurationMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
  register: { maxAttempts: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 }, // 3 attempts per hour
  changePassword: { maxAttempts: 3, windowMs: 15 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 }, // 3 attempts per 15 min
  contactForm: { maxAttempts: 5, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 }, // 5 attempts per hour
  general: { maxAttempts: 10, windowMs: 60 * 1000, blockDurationMs: 5 * 60 * 1000 } // 10 attempts per minute
}

// Validation error formatter
export const formatValidationErrors = (errors: z.ZodError, t: any) => {
  const formattedErrors: Record<string, string> = {}
  
  errors.errors.forEach((error) => {
    const path = error.path.join('.')
    formattedErrors[path] = error.message
  })

  return formattedErrors
}

// Secure form submission handler
export const createSecureSubmission = <T>(
  formId: string,
  schema: z.ZodSchema<T>,
  rateLimitConfig: RateLimitConfig = rateLimitConfigs.general
) => {
  return async (data: unknown): Promise<{ success: boolean; data?: T; errors?: Record<string, string>; rateLimited?: boolean }> => {
    // Check rate limiting
    if (formRateLimiter.isRateLimited(formId, rateLimitConfig)) {
      const remainingTime = Math.ceil(formRateLimiter.getRemainingTime(formId) / 1000)
      return {
        success: false,
        rateLimited: true,
        errors: {
          form: `Too many attempts. Please try again in ${remainingTime} seconds.`
        }
      }
    }

    // Validate data
    try {
      const validatedData = schema.parse(data)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const { t } = useTranslation()
        const errors = formatValidationErrors(error, t)
        return { success: false, errors }
      }
      
      return {
        success: false,
        errors: { form: 'An unexpected validation error occurred' }
      }
    }
  }
}

// Utility function to sanitize form data before submission
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = {} as T

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeUserInput(value) as T[keyof T]
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map(item => 
        typeof item === 'string' ? sanitizeUserInput(item) : item
      ) as T[keyof T]
    } else {
      sanitized[key as keyof T] = value
    }
  }

  return sanitized
}

// Export types
export type FormSchema = keyof typeof formSchemas
export type ValidationResult<T> = {
  success: boolean
  data?: T
  errors?: Record<string, string>
  rateLimited?: boolean
}
