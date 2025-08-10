# Penguin X Frontend Architecture

## Overview

Penguin X is a modern financial application built with React, TypeScript, and Vite. This document provides a comprehensive overview of the application architecture, design patterns, and technical decisions.

## Technology Stack

### Core Technologies
- **React 18** - UI library with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Recharts** - Chart and data visualization library

### Development Tools
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **TypeScript** - Static type checking

### Deployment & Infrastructure
- **Vite Build** - Production bundling
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── charts/         # Financial chart components
│   ├── forms/          # Form-specific components
│   └── optimized/      # Performance-optimized components
├── pages/              # Route-level page components
├── layouts/            # Layout components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and helpers
├── store/              # State management (Zustand)
├── security/           # Security-related utilities
├── context/            # React Context providers
└── assets/             # Static assets
```

## State Management Architecture

### Zustand Store Structure

```typescript
interface AppState {
  // User authentication
  currentUser: User | null
  isAuthenticated: boolean
  
  // UI state
  theme: 'light' | 'dark' | 'system'
  highContrast: boolean
  sidebarOpen: boolean
  
  // Application data
  notifications: Notification[]
  settings: UserSettings
  
  // Actions
  setUser: (user: User | null) => void
  logout: () => void
  updateSettings: (settings: Partial<UserSettings>) => void
}
```

### State Patterns

1. **Separation of Concerns**: Each domain has its own store slice
2. **Immutable Updates**: All state updates use immutable patterns
3. **Optimistic Updates**: UI updates immediately, rollback on error
4. **Persistent State**: Critical state persisted to localStorage

### Store Implementation

```typescript
// Main application store
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentUser: null,
        isAuthenticated: false,
        theme: 'system',
        
        // Actions
        setUser: (user) => set({ currentUser: user, isAuthenticated: !!user }),
        logout: () => set({ currentUser: null, isAuthenticated: false }),
        
        // Enhanced theme management
        setTheme: (theme) => {
          set({ theme })
          applyTheme(theme)
        }
      }),
      {
        name: 'penguin-x-storage',
        partialize: (state) => ({
          theme: state.theme,
          settings: state.settings
        })
      }
    )
  )
)

// Specialized hooks for specific slices
export const useUser = () => useAppStore(state => ({
  user: state.currentUser,
  isAuthenticated: state.isAuthenticated,
  setUser: state.setUser,
  logout: state.logout
}))

export const useTheme = () => useAppStore(state => ({
  theme: state.theme,
  highContrast: state.highContrast,
  setTheme: state.setTheme,
  setHighContrast: state.setHighContrast
}))
```

## Theme System Architecture

### Design Token Structure

The theme system is built on a hierarchical token structure:

```typescript
interface DesignTokens {
  colors: {
    semantic: {
      primary: ColorScale
      secondary: ColorScale
      success: ColorScale
      warning: ColorScale
      error: ColorScale
    }
    neutral: ColorScale
    brand: ColorScale
  }
  typography: {
    fontFamilies: FontFamily[]
    fontSizes: FontSizeScale
    fontWeights: FontWeightScale
    lineHeights: LineHeightScale
  }
  spacing: SpacingScale
  borderRadius: BorderRadiusScale
  shadows: ShadowScale
}
```

### CSS Custom Properties

The theme system uses CSS custom properties for runtime theme switching:

```css
:root {
  /* Color tokens */
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  
  /* Typography tokens */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Spacing tokens */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  
  /* Border radius */
  --radius: 0.5rem;
}

[data-theme="dark"] {
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 84% 4.9%;
  /* ... dark theme overrides */
}
```

### Theme Implementation

```typescript
export const themeConfig = {
  light: {
    primary: 'hsl(222.2 84% 4.9%)',
    'primary-foreground': 'hsl(210 40% 98%)',
    // ... light theme colors
  },
  dark: {
    primary: 'hsl(210 40% 98%)',
    'primary-foreground': 'hsl(222.2 84% 4.9%)',
    // ... dark theme colors
  }
}

