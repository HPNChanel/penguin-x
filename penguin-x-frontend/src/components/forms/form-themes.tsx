import React, { createContext, useContext, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider'

// Form theme configuration types
export interface FormThemeConfig {
  name: string
  label: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    border: string
    input: string
    ring: string
    error: string
    warning: string
    success: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
    }
    fontWeight: {
      normal: string
      medium: string
      semibold: string
      bold: string
    }
  }
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
  }
  animations: {
    duration: string
    easing: string
  }
}

// Predefined themes
export const formThemes: Record<string, FormThemeConfig> = {
  default: {
    name: 'default',
    label: 'Default',
    description: 'Clean and modern form styling',
    colors: {
      primary: 'hsl(var(--primary))',
      secondary: 'hsl(var(--secondary))',
      accent: 'hsl(var(--accent))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      muted: 'hsl(var(--muted))',
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      error: 'hsl(var(--destructive))',
      warning: 'hsl(39 84% 56%)',
      success: 'hsl(142 76% 36%)'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    typography: {
      fontFamily: 'var(--font-sans)',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem'
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      }
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
    },
    animations: {
      duration: '150ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },

  minimal: {
    name: 'minimal',
    label: 'Minimal',
    description: 'Clean and simple with minimal styling',
    colors: {
      primary: 'hsl(220 13% 91%)',
      secondary: 'hsl(220 14% 96%)',
      accent: 'hsl(220 13% 91%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(220 9% 46%)',
      muted: 'hsl(220 14% 96%)',
      border: 'hsl(220 13% 91%)',
      input: 'hsl(220 13% 91%)',
      ring: 'hsl(220 9% 46%)',
      error: 'hsl(0 84% 60%)',
      warning: 'hsl(38 92% 50%)',
      success: 'hsl(142 76% 36%)'
    },
    spacing: {
      xs: '0.125rem',
      sm: '0.375rem',
      md: '0.75rem',
      lg: '1.25rem',
      xl: '1.75rem'
    },
    typography: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem'
      },
      fontWeight: {
        normal: '400',
        medium: '400',
        semibold: '500',
        bold: '600'
      }
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.375rem',
      full: '9999px'
    },
    shadows: {
      sm: 'none',
      md: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      lg: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
    },
    animations: {
      duration: '100ms',
      easing: 'ease-out'
    }
  },

  modern: {
    name: 'modern',
    label: 'Modern',
    description: 'Bold and contemporary design',
    colors: {
      primary: 'hsl(263 85% 62%)',
      secondary: 'hsl(263 50% 95%)',
      accent: 'hsl(263 85% 62%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(263 15% 15%)',
      muted: 'hsl(263 10% 95%)',
      border: 'hsl(263 20% 85%)',
      input: 'hsl(263 10% 98%)',
      ring: 'hsl(263 85% 62%)',
      error: 'hsl(0 84% 60%)',
      warning: 'hsl(38 92% 50%)',
      success: 'hsl(142 76% 36%)'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2.5rem'
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem'
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      }
    },
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)'
    },
    animations: {
      duration: '200ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },

  glass: {
    name: 'glass',
    label: 'Glass',
    description: 'Glassmorphism with transparency effects',
    colors: {
      primary: 'hsla(217 91% 60% / 0.8)',
      secondary: 'hsla(217 91% 60% / 0.1)',
      accent: 'hsla(217 91% 60% / 0.8)',
      background: 'hsla(0 0% 100% / 0.8)',
      foreground: 'hsl(217 32% 17%)',
      muted: 'hsla(217 32% 17% / 0.05)',
      border: 'hsla(217 32% 17% / 0.15)',
      input: 'hsla(0 0% 100% / 0.6)',
      ring: 'hsla(217 91% 60% / 0.8)',
      error: 'hsla(0 84% 60% / 0.8)',
      warning: 'hsla(38 92% 50% / 0.8)',
      success: 'hsla(142 76% 36% / 0.8)'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    typography: {
      fontFamily: 'var(--font-sans)',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem'
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      }
    },
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      lg: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
    },
    animations: {
      duration: '300ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
}

// Theme context
interface FormThemeContextType {
  currentTheme: string
  setTheme: (themeName: string) => void
  themeConfig: FormThemeConfig
  availableThemes: string[]
}

const FormThemeContext = createContext<FormThemeContextType | undefined>(undefined)

// Theme provider component
interface FormThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
}

