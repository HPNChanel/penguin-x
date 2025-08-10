import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  securityValidators, 
  formSchemas, 
  formRateLimiter, 
  rateLimitConfigs,
  sanitizeFormData,
  createSecureSubmission 
} from './secure-validation'

describe('Security Validators', () => {
  describe('email validator', () => {
    it('accepts valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email+tag@domain.co.uk',
        'simple@domain.org'
      ]

      validEmails.forEach(email => {
        expect(() => securityValidators.email.parse(email)).not.toThrow()
      })
    })

    it('rejects invalid email addresses', () => {
      const invalidEmails = [
        'not-an-email',
        '@domain.com',
        'user@',
        'user@domain',
        '<script>alert("xss")</script>@evil.com'
      ]

      invalidEmails.forEach(email => {
        expect(() => securityValidators.email.parse(email)).toThrow()
      })
    })

    it('rejects emails with dangerous patterns', () => {
      const dangerousEmails = [
        'user+<script>@evil.com',
        'user@domain.com<script>alert("xss")</script>',
        'javascript:alert("xss")@evil.com',
        'data:text/html,<script>@evil.com'
      ]

      dangerousEmails.forEach(email => {
        expect(() => securityValidators.email.parse(email)).toThrow()
      })
    })
  })

  describe('password validator', () => {
    it('accepts strong passwords', () => {
      const strongPasswords = [
        'MyStr0ng!Password',
        'C0mpl3x@Pass123',
        'S3cur3#P@ssw0rd!'
      ]

      strongPasswords.forEach(password => {
        expect(() => securityValidators.password.parse(password)).not.toThrow()
      })
    })

    it('rejects weak passwords', () => {
      const weakPasswords = [
        'short',
        'nouppercase123!',
        'NOLOWERCASE123!',
        'NoNumbers!',
        'NoSpecialChars123',
        'password123', // common password
        'admin123!' // common password
      ]

      weakPasswords.forEach(password => {
        expect(() => securityValidators.password.parse(password)).toThrow()
      })
    })
  })

  describe('secureText validator', () => {
    it('accepts clean text', () => {
      const cleanTexts = [
        'Normal text content',
        'Text with numbers 123',
        'Text with basic punctuation!'
      ]

      cleanTexts.forEach(text => {
        expect(() => securityValidators.secureText.parse(text)).not.toThrow()
      })
    })

    it('rejects text with dangerous content', () => {
      const dangerousTexts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src=x onerror=alert("xss")>',
        'Text with <script> tags'
      ]

      dangerousTexts.forEach(text => {
        expect(() => securityValidators.secureText.parse(text)).toThrow()
      })
    })
  })

  describe('secureUrl validator', () => {
    it('accepts valid HTTPS URLs', () => {
      const validUrls = [
        'https://example.com',
        'https://subdomain.example.com/path',
        'https://example.com:8080/path?query=value'
      ]

      validUrls.forEach(url => {
        expect(() => securityValidators.secureUrl.parse(url)).not.toThrow()
      })
    })

    it('accepts valid HTTP URLs', () => {
      const httpUrls = [
        'http://example.com',
        'http://localhost:3000'
      ]

      httpUrls.forEach(url => {
        expect(() => securityValidators.secureUrl.parse(url)).not.toThrow()
      })
    })

    it('rejects dangerous URLs', () => {
      const dangerousUrls = [
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        'file:///etc/passwd',
        'ftp://example.com',
        'https://localhost/admin',
        'https://127.0.0.1/api'
      ]

      dangerousUrls.forEach(url => {
        expect(() => securityValidators.secureUrl.parse(url)).toThrow()
      })
    })
  })

  describe('fileName validator', () => {
    it('accepts safe file names', () => {
      const safeNames = [
        'document.pdf',
        'image.jpg',
        'data-file.csv',
        'report_2024.xlsx'
      ]

      safeNames.forEach(name => {
        expect(() => securityValidators.fileName.parse(name)).not.toThrow()
      })
    })

    it('rejects dangerous file extensions', () => {
      const dangerousNames = [
        'malware.exe',
        'script.js',
        'virus.bat',
        'trojan.scr',
        'backdoor.php'
      ]

      dangerousNames.forEach(name => {
        expect(() => securityValidators.fileName.parse(name)).toThrow()
      })
    })

    it('rejects path traversal attempts', () => {
      const pathTraversalNames = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32',
        'file/../../../secret.txt',
        '..\\config.ini'
      ]

      pathTraversalNames.forEach(name => {
        expect(() => securityValidators.fileName.parse(name)).toThrow()
      })
    })
  })

  describe('username validator', () => {
    it('accepts valid usernames', () => {
      const validUsernames = [
        'user123',
        'test_user',
        'user-name',
        'validuser'
      ]

      validUsernames.forEach(username => {
        expect(() => securityValidators.username.parse(username)).not.toThrow()
      })
    })

    it('rejects reserved usernames', () => {
      const reservedUsernames = [
        'admin',
        'administrator',
        'root',
        'system',
        'guest',
        'api'
      ]

      reservedUsernames.forEach(username => {
        expect(() => securityValidators.username.parse(username)).toThrow()
      })
    })

    it('rejects usernames with invalid characters', () => {
      const invalidUsernames = [
        'user@domain',
        'user spaces',
        'user!@#',
        'user<script>'
      ]

      invalidUsernames.forEach(username => {
        expect(() => securityValidators.username.parse(username)).toThrow()
      })
    })
  })
})

