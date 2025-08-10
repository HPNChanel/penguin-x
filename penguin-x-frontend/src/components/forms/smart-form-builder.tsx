import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Eye, 
  EyeOff, 
  Calendar,
  DollarSign,
  Hash,
  Type,
  Mail,
  Phone,
  Globe,
  FileText,
  ToggleLeft,
  ChevronDown,
  Info
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider'
import { 
  formRateLimiter, 
  rateLimitConfigs, 
  sanitizeFormData,
  formatValidationErrors,
  type ValidationResult 
} from '@/lib/secure-validation'

// Enhanced field configuration types
export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'currency' 
  | 'percentage'
  | 'date' 
  | 'datetime'
  | 'tel' 
  | 'url' 
  | 'textarea' 
  | 'select' 
  | 'multiselect'
  | 'switch' 
  | 'checkbox'
  | 'radio'
  | 'file'

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  description?: string
}

export interface ConditionalLogic {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
  value: any
  action: 'show' | 'hide' | 'require' | 'disable'
}

export interface FieldValidation {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  custom?: (value: any, formData: any) => string | true
}

export interface FieldFormatting {
  type: 'currency' | 'percentage' | 'phone' | 'date' | 'number' | 'text'
  options?: {
    currency?: string
    locale?: string
    decimals?: number
    prefix?: string
    suffix?: string
    thousandsSeparator?: boolean
  }
}

export interface SmartFieldConfig {
  id: string
  name: string
  label: string
  type: FieldType
  placeholder?: string
  description?: string
  defaultValue?: any
  validation?: FieldValidation
  formatting?: FieldFormatting
  options?: SelectOption[]
  conditional?: ConditionalLogic[]
  autoComplete?: string
  disabled?: boolean
  readonly?: boolean
  className?: string
  grid?: {
    span?: number
    row?: number
    col?: number
  }
  accessibility?: {
    ariaLabel?: string
    ariaDescribedby?: string
    helpText?: string
  }
}

export interface SmartFormConfig {
  id: string
  title?: string
  description?: string
  fields: SmartFieldConfig[]
  layout?: 'single' | 'two-column' | 'grid'
  theme?: 'default' | 'minimal' | 'card'
  submitText?: string
  resetText?: string
  showReset?: boolean
  autoSave?: boolean
  realTimeValidation?: boolean
  progressIndicator?: boolean
}

interface SmartFormBuilderProps {
  config: SmartFormConfig
  schema?: z.ZodSchema<any>
  onSubmit: (data: any) => Promise<ValidationResult<any>>
  onFieldChange?: (fieldName: string, value: any, formData: any) => void
  onValidationChange?: (isValid: boolean, errors: any) => void
  initialData?: any
  className?: string
  rateLimitConfig?: keyof typeof rateLimitConfigs
}

// Auto-format utilities
const formatters = {
  currency: (value: string, options?: any) => {
    const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''))
    if (isNaN(numValue)) return value
    
    const locale = options?.locale || 'en-US'
    const currency = options?.currency || 'USD'
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: options?.decimals ?? 2,
      maximumFractionDigits: options?.decimals ?? 2
    }).format(numValue)
  },

  percentage: (value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''))
    if (isNaN(numValue)) return value
    return `${numValue}%`
  },

  phone: (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return value
  },

  date: (value: string) => {
    const date = new Date(value)
    if (isNaN(date.getTime())) return value
    return date.toLocaleDateString()
  },

  number: (value: string, options?: any) => {
    const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''))
    if (isNaN(numValue)) return value
    
    if (options?.thousandsSeparator) {
      return numValue.toLocaleString()
    }
    return numValue.toString()
  }
}

// Field type icons
const fieldIcons = {
  text: Type,
  email: Mail,
  password: Eye,
  number: Hash,
  currency: DollarSign,
  percentage: Hash,
  date: Calendar,
  datetime: Calendar,
  tel: Phone,
  url: Globe,
  textarea: FileText,
  select: ChevronDown,
  multiselect: ChevronDown,
  switch: ToggleLeft,
  checkbox: ToggleLeft,
  radio: ToggleLeft,
  file: FileText
}

