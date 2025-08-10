import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { CashflowPoint, formatCurrency, getChartDimensions, chartColors, createTooltip } from '@/lib/chart-utils'
import { useEnhancedTheme } from '@/store/app-store'
import { Skeleton } from '@/components/ui/skeleton'
import { Info, TrendingUp, TrendingDown } from 'lucide-react'

interface CashflowWaterfallProps {
  data: CashflowPoint[]
  loading?: boolean
  error?: string | null
  className?: string
}

type ViewMode = 'net' | 'detailed'

interface WaterfallBar {
  period: string
  value: number
  cumulative: number
  type: 'positive' | 'negative' | 'cumulative'
  startY: number
  endY: number
  inflow?: number
  outflow?: number
}

export function CashflowWaterfall({ 
  data, 
  loading = false, 
  error = null, 
  className = '' 
}: CashflowWaterfallProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<d3.Selection<HTMLDivElement, unknown, HTMLElement, any> | null>(null)
  const { theme } = useEnhancedTheme()
  
  const [viewMode, setViewMode] = useState<ViewMode>('net')
  const [showConnectors, setShowConnectors] = useState(true)
  const [showValues, setShowValues] = useState(true)
  const [showCumulative, setShowCumulative] = useState(true)

  // Transform data for waterfall visualization
  const prepareWaterfallData = useCallback((rawData: CashflowPoint[]): WaterfallBar[] => {
    if (!rawData || rawData.length === 0) return []

    const waterfallData: WaterfallBar[] = []
    let runningTotal = 0

    rawData.forEach((d, i) => {
      if (viewMode === 'detailed') {
        // Show inflow and outflow separately
        if (d.inflow > 0) {
          waterfallData.push({
            period: `${d.period} In`,
            value: d.inflow,
            cumulative: runningTotal + d.inflow,
            type: 'positive',
            startY: runningTotal,
            endY: runningTotal + d.inflow,
            inflow: d.inflow,
            outflow: d.outflow
          })
          runningTotal += d.inflow
        }
        
        if (d.outflow > 0) {
          waterfallData.push({
            period: `${d.period} Out`,
            value: -d.outflow,
            cumulative: runningTotal - d.outflow,
            type: 'negative',
            startY: runningTotal,
            endY: runningTotal - d.outflow,
            inflow: d.inflow,
            outflow: d.outflow
          })
          runningTotal -= d.outflow
        }
      } else {
        // Show net flow
        const netValue = d.net
        waterfallData.push({
          period: d.period,
          value: netValue,
          cumulative: runningTotal + netValue,
          type: netValue >= 0 ? 'positive' : 'negative',
          startY: runningTotal,
          endY: runningTotal + netValue,
          inflow: d.inflow,
          outflow: d.outflow
        })
        runningTotal += netValue
      }

      // Add cumulative bar at the end of each period
      if (showCumulative && i === rawData.length - 1) {
        waterfallData.push({
          period: 'Total',
          value: runningTotal,
          cumulative: runningTotal,
          type: 'cumulative',
          startY: 0,
          endY: runningTotal
        })
      }
    })

    return waterfallData
  }, [viewMode, showCumulative])

  const drawChart = useCallback(() => {
    if (!svgRef.current || !containerRef.current || !data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const containerRect = containerRef.current.getBoundingClientRect()
    const { width, height, margin } = getChartDimensions(containerRect.width, containerRect.height - 100)
    
    if (width <= 0 || height <= 0) return

    const colors = chartColors[theme]
    const waterfallData = prepareWaterfallData(data)
    
    if (waterfallData.length === 0) return

    // Set up scales
    const xScale = d3.scaleBand()
      .domain(waterfallData.map(d => d.period))
      .range([0, width])
      .padding(0.2)

    const yExtent = d3.extent([
      ...waterfallData.map(d => d.startY),
      ...waterfallData.map(d => d.endY),
      0
    ]) as [number, number]
    
    const yScale = d3.scaleLinear()
      .domain(yExtent)
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

    // Create bars
    const bars = g.selectAll('.waterfall-bar')
      .data(waterfallData)
      .enter()
      .append('g')
      .attr('class', 'waterfall-bar')
      .attr('transform', d => `translate(${xScale(d.period)},0)`)

    // Add rectangles
    bars.append('rect')
      .attr('x', 0)
      .attr('y', d => yScale(Math.max(d.startY, d.endY)))
      .attr('width', xScale.bandwidth())
      .attr('height', d => Math.abs(yScale(d.startY) - yScale(d.endY)))
      .attr('fill', d => {
        switch (d.type) {
          case 'positive':
            return colors.success
          case 'negative':
            return colors.danger
          case 'cumulative':
            return colors.primary
          default:
            return colors.muted
        }
      })
      .attr('stroke', colors.background)
      .attr('stroke-width', 1)
      .attr('rx', 2)
      .attr('ry', 2)
      .style('cursor', 'pointer')

    // Add connectors if enabled
    if (showConnectors) {
      waterfallData.forEach((d, i) => {
        if (i < waterfallData.length - 1 && d.type !== 'cumulative') {
          const nextBar = waterfallData[i + 1]
          if (nextBar.type !== 'cumulative') {
            const x1 = (xScale(d.period) || 0) + xScale.bandwidth()
            const x2 = xScale(nextBar.period) || 0
            const y = yScale(d.endY)

            g.append('line')
              .attr('class', 'connector')
              .attr('x1', x1)
              .attr('x2', x2)
              .attr('y1', y)
              .attr('y2', y)
              .attr('stroke', colors.textMuted)
              .attr('stroke-width', 1)
              .attr('stroke-dasharray', '2,2')
              .attr('opacity', 0.5)
          }
        }
      })
    }

    // Add value labels if enabled
    if (showValues) {
      bars.append('text')
        .attr('class', 'value-label')
        .attr('x', xScale.bandwidth() / 2)
        .attr('y', d => {
          const barTop = yScale(Math.max(d.startY, d.endY))
          const barHeight = Math.abs(yScale(d.startY) - yScale(d.endY))
          return barTop + (d.value >= 0 ? -5 : barHeight + 15)
        })
        .attr('text-anchor', 'middle')
        .style('fill', colors.text)
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .text(d => formatCurrency(Math.abs(d.value)))
    }

    // Create axes
    const xAxis = d3.axisBottom(xScale)
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => formatCurrency(d))
      .ticks(8)

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', colors.textMuted)
      .style('font-size', '11px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')

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
      tooltipRef.current = createTooltip('waterfall-tooltip')
    }

    // Add interactions
    bars
      .on('mouseover', (event, d) => {
        // Highlight bar
        d3.select(event.currentTarget)
          .select('rect')
          .transition()
          .duration(200)
          .attr('stroke-width', 2)
          .attr('stroke', colors.primary)

        if (tooltipRef.current) {
          const tooltipContent = d.type === 'cumulative' ? `
            <div style="font-weight: bold; margin-bottom: 4px;">
              ${d.period}
            </div>
            <div>Cumulative: ${formatCurrency(d.cumulative)}</div>
          ` : `
            <div style="font-weight: bold; margin-bottom: 4px;">
              ${d.period}
            </div>
            ${d.inflow !== undefined ? `<div>Inflow: ${formatCurrency(d.inflow)}</div>` : ''}
            ${d.outflow !== undefined ? `<div>Outflow: ${formatCurrency(d.outflow)}</div>` : ''}
            <div>Net: ${formatCurrency(d.value)}</div>
            <div>Cumulative: ${formatCurrency(d.cumulative)}</div>
          `

          tooltipRef.current
            .style('opacity', 1)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
            .html(tooltipContent)
        }
      })
      .on('mouseout', (event, d) => {
        d3.select(event.currentTarget)
          .select('rect')
          .transition()
          .duration(200)
          .attr('stroke-width', 1)
          .attr('stroke', colors.background)

        if (tooltipRef.current) {
          tooltipRef.current.style('opacity', 0)
        }
      })

    // Add animation
    bars.selectAll('rect')
      .attr('height', 0)
      .attr('y', height)
      .transition()
      .duration(750)
      .delay((d, i) => i * 100)
      .attr('y', d => yScale(Math.max(d.startY, d.endY)))
      .attr('height', d => Math.abs(yScale(d.startY) - yScale(d.endY)))

  }, [data, viewMode, showConnectors, showValues, showCumulative, theme, prepareWaterfallData])

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
    totalInflow: data.reduce((sum, d) => sum + d.inflow, 0),
    totalOutflow: data.reduce((sum, d) => sum + d.outflow, 0),
    netCashflow: data.reduce((sum, d) => sum + d.net, 0),
    finalCumulative: data[data.length - 1]?.cumulative || 0
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
            Failed to load cashflow data
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Cashflow Waterfall</CardTitle>
          <CardDescription>Visualize cash flows and cumulative impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No cashflow data available
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
              Cashflow Waterfall
              {summaryStats && (
                <span className={`flex items-center gap-1 text-sm ${summaryStats.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summaryStats.netCashflow >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {formatCurrency(summaryStats.netCashflow)}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {summaryStats && (
                <div className="flex items-center gap-4 mt-1">
                  <span>Total Inflow: {formatCurrency(summaryStats.totalInflow)}</span>
                  <span>Total Outflow: {formatCurrency(summaryStats.totalOutflow)}</span>
                  <span>Ending Balance: {formatCurrency(summaryStats.finalCumulative)}</span>
                </div>
              )}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="connectors" className="text-sm">Connectors</Label>
              <Switch 
                id="connectors"
                checked={showConnectors}
                onCheckedChange={setShowConnectors}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="values" className="text-sm">Values</Label>
              <Switch 
                id="values"
                checked={showValues}
                onCheckedChange={setShowValues}
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="cumulative" className="text-sm">Total</Label>
              <Switch 
                id="cumulative"
                checked={showCumulative}
                onCheckedChange={setShowCumulative}
              />
            </div>

            <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net">Net Flow</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
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
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Positive Cash Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Negative Cash Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Cumulative Total</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
