import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Calendar,
  Upload,
  X,
  Check,
  ChevronDown,
  Search,
  Plus,
  Minus
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { SmartFieldConfig, SelectOption } from './smart-form-builder'

interface SmartFieldProps {
  config: SmartFieldConfig
  value: any
  onChange: (value: any) => void
  onBlur?: () => void
  error?: string
  disabled?: boolean
  className?: string
}

export function SmartField({ 
  config, 
  value, 
  onChange, 
  onBlur, 
  error, 
  disabled, 
  className 
}: SmartFieldProps) {
  const fieldId = `field-${config.id}`

  switch (config.type) {
    case 'multiselect':
      return (
        <MultiSelectField
          config={config}
          value={value || []}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          disabled={disabled}
          className={className}
        />
      )
    case 'file':
      return (
        <FileUploadField
          config={config}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          disabled={disabled}
          className={className}
        />
      )
    case 'radio':
      return (
        <RadioGroupField
          config={config}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          disabled={disabled}
          className={className}
        />
      )
    case 'checkbox':
      return (
        <CheckboxGroupField
          config={config}
          value={value || []}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          disabled={disabled}
          className={className}
        />
      )
    case 'number':
      return (
        <NumberField
          config={config}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          disabled={disabled}
          className={className}
        />
      )
    case 'date':
      return (
        <DatePickerField
          config={config}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          disabled={disabled}
          className={className}
        />
      )
    default:
      return null
  }
}

