import React from 'react'
import { SmartFormBuilder, type SmartFormConfig } from './smart-form-builder'
import { type ValidationResult } from '@/lib/secure-validation'

// Pre-built form templates for common use cases
export const formTemplates = {
  userRegistration: {
    id: 'user-registration',
    title: 'Create Account',
    description: 'Sign up to get started with PenguinX',
    layout: 'single',
    theme: 'card',
    realTimeValidation: true,
    showReset: false,
    submitText: 'Create Account',
    fields: [
      {
        id: 'firstName',
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        placeholder: 'Enter your first name',
        validation: {
          required: true,
          minLength: 2,
          maxLength: 50
        },
        formatting: {
          type: 'text',
          options: {}
        },
        autoComplete: 'given-name',
        accessibility: {
          ariaLabel: 'First name input',
          helpText: 'Enter your legal first name as it appears on official documents'
        }
      },
      {
        id: 'lastName',
        name: 'lastName',
        label: 'Last Name',
        type: 'text',
        placeholder: 'Enter your last name',
        validation: {
          required: true,
          minLength: 2,
          maxLength: 50
        },
        formatting: {
          type: 'text',
          options: {}
        },
        autoComplete: 'family-name',
        accessibility: {
          ariaLabel: 'Last name input',
          helpText: 'Enter your legal last name as it appears on official documents'
        }
      },
      {
        id: 'email',
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'Enter your email address',
        validation: {
          required: true,
          pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
        },
        autoComplete: 'email',
        accessibility: {
          ariaLabel: 'Email address input',
          helpText: 'We will use this email for account verification and important updates'
        }
      },
      {
        id: 'password',
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Create a strong password',
        validation: {
          required: true,
          minLength: 8,
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).*$'
        },
        autoComplete: 'new-password',
        accessibility: {
          ariaLabel: 'Password input',
          helpText: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
        }
      },
      {
        id: 'confirmPassword',
        name: 'confirmPassword',
        label: 'Confirm Password',
        type: 'password',
        placeholder: 'Confirm your password',
        validation: {
          required: true
        },
        autoComplete: 'new-password',
        accessibility: {
          ariaLabel: 'Confirm password input',
          helpText: 'Re-enter your password to confirm'
        }
      },
      {
        id: 'acceptTerms',
        name: 'acceptTerms',
        label: 'I accept the Terms of Service and Privacy Policy',
        type: 'switch',
        validation: {
          required: true
        },
        accessibility: {
          ariaLabel: 'Accept terms and conditions',
          helpText: 'You must accept our terms to create an account'
        }
      }
    ]
  } as SmartFormConfig,

  financialTransaction: {
    id: 'financial-transaction',
    title: 'Add Transaction',
    description: 'Record a new financial transaction',
    layout: 'two-column',
    theme: 'default',
    realTimeValidation: true,
    autoSave: true,
    submitText: 'Save Transaction',
    showReset: true,
    fields: [
      {
        id: 'type',
        name: 'type',
        label: 'Transaction Type',
        type: 'select',
        validation: {
          required: true
        },
        options: [
          { label: 'Income', value: 'income', description: 'Money received' },
          { label: 'Expense', value: 'expense', description: 'Money spent' }
        ],
        accessibility: {
          ariaLabel: 'Select transaction type'
        }
      },
      {
        id: 'amount',
        name: 'amount',
        label: 'Amount',
        type: 'currency',
        placeholder: 'Enter amount',
        validation: {
          required: true,
          min: 0.01,
          max: 999999.99
        },
        formatting: {
          type: 'currency',
          options: {
            currency: 'USD',
            locale: 'en-US',
            decimals: 2
          }
        },
        accessibility: {
          ariaLabel: 'Transaction amount',
          helpText: 'Enter the transaction amount in USD'
        }
      },
      {
        id: 'category',
        name: 'category',
        label: 'Category',
        type: 'select',
        validation: {
          required: true
        },
        options: [
          { label: 'Food & Dining', value: 'food' },
          { label: 'Transportation', value: 'transport' },
          { label: 'Shopping', value: 'shopping' },
          { label: 'Entertainment', value: 'entertainment' },
          { label: 'Bills & Utilities', value: 'bills' },
          { label: 'Healthcare', value: 'healthcare' },
          { label: 'Income', value: 'income' },
          { label: 'Other', value: 'other' }
        ],
        conditional: [
          {
            field: 'type',
            operator: 'equals',
            value: 'expense',
            action: 'show'
          }
        ],
        accessibility: {
          ariaLabel: 'Select transaction category'
        }
      },
      {
        id: 'date',
        name: 'date',
        label: 'Date',
        type: 'date',
        defaultValue: new Date().toISOString().split('T')[0],
        validation: {
          required: true
        },
        accessibility: {
          ariaLabel: 'Transaction date'
        }
      },
      {
        id: 'description',
        name: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Optional description...',
        validation: {
          maxLength: 500
        },
        grid: {
          span: 2
        },
        accessibility: {
          ariaLabel: 'Transaction description',
          helpText: 'Optional: Add additional details about this transaction'
        }
      },
      {
        id: 'tags',
        name: 'tags',
        label: 'Tags',
        type: 'multiselect',
        placeholder: 'Add tags...',
        options: [
          { label: 'Business', value: 'business' },
          { label: 'Personal', value: 'personal' },
          { label: 'Tax Deductible', value: 'tax-deductible' },
          { label: 'Recurring', value: 'recurring' },
          { label: 'One-time', value: 'one-time' }
        ],
        grid: {
          span: 2
        },
        accessibility: {
          ariaLabel: 'Transaction tags',
          helpText: 'Add tags to categorize and filter transactions'
        }
      }
    ]
  } as SmartFormConfig,

  investmentEntry: {
    id: 'investment-entry',
    title: 'Add Investment',
    description: 'Record a new investment transaction',
    layout: 'grid',
    theme: 'card',
    realTimeValidation: true,
    submitText: 'Add Investment',
    showReset: true,
    fields: [
      {
        id: 'symbol',
        name: 'symbol',
        label: 'Stock Symbol',
        type: 'text',
        placeholder: 'e.g., AAPL, GOOGL',
        validation: {
          required: true,
          pattern: '^[A-Z]{1,5}$'
        },
        formatting: {
          type: 'text',
          options: {}
        },
        grid: {
          span: 1
        },
        accessibility: {
          ariaLabel: 'Stock symbol',
          helpText: 'Enter the stock ticker symbol in uppercase'
        }
      },
      {
        id: 'assetType',
        name: 'assetType',
        label: 'Asset Type',
        type: 'select',
        validation: {
          required: true
        },
        options: [
          { label: 'Stock', value: 'stock' },
          { label: 'ETF', value: 'etf' },
          { label: 'Mutual Fund', value: 'mutual_fund' },
          { label: 'Bond', value: 'bond' },
          { label: 'Cryptocurrency', value: 'crypto' },
          { label: 'Real Estate', value: 'real_estate' },
          { label: 'Commodity', value: 'commodity' }
        ],
        grid: {
          span: 1
        },
        accessibility: {
          ariaLabel: 'Asset type selection'
        }
      },
      {
        id: 'shares',
        name: 'shares',
        label: 'Number of Shares',
        type: 'number',
        placeholder: 'Enter quantity',
        validation: {
          required: true,
          min: 0.000001
        },
        grid: {
          span: 1
        },
        accessibility: {
          ariaLabel: 'Number of shares',
          helpText: 'Enter the quantity of shares or units purchased'
        }
      },
      {
        id: 'pricePerShare',
        name: 'pricePerShare',
        label: 'Price per Share',
        type: 'currency',
        placeholder: 'Enter price',
        validation: {
          required: true,
          min: 0.01
        },
        formatting: {
          type: 'currency',
          options: {
            currency: 'USD',
            locale: 'en-US',
            decimals: 4
          }
        },
        grid: {
          span: 1
        },
        accessibility: {
          ariaLabel: 'Price per share',
          helpText: 'Enter the purchase price per share'
        }
      },
      {
        id: 'totalAmount',
        name: 'totalAmount',
        label: 'Total Investment',
        type: 'currency',
        readonly: true,
        formatting: {
          type: 'currency',
          options: {
            currency: 'USD',
            locale: 'en-US',
            decimals: 2
          }
        },
        grid: {
          span: 2
        },
        accessibility: {
          ariaLabel: 'Total investment amount',
          helpText: 'Calculated automatically from shares × price per share'
        }
      },
      {
        id: 'purchaseDate',
        name: 'purchaseDate',
        label: 'Purchase Date',
        type: 'date',
        defaultValue: new Date().toISOString().split('T')[0],
        validation: {
          required: true
        },
        grid: {
          span: 1
        },
        accessibility: {
          ariaLabel: 'Purchase date'
        }
      },
      {
        id: 'broker',
        name: 'broker',
        label: 'Broker/Platform',
        type: 'select',
        options: [
          { label: 'Fidelity', value: 'fidelity' },
          { label: 'Charles Schwab', value: 'schwab' },
          { label: 'E*TRADE', value: 'etrade' },
          { label: 'TD Ameritrade', value: 'td_ameritrade' },
          { label: 'Robinhood', value: 'robinhood' },
          { label: 'Interactive Brokers', value: 'interactive_brokers' },
          { label: 'Vanguard', value: 'vanguard' },
          { label: 'Other', value: 'other' }
        ],
        grid: {
          span: 1
        },
        accessibility: {
          ariaLabel: 'Broker or trading platform'
        }
      },
      {
        id: 'fees',
        name: 'fees',
        label: 'Transaction Fees',
        type: 'currency',
        placeholder: '0.00',
        defaultValue: 0,
        formatting: {
          type: 'currency',
          options: {
            currency: 'USD',
            locale: 'en-US',
            decimals: 2
          }
        },
        grid: {
          span: 1
        },
        accessibility: {
          ariaLabel: 'Transaction fees',
          helpText: 'Enter any commission or fees paid for this transaction'
        }
      },
      {
        id: 'notes',
        name: 'notes',
        label: 'Investment Notes',
        type: 'textarea',
        placeholder: 'Optional notes about this investment...',
        validation: {
          maxLength: 1000
        },
        grid: {
          span: 4
        },
        accessibility: {
          ariaLabel: 'Investment notes',
          helpText: 'Optional: Add any additional information about this investment'
        }
      }
    ]
  } as SmartFormConfig,

  userProfile: {
    id: 'user-profile',
    title: 'Profile Settings',
    description: 'Update your account information',
    layout: 'two-column',
    theme: 'minimal',
    realTimeValidation: false,
    autoSave: true,
    submitText: 'Save Changes',
    showReset: true,
    fields: [
      {
        id: 'avatar',
        name: 'avatar',
        label: 'Profile Picture',
        type: 'file',
        validation: {
          pattern: 'image/*',
          max: 1
        },
        grid: {
          span: 2
        },
        accessibility: {
          ariaLabel: 'Upload profile picture',
          helpText: 'Upload a profile picture (JPEG, PNG, GIF supported, max 5MB)'
        }
      },
      {
        id: 'firstName',
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        validation: {
          required: true,
          minLength: 2
        },
        autoComplete: 'given-name',
        accessibility: {
          ariaLabel: 'First name'
        }
      },
      {
        id: 'lastName',
        name: 'lastName',
        label: 'Last Name',
        type: 'text',
        validation: {
          required: true,
          minLength: 2
        },
        autoComplete: 'family-name',
        accessibility: {
          ariaLabel: 'Last name'
        }
      },
      {
        id: 'email',
        name: 'email',
        label: 'Email Address',
        type: 'email',
        validation: {
          required: true
        },
        autoComplete: 'email',
        accessibility: {
          ariaLabel: 'Email address'
        }
      },
      {
        id: 'phone',
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: '(555) 123-4567',
        formatting: {
          type: 'phone',
          options: {}
        },
        autoComplete: 'tel',
        accessibility: {
          ariaLabel: 'Phone number',
          helpText: 'Optional: Used for account security and notifications'
        }
      },
      {
        id: 'timezone',
        name: 'timezone',
        label: 'Timezone',
        type: 'select',
        options: [
          { label: 'Eastern Time (UTC-5)', value: 'America/New_York' },
          { label: 'Central Time (UTC-6)', value: 'America/Chicago' },
          { label: 'Mountain Time (UTC-7)', value: 'America/Denver' },
          { label: 'Pacific Time (UTC-8)', value: 'America/Los_Angeles' },
          { label: 'UTC', value: 'UTC' }
        ],
        validation: {
          required: true
        },
        accessibility: {
          ariaLabel: 'Select timezone'
        }
      },
      {
        id: 'language',
        name: 'language',
        label: 'Language',
        type: 'select',
        options: [
          { label: 'English', value: 'en' },
          { label: 'Spanish', value: 'es' },
          { label: 'French', value: 'fr' },
          { label: 'German', value: 'de' },
          { label: 'Chinese', value: 'zh' }
        ],
        validation: {
          required: true
        },
        accessibility: {
          ariaLabel: 'Select language preference'
        }
      },
      {
        id: 'notifications',
        name: 'notifications',
        label: 'Email Notifications',
        type: 'checkbox',
        options: [
          { label: 'Weekly summary', value: 'weekly_summary', description: 'Get a weekly overview of your activity' },
          { label: 'Security alerts', value: 'security_alerts', description: 'Important security notifications' },
          { label: 'Product updates', value: 'product_updates', description: 'News about new features and improvements' },
          { label: 'Marketing emails', value: 'marketing', description: 'Promotional content and tips' }
        ],
        grid: {
          span: 2
        },
        accessibility: {
          ariaLabel: 'Email notification preferences',
          helpText: 'Choose which types of emails you would like to receive'
        }
      },
      {
        id: 'privacy',
        name: 'privacy',
        label: 'Privacy Settings',
        type: 'radio',
        options: [
          { label: 'Public', value: 'public', description: 'Profile visible to all users' },
          { label: 'Friends Only', value: 'friends', description: 'Profile visible to friends only' },
          { label: 'Private', value: 'private', description: 'Profile not visible to other users' }
        ],
        validation: {
          required: true
        },
        grid: {
          span: 2
        },
        accessibility: {
          ariaLabel: 'Privacy settings',
          helpText: 'Control who can see your profile information'
        }
      }
    ]
  } as SmartFormConfig,

  contactForm: {
    id: 'contact-form',
    title: 'Contact Us',
    description: 'Get in touch with our support team',
    layout: 'single',
    theme: 'card',
    realTimeValidation: true,
    submitText: 'Send Message',
    fields: [
      {
        id: 'name',
        name: 'name',
        label: 'Full Name',
        type: 'text',
        validation: {
          required: true,
          minLength: 2
        },
        autoComplete: 'name',
        accessibility: {
          ariaLabel: 'Your full name'
        }
      },
      {
        id: 'email',
        name: 'email',
        label: 'Email Address',
        type: 'email',
        validation: {
          required: true
        },
        autoComplete: 'email',
        accessibility: {
          ariaLabel: 'Your email address'
        }
      },
      {
        id: 'subject',
        name: 'subject',
        label: 'Subject',
        type: 'select',
        validation: {
          required: true
        },
        options: [
          { label: 'General Inquiry', value: 'general' },
          { label: 'Technical Support', value: 'technical' },
          { label: 'Billing Question', value: 'billing' },
          { label: 'Feature Request', value: 'feature' },
          { label: 'Bug Report', value: 'bug' },
          { label: 'Other', value: 'other' }
        ],
        accessibility: {
          ariaLabel: 'Select message subject'
        }
      },
      {
        id: 'priority',
        name: 'priority',
        label: 'Priority Level',
        type: 'radio',
        options: [
          { label: 'Low', value: 'low', description: 'General questions, non-urgent' },
          { label: 'Medium', value: 'medium', description: 'Important but not critical' },
          { label: 'High', value: 'high', description: 'Critical issue affecting usage' },
          { label: 'Urgent', value: 'urgent', description: 'Service disruption or security concern' }
        ],
        validation: {
          required: true
        },
        accessibility: {
          ariaLabel: 'Select priority level'
        }
      },
      {
        id: 'message',
        name: 'message',
        label: 'Message',
        type: 'textarea',
        placeholder: 'Please describe your question or issue...',
        validation: {
          required: true,
          minLength: 10,
          maxLength: 2000
        },
        accessibility: {
          ariaLabel: 'Your message',
          helpText: 'Please provide as much detail as possible to help us assist you'
        }
      },
      {
        id: 'attachments',
        name: 'attachments',
        label: 'Attachments',
        type: 'file',
        validation: {
          pattern: 'image/*,application/pdf,.doc,.docx',
          max: 3
        },
        accessibility: {
          ariaLabel: 'Upload attachments',
          helpText: 'Optional: Upload screenshots, documents, or other files (max 3 files)'
        }
      }
    ]
  } as SmartFormConfig
}

