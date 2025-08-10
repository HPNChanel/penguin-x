import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { PortfolioDataPoint, formatCurrency, formatPercent, getChartDimensions, chartColors, createTooltip, createBrush } from '@/lib/chart-utils'
import { useEnhancedTheme } from '@/store/app-store'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'

interface PortfolioPerformanceChartProps {
  data: PortfolioDataPoint[]
  loading?: boolean
  error?: string | null
  className?: string
}

type TimeRange = '1M' | '3M' | '6M' | '1Y' | '2Y' | 'ALL'

export function PortfolioPerformanceChart({ 
  data, 
  loading = false, 
  error = null, 
  className = '' 
}: PortfolioPerformanceChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<d3.Selection<HTMLDivElement, unknown, HTMLElement, any> | null>(null)
  const { theme } = useEnhancedTheme()
  
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y')
  const [showMovingAverages, setShowMovingAverages] = useState(true)
  const [showDrawdown, setShowDrawdown] = useState(true)
  const [showVolume, setShowVolume] = useState(false)
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

    // Set up scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(chartData, d => d.date) as [Date, Date])
      .range([0, width])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(chartData, d => d.value) as [number, number])
      .nice()
      .range([height, 0])

    const drawdownScale = d3.scaleLinear()
      .domain(d3.extent(chartData, d => d.drawdown || 0) as [number, number])
      .range([height, height * 0.7])

    // Create main chart group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create gradient for area chart
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'portfolioGradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', height)
      .attr('x2', 0).attr('y2', 0)

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colors.primary)
      .attr('stop-opacity', 0.1)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colors.primary)
      .attr('stop-opacity', 0.4)

    // Create area generator
    const area = d3.area<PortfolioDataPoint>()
      .x(d => xScale(d.date))
      .y0(height)
      .y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX)

    // Create line generator
    const line = d3.line<PortfolioDataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX)

    // Draw drawdown shading if enabled
    if (showDrawdown) {
      const drawdownArea = d3.area<PortfolioDataPoint>()
        .x(d => xScale(d.date))
        .y0(height)
        .y1(d => drawdownScale(d.drawdown || 0))
        .curve(d3.curveMonotoneX)

      g.append('path')
        .datum(chartData.filter(d => (d.drawdown || 0) < 0))
        .attr('class', 'drawdown-area')
        .attr('d', drawdownArea)
        .attr('fill', colors.danger)
        .attr('opacity', 0.2)
    }

    // Draw area chart
    g.append('path')
      .datum(chartData)
      .attr('class', 'area')
      .attr('d', area)
      .attr('fill', 'url(#portfolioGradient)')

    // Draw main line
    g.append('path')
      .datum(chartData)
      .attr('class', 'line')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2)

    // Draw moving averages if enabled
    if (showMovingAverages) {
      const ma7Line = d3.line<PortfolioDataPoint>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.ma7 || d.value))
        .curve(d3.curveMonotoneX)
        .defined(d => !isNaN(d.ma7 || 0))

      const ma30Line = d3.line<PortfolioDataPoint>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.ma30 || d.value))
        .curve(d3.curveMonotoneX)
        .defined(d => !isNaN(d.ma30 || 0))

      g.append('path')
        .datum(chartData)
        .attr('class', 'ma7-line')
        .attr('d', ma7Line)
        .attr('fill', 'none')
        .attr('stroke', colors.warning)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', 0.7)

      g.append('path')
        .datum(chartData)
        .attr('class', 'ma30-line')
        .attr('d', ma30Line)
        .attr('fill', 'none')
        .attr('stroke', colors.info)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.7)
    }

    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat('%b %Y'))
      .ticks(6)

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => formatCurrency(d))
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

    // Style axis lines
    g.selectAll('.domain')
      .style('stroke', colors.border)

    g.selectAll('.tick line')
      .style('stroke', colors.border)

    // Create tooltip
    if (!tooltipRef.current) {
      tooltipRef.current = createTooltip('portfolio-tooltip')
    }

    // Add invisible overlay for mouse events
    g.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseover', () => tooltipRef.current?.style('opacity', 1))
      .on('mouseout', () => tooltipRef.current?.style('opacity', 0))
      .on('mousemove', (event) => {
        const [mouseX] = d3.pointer(event)
        const date = xScale.invert(mouseX)
        
        // Find closest data point
        const bisect = d3.bisector((d: PortfolioDataPoint) => d.date).left
        const index = bisect(chartData, date, 1)
        const d0 = chartData[index - 1]
        const d1 = chartData[index]
        const d = d1 && (date.getTime() - d0.date.getTime() > d1.date.getTime() - date.getTime()) ? d1 : d0

        if (d && tooltipRef.current) {
          const x = xScale(d.date)
          const y = yScale(d.value)

          // Update tooltip position and content
          tooltipRef.current
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
            .html(`
              <div style="font-weight: bold; margin-bottom: 4px;">
                ${d.date.toLocaleDateString()}
              </div>
              <div>Value: ${formatCurrency(d.value)}</div>
              <div>Change: ${formatPercent(d.changePercent / 100)}</div>
              ${d.ma7 ? `<div>MA7: ${formatCurrency(d.ma7)}</div>` : ''}
              ${d.ma30 ? `<div>MA30: ${formatCurrency(d.ma30)}</div>` : ''}
              ${d.drawdown ? `<div>Drawdown: ${formatPercent(d.drawdown / 100)}</div>` : ''}
            `)

          // Update crosshair
          g.selectAll('.crosshair').remove()
          
          g.append('line')
            .attr('class', 'crosshair')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', 0)
            .attr('y2', height)
            .attr('stroke', colors.textMuted)
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '2,2')
            .attr('opacity', 0.5)

          g.append('circle')
            .attr('class', 'crosshair')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 4)
            .attr('fill', colors.primary)
            .attr('stroke', colors.background)
            .attr('stroke-width', 2)
        }
      })

    // Add brush for zooming if data is large enough
    if (chartData.length > 100) {
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

      const miniLine = d3.line<PortfolioDataPoint>()
        .x(d => xScale(d.date))
        .y(d => miniScale(d.value))
        .curve(d3.curveMonotoneX)

      brushG.append('path')
        .datum(chartData)
        .attr('d', miniLine)
        .attr('fill', 'none')
        .attr('stroke', colors.primary)
        .attr('stroke-width', 1)
        .attr('opacity', 0.6)
    }

  }, [data, timeRange, showMovingAverages, showDrawdown, showVolume, theme, filteredData, brushSelection])

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

  // Calculate summary stats
  const summaryStats = data && data.length > 0 ? {
    currentValue: data[data.length - 1]?.value || 0,
    totalReturn: data.length > 0 ? ((data[data.length - 1]?.value || 0) - (data[0]?.value || 0)) : 0,
    totalReturnPercent: data.length > 0 ? (((data[data.length - 1]?.value || 0) - (data[0]?.value || 0)) / (data[0]?.value || 1)) * 100 : 0,
    dayChange: data[data.length - 1]?.change || 0,
    maxDrawdown: Math.min(...(data.map(d => d.drawdown || 0)))
  } : null

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
            Failed to load portfolio performance data
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>Track your portfolio value over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No portfolio data available
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
              Portfolio Performance
              {summaryStats && (
                <span className={`flex items-center gap-1 text-sm ${summaryStats.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summaryStats.dayChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {formatPercent(summaryStats.dayChange / 100)}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {summaryStats && (
                <div className="flex items-center gap-4 mt-1">
                  <span>Current: {formatCurrency(summaryStats.currentValue)}</span>
                  <span>Total Return: {formatPercent(summaryStats.totalReturnPercent / 100)}</span>
                  <span>Max Drawdown: {formatPercent(summaryStats.maxDrawdown / 100)}</span>
                </div>
              )}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="moving-averages" className="text-sm">MA</Label>
              <Switch 
                id="moving-averages"
                checked={showMovingAverages}
                onCheckedChange={setShowMovingAverages}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="drawdown" className="text-sm">Drawdown</Label>
              <Switch 
                id="drawdown"
                checked={showDrawdown}
                onCheckedChange={setShowDrawdown}
              />
            </div>

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
        
        {showMovingAverages && (
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-px bg-yellow-500 border-dashed"></div>
              <span>7-day MA</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-px bg-blue-500 border-dashed"></div>
              <span>30-day MA</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