export function applyTheme(theme: 'light' | 'dark' | 'system') {
  const actualTheme = theme === 'system' 
    ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    : theme
    
  const root = document.documentElement
  
  Object.entries(themeConfig[actualTheme]).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })
  
  root.setAttribute('data-theme', actualTheme)
}
```

## Component Architecture

### Component Categories

1. **Base Components** (`/components/ui/`)
   - Primitive, unstyled components
   - Follow shadcn/ui patterns
   - Maximum reusability and composability

2. **Domain Components** (`/components/`)
   - Business logic components
   - Chart components for financial data
   - Form components with validation

3. **Layout Components** (`/layouts/`)
   - Page structure components
   - Navigation and routing logic

4. **Page Components** (`/pages/`)
   - Route-level components
   - Data fetching and high-level state management

### Component Design Patterns

#### Compound Components
```typescript
// Example: Card component with compound pattern
export const Card = ({ children, className, ...props }) => (
  <div className={cn("rounded-lg border bg-card", className)} {...props}>
    {children}
  </div>
)

Card.Header = CardHeader
Card.Content = CardContent
Card.Footer = CardFooter

// Usage
<Card>
  <Card.Header>
    <Card.Title>Portfolio Performance</Card.Title>
  </Card.Header>
  <Card.Content>
    <PortfolioChart data={data} />
  </Card.Content>
</Card>
```

#### Polymorphic Components
```typescript
interface ButtonProps<T extends React.ElementType = 'button'> {
  as?: T
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
}

