import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Keyboard,
  Volume2,
  Eye
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Skip Navigation Link for keyboard users
 * Allows users to skip directly to main form content
 */
export function SkipToFormLink({ targetId }: { targetId: string }) {
  const { t } = useTranslation()
  
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50',
        'bg-primary text-primary-foreground px-4 py-2 rounded-md',
        'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring'
      )}
    >
      {t('accessibility.skipToForm', 'Skip to form')}
    </a>
  )
}

/**
 * Form Progress Indicator with ARIA support
 * Shows current progress through multi-step forms
 */
interface FormProgressProps {
  currentStep: number
  totalSteps: number
  stepLabels?: string[]
  className?: string
}

export function AccessibleFormProgress({ 
  currentStep, 
  totalSteps, 
  stepLabels = [],
  className 
}: FormProgressProps) {
  const { t } = useTranslation()
  const progressPercentage = Math.round((currentStep / totalSteps) * 100)
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          {t('form.progress', 'Form Progress')}
        </span>
        <span className="text-sm text-muted-foreground">
          {currentStep} of {totalSteps}
        </span>
      </div>
      
      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Form progress: step ${currentStep} of ${totalSteps}`}
        className="w-full bg-muted rounded-full h-2"
      >
              <div
        className="bg-primary h-2 rounded-full transition-all duration-300"
        style={{ width: `${progressPercentage}%` } as React.CSSProperties}
      />
      </div>
      
      {stepLabels.length > 0 && (
        <div className="flex justify-between text-xs">
          {stepLabels.map((label, index) => (
            <span
              key={index}
              className={cn(
                'transition-colors',
                index < currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
              )}
              aria-current={index + 1 === currentStep ? 'step' : undefined}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Enhanced Error Summary for screen readers
 * Lists all form errors at the top for quick navigation
 */
interface ErrorSummaryProps {
  errors: Array<{
    field: string
    message: string
    fieldId?: string
  }>
  className?: string
}

export function AccessibleErrorSummary({ errors, className }: ErrorSummaryProps) {
  const { t } = useTranslation()
  const summaryRef = useRef<HTMLDivElement>(null)
  
  // Focus error summary when errors appear
  useEffect(() => {
    if (errors.length > 0 && summaryRef.current) {
      summaryRef.current.focus()
    }
  }, [errors.length])
  
  if (errors.length === 0) return null
  
  return (
    <div
      ref={summaryRef}
      role="alert"
      aria-live="assertive"
      aria-labelledby="error-summary-title"
      tabIndex={-1}
      className={cn(
        'p-4 border border-red-500 bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
        <h2 id="error-summary-title" className="text-lg font-semibold text-red-800">
          {t('form.errors.title', 'Please fix the following errors:')}
        </h2>
      </div>
      
      <ul className="space-y-1">
        {errors.map((error, index) => (
          <li key={index}>
            <a
              href={error.fieldId ? `#${error.fieldId}` : undefined}
              onClick={(e) => {
                if (error.fieldId) {
                  e.preventDefault()
                  const element = document.getElementById(error.fieldId)
                  if (element) {
                    element.focus()
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }
                }
              }}
              className="text-red-700 hover:text-red-900 underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
            >
              {error.field}: {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Live Region for announcing dynamic changes
 * Announces form updates to screen readers
 */
export function FormAnnouncementRegion() {
  return (
    <>
      {/* Polite announcements for non-critical updates */}
      <div
        id="form-announcements-polite"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      
      {/* Assertive announcements for critical updates */}
      <div
        id="form-announcements-assertive"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  )
}

/**
 * Hook for announcing form changes
 */
export function useFormAnnouncements() {
  const announcePolite = (message: string) => {
    const element = document.getElementById('form-announcements-polite')
    if (element) {
      element.textContent = message
    }
  }
  
  const announceAssertive = (message: string) => {
    const element = document.getElementById('form-announcements-assertive')
    if (element) {
      element.textContent = message
    }
  }
  
  return { announcePolite, announceAssertive }
}

/**
 * Keyboard Navigation Help Panel
 * Shows keyboard shortcuts for form navigation
 */
interface KeyboardHelpProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardNavigationHelp({ isOpen, onClose }: KeyboardHelpProps) {
  const { t } = useTranslation()
  
  const shortcuts = [
    { key: 'Tab', description: 'Move to next field' },
    { key: 'Shift + Tab', description: 'Move to previous field' },
    { key: 'Enter', description: 'Submit form or activate button' },
    { key: 'Space', description: 'Toggle checkbox or button' },
    { key: 'Arrow Keys', description: 'Navigate radio buttons or select options' },
    { key: 'Esc', description: 'Close dropdowns or cancel' },
    { key: 'Home', description: 'Go to first option' },
    { key: 'End', description: 'Go to last option' }
  ]
  
  if (!isOpen) return null
  
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background border rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="keyboard-help-title"
        aria-modal="true"
      >
        <div className="flex items-center gap-2 mb-4">
          <Keyboard className="h-5 w-5" />
          <h2 id="keyboard-help-title" className="text-lg font-semibold">
            {t('accessibility.keyboardHelp.title', 'Keyboard Navigation')}
          </h2>
        </div>
        
        <div className="space-y-3 mb-6">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center">
              <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">
                {shortcut.key}
              </kbd>
              <span className="text-sm text-muted-foreground flex-1 ml-3">
                {shortcut.description}
              </span>
            </div>
          ))}
        </div>
        
        <Button onClick={onClose} className="w-full">
          {t('common.close', 'Close')}
        </Button>
      </div>
    </div>
  )
}

