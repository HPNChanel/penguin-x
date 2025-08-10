import { useState, useEffect } from "react"
import { Copy, Check, Palette, Component, BarChart3, FileText, Code, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Import all chart components
import { PortfolioPerformanceChart } from "@/components/charts/portfolio-performance-chart"
import { AssetAllocationTreemap } from "@/components/charts/asset-allocation-treemap"
import { RiskReturnScatter } from "@/components/charts/risk-return-scatter"
import { CashflowWaterfall } from "@/components/charts/cashflow-waterfall"
import { DrawdownCurve } from "@/components/charts/drawdown-curve"
import { BenchmarkCompare } from "@/components/charts/benchmark-compare"

// Import theme components
import { ThemeToggle } from "@/components/theme-toggle"
import { useAnalytics } from "@/lib/enhanced-analytics"
import AnimationTest from "@/components/animation-test"

// Sample data for demonstrations
const sampleData = {
  portfolioPerformance: [
    { date: '2024-01', portfolio: 100000, benchmark: 100000 },
    { date: '2024-02', portfolio: 105000, benchmark: 103000 },
    { date: '2024-03', portfolio: 110000, benchmark: 106000 },
    { date: '2024-04', portfolio: 108000, benchmark: 108000 },
    { date: '2024-05', portfolio: 115000, benchmark: 110000 },
    { date: '2024-06', portfolio: 120000, benchmark: 112000 }
  ],
  assetAllocation: [
    { name: 'Stocks', value: 60, children: [
      { name: 'US Stocks', value: 40 },
      { name: 'International', value: 20 }
    ]},
    { name: 'Bonds', value: 30, children: [
      { name: 'Government', value: 20 },
      { name: 'Corporate', value: 10 }
    ]},
    { name: 'Alternatives', value: 10, children: [
      { name: 'REITs', value: 5 },
      { name: 'Commodities', value: 5 }
    ]}
  ],
  riskReturn: [
    { name: 'Conservative', risk: 5, return: 4 },
    { name: 'Moderate', risk: 10, return: 7 },
    { name: 'Aggressive', risk: 18, return: 12 },
    { name: 'Your Portfolio', risk: 12, return: 9, isUser: true }
  ]
}

export function DesignSystemPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    trackEvent('view_design_system', { source: 'navigation' })
  }, [trackEvent])

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(null), 2000)
      trackEvent('copy_code_snippet', { component: id })
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const colorPalette = [
    { name: 'Primary', css: 'hsl(var(--primary))', description: 'Main brand color' },
    { name: 'Secondary', css: 'hsl(var(--secondary))', description: 'Supporting accent' },
    { name: 'Muted', css: 'hsl(var(--muted))', description: 'Subtle backgrounds' },
    { name: 'Accent', css: 'hsl(var(--accent))', description: 'Interactive elements' },
    { name: 'Destructive', css: 'hsl(var(--destructive))', description: 'Error states' },
    { name: 'Success', css: 'hsl(142, 76%, 36%)', description: 'Success states' },
    { name: 'Warning', css: 'hsl(38, 92%, 50%)', description: 'Warning states' },
    { name: 'Info', css: 'hsl(221, 83%, 53%)', description: 'Information states' }
  ]

  const typography = [
    { name: 'Heading 1', class: 'text-4xl font-bold', element: 'h1' },
    { name: 'Heading 2', class: 'text-3xl font-semibold', element: 'h2' },
    { name: 'Heading 3', class: 'text-2xl font-semibold', element: 'h3' },
    { name: 'Heading 4', class: 'text-xl font-semibold', element: 'h4' },
    { name: 'Body Large', class: 'text-lg', element: 'p' },
    { name: 'Body', class: 'text-base', element: 'p' },
    { name: 'Body Small', class: 'text-sm', element: 'p' },
    { name: 'Caption', class: 'text-xs text-muted-foreground', element: 'p' }
  ]

  const spacing = [
    { name: 'xs', value: '0.25rem', pixels: '4px' },
    { name: 'sm', value: '0.5rem', pixels: '8px' },
    { name: 'md', value: '1rem', pixels: '16px' },
    { name: 'lg', value: '1.5rem', pixels: '24px' },
    { name: 'xl', value: '2rem', pixels: '32px' },
    { name: '2xl', value: '3rem', pixels: '48px' },
    { name: '3xl', value: '4rem', pixels: '64px' }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Component className="h-6 w-6" />
                <h1 className="text-xl font-bold">Design System</h1>
              </div>
              <Badge variant="secondary">v1.0.0</Badge>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm">
                Export Tokens
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="animations">Animations</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Penguin X Design System</h2>
              <p className="text-muted-foreground text-lg mb-6">
                A comprehensive design system built for modern financial applications, 
                featuring accessible components, beautiful charts, and flexible theming.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Palette className="h-5 w-5" />
                    Colors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Semantic color system with dark/light mode support
                  </p>
                  <div className="flex gap-1">
                    {colorPalette.slice(0, 4).map((color, index) => (
                      <div
                        key={color.name}
                        className={`w-6 h-6 rounded-full border ${
                          index === 0 ? 'bg-primary' :
                          index === 1 ? 'bg-secondary' :
                          index === 2 ? 'bg-muted' : 'bg-accent'
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    Typography
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Consistent typography scale with semantic sizing
                  </p>
                  <div className="space-y-1">
                    <div className="text-xl font-bold">Heading</div>
                    <div className="text-base">Body text</div>
                    <div className="text-sm text-muted-foreground">Caption</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Component className="h-5 w-5" />
                    Components
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    50+ accessible UI components with consistent API
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm">Primary</Button>
                    <Button variant="outline" size="sm">Secondary</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5" />
                    Charts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Financial charts with real-time data visualization
                  </p>
                  <div className="h-12 bg-gradient-to-r from-primary/20 to-secondary/20 rounded"></div>
                </CardContent>
              </Card>
            </div>

            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
                <CardDescription>What makes this design system special</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold">Accessibility First</h4>
                        <p className="text-sm text-muted-foreground">
                          WCAG 2.1 AA compliant with keyboard navigation and screen reader support
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold">Theme System</h4>
                        <p className="text-sm text-muted-foreground">
                          Comprehensive theming with light/dark modes and high contrast support
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold">Performance Optimized</h4>
                        <p className="text-sm text-muted-foreground">
                          Tree-shakeable components with minimal bundle impact
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold">TypeScript Ready</h4>
                        <p className="text-sm text-muted-foreground">
                          Full TypeScript support with strict type checking
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold">Financial Focus</h4>
                        <p className="text-sm text-muted-foreground">
                          Specialized components for financial data and interactions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold">Documentation</h4>
                        <p className="text-sm text-muted-foreground">
                          Comprehensive documentation with live examples and code snippets
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Color Palette</h2>
              <p className="text-muted-foreground">
                Our semantic color system adapts to light and dark themes automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {colorPalette.map((color) => (
                <Card key={color.name}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-16 h-16 rounded-lg border shadow-sm ${
                          color.name === 'Primary' ? 'bg-primary' :
                          color.name === 'Secondary' ? 'bg-secondary' :
                          color.name === 'Muted' ? 'bg-muted' :
                          color.name === 'Accent' ? 'bg-accent' :
                          color.name === 'Destructive' ? 'bg-destructive' :
                          color.name === 'Success' ? 'bg-green-600' :
                          color.name === 'Warning' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{color.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{color.description}</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {color.css}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(color.css, `color-${color.name}`)}
                          >
                            {copiedCode === `color-${color.name}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Typography Scale</h2>
              <p className="text-muted-foreground">
                Consistent typography that maintains hierarchy and readability.
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {typography.map((type) => (
                    <div key={type.name} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className={type.class}>
                          {type.name} - The quick brown fox jumps over the lazy dog
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {type.class}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`<${type.element} className="${type.class}">Text</${type.element}>`, `typography-${type.name}`)}
                        >
                          {copiedCode === `typography-${type.name}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Spacing Scale */}
            <Card>
              <CardHeader>
                <CardTitle>Spacing Scale</CardTitle>
                <CardDescription>Consistent spacing using Tailwind CSS spacing tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {spacing.map((space) => (
                    <div key={space.name} className="flex items-center gap-4">
                      <div className="w-16 text-sm font-mono">{space.name}</div>
                      <div
                        className={`bg-primary h-4 ${
                          space.name === 'xs' ? 'w-1' :
                          space.name === 'sm' ? 'w-2' :
                          space.name === 'md' ? 'w-4' :
                          space.name === 'lg' ? 'w-6' :
                          space.name === 'xl' ? 'w-8' :
                          space.name === '2xl' ? 'w-12' : 'w-16'
                        }`}
                      />
                      <div className="text-sm text-muted-foreground">
                        {space.value} ({space.pixels})
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Component Library</h2>
              <p className="text-muted-foreground">
                Interactive examples of all available components with different states.
              </p>
            </div>

            {/* Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>Various button styles and states</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="default">Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button disabled>Disabled</Button>
                    <Button disabled>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Components */}
            <Card>
              <CardHeader>
                <CardTitle>Form Components</CardTitle>
                <CardDescription>Form inputs and controls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="demo-input">Input</Label>
                      <Input id="demo-input" placeholder="Enter some text..." />
                    </div>
                    <div>
                      <Label htmlFor="demo-textarea">Textarea</Label>
                      <textarea 
                        id="demo-textarea" 
                        placeholder="Enter a longer message..." 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="demo-select">Select</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="option1">Option 1</SelectItem>
                          <SelectItem value="option2">Option 2</SelectItem>
                          <SelectItem value="option3">Option 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="demo-switch" />
                      <Label htmlFor="demo-switch">Switch</Label>
                    </div>
                    <div>
                      <Label>Progress</Label>
                      <Progress value={65} className="mt-2" />
                    </div>
                    <div>
                      <Label>Avatar</Label>
                      <div className="flex gap-2 mt-2">
                        <Avatar>
                          <AvatarImage src="/placeholder-avatar.jpg" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <Avatar>
                          <AvatarFallback>AB</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Display */}
            <Card>
              <CardHeader>
                <CardTitle>Data Display</CardTitle>
                <CardDescription>Components for displaying data and information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Badges</Label>
                    <div className="flex gap-2">
                      <Badge variant="default">Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Alert</Label>
                    <Alert>
                      <AlertDescription>
                        This is a default alert with some important information.
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Skeleton Loading</Label>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardHeader>
                <CardTitle>Table</CardTitle>
                <CardDescription>Data tables with sorting and pagination</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Allocation</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">US Stocks</TableCell>
                      <TableCell>40%</TableCell>
                      <TableCell className="text-green-600">+12.5%</TableCell>
                      <TableCell className="text-right">$40,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Bonds</TableCell>
                      <TableCell>30%</TableCell>
                      <TableCell className="text-green-600">+4.2%</TableCell>
                      <TableCell className="text-right">$30,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">International</TableCell>
                      <TableCell>20%</TableCell>
                      <TableCell className="text-red-600">-2.1%</TableCell>
                      <TableCell className="text-right">$20,000</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Chart Components</h2>
              <p className="text-muted-foreground">
                Specialized financial charts built with Recharts and optimized for financial data.
              </p>
            </div>

            {/* Portfolio Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance Chart</CardTitle>
                <CardDescription>Track portfolio performance against benchmarks over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <PortfolioPerformanceChart data={sampleData.portfolioPerformance} />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex-1">
                    {'<PortfolioPerformanceChart data={portfolioData} />'}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard('<PortfolioPerformanceChart data={portfolioData} />', 'chart-portfolio')}
                  >
                    {copiedCode === 'chart-portfolio' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Asset Allocation */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation Treemap</CardTitle>
                <CardDescription>Visualize portfolio allocation with hierarchical data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <AssetAllocationTreemap data={sampleData.assetAllocation} />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex-1">
                    {'<AssetAllocationTreemap data={allocationData} />'}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard('<AssetAllocationTreemap data={allocationData} />', 'chart-allocation')}
                  >
                    {copiedCode === 'chart-allocation' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Risk Return Scatter */}
            <Card>
              <CardHeader>
                <CardTitle>Risk vs Return Scatter</CardTitle>
                <CardDescription>Compare risk-adjusted returns across portfolios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <RiskReturnScatter data={sampleData.riskReturn} />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex-1">
                    {'<RiskReturnScatter data={riskReturnData} />'}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard('<RiskReturnScatter data={riskReturnData} />', 'chart-risk-return')}
                  >
                    {copiedCode === 'chart-risk-return' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Chart States */}
            <Card>
              <CardHeader>
                <CardTitle>Chart States</CardTitle>
                <CardDescription>Different states and variations of chart components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Loading State</h4>
                    <div className="h-48 border rounded-lg flex items-center justify-center bg-muted/50">
                      <div className="space-y-2 w-full max-w-xs">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Empty State</h4>
                    <div className="h-48 border rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No data available</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Add Data
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Animations Tab */}
          <TabsContent value="animations" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Animation System</h2>
              <p className="text-muted-foreground">
                Natural, accessible animations with automatic reduced motion support and performance optimization.
              </p>
            </div>
            
            <AnimationTest />
          </TabsContent>

          {/* Patterns Tab */}}
          <TabsContent value="patterns" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Design Patterns</h2>
              <p className="text-muted-foreground">
                Common UI patterns and layouts used throughout the application.
              </p>
            </div>

            {/* Cards Pattern */}
            <Card>
              <CardHeader>
                <CardTitle>Card Layouts</CardTitle>
                <CardDescription>Different card patterns for various content types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Stat Card */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <Badge variant="secondary">+12%</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$45,231.89</div>
                      <p className="text-xs text-muted-foreground">
                        +20.1% from last month
                      </p>
                    </CardContent>
                  </Card>

                  {/* Feature Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Portfolio Analytics</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Stocks</span>
                          <span>60%</span>
                        </div>
                        <Progress value={60} />
                        <div className="flex justify-between text-sm">
                          <span>Bonds</span>
                          <span>30%</span>
                        </div>
                        <Progress value={30} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <Button size="sm" className="w-full justify-start">
                          Add Transaction
                        </Button>
                        <Button size="sm" variant="outline" className="w-full justify-start">
                          View Reports
                        </Button>
                        <Button size="sm" variant="ghost" className="w-full justify-start">
                          Export Data
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Form Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Form Patterns</CardTitle>
                <CardDescription>Common form layouts and validation patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Single Column Form</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="pattern-name">Full Name</Label>
                        <Input id="pattern-name" placeholder="John Doe" />
                      </div>
                      <div>
                        <Label htmlFor="pattern-email">Email</Label>
                        <Input id="pattern-email" type="email" placeholder="john@example.com" />
                      </div>
                      <div>
                        <Label htmlFor="pattern-amount">Amount</Label>
                        <Input id="pattern-amount" type="number" placeholder="1000.00" />
                      </div>
                      <div className="flex gap-2">
                        <Button>Submit</Button>
                        <Button variant="outline">Cancel</Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Two Column Form</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="pattern-first">First Name</Label>
                        <Input id="pattern-first" placeholder="John" />
                      </div>
                      <div>
                        <Label htmlFor="pattern-last">Last Name</Label>
                        <Input id="pattern-last" placeholder="Doe" />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="pattern-company">Company</Label>
                        <Input id="pattern-company" placeholder="Acme Corp" />
                      </div>
                      <div>
                        <Label htmlFor="pattern-city">City</Label>
                        <Input id="pattern-city" placeholder="New York" />
                      </div>
                      <div>
                        <Label htmlFor="pattern-zip">ZIP Code</Label>
                        <Input id="pattern-zip" placeholder="10001" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Navigation Patterns</CardTitle>
                <CardDescription>Different navigation styles and structures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Breadcrumb Navigation</h4>
                    <nav className="flex" aria-label="Breadcrumb">
                      <ol className="flex items-center space-x-1 md:space-x-3">
                        <li>
                          <Button variant="ghost" size="sm" className="p-0 h-auto">
                            Home
                          </Button>
                        </li>
                        <li className="text-muted-foreground">/</li>
                        <li>
                          <Button variant="ghost" size="sm" className="p-0 h-auto">
                            Dashboard
                          </Button>
                        </li>
                        <li className="text-muted-foreground">/</li>
                        <li className="text-sm text-muted-foreground">Analytics</li>
                      </ol>
                    </nav>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Tab Navigation</h4>
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Design Tokens</h2>
              <p className="text-muted-foreground">
                Core design tokens exported for use in other platforms and tools.
              </p>
            </div>

            {/* CSS Variables */}
            <Card>
              <CardHeader>
                <CardTitle>CSS Custom Properties</CardTitle>
                <CardDescription>Core CSS variables for theming and customization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
                    <div className="space-y-2">
                      <h4 className="font-sans font-semibold">Colors</h4>
                      <div>--primary: 222.2 84% 4.9%</div>
                      <div>--primary-foreground: 210 40% 98%</div>
                      <div>--secondary: 210 40% 96%</div>
                      <div>--secondary-foreground: 222.2 84% 4.9%</div>
                      <div>--muted: 210 40% 96%</div>
                      <div>--muted-foreground: 215.4 16.3% 46.9%</div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-sans font-semibold">Layout</h4>
                      <div>--border: 214.3 31.8% 91.4%</div>
                      <div>--input: 214.3 31.8% 91.4%</div>
                      <div>--ring: 222.2 84% 4.9%</div>
                      <div>--radius: 0.5rem</div>
                      <div>--chart-1: 12 76% 61%</div>
                      <div>--chart-2: 173 58% 39%</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(`/* CSS Custom Properties */\n:root {\n  --primary: 222.2 84% 4.9%;\n  --primary-foreground: 210 40% 98%;\n  /* ... */\n}`, 'css-tokens')}
                  >
                    {copiedCode === 'css-tokens' ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    Copy CSS Variables
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tailwind Config */}
            <Card>
              <CardHeader>
                <CardTitle>Tailwind Configuration</CardTitle>
                <CardDescription>Tailwind CSS configuration for consistent styling</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
{`module.exports = {
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      }
    }
  }
}`}
                  </pre>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard('// Tailwind configuration...\nmodule.exports = { /* config */ }', 'tailwind-config')}
                  >
                    {copiedCode === 'tailwind-config' ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    Copy Tailwind Config
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Design Token JSON */}
            <Card>
              <CardHeader>
                <CardTitle>Design Tokens (JSON)</CardTitle>
                <CardDescription>Design tokens in JSON format for design tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
{`{
  "color": {
    "primary": {
      "50": { "value": "#f8fafc" },
      "100": { "value": "#f1f5f9" },
      "500": { "value": "#64748b" },
      "900": { "value": "#0f172a" }
    }
  },
  "spacing": {
    "xs": { "value": "4px" },
    "sm": { "value": "8px" },
    "md": { "value": "16px" },
    "lg": { "value": "24px" }
  },
  "typography": {
    "heading": {
      "h1": {
        "fontSize": { "value": "2.25rem" },
        "fontWeight": { "value": "700" }
      }
    }
  }
}`}
                  </pre>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard('{ "color": { /* tokens */ } }', 'design-tokens')}
                  >
                    {copiedCode === 'design-tokens' ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    Copy Design Tokens
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
