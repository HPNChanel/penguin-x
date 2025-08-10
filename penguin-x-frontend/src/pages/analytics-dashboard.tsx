import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, Users, Activity, Clock, MousePointer, Eye, AlertTriangle, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { EVENT_MAP } from "@/lib/enhanced-analytics"

// Mock data for the analytics dashboard
const generateMockAnalyticsData = () => {
  const events = Object.values(EVENT_MAP)
  const pages = ['/dashboard', '/finance', '/invest', '/academy', '/login', '/register']
  const features = ['theme-toggle', 'transaction-form', 'portfolio-view', 'lesson-view', 'chart-interaction']
  
  // Generate daily metrics for the last 30 days
  const dailyMetrics = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return {
      date: date.toISOString().split('T')[0],
      pageViews: Math.floor(Math.random() * 1000) + 500,
      uniqueUsers: Math.floor(Math.random() * 300) + 150,
      sessions: Math.floor(Math.random() * 400) + 200,
      bounceRate: Math.random() * 0.3 + 0.2,
      avgSessionDuration: Math.floor(Math.random() * 300) + 120
    }
  }).reverse()

  // Generate event data
  const eventData = events.map(event => ({
    event,
    count: Math.floor(Math.random() * 500) + 50,
    uniqueUsers: Math.floor(Math.random() * 200) + 25
  })).sort((a, b) => b.count - a.count)

  // Generate page analytics
  const pageAnalytics = pages.map(page => ({
    page,
    views: Math.floor(Math.random() * 2000) + 500,
    uniqueViews: Math.floor(Math.random() * 1500) + 300,
    avgTime: Math.floor(Math.random() * 200) + 60,
    bounceRate: Math.random() * 0.4 + 0.1,
    exitRate: Math.random() * 0.3 + 0.1
  })).sort((a, b) => b.views - a.views)

  // Generate user flow data
  const userFlow = [
    { from: 'landing', to: 'register', users: 450, conversionRate: 0.15 },
    { from: 'landing', to: 'login', users: 320, conversionRate: 0.11 },
    { from: 'register', to: 'dashboard', users: 380, conversionRate: 0.84 },
    { from: 'login', to: 'dashboard', users: 290, conversionRate: 0.91 },
    { from: 'dashboard', to: 'finance', users: 250, conversionRate: 0.41 },
    { from: 'dashboard', to: 'invest', users: 180, conversionRate: 0.30 },
    { from: 'dashboard', to: 'academy', users: 120, conversionRate: 0.20 }
  ]

  // Generate retention data
  const retentionData = [
    { day: 'Day 1', retention: 0.85 },
    { day: 'Day 7', retention: 0.62 },
    { day: 'Day 14', retention: 0.45 },
    { day: 'Day 30', retention: 0.32 },
    { day: 'Day 60', retention: 0.25 },
    { day: 'Day 90', retention: 0.20 }
  ]

  // Generate feature usage
  const featureUsage = features.map(feature => ({
    feature,
    users: Math.floor(Math.random() * 800) + 200,
    sessions: Math.floor(Math.random() * 1500) + 500,
    avgUsagePerSession: Math.random() * 10 + 1
  })).sort((a, b) => b.users - a.users)

  // Generate performance metrics
  const performanceMetrics = {
    webVitals: {
      lcp: 2.1, // Largest Contentful Paint
      fid: 85,  // First Input Delay
      cls: 0.08, // Cumulative Layout Shift
      fcp: 1.4,  // First Contentful Paint
      ttfb: 0.6  // Time to First Byte
    },
    errors: {
      total: 23,
      byType: [
        { type: 'JavaScript Error', count: 12 },
        { type: 'Network Error', count: 7 },
        { type: 'Validation Error', count: 4 }
      ]
    }
  }

  return {
    dailyMetrics,
    eventData,
    pageAnalytics,
    userFlow,
    retentionData,
    featureUsage,
    performanceMetrics
  }
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null)
  const [timeRange, setTimeRange] = useState("30d")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setData(generateMockAnalyticsData())
      setIsLoading(false)
    }
    loadData()
  }, [timeRange])

  const summary = useMemo(() => {
    if (!data) return null
    
    const latest = data.dailyMetrics[data.dailyMetrics.length - 1]
    const previous = data.dailyMetrics[data.dailyMetrics.length - 2]
    
    return {
      totalPageViews: data.dailyMetrics.reduce((sum: number, day: any) => sum + day.pageViews, 0),
      totalUsers: data.dailyMetrics.reduce((sum: number, day: any) => sum + day.uniqueUsers, 0),
      avgSessionDuration: data.dailyMetrics.reduce((sum: number, day: any) => sum + day.avgSessionDuration, 0) / data.dailyMetrics.length,
      bounceRate: data.dailyMetrics.reduce((sum: number, day: any) => sum + day.bounceRate, 0) / data.dailyMetrics.length,
      trends: {
        pageViews: latest.pageViews - previous.pageViews,
        users: latest.uniqueUsers - previous.uniqueUsers
      }
    }
  }, [data])

  if (isLoading) {
    return <AnalyticsDashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Internal analytics for Penguin X user behavior and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            Export Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalPageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={summary?.trends.pageViews > 0 ? "text-green-600" : "text-red-600"}>
                {summary?.trends.pageViews > 0 ? "+" : ""}{summary?.trends.pageViews}
              </span>{" "}
              from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={summary?.trends.users > 0 ? "text-green-600" : "text-red-600"}>
                {summary?.trends.users > 0 ? "+" : ""}{summary?.trends.users}
              </span>{" "}
              from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor((summary?.avgSessionDuration || 0) / 60)}m {Math.floor((summary?.avgSessionDuration || 0) % 60)}s
            </div>
            <p className="text-xs text-muted-foreground">
              Across all sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((summary?.bounceRate || 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Single page sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Metrics Chart */}
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Daily Metrics</CardTitle>
                <CardDescription>Page views, users, and sessions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.dailyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="pageViews" stroke="#8884d8" name="Page Views" />
                    <Line type="monotone" dataKey="uniqueUsers" stroke="#82ca9d" name="Unique Users" />
                    <Line type="monotone" dataKey="sessions" stroke="#ffc658" name="Sessions" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Events */}
            <Card>
              <CardHeader>
                <CardTitle>Top Events</CardTitle>
                <CardDescription>Most tracked user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.eventData.slice(0, 6).map((event: any, index: number) => (
                    <div key={event.event} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="text-sm font-medium">{event.event}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{event.count}</div>
                        <div className="text-xs text-muted-foreground">{event.uniqueUsers} users</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Flow */}
            <Card>
              <CardHeader>
                <CardTitle>User Flow</CardTitle>
                <CardDescription>Most common user journey paths</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.userFlow.map((flow: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{flow.from}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-sm font-medium">{flow.to}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{flow.users} users</div>
                        <div className="text-xs text-muted-foreground">
                          {(flow.conversionRate * 100).toFixed(1)}% conversion
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Analytics</CardTitle>
              <CardDescription>Detailed breakdown of all tracked events</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.eventData.slice(0, 15)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="event" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name="Total Events" />
                  <Bar dataKey="uniqueUsers" fill="#82ca9d" name="Unique Users" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Analytics</CardTitle>
              <CardDescription>Performance metrics for each page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.pageAnalytics.map((page: any) => (
                  <div key={page.page} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{page.page}</h3>
                      <Badge variant="secondary">{page.views} views</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Unique Views</div>
                        <div className="font-medium">{page.uniqueViews}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Time</div>
                        <div className="font-medium">{Math.floor(page.avgTime / 60)}m {page.avgTime % 60}s</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Bounce Rate</div>
                        <div className="font-medium">{(page.bounceRate * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Exit Rate</div>
                        <div className="font-medium">{(page.exitRate * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>How users interact with different features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.featureUsage.map((feature: any) => (
                    <div key={feature.feature} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{feature.feature}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold">{feature.users} users</div>
                        <div className="text-xs text-muted-foreground">
                          {feature.avgUsagePerSession.toFixed(1)} avg/session
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>User retention over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data.retentionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Retention']} />
                    <Line type="monotone" dataKey="retention" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
                <CardDescription>Performance metrics for user experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(data.performanceMetrics.webVitals).map(([metric, value]) => (
                    <div key={metric} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">{metric.toUpperCase()}</div>
                        <div className="text-xs text-muted-foreground">
                          {metric === 'lcp' && 'Largest Contentful Paint'}
                          {metric === 'fid' && 'First Input Delay'}
                          {metric === 'cls' && 'Cumulative Layout Shift'}
                          {metric === 'fcp' && 'First Contentful Paint'}
                          {metric === 'ttfb' && 'Time to First Byte'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {typeof value === 'number' ? 
                            (metric === 'fid' ? `${value}ms` : 
                             metric === 'cls' ? value.toFixed(3) : 
                             `${value}s`) : 
                            value
                          }
                        </div>
                        <Badge variant={
                          (metric === 'lcp' && value < 2.5) ||
                          (metric === 'fid' && value < 100) ||
                          (metric === 'cls' && value < 0.1) ||
                          (metric === 'fcp' && value < 1.8) ||
                          (metric === 'ttfb' && value < 0.8) 
                            ? "default" : "destructive"
                        }>
                          {(metric === 'lcp' && value < 2.5) ||
                           (metric === 'fid' && value < 100) ||
                           (metric === 'cls' && value < 0.1) ||
                           (metric === 'fcp' && value < 1.8) ||
                           (metric === 'ttfb' && value < 0.8) 
                             ? "Good" : "Needs Work"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Analytics</CardTitle>
                <CardDescription>Application errors and issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Errors</span>
                    <Badge variant="destructive">{data.performanceMetrics.errors.total}</Badge>
                  </div>
                  <div className="space-y-2">
                    {data.performanceMetrics.errors.byType.map((error: any) => (
                      <div key={error.type} className="flex justify-between items-center">
                        <span className="text-sm">{error.type}</span>
                        <span className="text-sm font-medium">{error.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Retention Analysis</CardTitle>
              <CardDescription>How well we retain users over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.retentionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Retention Rate']} />
                  <Bar dataKey="retention" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AnalyticsDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="h-96">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
