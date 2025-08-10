import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { BenchmarkPoint, formatPercent, formatDate, getChartDimensions, chartColors, createTooltip, createBrush } from '@/lib/chart-utils'
import { useEnhancedTheme } from '@/store/app-store'
import { Skeleton } from '@/components/ui/skeleton'
import { Info, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

interface BenchmarkCompareProps {
  data: BenchmarkPoint[]
  loading?: boolean
  error?: string | null
  className?: string
  benchmarkNames?: {
    portfolio: string
    benchmark1: string
    benchmark2?: string
  }
}

type TimeRange = '1M' | '3M' | '6M' | '1Y' | '2Y' | 'ALL'
type DisplayMode = 'cumulative' | 'relative'

export function BenchmarkCompare({ 
  data, 
  loading = false, 
  error = null, 
  className = '',
  benchmarkNames = {
    portfolio: 'Portfolio',
    benchmark1: 'S&P 500',
    benchmark2: 'Bonds'
  }
}: BenchmarkCompareProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<d3.Selection<HTMLDivElement, unknown, HTMLElement, any> | null>(null)
  const { theme } = useEnhancedTheme()
  
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('cumulative')
  const [showBenchmark2, setShowBenchmark2] = useState(true)
  const [showExcess, setShowExcess] = useState(false)
  const [showStatistics, setShowStatistics] = useState(true)
  const [brushSelection, setBrushSelection] = useState<[number, number] | null>(null)

  // Filter data based on time range
  const filteredData = useCallback(() => {
    if (!data || data.length === 0) return []
    
    const now = new Date()
    let startDate: Date
    
    switch (timeRange) {
      case '1M':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '3M':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '6M':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        break
      case '1Y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case '2Y':
        startDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000)
        break
      default:
        return data
    }
    
    return data.filter(d => d.date >= startDate)
  }, [data, timeRange])

  // Calculate performance statistics
  const calculateStats = useCallback((chartData: BenchmarkPoint[]) => {
    if (chartData.length === 0) return null

    const portfolioReturns = chartData.map(d => d.portfolio)
    const benchmark1Returns = chartData.map(d => d.benchmark1)
    const benchmark2Returns = showBenchmark2 ? chartData.map(d => d.benchmark2 || 0) : []

    const calculateStdDev = (values: number[]) => {
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
      return Math.sqrt(variance)
    }

    const calculateSharpe = (returns: number[], riskFreeRate = 0.02) => {
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length
      const stdDev = calculateStdDev(returns)
      return stdDev > 0 ? (mean - riskFreeRate / 252) / stdDev : 0
    }

    return {
      portfolio: {
        totalReturn: portfolioReturns[portfolioReturns.length - 1] || 0,
        volatility: calculateStdDev(portfolioReturns),
        sharpe: calculateSharpe(portfolioReturns),
        maxReturn: Math.max(...portfolioReturns),
        minReturn: Math.min(...portfolioReturns)
      },
      benchmark1: {
        totalReturn: benchmark1Returns[benchmark1Returns.length - 1] || 0,
        volatility: calculateStdDev(benchmark1Returns),
        sharpe: calculateSharpe(benchmark1Returns),
        maxReturn: Math.max(...benchmark1Returns),
        minReturn: Math.min(...benchmark1Returns)
      },
      benchmark2: showBenchmark2 ? {
        totalReturn: benchmark2Returns[benchmark2Returns.length - 1] || 0,
        volatility: calculateStdDev(benchmark2Returns),
        sharpe: calculateSharpe(benchmark2Returns),
        maxReturn: Math.max(...benchmark2Returns),
        minReturn: Math.min(...benchmark2Returns)
      } : null
    }
  }, [showBenchmark2])

  const drawChart = useCallback(() => {
    if (!svgRef.current || !containerRef.current || !data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const containerRect = containerRef.current.getBoundingClientRect()
    const { width, height, margin } = getChartDimensions(containerRect.width, containerRect.height - 100)
    
    if (width <= 0 || height <= 0) return

    const colors = chartColors[theme]
    const chartData = filteredData()
    
    if (chartData.length === 0) return

    // Transform data based on display mode
    const transformedData = displayMode === 'relative' 
      ? chartData.map((d, i) => ({
          ...d,
          portfolio: i === 0 ? 0 : d.portfolio - chartData[0].portfolio,
          benchmark1: i === 0 ? 0 : d.benchmark1 - chartData[0].benchmark1,
          benchmark2: i === 0 ? 0 : (d.benchmark2 || 0) - (chartData[0].benchmark2 || 0)
        }))
      : chartData

    // Set up scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(transformedData, d => d.date) as [Date, Date])
      .range([0, width])

    const allValues = [
      ...transformedData.map(d => d.portfolio),
      ...transformedData.map(d => d.benchmark1),
      ...(showBenchmark2 ? transformedData.map(d => d.benchmark2 || 0) : [])
    ]

    const yScale = d3.scaleLinear()
      .domain(d3.extent(allValues) as [number, number])
      .nice()
      .range([height, 0])

    // Create main chart group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Add zero line
    g.append('line')
      .attr('class', 'zero-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .attr('stroke', colors.border)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.6)

    // Line generators
    const portfolioLine = d3.line<BenchmarkPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.portfolio))
      .curve(d3.curveMonotoneX)

    const benchmark1Line = d3.line<BenchmarkPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.benchmark1))
      .curve(d3.curveMonotoneX)

    const benchmark2Line = d3.line<BenchmarkPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.benchmark2 || 0))
      .curve(d3.curveMonotoneX)

    // Draw benchmark lines first (so portfolio is on top)
    if (showBenchmark2) {
      g.append('path')
        .datum(transformedData)
        .attr('class', 'benchmark2-line')
        .attr('d', benchmark2Line)
        .attr('fill', 'none')
        .attr('stroke', colors.info)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.8)
    }

    g.append('path')
      .datum(transformedData)
      .attr('class', 'benchmark1-line')
      .attr('d', benchmark1Line)
      .attr('fill', 'none')
      .attr('stroke', colors.secondary)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.8)

    // Draw portfolio line
    g.append('path')
      .datum(transformedData)
      .attr('class', 'portfolio-line')
      .attr('d', portfolioLine)
      .attr('fill', 'none')
      .attr('stroke', colors.primary)
      .attr('stroke-width', 3)

    // Draw excess return area if enabled
    if (showExcess && transformedData[0].excess !== undefined) {
      const excessArea = d3.area<BenchmarkPoint>()
        .x(d => xScale(d.date))
        .y0(yScale(0))
        .y1(d => yScale(d.excess || 0))
        .curve(d3.curveMonotoneX)

      g.append('path')
        .datum(transformedData)
        .attr('class', 'excess-area')
        .attr('d', excessArea)
        .attr('fill', colors.warning)
        .attr('opacity', 0.2)
    }

    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat('%b %Y'))
      .ticks(6)

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => formatPercent(d / 100))
      .ticks(8)

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', colors.textMuted)

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('fill', colors.textMuted)

    // Add axis labels
    g.append('text')
      .attr('class', 'y-label')
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90)`)
      .attr('x', -height / 2)
      .attr('y', -50)
      .style('fill', colors.text)
      .style('font-size', '14px')
      .text(`${displayMode === 'cumulative' ? 'Cumulative' : 'Relative'} Return (%)`)

    // Style axis lines
    g.selectAll('.domain')
      .style('stroke', colors.border)

    g.selectAll('.tick line')
      .style('stroke', colors.border)

    // Create tooltip
    if (!tooltipRef.current) {
      tooltipRef.current = createTooltip('benchmark-tooltip')
    }

    // Add synchronized crosshair and tooltip
    const focusLines = g.append('g').attr('class', 'focus-lines').style('display', 'none')
    const focusCircles = g.append('g').attr('class', 'focus-circles').style('display', 'none')

    // Crosshair lines
    focusLines.append('line')
      .attr('class', 'crosshair-x')
      .attr('stroke', colors.textMuted)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2')
      .attr('opacity', 0.7)

    focusLines.append('line')
      .attr('class', 'crosshair-y')
      .attr('stroke', colors.textMuted)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2')
      .attr('opacity', 0.7)

    // Focus circles
    focusCircles.append('circle')
      .attr('class', 'focus-portfolio')
      .attr('r', 4)
      .attr('fill', colors.primary)
      .attr('stroke', colors.background)
      .attr('stroke-width', 2)

    focusCircles.append('circle')
      .attr('class', 'focus-benchmark1')
      .attr('r', 3)
      .attr('fill', colors.secondary)
      .attr('stroke', colors.background)
      .attr('stroke-width', 2)

    if (showBenchmark2) {
      focusCircles.append('circle')
        .attr('class', 'focus-benchmark2')
        .attr('r', 3)
        .attr('fill', colors.info)
        .attr('stroke', colors.background)
        .attr('stroke-width', 2)
    }

    // Add invisible overlay for mouse events
    g.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseover', () => {
        focusLines.style('display', null)
        focusCircles.style('display', null)
        tooltipRef.current?.style('opacity', 1)
      })
      .on('mouseout', () => {
        focusLines.style('display', 'none')
        focusCircles.style('display', 'none')
        tooltipRef.current?.style('opacity', 0)
      })
      .on('mousemove', (event) => {
        const [mouseX] = d3.pointer(event)
        const date = xScale.invert(mouseX)
        
        // Find closest data point
        const bisect = d3.bisector((d: BenchmarkPoint) => d.date).left
        const index = bisect(transformedData, date, 1)
        const d0 = transformedData[index - 1]
        const d1 = transformedData[index]
        const d = d1 && (date.getTime() - d0.date.getTime() > d1.date.getTime() - date.getTime()) ? d1 : d0

        if (d && tooltipRef.current) {
          const x = xScale(d.date)
          const portfolioY = yScale(d.portfolio)
          const benchmark1Y = yScale(d.benchmark1)
          const benchmark2Y = yScale(d.benchmark2 || 0)

          // Update crosshair
          focusLines.select('.crosshair-x')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', 0)
            .attr('y2', height)

          focusLines.select('.crosshair-y')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', portfolioY)
            .attr('y2', portfolioY)

          // Update focus circles
          focusCircles.select('.focus-portfolio')
            .attr('cx', x)
            .attr('cy', portfolioY)

          focusCircles.select('.focus-benchmark1')
            .attr('cx', x)
            .attr('cy', benchmark1Y)

          if (showBenchmark2) {
            focusCircles.select('.focus-benchmark2')
              .attr('cx', x)
              .attr('cy', benchmark2Y)
          }

          // Update tooltip
          tooltipRef.current
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
            .html(`
              <div style="font-weight: bold; margin-bottom: 4px;">
                ${formatDate(d.date)}
              </div>
              <div style="color: ${colors.primary};">
                ${benchmarkNames.portfolio}: ${formatPercent(d.portfolio / 100)}
              </div>
              <div style="color: ${colors.secondary};">
                ${benchmarkNames.benchmark1}: ${formatPercent(d.benchmark1 / 100)}
              </div>
              ${showBenchmark2 && benchmarkNames.benchmark2 ? `
                <div style="color: ${colors.info};">
                  ${benchmarkNames.benchmark2}: ${formatPercent((d.benchmark2 || 0) / 100)}
                </div>
              ` : ''}
              ${d.excess !== undefined ? `
                <div style="margin-top: 4px; color: ${colors.warning};">
                  Excess: ${formatPercent((d.excess || 0) / 100)}
                </div>
              ` : ''}
            `)
        }
      })

    // Add brush for zooming if data is large enough
    if (transformedData.length > 100) {
      const brush = createBrush(width, 30, (selection) => {
        setBrushSelection(selection)
      })

      const brushG = g.append('g')
        .attr('class', 'brush')
        .attr('transform', `translate(0,${height + 40})`)
        .call(brush)

      // Add mini chart for brush context
      const miniScale = d3.scaleLinear()
        .domain(yScale.domain())
        .range([30, 0])

      const miniPortfolioLine = d3.line<BenchmarkPoint>()
        .x(d => xScale(d.date))
        .y(d => miniScale(d.portfolio))
        .curve(d3.curveMonotoneX)

      brushG.append('path')
        .datum(transformedData)
        .attr('d', miniPortfolioLine)
        .attr('fill', 'none')
        .attr('stroke', colors.primary)
        .attr('stroke-width', 1)
        .attr('opacity', 0.6)
    }

  }, [data, timeRange, displayMode, showBenchmark2, showExcess, theme, filteredData, benchmarkNames])

  // Resize handler
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      drawChart()
    })

    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [drawChart])

  // Redraw when dependencies change
  useEffect(() => {
    drawChart()
  }, [drawChart])

  const stats = calculateStats(filteredData())

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Info className="h-5 w-5" />
            Error Loading Chart
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            Failed to load benchmark data
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Benchmark Comparison</CardTitle>
          <CardDescription>Compare portfolio performance against benchmarks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No benchmark data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Benchmark Comparison
              {stats && (
                <span className={`flex items-center gap-1 text-sm ${stats.portfolio.totalReturn >= stats.benchmark1.totalReturn ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.portfolio.totalReturn >= stats.benchmark1.totalReturn ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {formatPercent((stats.portfolio.totalReturn - stats.benchmark1.totalReturn) / 100)}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Compare portfolio performance against market benchmarks over time
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="benchmark2" className="text-sm">Bonds</Label>
              <Switch 
                id="benchmark2"
                checked={showBenchmark2}
                onCheckedChange={setShowBenchmark2}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="excess" className="text-sm">Excess</Label>
              <Switch 
                id="excess"
                checked={showExcess}
                onCheckedChange={setShowExcess}
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="stats" className="text-sm">Stats</Label>
              <Switch 
                id="stats"
                checked={showStatistics}
                onCheckedChange={setShowStatistics}
              />
            </div>

            <Select value={displayMode} onValueChange={(value: DisplayMode) => setDisplayMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cumulative">Cumulative</SelectItem>
                <SelectItem value="relative">Relative</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1M">1M</SelectItem>
                <SelectItem value="3M">3M</SelectItem>
                <SelectItem value="6M">6M</SelectItem>
                <SelectItem value="1Y">1Y</SelectItem>
                <SelectItem value="2Y">2Y</SelectItem>
                <SelectItem value="ALL">ALL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div ref={containerRef} className="w-full h-96">
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            style={{ overflow: 'visible' }}
          />
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-px bg-blue-500"></div>
              <span>{benchmarkNames.portfolio}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-px bg-purple-500 border-dashed"></div>
              <span>{benchmarkNames.benchmark1}</span>
            </div>
            {showBenchmark2 && benchmarkNames.benchmark2 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-px bg-cyan-500 border-dashed"></div>
                <span>{benchmarkNames.benchmark2}</span>
              </div>
            )}
          </div>
          
          {showStatistics && stats && (
            <div className="text-xs text-muted-foreground grid grid-cols-3 gap-4">
              <div>
                <div className="font-semibold">{benchmarkNames.portfolio}</div>
                <div>Return: {formatPercent(stats.portfolio.totalReturn / 100)}</div>
                <div>Volatility: {formatPercent(stats.portfolio.volatility / 100)}</div>
                <div>Sharpe: {stats.portfolio.sharpe.toFixed(2)}</div>
              </div>
              <div>
                <div className="font-semibold">{benchmarkNames.benchmark1}</div>
                <div>Return: {formatPercent(stats.benchmark1.totalReturn / 100)}</div>
                <div>Volatility: {formatPercent(stats.benchmark1.volatility / 100)}</div>
                <div>Sharpe: {stats.benchmark1.sharpe.toFixed(2)}</div>
              </div>
              {showBenchmark2 && stats.benchmark2 && benchmarkNames.benchmark2 && (
                <div>
                  <div className="font-semibold">{benchmarkNames.benchmark2}</div>
                  <div>Return: {formatPercent(stats.benchmark2.totalReturn / 100)}</div>
                  <div>Volatility: {formatPercent(stats.benchmark2.volatility / 100)}</div>
                  <div>Sharpe: {stats.benchmark2.sharpe.toFixed(2)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