describe('Form Schemas', () => {
  describe('login schema', () => {
    it('validates correct login data', () => {
      const validLogin = {
        email: 'user@example.com',
        password: 'password123',
        rememberMe: true
      }

      expect(() => formSchemas.login.parse(validLogin)).not.toThrow()
    })

    it('rejects invalid login data', () => {
      const invalidLogin = {
        email: 'not-an-email',
        password: '',
        rememberMe: 'not-boolean'
      }

      expect(() => formSchemas.login.parse(invalidLogin)).toThrow()
    })
  })

  describe('register schema', () => {
    it('validates correct registration data', () => {
      const validRegister = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'MyStr0ng!Password',
        confirmPassword: 'MyStr0ng!Password',
        acceptTerms: true
      }

      expect(() => formSchemas.register.parse(validRegister)).not.toThrow()
    })

    it('rejects registration with mismatched passwords', () => {
      const mismatchedPasswords = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'MyStr0ng!Password',
        confirmPassword: 'DifferentPassword!',
        acceptTerms: true
      }

      expect(() => formSchemas.register.parse(mismatchedPasswords)).toThrow()
    })

    it('rejects registration without accepting terms', () => {
      const noTermsAccepted = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'MyStr0ng!Password',
        confirmPassword: 'MyStr0ng!Password',
        acceptTerms: false
      }

      expect(() => formSchemas.register.parse(noTermsAccepted)).toThrow()
    })
  })
})

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Reset rate limiter before each test
    formRateLimiter.reset('test-form')
  })

  afterEach(() => {
    formRateLimiter.reset('test-form')
  })

  it('allows requests within rate limit', () => {
    const config = { maxAttempts: 3, windowMs: 60000, blockDurationMs: 30000 }
    
    // First 3 attempts should be allowed
    expect(formRateLimiter.isRateLimited('test-form', config)).toBe(false)
    expect(formRateLimiter.isRateLimited('test-form', config)).toBe(false)
    expect(formRateLimiter.isRateLimited('test-form', config)).toBe(false)
  })

  it('blocks requests after exceeding rate limit', () => {
    const config = { maxAttempts: 2, windowMs: 60000, blockDurationMs: 30000 }
    
    // First 2 attempts should be allowed
    expect(formRateLimiter.isRateLimited('test-form', config)).toBe(false)
    expect(formRateLimiter.isRateLimited('test-form', config)).toBe(false)
    
    // Third attempt should be blocked
    expect(formRateLimiter.isRateLimited('test-form', config)).toBe(true)
  })

  it('provides remaining time information', () => {
    const config = { maxAttempts: 1, windowMs: 60000, blockDurationMs: 30000 }
    
    // Exceed rate limit
    formRateLimiter.isRateLimited('test-form', config)
    formRateLimiter.isRateLimited('test-form', config)
    
    const remainingTime = formRateLimiter.getRemainingTime('test-form')
    expect(remainingTime).toBeGreaterThan(0)
    expect(remainingTime).toBeLessThanOrEqual(30000)
  })
})

describe('Form Data Sanitization', () => {
  it('sanitizes string values in form data', () => {
    const formData = {
      name: 'John<script>alert("xss")</script>Doe',
      email: 'john@example.com',
      age: 25,
      active: true,
      tags: ['tag1<script>', 'tag2', 'tag3']
    }

    const sanitized = sanitizeFormData(formData)
    
    expect(sanitized.name).not.toContain('<script>')
    expect(sanitized.email).toBe('john@example.com')
    expect(sanitized.age).toBe(25)
    expect(sanitized.active).toBe(true)
    expect(sanitized.tags[0]).not.toContain('<script>')
    expect(sanitized.tags[1]).toBe('tag2')
  })

  it('preserves non-string values', () => {
    const formData = {
      count: 42,
      enabled: true,
      items: [1, 2, 3],
      metadata: { key: 'value' }
    }

    const sanitized = sanitizeFormData(formData)
    
    expect(sanitized).toEqual(formData)
  })
})

describe('Secure Form Submission', () => {
  const mockSchema = formSchemas.login

  it('validates and submits valid data', async () => {
    const submission = createSecureSubmission('test-form', mockSchema)
    
    const validData = {
      email: 'user@example.com',
      password: 'password123'
    }

    const result = await submission(validData)
    
    expect(result.success).toBe(true)
    expect(result.data).toEqual(validData)
    expect(result.errors).toBeUndefined()
  })

  it('rejects invalid data with validation errors', async () => {
    const submission = createSecureSubmission('test-form', mockSchema)
    
    const invalidData = {
      email: 'not-an-email',
      password: ''
    }

    const result = await submission(invalidData)
    
    expect(result.success).toBe(false)
    expect(result.data).toBeUndefined()
    expect(result.errors).toBeDefined()
    expect(result.errors?.email).toContain('valid email')
  })

  it('respects rate limiting', async () => {
    const config = { maxAttempts: 1, windowMs: 60000, blockDurationMs: 30000 }
    const submission = createSecureSubmission('rate-limit-test', mockSchema, config)
    
    const validData = {
      email: 'user@example.com',
      password: 'password123'
    }

    // First submission should work
    const result1 = await submission(validData)
    expect(result1.success).toBe(true)

    // Second submission should be rate limited
    const result2 = await submission(validData)
    expect(result2.success).toBe(false)
    expect(result2.rateLimited).toBe(true)
  })
})
