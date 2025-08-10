import { Suspense, lazy, useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useLoading } from '@/store/app-store'
import { 
  getPortfolioPerformanceData,
  getRiskReturnData,
  getAssetAllocationData,
  getCashflowData,
  getDrawdownData,
  getBenchmarkData,
  getPortfolioAnalytics
} from '@/lib/mock-data'
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Waves, 
  TrendingDown, 
  GitCompare,
  Zap,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

// Lazy load all chart components for better performance
const PortfolioPerformanceChart = lazy(() => import('@/components/charts/portfolio-performance-chart').then(module => ({ default: module.PortfolioPerformanceChart })))
const RiskReturnScatter = lazy(() => import('@/components/charts/risk-return-scatter').then(module => ({ default: module.RiskReturnScatter })))
const AssetAllocationTreemap = lazy(() => import('@/components/charts/asset-allocation-treemap').then(module => ({ default: module.AssetAllocationTreemap })))
const CashflowWaterfall = lazy(() => import('@/components/charts/cashflow-waterfall').then(module => ({ default: module.CashflowWaterfall })))
const DrawdownCurve = lazy(() => import('@/components/charts/drawdown-curve').then(module => ({ default: module.DrawdownCurve })))
const BenchmarkCompare = lazy(() => import('@/components/charts/benchmark-compare').then(module => ({ default: module.BenchmarkCompare })))

// Enhanced skeleton for charts
function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
          <Skeleton className="h-80 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ChartData {
  portfolioPerformance: any[]
  riskReturn: any[]
  assetAllocation: any[]
  cashflow: any[]
  drawdown: any[]
  benchmark: any[]
  analytics: any
}

