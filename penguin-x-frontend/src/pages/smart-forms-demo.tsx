import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Smartphone,
  Tablet,
  Monitor,
  Accessibility,
  Palette,
  Settings,
  Code,
  Eye,
  Keyboard,
  CheckCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { SmartFormBuilder } from '@/components/forms/smart-form-builder'
import { 
  UserRegistrationForm,
  FinancialTransactionForm,
  InvestmentEntryForm,
  UserProfileForm,
  ContactForm,
  formTemplates
} from '@/components/forms/form-templates'
import { 
  FormThemeProvider, 
  FormThemeSelector, 
  ThemedFormWrapper,
  useFormTheme 
} from '@/components/forms/form-themes'
import {
  SkipToFormLink,
  AccessibleFormProgress,
  AccessibleErrorSummary,
  FormAnnouncementRegion,
  KeyboardNavigationHelp,
  HighContrastToggle,
  useAriaLive
} from '@/components/forms/accessibility-enhancements'
import { type ValidationResult } from '@/lib/secure-validation'

export function SmartFormsDemo() {
  const { t } = useTranslation()
  const [activeDemo, setActiveDemo] = useState('registration')
  const [currentStep, setCurrentStep] = useState(1)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [devicePreview, setDevicePreview] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [demoErrors, setDemoErrors] = useState<Array<{ field: string; message: string; fieldId?: string }>>([])
  const { announceToScreenReader } = useAriaLive()

  // Mock form submission handler
  const handleFormSubmit = async (data: any): Promise<ValidationResult<any>> => {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    
    announceToScreenReader('Form submitted successfully!', 'assertive')
    
    return {
      success: true,
      data,
      errors: {}
    }
  }

  const demoForms = [
    {
      id: 'registration',
      title: 'User Registration',
      description: 'Multi-step registration with validation',
      component: (
        <UserRegistrationForm 
          onSubmit={handleFormSubmit}
          className="max-w-2xl mx-auto"
        />
      ),
      features: ['Real-time validation', 'Password strength indicator', 'Email suggestions', 'Terms acceptance']
    },
    {
      id: 'transaction',
      title: 'Financial Transaction',
      description: 'Smart financial form with auto-calculations',
      component: (
        <FinancialTransactionForm 
          onSubmit={handleFormSubmit}
          className="max-w-4xl mx-auto"
        />
      ),
      features: ['Currency formatting', 'Conditional fields', 'Auto-save', 'Category selection']
    },
    {
      id: 'investment',
      title: 'Investment Entry',
      description: 'Complex investment form with calculations',
      component: (
        <InvestmentEntryForm 
          onSubmit={handleFormSubmit}
          className="max-w-5xl mx-auto"
        />
      ),
      features: ['Real-time calculations', 'Symbol validation', 'Fee tracking', 'Portfolio integration']
    },
    {
      id: 'profile',
      title: 'User Profile',
      description: 'Profile settings with file upload',
      component: (
        <UserProfileForm 
          onSubmit={handleFormSubmit}
          className="max-w-3xl mx-auto"
          initialData={{
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            timezone: 'America/New_York',
            language: 'en'
          }}
        />
      ),
      features: ['File upload', 'Multi-select options', 'Auto-save', 'Privacy settings']
    },
    {
      id: 'contact',
      title: 'Contact Form',
      description: 'Support contact form with attachments',
      component: (
        <ContactForm 
          onSubmit={handleFormSubmit}
          className="max-w-2xl mx-auto"
        />
      ),
      features: ['Priority selection', 'File attachments', 'Character count', 'Subject categories']
    }
  ]

  const currentForm = demoForms.find(form => form.id === activeDemo)

  const getDeviceClassName = () => {
    switch (devicePreview) {
      case 'mobile':
        return 'max-w-sm mx-auto'
      case 'tablet':
        return 'max-w-2xl mx-auto'
      default:
        return 'max-w-full'
    }
  }

  return (
    <FormThemeProvider defaultTheme="default">
      <div className="min-h-screen bg-background">
        <SkipToFormLink targetId="demo-form" />
        <FormAnnouncementRegion />
        
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {t('smartForms.title', 'Smart & Advanced Forms')}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {t('smartForms.subtitle', 'Intelligent, accessible, and customizable form components')}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <HighContrastToggle />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKeyboardHelp(true)}
                >
                  <Keyboard className="h-4 w-4 mr-2" />
                  Keyboard Help
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="demo" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="demo">Live Demo</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              <TabsTrigger value="customization">Themes</TabsTrigger>
            </TabsList>

            {/* Live Demo Tab */}
            <TabsContent value="demo" className="space-y-6">
              {/* Form Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Demo Configuration
                  </CardTitle>
                  <CardDescription>
                    Choose a form template and device preview mode
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Form Template Selection */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Form Template</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {demoForms.map((form) => (
                        <button
                          key={form.id}
                          onClick={() => setActiveDemo(form.id)}
                          className={cn(
                            'p-3 text-left text-sm border rounded-lg transition-all',
                            'hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring',
                            activeDemo === form.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-accent'
                          )}
                        >
                          <div className="font-medium">{form.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {form.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Device Preview */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Device Preview</h3>
                    <div className="flex gap-2">
                      <Button
                        variant={devicePreview === 'mobile' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDevicePreview('mobile')}
                      >
                        <Smartphone className="h-4 w-4 mr-2" />
                        Mobile
                      </Button>
                      <Button
                        variant={devicePreview === 'tablet' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDevicePreview('tablet')}
                      >
                        <Tablet className="h-4 w-4 mr-2" />
                        Tablet
                      </Button>
                      <Button
                        variant={devicePreview === 'desktop' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDevicePreview('desktop')}
                      >
                        <Monitor className="h-4 w-4 mr-2" />
                        Desktop
                      </Button>
                    </div>
                  </div>

                  {/* Form Features */}
                  {currentForm && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Form Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentForm.features.map((feature, index) => (
                          <Badge key={index} variant="secondary">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Error Summary Demo */}
              {demoErrors.length > 0 && (
                <AccessibleErrorSummary errors={demoErrors} />
              )}

              {/* Form Demo */}
              <Card>
                <CardContent className="p-0">
                  <div
                    id="demo-form"
                    className={cn(
                      'p-6 transition-all duration-300',
                      getDeviceClassName(),
                      devicePreview === 'mobile' && 'scale-90 origin-top'
                    )}
                    style={{
                      transform: devicePreview === 'mobile' ? 'scale(0.9)' : undefined
                    } as React.CSSProperties}
                  >
                    {currentForm && (
                      <ThemedFormWrapper variant="card">
                        {currentForm.component}
                      </ThemedFormWrapper>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Real-time Validation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Instant field validation</li>
                      <li>• Smart error messages</li>
                      <li>• Auto-formatting suggestions</li>
                      <li>• Cross-field validation</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-500" />
                      Conditional Logic
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Show/hide fields dynamically</li>
                      <li>• Conditional validation rules</li>
                      <li>• Field dependency management</li>
                      <li>• Smart form workflows</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-purple-500" />
                      Smart Formatting
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Currency auto-formatting</li>
                      <li>• Phone number patterns</li>
                      <li>• Date formatting</li>
                      <li>• Custom formatters</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-orange-500" />
                      Configurable Fields
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• 15+ field types</li>
                      <li>• Custom validation rules</li>
                      <li>• Grid layout support</li>
                      <li>• Theme customization</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Accessibility className="h-5 w-5 text-green-600" />
                      Accessibility First
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• WCAG 2.1 compliant</li>
                      <li>• Screen reader support</li>
                      <li>• Keyboard navigation</li>
                      <li>• High contrast mode</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-indigo-500" />
                      Responsive Design
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Mobile-first approach</li>
                      <li>• Adaptive layouts</li>
                      <li>• Touch-friendly inputs</li>
                      <li>• Cross-device testing</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Accessibility Tab */}
            <TabsContent value="accessibility" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Accessibility className="h-5 w-5" />
                    Accessibility Features
                  </CardTitle>
                  <CardDescription>
                    Built with inclusive design principles and WCAG 2.1 compliance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Indicator Demo */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Form Progress</h3>
                    <AccessibleFormProgress
                      currentStep={currentStep}
                      totalSteps={4}
                      stepLabels={['Personal Info', 'Contact Details', 'Preferences', 'Review']}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                        disabled={currentStep === 4}
                      >
                        Next
                      </Button>
                    </div>
                  </div>

                  {/* Error Summary Demo */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Error Summary</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDemoErrors([
                        { field: 'Email', message: 'Please enter a valid email address', fieldId: 'email-field' },
                        { field: 'Password', message: 'Password must be at least 8 characters', fieldId: 'password-field' }
                      ])}
                    >
                      Show Error Summary
                    </Button>
                    {demoErrors.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDemoErrors([])}
                      >
                        Clear Errors
                      </Button>
                    )}
                  </div>

                  {/* Accessibility Features List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Screen Reader Support</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Proper ARIA labels and descriptions</li>
                        <li>• Live regions for dynamic updates</li>
                        <li>• Semantic HTML structure</li>
                        <li>• Error announcements</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Keyboard Navigation</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Tab order management</li>
                        <li>• Focus trap for modals</li>
                        <li>• Keyboard shortcuts</li>
                        <li>• Skip navigation links</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Visual Accessibility</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• High contrast mode</li>
                        <li>• Color-independent indicators</li>
                        <li>• Sufficient color contrast</li>
                        <li>• Scalable text and icons</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Motor Accessibility</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Large touch targets</li>
                        <li>• Drag and drop alternatives</li>
                        <li>• Voice input support</li>
                        <li>• Timeout extensions</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Customization Tab */}
            <TabsContent value="customization" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Theme Customization
                  </CardTitle>
                  <CardDescription>
                    Customize the appearance and styling of your forms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormThemeSelector />
                  
                  <div className="mt-6 p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Theme Preview</h4>
                    <ThemedFormWrapper variant="card" className="max-w-md">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Sample Input</label>
                          <input
                            type="text"
                            placeholder="Enter some text..."
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Sample Select</label>
                                                <select className="w-full p-2 border rounded" aria-label="Sample select">
                        <option>Option 1</option>
                        <option>Option 2</option>
                      </select>
                        </div>
                        <button className="w-full p-2 rounded font-medium">
                          Sample Button
                        </button>
                      </div>
                    </ThemedFormWrapper>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Keyboard Help Modal */}
        <KeyboardNavigationHelp
          isOpen={showKeyboardHelp}
          onClose={() => setShowKeyboardHelp(false)}
        />
      </div>
    </FormThemeProvider>
  )
}

export default SmartFormsDemo