export const Button = <T extends React.ElementType = 'button'>({
  as,
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof ButtonProps>) => {
  const Component = as || 'button'
  return (
    <Component
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

#### Render Props Pattern
```typescript
interface DataProviderProps<T> {
  children: (data: T, loading: boolean, error: Error | null) => React.ReactNode
  endpoint: string
}

export function DataProvider<T>({ children, endpoint }: DataProviderProps<T>) {
  const { data, loading, error } = useSWR<T>(endpoint)
  return children(data, loading, error)
}

// Usage
<DataProvider endpoint="/api/portfolio">
  {(portfolio, loading, error) => (
    loading ? <Skeleton /> : 
    error ? <ErrorMessage /> :
    <PortfolioChart data={portfolio} />
  )}
</DataProvider>
```

## Chart Component Architecture

### Chart Props Interface

```typescript
interface BaseChartProps {
  data: any[]
  width?: number | string
  height?: number | string
  loading?: boolean
  error?: Error | null
  className?: string
  
  // Interaction handlers
  onDataPointClick?: (data: any, index: number) => void
  onLegendClick?: (data: any) => void
  
  // Customization
  colors?: string[]
  theme?: 'light' | 'dark'
  
  // Accessibility
  title?: string
  description?: string
}

interface PortfolioChartProps extends BaseChartProps {
  data: PortfolioDataPoint[]
  showBenchmark?: boolean
  timeRange?: '1M' | '3M' | '1Y' | 'ALL'
  
  // Portfolio-specific props
  baseCurrency?: string
  showDividends?: boolean
  highlightPeriods?: DateRange[]
}
```

### Chart Implementation Pattern

```typescript
export const PortfolioPerformanceChart: React.FC<PortfolioChartProps> = ({
  data,
  width = '100%',
  height = 400,
  loading = false,
  error = null,
  showBenchmark = true,
  timeRange = '1Y',
  colors = ['#8884d8', '#82ca9d'],
  onDataPointClick,
  title = 'Portfolio Performance',
  description = 'Portfolio performance over time',
  ...props
}) => {
  // Data processing
  const processedData = useMemo(() => 
    processPortfolioData(data, timeRange), [data, timeRange]
  )
  
  // Chart configuration
  const chartConfig = useMemo(() => ({
    colors,
    showBenchmark,
    // ... other config
  }), [colors, showBenchmark])
  
  // Error and loading states
  if (loading) return <ChartSkeleton height={height} />
  if (error) return <ChartError error={error} />
  if (!data?.length) return <ChartEmptyState />
  
  return (
    <div 
      className="w-full"
      role="img"
      aria-label={title}
      aria-describedby={description}
    >
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            aria-label="Date"
          />
          <YAxis 
            tickFormatter={formatCurrency}
            aria-label="Value"
          />
          <Tooltip
            content={<CustomTooltip />}
            accessibility={{
              describedBy: 'chart-tooltip'
            }}
          />
          <Legend />
          
          <Line
            type="monotone"
            dataKey="portfolio"
            stroke={colors[0]}
            strokeWidth={2}
            dot={false}
            name="Portfolio"
            onClick={onDataPointClick}
          />
          
          {showBenchmark && (
            <Line
              type="monotone"
              dataKey="benchmark"
              stroke={colors[1]}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Benchmark"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### Chart Performance Optimization

```typescript
// Memoized chart components for performance
export const MemoizedPortfolioChart = React.memo(PortfolioPerformanceChart, 
  (prevProps, nextProps) => {
    return (
      prevProps.data === nextProps.data &&
      prevProps.timeRange === nextProps.timeRange &&
      prevProps.showBenchmark === nextProps.showBenchmark
    )
  }
)

// Virtual scrolling for large datasets
export const VirtualizedChartList: React.FC<{
  charts: ChartConfig[]
  height: number
}> = ({ charts, height }) => {
  return (
    <FixedSizeList
      height={height}
      itemCount={charts.length}
      itemSize={400}
      itemData={charts}
    >
      {({ index, data, style }) => (
        <div style={style}>
          <MemoizedPortfolioChart {...data[index]} />
        </div>
      )}
    </FixedSizeList>
  )
}
```

## Routing Architecture

### Route Structure

```typescript
// Route configuration
export const routes = [
  {
    path: '/',
    element: <LandingPage />,
    public: true
  },
  {
    path: '/login',
    element: <LoginPage />,
    public: true
  },
  {
    path: '/register',
    element: <RegisterPage />,
    public: true
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <DashboardOverview />
      },
      {
        path: 'portfolio',
        element: <PortfolioPage />
      },
      {
        path: 'transactions',
        element: <TransactionsPage />
      }
    ]
  }
]
```

### Protected Route Implementation

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallback = <Navigate to="/login" replace />
}) => {
  const { isAuthenticated, user } = useUser()
  const location = useLocation()
  
  // Check authentication
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    )
  }
  
  // Check role-based authorization
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => 
      user?.roles?.includes(role)
    )
    
    if (!hasRequiredRole) {
      return fallback || <UnauthorizedPage />
    }
  }
  
  return <>{children}</>
}
```

### Route-based Code Splitting

```typescript
// Lazy load route components
const DashboardOverview = lazy(() => import('../pages/dashboard-overview'))
const PortfolioPage = lazy(() => import('../pages/portfolio'))
const TransactionsPage = lazy(() => import('../pages/transactions'))

// Route component with suspense
export const AppRouter: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          {routes.map(route => (
            <Route key={route.path} {...route} />
          ))}
        </Routes>
      </Suspense>
    </Router>
  )
}
```

## Data Fetching Architecture

### SWR Configuration

```typescript
// Global SWR configuration
export const swrConfig: SWRConfiguration = {
  fetcher: async (url: string) => {
    const response = await secureAPI.get(url)
    return response.data
  },
  
  // Caching strategy
  dedupingInterval: 2000,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  
  // Error handling
  onError: (error, key) => {
    console.error('SWR Error:', { error, key })
    // Track error for analytics
    analytics.trackEvent('api_error', {
      endpoint: key,
      error: error.message
    })
  },
  
  // Loading states
  loadingTimeout: 3000,
  errorRetryCount: 3,
  errorRetryInterval: 5000
}

// Custom hooks for data fetching
export const usePortfolioData = (timeRange: string = '1Y') => {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/portfolio?range=${timeRange}`,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnMount: true
    }
  )
  
  return {
    portfolio: data,
    loading: isLoading,
    error,
    refresh: mutate
  }
}
```

### API Client Architecture

```typescript
// Secure API client with interceptors
class SecureApiClient {
  private instance: AxiosInstance
  
  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    this.setupInterceptors()
  }
  
  private setupInterceptors() {
    // Request interceptor for authentication
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )
    
    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle token expiration
          await this.handleTokenRefresh()
        }
        return Promise.reject(error)
      }
    )
  }
  
  private async handleTokenRefresh() {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) throw new Error('No refresh token')
      
      const response = await this.instance.post('/auth/refresh', {
        refresh_token: refreshToken
      })
      
      const { access_token } = response.data
      localStorage.setItem('access_token', access_token)
      
    } catch (error) {
      // Redirect to login
      localStorage.clear()
      window.location.href = '/login'
    }
  }
}