// Template wrapper components for easy use
export function UserRegistrationForm({ 
  onSubmit, 
  className 
}: { 
  onSubmit: (data: any) => Promise<ValidationResult<any>>
  className?: string 
}) {
  return (
    <SmartFormBuilder
      config={formTemplates.userRegistration}
      onSubmit={onSubmit}
      className={className}
    />
  )
}

export function FinancialTransactionForm({ 
  onSubmit, 
  className,
  initialData 
}: { 
  onSubmit: (data: any) => Promise<ValidationResult<any>>
  className?: string
  initialData?: any
}) {
  return (
    <SmartFormBuilder
      config={formTemplates.financialTransaction}
      onSubmit={onSubmit}
      initialData={initialData}
      className={className}
    />
  )
}

export function InvestmentEntryForm({ 
  onSubmit, 
  className,
  initialData 
}: { 
  onSubmit: (data: any) => Promise<ValidationResult<any>>
  className?: string
  initialData?: any
}) {
  return (
    <SmartFormBuilder
      config={formTemplates.investmentEntry}
      onSubmit={onSubmit}
      initialData={initialData}
      className={className}
    />
  )
}

export function UserProfileForm({ 
  onSubmit, 
  className,
  initialData 
}: { 
  onSubmit: (data: any) => Promise<ValidationResult<any>>
  className?: string
  initialData?: any
}) {
  return (
    <SmartFormBuilder
      config={formTemplates.userProfile}
      onSubmit={onSubmit}
      initialData={initialData}
      className={className}
    />
  )
}

export function ContactForm({ 
  onSubmit, 
  className 
}: { 
  onSubmit: (data: any) => Promise<ValidationResult<any>>
  className?: string 
}) {
  return (
    <SmartFormBuilder
      config={formTemplates.contactForm}
      onSubmit={onSubmit}
      className={className}
    />
  )
}
