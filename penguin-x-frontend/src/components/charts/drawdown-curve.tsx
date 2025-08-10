import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { DrawdownPoint, formatPercent, formatDate, getChartDimensions, chartColors, createTooltip, createBrush } from '@/lib/chart-utils'
import { useEnhancedTheme } from '@/store/app-store'
import { Skeleton } from '@/components/ui/skeleton'
import { Info, TrendingDown, AlertTriangle } from 'lucide-react'

interface DrawdownCurveProps {
  data: DrawdownPoint[]
  loading?: boolean
  error?: string | null
  className?: string
}

type TimeRange = '1M' | '3M' | '6M' | '1Y' | '2Y' | 'ALL'

export function DrawdownCurve({ 
  data, 
  loading = false, 
  error = null, 
  className = '' 
}: DrawdownCurveProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<d3.Selection<HTMLDivElement, unknown, HTMLElement, any> | null>(null)
  const { theme } = useEnhancedTheme()
  
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y')
  const [showUnderwaterPlot, setShowUnderwaterPlot] = useState(true)
  const [showRecoveryPeriods, setShowRecoveryPeriods] = useState(true)
  const [highlightMaxDrawdown, setHighlightMaxDrawdown] = useState(true)
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

  // Find recovery periods
  const findRecoveryPeriods = useCallback((drawdownData: DrawdownPoint[]) => {
    const periods: Array<{ start: Date; end: Date; maxDrawdown: number }> = []
    let currentPeriod: { start: Date; maxDrawdown: number } | null = null
    
    drawdownData.forEach((d, i) => {
      if (d.drawdown < 0) {
        // In drawdown
        if (!currentPeriod) {
          currentPeriod = { start: d.date, maxDrawdown: d.drawdown }
        } else {
          currentPeriod.maxDrawdown = Math.min(currentPeriod.maxDrawdown, d.drawdown)
        }
      } else {
        // Recovery
        if (currentPeriod) {
          periods.push({
            start: currentPeriod.start,
            end: d.date,
            maxDrawdown: currentPeriod.maxDrawdown
          })
          currentPeriod = null
        }
      }
    })
    
    // Handle ongoing drawdown
    if (currentPeriod) {
      const lastDate = drawdownData[drawdownData.length - 1]?.date
      if (lastDate) {
        periods.push({
          start: currentPeriod.start,
          end: lastDate,
          maxDrawdown: currentPeriod.maxDrawdown
        })
      }
    }
    
    return periods
  }, [])

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
      .domain([Math.min(0, d3.min(chartData, d => d.drawdown) || 0), 0])
      .nice()
      .range([height, 0])

    // Create main chart group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create gradient for underwater area
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'underwaterGradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', yScale(0))
      .attr('x2', 0).attr('y2', height)

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colors.danger)
      .attr('stop-opacity', 0.1)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colors.danger)
      .attr('stop-opacity', 0.4)

    // Zero line
    g.append('line')
      .attr('class', 'zero-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .attr('stroke', colors.border)
      .attr('stroke-width', 2)

    // Find recovery periods
    const recoveryPeriods = findRecoveryPeriods(chartData)

    // Draw recovery period backgrounds
    if (showRecoveryPeriods) {
      recoveryPeriods.forEach((period, i) => {
        g.append('rect')
          .attr('class', 'recovery-period')
          .attr('x', xScale(period.start))
          .attr('y', 0)
          .attr('width', xScale(period.end) - xScale(period.start))
          .attr('height', height)
          .attr('fill', colors.danger)
          .attr('opacity', 0.05)
          .attr('rx', 4)
      })
    }

    // Draw underwater area if enabled
    if (showUnderwaterPlot) {
      const area = d3.area<DrawdownPoint>()
        .x(d => xScale(d.date))
        .y0(yScale(0))
        .y1(d => yScale(d.drawdown))
        .curve(d3.curveMonotoneX)

      g.append('path')
        .datum(chartData.filter(d => d.drawdown < 0))
        .attr('class', 'underwater-area')
        .attr('d', area)
        .attr('fill', 'url(#underwaterGradient)')
    }

    // Create line generator
    const line = d3.line<DrawdownPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.drawdown))
      .curve(d3.curveMonotoneX)

    // Draw main drawdown line
    g.append('path')
      .datum(chartData)
      .attr('class', 'drawdown-line')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', colors.danger)
      .attr('stroke-width', 2)

    // Highlight maximum drawdown point
    if (highlightMaxDrawdown) {
      const maxDrawdownPoint = chartData.reduce((prev, current) => 
        (prev.drawdown < current.drawdown) ? prev : current
      )

      g.append('circle')
        .attr('class', 'max-drawdown-point')
        .attr('cx', xScale(maxDrawdownPoint.date))
        .attr('cy', yScale(maxDrawdownPoint.drawdown))
        .attr('r', 6)
        .attr('fill', colors.danger)
        .attr('stroke', colors.background)
        .attr('stroke-width', 3)

      // Add annotation
      const annotation = g.append('g')
        .attr('class', 'max-drawdown-annotation')
        .attr('transform', `translate(${xScale(maxDrawdownPoint.date)},${yScale(maxDrawdownPoint.drawdown)})`)

      annotation.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 30)
        .attr('y2', -30)
        .attr('stroke', colors.danger)
        .attr('stroke-width', 1)

      const annotationText = annotation.append('g')
        .attr('transform', 'translate(35,-35)')

      annotationText.append('rect')
        .attr('x', -5)
        .attr('y', -15)
        .attr('width', 100)
        .attr('height', 30)
        .attr('fill', colors.surface)
        .attr('stroke', colors.border)
        .attr('rx', 4)

      annotationText.append('text')
        .attr('x', 45)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .style('fill', colors.text)
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .text('Max Drawdown')

      annotationText.append('text')
        .attr('x', 45)
        .attr('y', 8)
        .attr('text-anchor', 'middle')
        .style('fill', colors.danger)
        .style('font-size', '10px')
        .text(formatPercent(maxDrawdownPoint.drawdown / 100))
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

    // Style axis lines
    g.selectAll('.domain')
      .style('stroke', colors.border)

    g.selectAll('.tick line')
      .style('stroke', colors.border)

    // Add axis labels
    g.append('text')
      .attr('class', 'y-label')
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90)`)
      .attr('x', -height / 2)
      .attr('y', -50)
      .style('fill', colors.text)
      .style('font-size', '14px')
      .text('Drawdown (%)')

    // Create tooltip
    if (!tooltipRef.current) {
      tooltipRef.current = createTooltip('drawdown-tooltip')
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
        const bisect = d3.bisector((d: DrawdownPoint) => d.date).left
        const index = bisect(chartData, date, 1)
        const d0 = chartData[index - 1]
        const d1 = chartData[index]
        const d = d1 && (date.getTime() - d0.date.getTime() > d1.date.getTime() - date.getTime()) ? d1 : d0

        if (d && tooltipRef.current) {
          const x = xScale(d.date)
          const y = yScale(d.drawdown)

          // Update tooltip position and content
          tooltipRef.current
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
            .html(`
              <div style="font-weight: bold; margin-bottom: 4px;">
                ${formatDate(d.date)}
              </div>
              <div>Drawdown: ${formatPercent(d.drawdown / 100)}</div>
              <div>Portfolio Value: ${d.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
              <div>Peak Value: ${d.peak.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
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
            .attr('fill', colors.danger)
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

      const miniLine = d3.line<DrawdownPoint>()
        .x(d => xScale(d.date))
        .y(d => miniScale(d.drawdown))
        .curve(d3.curveMonotoneX)

      brushG.append('path')
        .datum(chartData)
        .attr('d', miniLine)
        .attr('fill', 'none')
        .attr('stroke', colors.danger)
        .attr('stroke-width', 1)
        .attr('opacity', 0.6)
    }

  }, [data, timeRange, showUnderwaterPlot, showRecoveryPeriods, highlightMaxDrawdown, theme, filteredData, findRecoveryPeriods, brushSelection])

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
    maxDrawdown: Math.min(...data.map(d => d.drawdown)),
    averageDrawdown: data.filter(d => d.drawdown < 0).reduce((sum, d) => sum + d.drawdown, 0) / data.filter(d => d.drawdown < 0).length || 0,
    drawdownDays: data.filter(d => d.drawdown < 0).length,
    recoveryPeriods: findRecoveryPeriods(data).length
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
            Failed to load drawdown data
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Drawdown Analysis</CardTitle>
          <CardDescription>Track portfolio drawdowns and recovery periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No drawdown data available
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
              <TrendingDown className="h-5 w-5 text-red-500" />
              Drawdown Analysis
              {summaryStats && (
                <span className="flex items-center gap-1 text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  {formatPercent(summaryStats.maxDrawdown / 100)}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {summaryStats && (
                <div className="flex items-center gap-4 mt-1">
                  <span>Max Drawdown: {formatPercent(summaryStats.maxDrawdown / 100)}</span>
                  <span>Avg Drawdown: {formatPercent(summaryStats.averageDrawdown / 100)}</span>
                  <span>Drawdown Days: {summaryStats.drawdownDays}</span>
                  <span>Recovery Periods: {summaryStats.recoveryPeriods}</span>
                </div>
              )}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="underwater" className="text-sm">Underwater</Label>
              <Switch 
                id="underwater"
                checked={showUnderwaterPlot}
                onCheckedChange={setShowUnderwaterPlot}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="recovery" className="text-sm">Recovery</Label>
              <Switch 
                id="recovery"
                checked={showRecoveryPeriods}
                onCheckedChange={setShowRecoveryPeriods}
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="highlight" className="text-sm">Max DD</Label>
              <Switch 
                id="highlight"
                checked={highlightMaxDrawdown}
                onCheckedChange={setHighlightMaxDrawdown}
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
        
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-px bg-red-500"></div>
            <span>Drawdown Curve</span>
          </div>
          {showUnderwaterPlot && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 opacity-20"></div>
              <span>Underwater Plot</span>
            </div>
          )}
          {showRecoveryPeriods && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 opacity-10 border"></div>
              <span>Recovery Periods</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