// Multi-select field with search functionality
function MultiSelectField({ config, value, onChange, error, disabled, className }: SmartFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredOptions = config.options?.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const selectedOptions = config.options?.filter(option =>
    value.includes(option.value)
  ) || []

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggleOption = (optionValue: string | number) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v: any) => v !== optionValue)
      : [...value, optionValue]
    onChange(newValue)
  }

  const handleRemoveOption = (optionValue: string | number) => {
    const newValue = value.filter((v: any) => v !== optionValue)
    onChange(newValue)
  }

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <div
        className={cn(
          'min-h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm cursor-pointer',
          'focus-within:outline-none focus-within:ring-1 focus-within:ring-ring',
          error && 'border-red-500 focus-within:ring-red-500',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 min-h-5">
          {selectedOptions.length > 0 ? (
            selectedOptions.map(option => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded-sm"
              >
                {option.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveOption(option.value)
                  }}
                  className="hover:bg-primary-foreground/20 rounded-full"
                  disabled={disabled}
                  aria-label={`Remove ${option.label}`}
                  title={`Remove ${option.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-muted-foreground">{config.placeholder || 'Select options...'}</span>
          )}
        </div>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-md shadow-md">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent',
                    option.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => !option.disabled && handleToggleOption(option.value)}
                >
                  <div className={cn(
                    'w-4 h-4 border rounded-sm flex items-center justify-center',
                    value.includes(option.value) && 'bg-primary border-primary'
                  )}>
                    {value.includes(option.value) && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// File upload field with drag and drop
function FileUploadField({ config, value, onChange, error, disabled, className }: SmartFieldProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const allowedTypes = config.validation?.pattern?.split(',') || []
    
    const validFiles = fileArray.filter(file => {
      if (allowedTypes.length > 0) {
        return allowedTypes.some(type => file.type.includes(type.trim()))
      }
      return true
    })

    if (config.validation?.max && validFiles.length > config.validation.max) {
      validFiles.splice(config.validation.max)
    }

    onChange(validFiles)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleRemoveFile = (index: number) => {
    if (Array.isArray(value)) {
      const newFiles = value.filter((_, i) => i !== index)
      onChange(newFiles)
    }
  }

  const files = Array.isArray(value) ? value : value ? [value] : []

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragOver && 'border-primary bg-primary/5',
          error && 'border-red-500',
          disabled && 'cursor-not-allowed opacity-50',
          'hover:border-primary hover:bg-primary/5'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {config.placeholder || 'Click to upload or drag and drop files here'}
        </p>
        {config.validation?.pattern && (
          <p className="text-xs text-muted-foreground mt-1">
            Accepted types: {config.validation.pattern}
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple={config.validation?.max !== 1}
        accept={config.validation?.pattern}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file: File, index: number) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-muted rounded-md"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveFile(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Radio group field
function RadioGroupField({ config, value, onChange, error, disabled, className }: SmartFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {config.options?.map(option => (
        <div key={option.value} className="flex items-center space-x-2">
          <input
            type="radio"
            id={`${config.id}-${option.value}`}
            name={config.name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            disabled={disabled || option.disabled}
            className={cn(
              'w-4 h-4 text-primary border-gray-300 focus:ring-2 focus:ring-primary',
              error && 'border-red-500'
            )}
            aria-describedby={option.description ? `${config.id}-${option.value}-desc` : undefined}
            aria-label={option.label}
          />
          <Label
            htmlFor={`${config.id}-${option.value}`}
            className={cn(
              'text-sm font-medium cursor-pointer',
              (disabled || option.disabled) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div>
              {option.label}
              {option.description && (
                <div className="text-xs text-muted-foreground font-normal">
                  {option.description}
                </div>
              )}
            </div>
          </Label>
        </div>
      ))}
    </div>
  )
}

// Checkbox group field
function CheckboxGroupField({ config, value, onChange, error, disabled, className }: SmartFieldProps) {
  const handleToggle = (optionValue: string | number) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v: any) => v !== optionValue)
      : [...value, optionValue]
    onChange(newValue)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {config.options?.map(option => (
        <div key={option.value} className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`${config.id}-${option.value}`}
            checked={value.includes(option.value)}
            onChange={() => handleToggle(option.value)}
            disabled={disabled || option.disabled}
            className={cn(
              'w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary',
              error && 'border-red-500'
            )}
            aria-describedby={option.description ? `${config.id}-${option.value}-desc` : undefined}
            aria-label={option.label}
          />
          <Label
            htmlFor={`${config.id}-${option.value}`}
            className={cn(
              'text-sm font-medium cursor-pointer',
              (disabled || option.disabled) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div>
              {option.label}
              {option.description && (
                <div className="text-xs text-muted-foreground font-normal">
                  {option.description}
                </div>
              )}
            </div>
          </Label>
        </div>
      ))}
    </div>
  )
}

// Enhanced number field with increment/decrement buttons
function NumberField({ config, value, onChange, error, disabled, className }: SmartFieldProps) {
  const step = config.validation?.min ? Math.pow(10, -2) : 1
  const min = config.validation?.min
  const max = config.validation?.max

  const handleIncrement = () => {
    const newValue = (value || 0) + step
    if (!max || newValue <= max) {
      onChange(newValue)
    }
  }

  const handleDecrement = () => {
    const newValue = (value || 0) - step
    if (!min || newValue >= min) {
      onChange(newValue)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <Input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        placeholder={config.placeholder}
        className={cn(
          'pr-16',
          error && 'border-red-500 focus-visible:ring-red-500'
        )}
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-4 w-6 p-0 hover:bg-muted"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && value >= max)}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-4 w-6 p-0 hover:bg-muted"
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && value <= min)}
        >
          <Minus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

// Date picker field with calendar
function DatePickerField({ config, value, onChange, error, disabled, className }: SmartFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  )

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date)
    onChange(date?.toISOString().split('T')[0] || '')
    setIsOpen(false)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleDateString()
  }

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm cursor-pointer',
          'focus-within:outline-none focus-within:ring-1 focus-within:ring-ring',
          error && 'border-red-500 focus-within:ring-red-500',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={cn(
          'flex-1 flex items-center',
          !selectedDate && 'text-muted-foreground'
        )}>
          {selectedDate ? formatDate(selectedDate) : (config.placeholder || 'Select date...')}
        </span>
        <Calendar className="h-4 w-4 opacity-50" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-popover border border-border rounded-md shadow-md p-3">
          <Input
            type="date"
            value={selectedDate?.toISOString().split('T')[0] || ''}
            onChange={(e) => handleDateSelect(e.target.value ? new Date(e.target.value) : null)}
            className="w-full"
            aria-label="Select date"
          />
        </div>
      )}
    </div>
  )
}

export {
  SmartField,
  MultiSelectField,
  FileUploadField,
  RadioGroupField,
  CheckboxGroupField,
  NumberField,
  DatePickerField
}