/**
 * Field Description Component with proper ARIA attributes
 */
interface FieldDescriptionProps {
  id: string
  children: React.ReactNode
  className?: string
}

export function FieldDescription({ id, children, className }: FieldDescriptionProps) {
  return (
    <div
      id={id}
      className={cn('text-sm text-muted-foreground mt-1', className)}
      role="note"
    >
      {children}
    </div>
  )
}

/**
 * Enhanced Field Error with icon and proper semantics
 */
interface FieldErrorProps {
  id: string
  children: React.ReactNode
  className?: string
}

export function FieldError({ id, children, className }: FieldErrorProps) {
  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={cn('flex items-center gap-2 text-sm text-red-600 mt-1', className)}
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

/**
 * Success message with proper semantics
 */
interface FieldSuccessProps {
  id: string
  children: React.ReactNode
  className?: string
}

export function FieldSuccess({ id, children, className }: FieldSuccessProps) {
  return (
    <div
      id={id}
      role="status"
      aria-live="polite"
      className={cn('flex items-center gap-2 text-sm text-green-600 mt-1', className)}
    >
      <CheckCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

/**
 * Required Field Indicator
 */
export function RequiredIndicator({ className }: { className?: string }) {
  const { t } = useTranslation()
  
  return (
    <span
      className={cn('text-red-500 ml-1', className)}
      aria-label={t('form.required', 'Required field')}
      title={t('form.required', 'Required field')}
    >
      *
    </span>
  )
}

/**
 * Form Instructions Component
 */
interface FormInstructionsProps {
  id: string
  children: React.ReactNode
  className?: string
}

export function FormInstructions({ id, children, className }: FormInstructionsProps) {
  return (
    <div
      id={id}
      className={cn('p-4 bg-blue-50 border border-blue-200 rounded-md mb-6', className)}
      role="region"
      aria-labelledby={`${id}-title`}
    >
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div>
          <h3 id={`${id}-title`} className="font-medium text-blue-900 mb-1">
            Instructions
          </h3>
          <div className="text-sm text-blue-800">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Character Count Component with accessibility
 */
interface CharacterCountProps {
  current: number
  max: number
  fieldId: string
  className?: string
}

export function AccessibleCharacterCount({ current, max, fieldId, className }: CharacterCountProps) {
  const { t } = useTranslation()
  const remaining = max - current
  const isOverLimit = remaining < 0
  const isNearLimit = remaining <= Math.floor(max * 0.1) // Within 10% of limit
  
  return (
    <div
      id={`${fieldId}-char-count`}
      className={cn(
        'text-sm mt-1',
        isOverLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-muted-foreground',
        className
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="sr-only">
        {isOverLimit
          ? t('form.characterCount.overLimit', `${Math.abs(remaining)} characters over limit`)
          : t('form.characterCount.remaining', `${remaining} characters remaining`)
        }
      </span>
      <span aria-hidden="true">
        {current}/{max}
      </span>
    </div>
  )
}

/**
 * High Contrast Mode Toggle for accessibility
 */
export function HighContrastToggle() {
  const [isHighContrast, setIsHighContrast] = useState(false)
  const { t } = useTranslation()
  
  useEffect(() => {
    // Check for saved preference
    const saved = localStorage.getItem('high-contrast-mode')
    if (saved === 'true') {
      setIsHighContrast(true)
      document.documentElement.classList.add('high-contrast')
    }
  }, [])
  
  const toggleHighContrast = () => {
    const newValue = !isHighContrast
    setIsHighContrast(newValue)
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast')
      localStorage.setItem('high-contrast-mode', 'true')
    } else {
      document.documentElement.classList.remove('high-contrast')
      localStorage.setItem('high-contrast-mode', 'false')
    }
  }
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleHighContrast}
      aria-pressed={isHighContrast}
      aria-label={t('accessibility.highContrast.toggle', 'Toggle high contrast mode')}
    >
      <Eye className="h-4 w-4 mr-2" />
      {t('accessibility.highContrast.label', 'High Contrast')}
    </Button>
  )
}

/**
 * Focus management utilities
 */
export function useFocusManagement() {
  const focusedElementRef = useRef<HTMLElement | null>(null)
  
  const saveFocus = () => {
    focusedElementRef.current = document.activeElement as HTMLElement
  }
  
  const restoreFocus = () => {
    if (focusedElementRef.current && typeof focusedElementRef.current.focus === 'function') {
      focusedElementRef.current.focus()
    }
  }
  
  const trapFocus = (containerElement: HTMLElement) => {
    const focusableElements = containerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
    
    containerElement.addEventListener('keydown', handleTabKey)
    firstElement?.focus()
    
    return () => {
      containerElement.removeEventListener('keydown', handleTabKey)
    }
  }
  
  return { saveFocus, restoreFocus, trapFocus }
}

/**
 * ARIA Live Region Hook for dynamic announcements
 */
export function useAriaLive() {
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }
  
  return { announceToScreenReader }
}
