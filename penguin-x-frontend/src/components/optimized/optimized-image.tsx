import React, { useState, useRef, useEffect, memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  loading?: 'lazy' | 'eager'
  placeholder?: string
  blurDataURL?: string
  sizes?: string
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
}

export const OptimizedImage = memo<OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  placeholder,
  blurDataURL,
  sizes,
  priority = false,
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLImageElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority, loading])

  // Generate responsive srcSet for different screen sizes
  const generateSrcSet = (baseSrc: string, width?: number) => {
    if (!width) return baseSrc

    const breakpoints = [0.5, 0.75, 1, 1.25, 1.5, 2]
    return breakpoints
      .map(ratio => {
        const scaledWidth = Math.round(width * ratio)
        // In a real app, you'd have a service to generate these URLs
        // For now, we'll just use the original source
        return `${baseSrc} ${scaledWidth}w`
      })
      .join(', ')
  }

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Show skeleton while not in view or loading
  if (!isInView) {
    return (
      <div 
        ref={imgRef}
        className={className}
        style={{ width, height }}
      >
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  // Show error state
  if (hasError) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-muted text-muted-foreground`}
        style={{ width, height }}
      >
        <span className="text-xs">Failed to load image</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Blur placeholder */}
      {isLoading && blurDataURL && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          aria-hidden="true"
        />
      )}

      {/* Loading skeleton */}
      {isLoading && !blurDataURL && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        sizes={sizes}
        srcSet={width ? generateSrcSet(src, width) : undefined}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
      />
    </div>
  )
})

OptimizedImage.displayName = 'OptimizedImage'

// Avatar component with optimization
interface OptimizedAvatarProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
  className?: string
}

export const OptimizedAvatar = memo<OptimizedAvatarProps>(({
  src,
  alt,
  size = 'md',
  fallback,
  className = ''
}) => {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 48, height: 48 },
    xl: { width: 64, height: 64 }
  }

  const dimensions = sizeMap[size]
  const initials = fallback || alt.slice(0, 2).toUpperCase()

  if (!src) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-muted text-muted-foreground rounded-full text-sm font-medium`}
        style={dimensions}
      >
        {initials}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      className={`${className} rounded-full`}
      priority={size === 'sm'} // Small avatars are usually visible immediately
    />
  )
})

OptimizedAvatar.displayName = 'OptimizedAvatar'

// Icon component with lazy loading for SVGs
interface OptimizedIconProps {
  name: string
  size?: number
  className?: string
  fallback?: React.ReactNode
}

export const OptimizedIcon = memo<OptimizedIconProps>(({
  name,
  size = 24,
  className = '',
  fallback
}) => {
  const [IconComponent, setIconComponent] = useState<React.ComponentType<any> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Dynamically import icon from lucide-react
    import('lucide-react')
      .then((icons) => {
        const Icon = (icons as any)[name]
        if (Icon) {
          setIconComponent(() => Icon)
        } else {
          setHasError(true)
        }
        setIsLoading(false)
      })
      .catch(() => {
        setHasError(true)
        setIsLoading(false)
      })
  }, [name])

  if (isLoading) {
    return <div className={`${className} animate-pulse bg-muted rounded`} style={{ width: size, height: size }} />
  }

  if (hasError || !IconComponent) {
    return fallback || <div className={`${className} bg-muted rounded`} style={{ width: size, height: size }} />
  }

  return <IconComponent size={size} className={className} />
})

OptimizedIcon.displayName = 'OptimizedIcon'

// Background image component with lazy loading
interface OptimizedBackgroundProps {
  src: string
  alt?: string
  className?: string
  children?: React.ReactNode
  overlay?: boolean
  overlayOpacity?: number
}

export const OptimizedBackground = memo<OptimizedBackgroundProps>(({
  src,
  alt = '',
  className = '',
  children,
  overlay = false,
  overlayOpacity = 0.5
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setIsLoaded(true)
    img.onerror = () => setHasError(true)
    img.src = src
  }, [src])

  return (
    <div className={`relative ${className}`}>
      {/* Background image */}
      {isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500"
          style={{ backgroundImage: `url(${src})` }}
          role="img"
          aria-label={alt}
        />
      )}

      {/* Overlay */}
      {overlay && isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-black transition-opacity duration-500"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Failed to load background</span>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
})

OptimizedBackground.displayName = 'OptimizedBackground'