export const secureAPI = new SecureApiClient()
```

## Performance Architecture

### Performance Optimization Strategies

1. **Code Splitting**
   - Route-based splitting
   - Component-based splitting
   - Library splitting

2. **Memoization**
   - React.memo for components
   - useMemo for expensive calculations
   - useCallback for function props

3. **Virtualization**
   - Virtual scrolling for large lists
   - Windowing for charts
   - Pagination for data tables

4. **Caching**
   - SWR for API caching
   - React Query for complex state
   - Service Worker for offline caching

### Bundle Optimization

```typescript
// Vite configuration for optimal bundling
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for stable libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // Chart libraries chunk
          charts: ['recharts', 'd3-scale', 'd3-array'],
          
          // UI components chunk
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    },
    
    // Optimize chunks
    chunkSizeWarningLimit: 1000,
    
    // Enable tree shaking
    target: 'esnext',
    minify: 'terser',
    
    // Source maps for debugging
    sourcemap: process.env.NODE_ENV === 'development'
  },
  
  // Development optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand'],
    exclude: ['@vite/client', '@vite/env']
  }
})
```

### Performance Monitoring

```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function initPerformanceMonitoring() {
  getCLS(sendToAnalytics)
  getFID(sendToAnalytics)
  getFCP(sendToAnalytics)
  getLCP(sendToAnalytics)
  getTTFB(sendToAnalytics)
}

function sendToAnalytics(metric: Metric) {
  analytics.trackEvent('web_vital', {
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    id: metric.id
  })
}

