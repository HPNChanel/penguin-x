import React from 'react'
import { AlertCircle, Loader2, FileX, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type StateType = 'loading' | 'error' | 'empty' | 'success'

interface StateCardProps {
  state: StateType
  title?: string
  description?: string
  className?: string
  onRetry?: () => void
  retryLabel?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  'aria-live'?: 'off' | 'polite' | 'assertive'
}

const stateConfig = {
  loading: {
    icon: Loader2,
    title: 'Loading...',
    description: 'Please wait while we fetch your data.',
    iconClass: 'animate-spin text-primary',
    ariaLive: 'polite' as const
  },
  error: {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'We encountered an error while loading your data.',
    iconClass: 'text-destructive',
    ariaLive: 'assertive' as const
  },
  empty: {
    icon: FileX,
    title: 'No data available',
    description: 'There is no data to display at the moment.',
    iconClass: 'text-muted-foreground',
    ariaLive: 'polite' as const
  },
  success: {
    icon: null,
    title: '',
    description: '',
    iconClass: '',
    ariaLive: 'off' as const
  }
}

export function StateCard({
  state,
  title,
  description,
  className,
  onRetry,
  retryLabel = 'Try again',
  icon,
  actions,
  'aria-live': ariaLive,
  ...props
}: StateCardProps) {
  const config = stateConfig[state]
  const IconComponent = icon ? null : config.icon
  const displayTitle = title || config.title
  const displayDescription = description || config.description
  const displayAriaLive = ariaLive || config.ariaLive

  if (state === 'success') {
    return null
  }

  return (
    <Card 
      className={cn(
        "border-dashed transition-all duration-200 hover-glow",
        state === 'error' && "border-destructive/50",
        className
      )}
      role={state === 'error' ? 'alert' : 'status'}
      aria-live={displayAriaLive}
      {...props}
    >
      <CardHeader className="text-center pb-4">
        {IconComponent && (
          <div className="flex justify-center mb-2" aria-hidden="true">
            <IconComponent className={cn("h-12 w-12", config.iconClass)} />
          </div>
        )}
        {icon && (
          <div className="flex justify-center mb-2" aria-hidden="true">
            {icon}
          </div>
        )}
        {displayTitle && (
          <CardTitle className="text-lg font-semibold">
            {displayTitle}
          </CardTitle>
        )}
        {displayDescription && (
          <CardDescription className="text-sm text-muted-foreground max-w-sm mx-auto">
            {displayDescription}
          </CardDescription>
        )}
      </CardHeader>
      {(onRetry || actions) && (
        <CardContent className="text-center pt-0">
          <div className="flex justify-center gap-2">
            {onRetry && (
              <Button
                variant="outline"
                onClick={onRetry}
                className="focus-visible-ring"
                aria-label={`${retryLabel}. ${displayDescription}`}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryLabel}
              </Button>
            )}
            {actions}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Convenience components for common states
export const LoadingCard = (props: Omit<StateCardProps, 'state'>) => (
  <StateCard state="loading" {...props} />
)

export const ErrorCard = (props: Omit<StateCardProps, 'state'>) => (
  <StateCard state="error" {...props} />
)

export const EmptyCard = (props: Omit<StateCardProps, 'state'>) => (
  <StateCard state="empty" {...props} />
)