export function SmartFormBuilder({
  config,
  schema,
  onSubmit,
  onFieldChange,
  onValidationChange,
  initialData,
  className,
  rateLimitConfig = 'general'
}: SmartFormBuilderProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<ValidationResult<any> | null>(null)
  const [fieldVisibility, setFieldVisibility] = useState<Record<string, boolean>>({})
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null)

  // Generate dynamic schema based on field configurations
  const dynamicSchema = useMemo(() => {
    if (schema) return schema

    const schemaFields: Record<string, z.ZodTypeAny> = {}
    
    config.fields.forEach(field => {
      let fieldSchema: z.ZodTypeAny

      switch (field.type) {
        case 'email':
          fieldSchema = z.string().email('Invalid email address')
          break
        case 'number':
        case 'currency':
        case 'percentage':
          fieldSchema = z.number({ invalid_type_error: 'Must be a number' })
          break
        case 'date':
        case 'datetime':
          fieldSchema = z.date({ invalid_type_error: 'Invalid date' })
          break
        case 'switch':
        case 'checkbox':
          fieldSchema = z.boolean()
          break
        case 'select':
        case 'radio':
          if (field.options) {
            const optionValues = field.options.map(opt => opt.value)
            fieldSchema = z.enum(optionValues as [string, ...string[]])
          } else {
            fieldSchema = z.string()
          }
          break
        case 'multiselect':
          fieldSchema = z.array(z.string())
          break
        default:
          fieldSchema = z.string()
      }

      // Apply validation rules
      if (field.validation) {
        const val = field.validation

        if (field.type === 'text' || field.type === 'textarea' || field.type === 'email') {
          if (val.minLength) fieldSchema = (fieldSchema as z.ZodString).min(val.minLength)
          if (val.maxLength) fieldSchema = (fieldSchema as z.ZodString).max(val.maxLength)
          if (val.pattern) fieldSchema = (fieldSchema as z.ZodString).regex(new RegExp(val.pattern))
        }

        if (field.type === 'number' || field.type === 'currency' || field.type === 'percentage') {
          if (val.min !== undefined) fieldSchema = (fieldSchema as z.ZodNumber).min(val.min)
          if (val.max !== undefined) fieldSchema = (fieldSchema as z.ZodNumber).max(val.max)
        }

        if (!val.required) {
          fieldSchema = fieldSchema.optional()
        }
      } else if (field.type === 'switch' || field.type === 'checkbox') {
        fieldSchema = fieldSchema.optional()
      } else {
        fieldSchema = fieldSchema.optional()
      }

      schemaFields[field.name] = fieldSchema
    })

    return z.object(schemaFields)
  }, [config.fields, schema])

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    setValue,
    watch,
    getValues,
    trigger
  } = useForm({
    resolver: zodResolver(dynamicSchema),
    mode: config.realTimeValidation ? 'onChange' : 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: initialData || {}
  })

  const watchedValues = useWatch({ control })

  // Handle conditional logic
  useEffect(() => {
    const newVisibility: Record<string, boolean> = {}
    
    config.fields.forEach(field => {
      if (field.conditional && field.conditional.length > 0) {
        const shouldShow = field.conditional.every(condition => {
          const fieldValue = watchedValues[condition.field]
          
          switch (condition.operator) {
            case 'equals':
              return fieldValue === condition.value
            case 'not_equals':
              return fieldValue !== condition.value
            case 'contains':
              return String(fieldValue).includes(String(condition.value))
            case 'not_contains':
              return !String(fieldValue).includes(String(condition.value))
            case 'greater_than':
              return Number(fieldValue) > Number(condition.value)
            case 'less_than':
              return Number(fieldValue) < Number(condition.value)
            case 'is_empty':
              return !fieldValue || fieldValue === ''
            case 'is_not_empty':
              return fieldValue && fieldValue !== ''
            default:
              return true
          }
        })
        
        newVisibility[field.name] = shouldShow
      } else {
        newVisibility[field.name] = true
      }
    })
    
    setFieldVisibility(newVisibility)
  }, [watchedValues, config.fields])

  // Handle field changes
  useEffect(() => {
    if (onFieldChange) {
      const subscription = watch((value, { name }) => {
        if (name) {
          onFieldChange(name, value[name], value)
        }
      })
      return () => subscription.unsubscribe()
    }
  }, [watch, onFieldChange])

  // Handle validation changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid, errors)
    }
  }, [isValid, errors, onValidationChange])

  // Auto-save functionality
  useEffect(() => {
    if (config.autoSave && isDirty) {
      const timeoutId = setTimeout(async () => {
        setAutoSaveStatus('saving')
        try {
          // Implement auto-save logic here
          await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated save
          setAutoSaveStatus('saved')
          setTimeout(() => setAutoSaveStatus(null), 2000)
        } catch (error) {
          setAutoSaveStatus('error')
          setTimeout(() => setAutoSaveStatus(null), 3000)
        }
      }, 2000) // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId)
    }
  }, [watchedValues, config.autoSave, isDirty])

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      // Apply formatting to data before submission
      const formattedData = { ...data }
      
      config.fields.forEach(field => {
        if (field.formatting && formattedData[field.name]) {
          const formatter = formatters[field.formatting.type]
          if (formatter) {
            formattedData[field.name] = formatter(
              String(formattedData[field.name]), 
              field.formatting.options
            )
          }
        }
      })

      const sanitizedData = sanitizeFormData(formattedData)
      const result = await onSubmit(sanitizedData)
      setSubmitResult(result)

      if (result.success && !config.autoSave) {
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

  const handleReset = () => {
    reset()
    setSubmitResult(null)
  }

  const renderField = (field: SmartFieldConfig) => {
    const isVisible = fieldVisibility[field.name] !== false
    if (!isVisible) return null

    const Icon = fieldIcons[field.type]
    const hasError = errors[field.name]
    const fieldId = `${config.id}-${field.name}`

    return (
      <div 
        key={field.id}
        className={cn(
          'space-y-2',
          field.className,
          field.grid?.span && `col-span-${field.grid.span}`,
          config.layout === 'grid' && 'col-span-1'
        )}
      >
        <Label 
          htmlFor={fieldId} 
          className="flex items-center gap-2 text-sm font-medium"
        >
          {Icon && <Icon className="h-4 w-4" />}
          {field.label}
          {field.validation?.required && (
            <span className="text-red-500 ml-1" aria-label="Required">*</span>
          )}
          {field.accessibility?.helpText && (
            <div className="relative group">
              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
              <div className="absolute left-0 top-6 z-10 hidden group-hover:block bg-popover text-popover-foreground text-xs p-2 rounded-md shadow-md border max-w-xs">
                {field.accessibility.helpText}
              </div>
            </div>
          )}
        </Label>

        <Controller
          name={field.name}
          control={control}
          render={({ field: controllerField, fieldState: { error } }) => (
            <div className="space-y-1">
              {renderFieldInput(field, controllerField, fieldId, error)}
              
              {field.description && !error && (
                <p className="text-xs text-muted-foreground">
                  {field.description}
                </p>
              )}
              
              {error && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-xs text-red-600" role="alert">
                    {error.message}
                  </p>
                </div>
              )}
            </div>
          )}
        />
      </div>
    )
  }

  const renderFieldInput = (
    fieldConfig: SmartFieldConfig, 
    field: any, 
    fieldId: string, 
    error: any
  ) => {
    const baseProps = {
      ...field,
      id: fieldId,
      disabled: fieldConfig.disabled || isSubmitting,
      readOnly: fieldConfig.readonly,
      placeholder: fieldConfig.placeholder,
      autoComplete: fieldConfig.autoComplete,
      className: cn(
        error && 'border-red-500 focus-visible:ring-red-500',
        'transition-colors'
      ),
      'aria-invalid': !!error,
      'aria-describedby': error ? `${fieldId}-error` : fieldConfig.accessibility?.ariaDescribedby
    }

    switch (fieldConfig.type) {
      case 'textarea':
        return (
          <textarea
            {...baseProps}
            rows={4}
            className={cn(
              "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              baseProps.className
            )}
          />
        )

      case 'select':
        return (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger className={baseProps.className}>
              <SelectValue placeholder={fieldConfig.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {fieldConfig.options?.map(option => (
                <SelectItem 
                  key={option.value} 
                  value={String(option.value)}
                  disabled={option.disabled}
                >
                  <div>
                    <div>{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={field.value || false}
              onCheckedChange={field.onChange}
              disabled={baseProps.disabled}
              aria-describedby={baseProps['aria-describedby']}
            />
          </div>
        )

      case 'password':
        return <PasswordInput {...baseProps} />

      case 'currency':
        return <CurrencyInput {...baseProps} formatting={fieldConfig.formatting} />

      case 'date':
        return (
          <Input
            {...baseProps}
            type="date"
          />
        )

      case 'datetime':
        return (
          <Input
            {...baseProps}
            type="datetime-local"
          />
        )

      default:
        return (
          <Input
            {...baseProps}
            type={fieldConfig.type === 'percentage' ? 'number' : fieldConfig.type}
          />
        )
    }
  }

  const getLayoutClassName = () => {
    switch (config.layout) {
      case 'two-column':
        return 'grid grid-cols-1 md:grid-cols-2 gap-4'
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'
      default:
        return 'space-y-4'
    }
  }

  const getThemeClassName = () => {
    switch (config.theme) {
      case 'minimal':
        return 'border-0 shadow-none'
      case 'card':
        return 'border-2 shadow-lg'
      default:
        return ''
    }
  }

  return (
    <Card className={cn('w-full', getThemeClassName(), className)}>
      {(config.title || config.description) && (
        <CardHeader>
          {config.title && <CardTitle>{config.title}</CardTitle>}
          {config.description && <CardDescription>{config.description}</CardDescription>}
          
          {autoSaveStatus && (
            <div className={cn(
              'flex items-center gap-2 text-sm',
              autoSaveStatus === 'saved' && 'text-green-600',
              autoSaveStatus === 'saving' && 'text-blue-600',
              autoSaveStatus === 'error' && 'text-red-600'
            )}>
              <Clock className="h-4 w-4" />
              <span>
                {autoSaveStatus === 'saved' && 'Changes saved'}
                {autoSaveStatus === 'saving' && 'Saving...'}
                {autoSaveStatus === 'error' && 'Save failed'}
              </span>
            </div>
          )}
        </CardHeader>
      )}
      
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className={getLayoutClassName()}>
            {config.fields.map(renderField)}
          </div>
          
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
          
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || (!isValid && config.realTimeValidation)}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : (config.submitText || 'Submit')}
            </Button>
            
            {config.showReset && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting || !isDirty}
              >
                {config.resetText || 'Reset'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Enhanced password input with show/hide toggle
function PasswordInput({ ...props }) {
  const [showPassword, setShowPassword] = useState(false)
  
  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? 'text' : 'password'}
      />
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
    </div>
  )
}

// Enhanced currency input with auto-formatting
function CurrencyInput({ formatting, onChange, value, ...props }: any) {
  const [displayValue, setDisplayValue] = useState(value || '')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.-]/g, '')
    const numericValue = parseFloat(rawValue) || 0
    
    onChange(numericValue)
    
    if (formatting?.type === 'currency') {
      const formatted = formatters.currency(rawValue, formatting.options)
      setDisplayValue(formatted)
    } else {
      setDisplayValue(rawValue)
    }
  }

  useEffect(() => {
    if (value !== undefined) {
      if (formatting?.type === 'currency') {
        const formatted = formatters.currency(String(value), formatting.options)
        setDisplayValue(formatted)
      } else {
        setDisplayValue(value)
      }
    }
  }, [value, formatting])

  return (
    <div className="relative">
      <Input
        {...props}
        value={displayValue}
        onChange={handleChange}
      />
      {formatting?.options?.currency && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {formatting.options.prefix || '$'}
        </div>
      )}
    </div>
  )
}

export type { SmartFormConfig, SmartFieldConfig, ConditionalLogic, FieldValidation, FieldFormatting }