// Performance budgets
export const performanceBudgets = {
  fcp: 1800,  // First Contentful Paint
  lcp: 2500,  // Largest Contentful Paint
  fid: 100,   // First Input Delay
  cls: 0.1,   // Cumulative Layout Shift
  ttfb: 800   // Time to First Byte
}
```

## Security Architecture

### Content Security Policy

```typescript
export const cspConfig = {
  directives: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // For development only
      'https://cdn.jsdelivr.net'
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com'
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:'
    ],
    'connect-src': [
      "'self'",
      process.env.VITE_API_BASE_URL
    ]
  }
}
```

### Input Sanitization

```typescript
// Comprehensive input sanitization
export class InputSanitizer {
  static sanitizeText(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    })
  }
  
  static sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    })
  }
  
  static sanitizeNumber(input: string | number): number | null {
    const num = typeof input === 'string' ? parseFloat(input) : input
    return isNaN(num) ? null : num
  }
  
  static sanitizeEmail(input: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const cleaned = this.sanitizeText(input).toLowerCase()
    return emailRegex.test(cleaned) ? cleaned : null
  }
}
```

### Authentication State

```typescript
// Secure authentication state management
interface AuthState {
  user: User | null
  tokens: {
    access: string | null
    refresh: string | null
  }
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  tokens: { access: null, refresh: null },
  isAuthenticated: false,
  isLoading: false,
  
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true })
    try {
      const response = await authAPI.login(credentials)
      const { user, access_token, refresh_token } = response.data
      
      // Store tokens securely
      secureStorage.setItem('access_token', access_token)
      secureStorage.setItem('refresh_token', refresh_token)
      
      set({
        user,
        tokens: { access: access_token, refresh: refresh_token },
        isAuthenticated: true,
        isLoading: false
      })
      
      analytics.trackEvent('login_success', { method: 'email' })
    } catch (error) {
      set({ isLoading: false })
      analytics.trackEvent('login_failure', { error: error.message })
      throw error
    }
  },
  
  logout: () => {
    secureStorage.removeItem('access_token')
    secureStorage.removeItem('refresh_token')
    
    set({
      user: null,
      tokens: { access: null, refresh: null },
      isAuthenticated: false
    })
    
    analytics.trackEvent('logout', { method: 'manual' })
  }
}))
```

## Testing Architecture

### Testing Strategy

1. **Unit Tests** - Individual functions and components
2. **Integration Tests** - Component interactions
3. **E2E Tests** - Complete user workflows
4. **Visual Regression Tests** - UI consistency
5. **Performance Tests** - Load and stress testing

### Component Testing Pattern

```typescript
// Component test example
describe('PortfolioChart', () => {
  const mockData = [
    { date: '2024-01', value: 100000 },
    { date: '2024-02', value: 105000 }
  ]
  
  it('renders chart with data', () => {
    render(<PortfolioChart data={mockData} />)
    
    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.getByText('Portfolio Performance')).toBeInTheDocument()
  })
  
  it('handles data point clicks', async () => {
    const onDataPointClick = vi.fn()
    
    render(
      <PortfolioChart 
        data={mockData} 
        onDataPointClick={onDataPointClick} 
      />
    )
    
    const dataPoint = screen.getByTestId('data-point-0')
    await user.click(dataPoint)
    
    expect(onDataPointClick).toHaveBeenCalledWith(mockData[0], 0)
  })
  
  it('shows loading state', () => {
    render(<PortfolioChart data={[]} loading />)
    
    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument()
  })
  
  it('shows error state', () => {
    const error = new Error('Failed to load data')
    
    render(<PortfolioChart data={[]} error={error} />)
    
    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
  })
})
```

### E2E Testing Pattern

```typescript
// E2E test example with Playwright
test.describe('Portfolio Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('[data-testid=email]', 'test@example.com')
    await page.fill('[data-testid=password]', 'password123')
    await page.click('[data-testid=login-button]')
    await page.waitForURL('/dashboard')
  })
  
  test('displays portfolio performance chart', async ({ page }) => {
    await expect(page.locator('[data-testid=portfolio-chart]')).toBeVisible()
    await expect(page.locator('text=Portfolio Performance')).toBeVisible()
  })
  
  test('allows time range selection', async ({ page }) => {
    await page.click('[data-testid=time-range-selector]')
    await page.click('text=1 Year')
    
    await page.waitForResponse('/api/portfolio?range=1Y')
    await expect(page.locator('[data-testid=portfolio-chart]')).toBeVisible()
  })
  
  test('handles chart interactions', async ({ page }) => {
    const chart = page.locator('[data-testid=portfolio-chart]')
    await chart.hover()
    
    await expect(page.locator('[data-testid=chart-tooltip]')).toBeVisible()
  })
})
```

## Deployment Architecture

### Build Configuration

```typescript
// Production build configuration
export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // Asset optimization
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    
    // Rollup configuration
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react'
            if (id.includes('recharts')) return 'charts'
            return 'vendor'
          }
        }
      }
    }
  },
  
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
})
```

### Docker Configuration

```dockerfile
# Multi-stage build for optimal image size
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## Monitoring & Analytics

### Error Tracking

```typescript
// Error boundary with reporting
export class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report to error tracking service
    errorTracker.captureException(error, {
      extra: errorInfo,
      tags: {
        component: this.props.name || 'Unknown',
        version: __APP_VERSION__
      }
    })
    
    // Track in analytics
    analytics.trackEvent('error_boundary', {
      error: error.message,
      stack: error.stack,
      component: this.props.name
    })
  }
}
```

### Performance Monitoring

```typescript
// Performance monitoring setup
export function initMonitoring() {
  // Web Vitals
  getCLS(sendToAnalytics)
  getFID(sendToAnalytics)
  getFCP(sendToAnalytics)
  getLCP(sendToAnalytics)
  getTTFB(sendToAnalytics)
  
  // Custom metrics
  performance.mark('app-start')
  
  window.addEventListener('load', () => {
    performance.mark('app-loaded')
    performance.measure('app-load-time', 'app-start', 'app-loaded')
    
    const measure = performance.getEntriesByName('app-load-time')[0]
    analytics.trackEvent('app_load_time', {
      duration: measure.duration
    })
  })
}
```

---

*This architecture documentation is maintained by the Penguin X development team and updated with each major release.*