export function FormThemeProvider({ children, defaultTheme = 'default' }: FormThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme)
  const { theme: systemTheme } = useTheme()
  
  // Get current theme config
  const themeConfig = formThemes[currentTheme] || formThemes.default
  
  // Available theme names
  const availableThemes = Object.keys(formThemes)
  
  // Apply theme variables to CSS
  useEffect(() => {
    const root = document.documentElement
    const config = formThemes[currentTheme]
    
    if (config) {
      // Apply color variables
      Object.entries(config.colors).forEach(([key, value]) => {
        root.style.setProperty(`--form-${key}`, value)
      })
      
      // Apply spacing variables
      Object.entries(config.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--form-spacing-${key}`, value)
      })
      
      // Apply typography variables
      root.style.setProperty(`--form-font-family`, config.typography.fontFamily)
      Object.entries(config.typography.fontSize).forEach(([key, value]) => {
        root.style.setProperty(`--form-text-${key}`, value)
      })
      Object.entries(config.typography.fontWeight).forEach(([key, value]) => {
        root.style.setProperty(`--form-font-${key}`, value)
      })
      
      // Apply border radius variables
      Object.entries(config.borderRadius).forEach(([key, value]) => {
        root.style.setProperty(`--form-radius-${key}`, value)
      })
      
      // Apply shadow variables
      Object.entries(config.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--form-shadow-${key}`, value)
      })
      
      // Apply animation variables
      root.style.setProperty(`--form-duration`, config.animations.duration)
      root.style.setProperty(`--form-easing`, config.animations.easing)
    }
  }, [currentTheme])
  
  const setTheme = (themeName: string) => {
    if (formThemes[themeName]) {
      setCurrentTheme(themeName)
      localStorage.setItem('form-theme', themeName)
    }
  }
  
  return (
    <FormThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        themeConfig,
        availableThemes
      }}
    >
      {children}
    </FormThemeContext.Provider>
  )
}

// Hook to use theme context
export function useFormTheme() {
  const context = useContext(FormThemeContext)
  if (context === undefined) {
    throw new Error('useFormTheme must be used within a FormThemeProvider')
  }
  return context
}

// Theme selector component
export function FormThemeSelector({ className }: { className?: string }) {
  const { currentTheme, setTheme, availableThemes } = useFormTheme()
  
  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-sm font-medium">Form Theme</h3>
      <div className="grid grid-cols-2 gap-2">
        {availableThemes.map((themeName) => {
          const theme = formThemes[themeName]
          return (
            <button
              key={themeName}
              onClick={() => setTheme(themeName)}
              className={cn(
                'p-3 text-left text-sm border rounded-lg transition-all',
                'hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring',
                currentTheme === themeName
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-accent'
              )}
            >
              <div className="font-medium">{theme.label}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {theme.description}
              </div>
              
              {/* Theme preview colors */}
              <div className="flex gap-1 mt-2">
                <div
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: theme.colors.primary } as React.CSSProperties}
                />
                <div
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: theme.colors.secondary } as React.CSSProperties}
                />
                <div
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: theme.colors.accent } as React.CSSProperties}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Themed form wrapper component
interface ThemedFormWrapperProps {
  children: React.ReactNode
  theme?: string
  className?: string
  variant?: 'default' | 'card' | 'minimal' | 'glass'
}

