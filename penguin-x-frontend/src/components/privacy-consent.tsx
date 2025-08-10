import { useState, useEffect } from "react"
import { Shield, Settings, Info, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAnalytics, ConsentSettings, EVENT_MAP } from "@/lib/enhanced-analytics"

export function PrivacyConsent() {
  const { updateConsent, getConsentSettings, trackEvent } = useAnalytics()
  const [consentSettings, setConsentSettings] = useState<ConsentSettings>(getConsentSettings())
  const [isOpen, setIsOpen] = useState(false)
  const [hasShownInitialPrompt, setHasShownInitialPrompt] = useState(false)

  useEffect(() => {
    // Show initial consent prompt if user hasn't set preferences
    const hasSetConsent = localStorage.getItem('penguin-x-analytics-consent')
    if (!hasSetConsent && !hasShownInitialPrompt) {
      setIsOpen(true)
      setHasShownInitialPrompt(true)
    }
  }, [hasShownInitialPrompt])

  const handleConsentChange = (key: keyof ConsentSettings, value: boolean) => {
    const newSettings = { ...consentSettings, [key]: value }
    setConsentSettings(newSettings)
    updateConsent({ [key]: value })
    
    trackEvent(EVENT_MAP.CONSENT_UPDATED, {
      setting: key,
      value,
      source: 'privacy_dialog'
    })
  }

  const acceptAll = () => {
    const allAccepted = {
      analytics: true,
      performance: true,
      functional: true,
      marketing: true
    }
    setConsentSettings({ ...consentSettings, ...allAccepted })
    updateConsent(allAccepted)
    setIsOpen(false)
    
    trackEvent(EVENT_MAP.CONSENT_UPDATED, {
      action: 'accept_all',
      source: 'privacy_dialog'
    })
  }

  const rejectAll = () => {
    const allRejected = {
      analytics: false,
      performance: true, // Keep essential
      functional: true,  // Keep essential
      marketing: false
    }
    setConsentSettings({ ...consentSettings, ...allRejected })
    updateConsent(allRejected)
    setIsOpen(false)
    
    trackEvent(EVENT_MAP.CONSENT_UPDATED, {
      action: 'reject_all',
      source: 'privacy_dialog'
    })
  }

  const saveCustomSettings = () => {
    setIsOpen(false)
    trackEvent(EVENT_MAP.CONSENT_UPDATED, {
      action: 'save_custom',
      source: 'privacy_dialog',
      settings: consentSettings
    })
  }

  const consentCategories = [
    {
      key: 'functional' as keyof ConsentSettings,
      title: 'Functional',
      description: 'Essential for the application to work properly. These cannot be disabled.',
      required: true,
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      details: [
        'User authentication and session management',
        'Theme preferences and UI state',
        'Form data validation and submission',
        'Basic error logging for debugging'
      ]
    },
    {
      key: 'performance' as keyof ConsentSettings,
      title: 'Performance',
      description: 'Helps us understand how the application performs and identify areas for improvement.',
      required: true,
      icon: <Info className="h-4 w-4 text-blue-500" />,
      details: [
        'Page load times and Core Web Vitals',
        'Application performance metrics',
        'Error tracking and crash reports',
        'Network request monitoring'
      ]
    },
    {
      key: 'analytics' as keyof ConsentSettings,
      title: 'Analytics',
      description: 'Helps us understand how you use the application to improve your experience.',
      required: false,
      icon: consentSettings.analytics ? 
        <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
        <XCircle className="h-4 w-4 text-red-500" />,
      details: [
        'Page views and navigation patterns',
        'Feature usage and interaction tracking',
        'User journey and flow analysis',
        'Anonymized usage statistics'
      ]
    },
    {
      key: 'marketing' as keyof ConsentSettings,
      title: 'Marketing',
      description: 'Allows us to show you relevant content and personalized experiences.',
      required: false,
      icon: consentSettings.marketing ? 
        <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
        <XCircle className="h-4 w-4 text-red-500" />,
      details: [
        'Personalized content recommendations',
        'Feature announcements and updates',
        'User segmentation for targeted messaging',
        'A/B testing for user experience improvements'
      ]
    }
  ]

  return (
    <>
      {/* Privacy Settings Trigger */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={() => trackEvent(EVENT_MAP.PRIVACY_SETTINGS_VIEWED, { source: 'settings_button' })}
          >
            <Shield className="h-4 w-4" />
            Privacy
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Data Settings
            </DialogTitle>
            <DialogDescription>
              Choose how Penguin X can use your data to improve your experience. 
              You can change these settings at any time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button onClick={acceptAll} variant="default" size="sm">
                Accept All
              </Button>
              <Button onClick={rejectAll} variant="outline" size="sm">
                Reject Optional
              </Button>
            </div>

            <Separator />

            {/* Consent Categories */}
            <div className="space-y-4">
              {consentCategories.map((category) => (
                <Card key={category.key} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {category.icon}
                        <h3 className="font-medium">{category.title}</h3>
                        {category.required && (
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description}
                      </p>
                      
                      {/* Category Details */}
                      <details className="group">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
                          <span>Show details</span>
                          <Settings className="h-3 w-3 group-open:rotate-90 transition-transform" />
                        </summary>
                        <ul className="mt-2 text-xs text-muted-foreground space-y-1 ml-4">
                          {category.details.map((detail, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="h-1 w-1 bg-muted-foreground rounded-full" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </details>
                    </div>
                    
                    <div className="ml-4">
                      <Switch
                        checked={consentSettings[category.key]}
                        onCheckedChange={(checked) => handleConsentChange(category.key, checked)}
                        disabled={category.required}
                        aria-label={`Toggle ${category.title} consent`}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Data Information */}
            <Card className="border-dashed bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Your Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>
                    • All data is encrypted in transit and at rest
                  </p>
                  <p>
                    • Personal information is automatically sanitized from analytics
                  </p>
                  <p>
                    • You can export or delete your data at any time
                  </p>
                  <p>
                    • We never sell your data to third parties
                  </p>
                </div>
                <div className="mt-3 text-xs">
                  <span className="text-muted-foreground">Last updated: </span>
                  <span>{new Date(consentSettings.lastUpdated).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveCustomSettings}>
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Compact consent banner for new users
export function ConsentBanner() {
  const { updateConsent, getConsentSettings, trackEvent } = useAnalytics()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasSetConsent = localStorage.getItem('penguin-x-analytics-consent')
    if (!hasSetConsent) {
      setIsVisible(true)
    }
  }, [])

  const acceptEssential = () => {
    updateConsent({
      analytics: false,
      performance: true,
      functional: true,
      marketing: false
    })
    setIsVisible(false)
    trackEvent(EVENT_MAP.CONSENT_UPDATED, {
      action: 'accept_essential',
      source: 'consent_banner'
    })
  }

  const acceptAll = () => {
    updateConsent({
      analytics: true,
      performance: true,
      functional: true,
      marketing: true
    })
    setIsVisible(false)
    trackEvent(EVENT_MAP.CONSENT_UPDATED, {
      action: 'accept_all',
      source: 'consent_banner'
    })
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4" />
            <span className="font-medium text-sm">Privacy & Cookies</span>
          </div>
          <p className="text-xs text-muted-foreground">
            We use cookies and similar technologies to improve your experience. 
            Choose your preferences or accept all to continue.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                Customize
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <PrivacyConsent />
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={acceptEssential}>
            Essential Only
          </Button>
          <Button size="sm" onClick={acceptAll}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  )
}
