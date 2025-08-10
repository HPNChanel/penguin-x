import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { AlertCircle, CheckCircle, Clock, Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  formRateLimiter, 
  rateLimitConfigs, 
  sanitizeFormData,
  formatValidationErrors,
  type ValidationResult 
} from '@/lib/secure-validation'

interface SecureFormProps<T extends z.ZodRawShape> {
  schema: z.ZodObject<T>
  formId: string
  title?: string
  description?: string
  onSubmit: (data: z.infer<z.ZodObject<T>>) => Promise<ValidationResult<z.infer<z.ZodObject<T>>>>
  submitText?: string
  rateLimitConfig?: keyof typeof rateLimitConfigs
  className?: string
  children?: React.ReactNode
  showSecurityIndicator?: boolean
}

interface FormFieldProps {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'date'
  placeholder?: string
  description?: string
  required?: boolean
  autoComplete?: string
  disabled?: boolean
  showPasswordStrength?: boolean
  className?: string
}

export function SecureForm<T extends z.ZodRawShape>({
  schema,
  formId,
  title,
  description,
  onSubmit,
  submitText = 'Submit',
  rateLimitConfig = 'general',
  className,
  children,
  showSecurityIndicator = true
}: SecureFormProps<T>) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<ValidationResult<any> | null>(null)
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    isLimited: boolean
    remainingTime: number
  }>({ isLimited: false, remainingTime: 0 })

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    setValue,
    watch
  } = useForm<z.infer<z.ZodObject<T>>>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange'
  })

  // Check rate limiting on mount and periodically
  useEffect(() => {
    const checkRateLimit = () => {
      const config = rateLimitConfigs[rateLimitConfig]
      const isLimited = formRateLimiter.isRateLimited(formId, config)
      const remainingTime = Math.ceil(formRateLimiter.getRemainingTime(formId) / 1000)
      
      setRateLimitInfo({ isLimited, remainingTime })
    }

    checkRateLimit()
    const interval = setInterval(checkRateLimit, 1000)
    
    return () => clearInterval(interval)
  }, [formId, rateLimitConfig])

  const handleFormSubmit = async (data: z.infer<z.ZodObject<T>>) => {
    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      // Sanitize form data before submission
      const sanitizedData = sanitizeFormData(data)
      
      // Submit the form
      const result = await onSubmit(sanitizedData)
      setSubmitResult(result)

      // Clear form on successful submission
      if (result.success) {
        reset()
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        errors: { form: 'An unexpected error occurred. Please try again.' }
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFieldError = (fieldName: string): string | undefined => {
    return errors[fieldName]?.message || submitResult?.errors?.[fieldName]
  }

  const isFormDisabled = isSubmitting || rateLimitInfo.isLimited

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
          
          {showSecurityIndicator && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Secure form with validation</span>
            </div>
          )}
        </CardHeader>
      )}
      
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {children}
          
          {/* Rate limit warning */}
          {rateLimitInfo.isLimited && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md text-orange-800">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                Too many attempts. Please try again in {rateLimitInfo.remainingTime} seconds.
              </span>
            </div>
          )}
          
          {/* Form-level errors */}
          {submitResult?.errors?.form && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{submitResult.errors.form}</span>
            </div>
          )}
          
          {/* Success message */}
          {submitResult?.success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Form submitted successfully!</span>
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full"
            disabled={isFormDisabled || !isValid}
            aria-describedby={rateLimitInfo.isLimited ? 'rate-limit-message' : undefined}
          >
            {isSubmitting ? 'Submitting...' : submitText}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function FormField({
  name,
  label,
  type = 'text',
  placeholder,
  description,
  required = false,
  autoComplete,
  disabled = false,
  showPasswordStrength = false,
  className
}: FormFieldProps) {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  
  return (
    <Controller
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className={cn('space-y-2', className)}>
          <Label htmlFor={field.name} className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          
          <div className="relative">
            <Input
              {...field}
              id={field.name}
              type={type === 'password' && showPassword ? 'text' : type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              disabled={disabled}
              className={cn(
                error && 'border-red-500 focus-visible:ring-red-500',
                'focus-visible-ring'
              )}
              aria-invalid={!!error}
              aria-describedby={error ? `${field.name}-error` : description ? `${field.name}-description` : undefined}
            />
            
            {type === 'password' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          
          {description && !error && (
            <p id={`${field.name}-description`} className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
          
          {error && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p id={`${field.name}-error`} className="text-xs text-red-600" role="alert">
                {error.message}
              </p>
            </div>
          )}
          
          {type === 'password' && showPasswordStrength && field.value && (
            <PasswordStrengthIndicator password={field.value} />
          )}
        </div>
      )}
    />
  )
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const getStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0
    
    if (pwd.length >= 8) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/\d/.test(pwd)) score++
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) score++
    
    const strengthLevels = [
      { score: 0, label: 'Very Weak', color: 'bg-red-500' },
      { score: 1, label: 'Weak', color: 'bg-red-400' },
      { score: 2, label: 'Fair', color: 'bg-orange-400' },
      { score: 3, label: 'Good', color: 'bg-yellow-400' },
      { score: 4, label: 'Strong', color: 'bg-green-400' },
      { score: 5, label: 'Very Strong', color: 'bg-green-500' }
    ]
    
    return strengthLevels[score] || strengthLevels[0]
  }
  
  const strength = getStrength(password)
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span>Password Strength</span>
        <span className={cn(
          'font-medium',
          strength.score <= 2 ? 'text-red-600' :
          strength.score <= 3 ? 'text-orange-600' :
          'text-green-600'
        )}>
          {strength.label}
        </span>
      </div>
      
      <div className="grid grid-cols-5 gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 rounded-full',
              i < strength.score ? strength.color : 'bg-gray-200'
            )}
          />
        ))}
      </div>
    </div>
  )
}

// Export types for external use
export type { SecureFormProps, FormFieldProps }