export function ThemedFormWrapper({ 
  children, 
  theme, 
  className, 
  variant = 'default' 
}: ThemedFormWrapperProps) {
  const { currentTheme, themeConfig } = useFormTheme()
  const activeTheme = theme || currentTheme
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return cn(
          'p-6 border rounded-lg shadow-sm bg-background',
          'backdrop-blur-sm',
          activeTheme === 'glass' && 'backdrop-blur-md border-white/20'
        )
      case 'minimal':
        return 'space-y-4'
      case 'glass':
        return cn(
          'p-6 rounded-xl border border-white/20 backdrop-blur-md',
          'bg-gradient-to-br from-white/80 to-white/40',
          'shadow-xl shadow-black/5'
        )
      default:
        return 'p-4 space-y-4'
    }
  }
  
  return (
    <div
      className={cn(
        'form-themed-wrapper',
        getVariantClasses(),
        className
      )}
      style={{
        '--form-theme': activeTheme,
        fontFamily: themeConfig.typography.fontFamily
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

// Dark mode aware theme adjustments
export function useDarkModeThemeAdjustments() {
  const { theme: systemTheme } = useTheme()
  const { currentTheme, themeConfig } = useFormTheme()
  
  const isDark = systemTheme === 'dark'
  
  // Adjust theme colors for dark mode
  const adjustedTheme = React.useMemo(() => {
    if (!isDark) return themeConfig
    
    return {
      ...themeConfig,
      colors: {
        ...themeConfig.colors,
        background: isDark ? 'hsl(222.2 84% 4.9%)' : themeConfig.colors.background,
        foreground: isDark ? 'hsl(210 40% 98%)' : themeConfig.colors.foreground,
        muted: isDark ? 'hsl(217.2 32.6% 17.5%)' : themeConfig.colors.muted,
        border: isDark ? 'hsl(217.2 32.6% 17.5%)' : themeConfig.colors.border,
        input: isDark ? 'hsl(217.2 32.6% 17.5%)' : themeConfig.colors.input
      }
    }
  }, [themeConfig, isDark])
  
  return adjustedTheme
}

// CSS-in-JS style generator for dynamic theming
export function generateThemeStyles(theme: FormThemeConfig) {
  return `
    .form-themed-wrapper {
      --primary: ${theme.colors.primary};
      --secondary: ${theme.colors.secondary};
      --accent: ${theme.colors.accent};
      --background: ${theme.colors.background};
      --foreground: ${theme.colors.foreground};
      --muted: ${theme.colors.muted};
      --border: ${theme.colors.border};
      --input: ${theme.colors.input};
      --ring: ${theme.colors.ring};
      --error: ${theme.colors.error};
      --warning: ${theme.colors.warning};
      --success: ${theme.colors.success};
      
      --spacing-xs: ${theme.spacing.xs};
      --spacing-sm: ${theme.spacing.sm};
      --spacing-md: ${theme.spacing.md};
      --spacing-lg: ${theme.spacing.lg};
      --spacing-xl: ${theme.spacing.xl};
      
      --text-xs: ${theme.typography.fontSize.xs};
      --text-sm: ${theme.typography.fontSize.sm};
      --text-base: ${theme.typography.fontSize.base};
      --text-lg: ${theme.typography.fontSize.lg};
      --text-xl: ${theme.typography.fontSize.xl};
      
      --font-normal: ${theme.typography.fontWeight.normal};
      --font-medium: ${theme.typography.fontWeight.medium};
      --font-semibold: ${theme.typography.fontWeight.semibold};
      --font-bold: ${theme.typography.fontWeight.bold};
      
      --radius-sm: ${theme.borderRadius.sm};
      --radius-md: ${theme.borderRadius.md};
      --radius-lg: ${theme.borderRadius.lg};
      
      --shadow-sm: ${theme.shadows.sm};
      --shadow-md: ${theme.shadows.md};
      --shadow-lg: ${theme.shadows.lg};
      
      --duration: ${theme.animations.duration};
      --easing: ${theme.animations.easing};
    }
    
    .form-themed-wrapper input,
    .form-themed-wrapper textarea,
    .form-themed-wrapper select {
      background-color: var(--input);
      border-color: var(--border);
      color: var(--foreground);
      border-radius: var(--radius-md);
      transition: all var(--duration) var(--easing);
    }
    
    .form-themed-wrapper input:focus,
    .form-themed-wrapper textarea:focus,
    .form-themed-wrapper select:focus {
      outline: none;
      border-color: var(--ring);
      box-shadow: 0 0 0 2px var(--ring);
    }
    
    .form-themed-wrapper label {
      color: var(--foreground);
      font-weight: var(--font-medium);
    }
    
    .form-themed-wrapper button {
      background-color: var(--primary);
      color: var(--background);
      border-radius: var(--radius-md);
      transition: all var(--duration) var(--easing);
    }
    
    .form-themed-wrapper button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    
    .form-themed-wrapper .error {
      color: var(--error);
    }
    
    .form-themed-wrapper .success {
      color: var(--success);
    }
    
    .form-themed-wrapper .warning {
      color: var(--warning);
    }
  `
}

export type { FormThemeConfig }