export function ChartsPage() {
  const { setLoading } = useLoading()
  const [activeTab, setActiveTab] = useState('overview')
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loadingStates, setLoadingStates] = useState({
    portfolioPerformance: true,
    riskReturn: true,
    assetAllocation: true,
    cashflow: true,
    drawdown: true,
    benchmark: true
  })
  const [errors, setErrors] = useState<Record<string, string | null>>({})

  // Simulate data loading with staggered timing for better UX
  useEffect(() => {
    const loadChartData = async () => {
      setLoading(true, 'Loading chart data...')
      
      try {
        // Load data with staggered timing
        const loadPromises = [
          { key: 'portfolioPerformance', fn: () => getPortfolioPerformanceData(), delay: 100 },
          { key: 'riskReturn', fn: () => getRiskReturnData(), delay: 300 },
          { key: 'assetAllocation', fn: () => getAssetAllocationData(), delay: 500 },
          { key: 'cashflow', fn: () => getCashflowData(), delay: 700 },
          { key: 'drawdown', fn: () => getDrawdownData(), delay: 900 },
          { key: 'benchmark', fn: () => getBenchmarkData(), delay: 1100 }
        ]

        const data: Partial<ChartData> = {}
        
        for (const { key, fn, delay } of loadPromises) {
          setTimeout(async () => {
            try {
              data[key as keyof ChartData] = await fn()
              setLoadingStates(prev => ({ ...prev, [key]: false }))
            } catch (error) {
              console.error(`Failed to load ${key}:`, error)
              setErrors(prev => ({ ...prev, [key]: `Failed to load ${key} data` }))
              setLoadingStates(prev => ({ ...prev, [key]: false }))
            }
          }, delay)
        }

        // Load analytics
        data.analytics = getPortfolioAnalytics()
        
        setTimeout(() => {
          setChartData(data as ChartData)
          setLoading(false)
        }, 1200)

      } catch (error) {
        console.error('Failed to load chart data:', error)
        setLoading(false)
      }
    }

    loadChartData()
  }, [setLoading])

  const chartTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Portfolio summary and key metrics'
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: TrendingUp,
      description: 'Portfolio value over time with moving averages'
    },
    {
      id: 'risk-return',
      label: 'Risk/Return',
      icon: PieChart,
      description: 'Risk vs return analysis across assets'
    },
    {
      id: 'allocation',
      label: 'Allocation',
      icon: PieChart,
      description: 'Asset allocation breakdown'
    },
    {
      id: 'cashflow',
      label: 'Cashflow',
      icon: Waves,
      description: 'Cash inflows and outflows'
    },
    {
      id: 'drawdown',
      label: 'Drawdown',
      icon: TrendingDown,
      description: 'Portfolio drawdown analysis'
    },
    {
      id: 'benchmark',
      label: 'Benchmark',
      icon: GitCompare,
      description: 'Performance vs market benchmarks'
    }
  ]

  const getLoadingCount = () => Object.values(loadingStates).filter(Boolean).length
  const getErrorCount = () => Object.values(errors).filter(Boolean).length
  const getSuccessCount = () => Object.values(loadingStates).filter(state => !state).length - getErrorCount()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Charts</h1>
          <p className="text-muted-foreground">
            Interactive financial analysis and portfolio insights
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Performance Optimized
          </Badge>
          
          {getLoadingCount() > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
              Loading {getLoadingCount()}
            </Badge>
          )}
          
          {getErrorCount() > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {getErrorCount()} Errors
            </Badge>
          )}
          
          {getSuccessCount() > 0 && getLoadingCount() === 0 && (
            <Badge variant="default" className="flex items-center gap-1 bg-green-600">
              <CheckCircle className="h-3 w-3" />
              {getSuccessCount()} Loaded
            </Badge>
          )}
        </div>
      </div>

      {/* Analytics Summary - Only show when data is loaded */}
      {chartData?.analytics && !loadingStates.portfolioPerformance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Portfolio Analytics Summary
            </CardTitle>
            <CardDescription>
              Key performance metrics and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {chartData.analytics.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${chartData.analytics.totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {chartData.analytics.totalReturnPercent.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Total Return</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {chartData.analytics.sharpeRatio.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {chartData.analytics.volatility.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Volatility</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {chartData.analytics.maxDrawdown.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Max Drawdown</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {chartData.analytics.beta.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Beta</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          {chartTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Suspense fallback={<ChartSkeleton />}>
              <PortfolioPerformanceChart 
                data={chartData?.portfolioPerformance || []}
                loading={loadingStates.portfolioPerformance}
                error={errors.portfolioPerformance}
              />
            </Suspense>
            
            <Suspense fallback={<ChartSkeleton />}>
              <AssetAllocationTreemap 
                data={chartData?.assetAllocation || []}
                loading={loadingStates.assetAllocation}
                error={errors.assetAllocation}
              />
            </Suspense>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Suspense fallback={<ChartSkeleton />}>
              <RiskReturnScatter 
                data={chartData?.riskReturn || []}
                loading={loadingStates.riskReturn}
                error={errors.riskReturn}
              />
            </Suspense>
            
            <Suspense fallback={<ChartSkeleton />}>
              <BenchmarkCompare 
                data={chartData?.benchmark || []}
                loading={loadingStates.benchmark}
                error={errors.benchmark}
              />
            </Suspense>
          </div>
        </TabsContent>

        {/* Individual Chart Tabs */}
        <TabsContent value="performance">
          <Suspense fallback={<ChartSkeleton />}>
            <PortfolioPerformanceChart 
              data={chartData?.portfolioPerformance || []}
              loading={loadingStates.portfolioPerformance}
              error={errors.portfolioPerformance}
              className="col-span-full"
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="risk-return">
          <Suspense fallback={<ChartSkeleton />}>
            <RiskReturnScatter 
              data={chartData?.riskReturn || []}
              loading={loadingStates.riskReturn}
              error={errors.riskReturn}
              className="col-span-full"
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="allocation">
          <Suspense fallback={<ChartSkeleton />}>
            <AssetAllocationTreemap 
              data={chartData?.assetAllocation || []}
              loading={loadingStates.assetAllocation}
              error={errors.assetAllocation}
              className="col-span-full"
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="cashflow">
          <Suspense fallback={<ChartSkeleton />}>
            <CashflowWaterfall 
              data={chartData?.cashflow || []}
              loading={loadingStates.cashflow}
              error={errors.cashflow}
              className="col-span-full"
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="drawdown">
          <Suspense fallback={<ChartSkeleton />}>
            <DrawdownCurve 
              data={chartData?.drawdown || []}
              loading={loadingStates.drawdown}
              error={errors.drawdown}
              className="col-span-full"
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="benchmark">
          <Suspense fallback={<ChartSkeleton />}>
            <BenchmarkCompare 
              data={chartData?.benchmark || []}
              loading={loadingStates.benchmark}
              error={errors.benchmark}
              className="col-span-full"
            />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Performance Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Features
          </CardTitle>
          <CardDescription>
            Optimizations implemented for better user experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Lazy Loading</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Suspense Boundaries</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Progressive Loading</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Error Boundaries</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Memoized Components</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Optimized Renders</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Responsive Design</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Dark/Light Theme</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
