import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { RiskReturnPoint, formatPercent, getChartDimensions, chartColors, createTooltip, createZoom } from '@/lib/chart-utils'
import { useEnhancedTheme } from '@/store/app-store'
import { Skeleton } from '@/components/ui/skeleton'
import { Info, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'

interface RiskReturnScatterProps {
  data: RiskReturnPoint[]
  loading?: boolean
  error?: string | null
  className?: string
}

type ColorBy = 'category' | 'sharpe' | 'return'

export function RiskReturnScatter({ 
  data, 
  loading = false, 
  error = null, 
  className = '' 
}: RiskReturnScatterProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<d3.Selection<HTMLDivElement, unknown, HTMLElement, any> | null>(null)
  const { theme } = useEnhancedTheme()
  
  const [colorBy, setColorBy] = useState<ColorBy>('category')
  const [showQuadrants, setShowQuadrants] = useState(true)
  const [showRegression, setShowRegression] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform | null>(null)

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(data?.map(d => d.category) || []))]

  // Filter data based on selected category
  const filteredData = useCallback(() => {
    if (!data || data.length === 0) return []
    if (selectedCategory === 'all') return data
    return data.filter(d => d.category === selectedCategory)
  }, [data, selectedCategory])

  // Calculate linear regression
  const calculateRegression = useCallback((points: RiskReturnPoint[]) => {
    if (points.length < 2) return null
    
    const n = points.length
    const sumX = points.reduce((sum, p) => sum + p.risk, 0)
    const sumY = points.reduce((sum, p) => sum + p.return, 0)
    const sumXY = points.reduce((sum, p) => sum + p.risk * p.return, 0)
    const sumXX = points.reduce((sum, p) => sum + p.risk * p.risk, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    return { slope, intercept }
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
    const xExtent = d3.extent(chartData, d => d.risk) as [number, number]
    const yExtent = d3.extent(chartData, d => d.return) as [number, number]
    
    // Add padding to domains
    const xPadding = (xExtent[1] - xExtent[0]) * 0.1
    const yPadding = (yExtent[1] - yExtent[0]) * 0.1
    
    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([0, width])

    const yScale = d3.scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .range([height, 0])

    // Color scales
    let colorScale: d3.ScaleOrdinal<string, string> | d3.ScaleLinear<string, string, never>
    
    if (colorBy === 'category') {
      const uniqueCategories = Array.from(new Set(chartData.map(d => d.category)))
      colorScale = d3.scaleOrdinal<string>()
        .domain(uniqueCategories)
        .range(theme === 'dark' ? 
          ['#3b82f6', '#8b5cf6', '#22c55e', '#ef4444', '#f97316', '#06b6d4'] :
          ['#2563eb', '#7c3aed', '#16a34a', '#dc2626', '#ea580c', '#0891b2']
        )
    } else if (colorBy === 'sharpe') {
      const sharpeExtent = d3.extent(chartData, d => d.sharpe) as [number, number]
      colorScale = d3.scaleLinear<string>()
        .domain(sharpeExtent)
        .range([colors.danger, colors.success])
    } else {
      const returnExtent = d3.extent(chartData, d => d.return) as [number, number]
      colorScale = d3.scaleLinear<string>()
        .domain(returnExtent)
        .range([colors.danger, colors.success])
    }

    // Size scale based on Sharpe ratio
    const sizeScale = d3.scaleSqrt()
      .domain(d3.extent(chartData, d => Math.abs(d.sharpe)) as [number, number])
      .range([4, 12])

    // Create main chart group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Add zoom behavior
    const zoom = createZoom((transform) => {
      setZoomTransform(transform)
      
      // Update scales with zoom transform
      const newXScale = transform.rescaleX(xScale)
      const newYScale = transform.rescaleY(yScale)
      
      // Update axes
      g.select('.x-axis')
        .call(d3.axisBottom(newXScale).tickFormat(d => formatPercent(d / 100)))
      
      g.select('.y-axis')
        .call(d3.axisLeft(newYScale).tickFormat(d => formatPercent(d / 100)))
      
      // Update points
      g.selectAll('.data-point')
        .attr('cx', (d: any) => newXScale(d.risk))
        .attr('cy', (d: any) => newYScale(d.return))
      
      // Update quadrant lines
      if (showQuadrants) {
        const meanRisk = d3.mean(chartData, d => d.risk) || 0
        const meanReturn = d3.mean(chartData, d => d.return) || 0
        
        g.select('.quadrant-vertical')
          .attr('x1', newXScale(meanRisk))
          .attr('x2', newXScale(meanRisk))
        
        g.select('.quadrant-horizontal')
          .attr('y1', newYScale(meanReturn))
          .attr('y2', newYScale(meanReturn))
      }
      
      // Update regression line
      if (showRegression) {
        const regression = calculateRegression(chartData)
        if (regression) {
          const xDomain = newXScale.domain()
          const lineData = [
            { x: xDomain[0], y: regression.slope * xDomain[0] + regression.intercept },
            { x: xDomain[1], y: regression.slope * xDomain[1] + regression.intercept }
          ]
          
          g.select('.regression-line')
            .attr('x1', newXScale(lineData[0].x))
            .attr('y1', newYScale(lineData[0].y))
            .attr('x2', newXScale(lineData[1].x))
            .attr('y2', newYScale(lineData[1].y))
        }
      }
    })

    svg.call(zoom)

    // Apply existing zoom transform if any
    if (zoomTransform) {
      svg.call(zoom.transform, zoomTransform)
    }

    // Draw quadrant lines if enabled
    if (showQuadrants) {
      const meanRisk = d3.mean(chartData, d => d.risk) || 0
      const meanReturn = d3.mean(chartData, d => d.return) || 0
      
      g.append('line')
        .attr('class', 'quadrant-vertical')
        .attr('x1', xScale(meanRisk))
        .attr('x2', xScale(meanRisk))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', colors.border)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', 0.5)

      g.append('line')
        .attr('class', 'quadrant-horizontal')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', yScale(meanReturn))
        .attr('y2', yScale(meanReturn))
        .attr('stroke', colors.border)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', 0.5)
      
      // Add quadrant labels
      const labelStyle = {
        fill: colors.textMuted,
        'font-size': '12px',
        'font-weight': 'bold',
        opacity: 0.7
      }
      
      g.append('text')
        .attr('x', width - 10)
        .attr('y', 15)
        .attr('text-anchor', 'end')
        .style('fill', labelStyle.fill)
        .style('font-size', labelStyle['font-size'])
        .style('opacity', labelStyle.opacity)
        .text('High Return, High Risk')
      
      g.append('text')
        .attr('x', 10)
        .attr('y', 15)
        .style('fill', labelStyle.fill)
        .style('font-size', labelStyle['font-size'])
        .style('opacity', labelStyle.opacity)
        .text('High Return, Low Risk')
      
      g.append('text')
        .attr('x', width - 10)
        .attr('y', height - 5)
        .attr('text-anchor', 'end')
        .style('fill', labelStyle.fill)
        .style('font-size', labelStyle['font-size'])
        .style('opacity', labelStyle.opacity)
        .text('Low Return, High Risk')
      
      g.append('text')
        .attr('x', 10)
        .attr('y', height - 5)
        .style('fill', labelStyle.fill)
        .style('font-size', labelStyle['font-size'])
        .style('opacity', labelStyle.opacity)
        .text('Low Return, Low Risk')
    }

    // Draw regression line if enabled
    if (showRegression) {
      const regression = calculateRegression(chartData)
      if (regression) {
        const xDomain = xScale.domain()
        const lineData = [
          { x: xDomain[0], y: regression.slope * xDomain[0] + regression.intercept },
          { x: xDomain[1], y: regression.slope * xDomain[1] + regression.intercept }
        ]
        
        g.append('line')
          .attr('class', 'regression-line')
          .attr('x1', xScale(lineData[0].x))
          .attr('y1', yScale(lineData[0].y))
          .attr('x2', xScale(lineData[1].x))
          .attr('y2', yScale(lineData[1].y))
          .attr('stroke', colors.warning)
          .attr('stroke-width', 2)
          .attr('opacity', 0.8)
      }
    }

    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => formatPercent(d / 100))
      .ticks(8)

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
      .attr('class', 'x-label')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .style('fill', colors.text)
      .style('font-size', '14px')
      .text('Risk (Volatility %)')

    g.append('text')
      .attr('class', 'y-label')
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90)`)
      .attr('x', -height / 2)
      .attr('y', -50)
      .style('fill', colors.text)
      .style('font-size', '14px')
      .text('Return (%)')

    // Style axis lines
    g.selectAll('.domain')
      .style('stroke', colors.border)

    g.selectAll('.tick line')
      .style('stroke', colors.border)

    // Create tooltip
    if (!tooltipRef.current) {
      tooltipRef.current = createTooltip('risk-return-tooltip')
    }

    // Draw data points
    const points = g.selectAll('.data-point')
      .data(chartData)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', d => xScale(d.risk))
      .attr('cy', d => yScale(d.return))
      .attr('r', d => sizeScale(Math.abs(d.sharpe)))
      .attr('fill', d => {
        if (colorBy === 'category') {
          return (colorScale as d3.ScaleOrdinal<string, string>)(d.category)
        } else if (colorBy === 'sharpe') {
          return (colorScale as d3.ScaleLinear<string, string, never>)(d.sharpe)
        } else {
          return (colorScale as d3.ScaleLinear<string, string, never>)(d.return)
        }
      })
      .attr('stroke', colors.background)
      .attr('stroke-width', 1)
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')

    // Add interactions
    points
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', sizeScale(Math.abs(d.sharpe)) * 1.5)
          .attr('opacity', 1)

        if (tooltipRef.current) {
          tooltipRef.current
            .style('opacity', 1)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
            .html(`
              <div style="font-weight: bold; margin-bottom: 4px;">
                ${d.name}
              </div>
              <div>Risk: ${formatPercent(d.risk / 100)}</div>
              <div>Return: ${formatPercent(d.return / 100)}</div>
              <div>Sharpe Ratio: ${d.sharpe.toFixed(2)}</div>
              <div>Category: ${d.category}</div>
            `)
        }
      })
      .on('mouseout', (event, d) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', sizeScale(Math.abs(d.sharpe)))
          .attr('opacity', 0.8)

        if (tooltipRef.current) {
          tooltipRef.current.style('opacity', 0)
        }
      })

  }, [data, colorBy, showQuadrants, showRegression, selectedCategory, theme, filteredData, calculateRegression, zoomTransform])

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

  const resetZoom = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current)
      svg.transition().duration(750).call(
        createZoom((transform) => setZoomTransform(transform)).transform,
        d3.zoomIdentity
      )
      setZoomTransform(null)
    }
  }

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
            Failed to load risk/return data
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Risk vs Return Analysis</CardTitle>
          <CardDescription>Analyze the risk-return profile of investments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No risk/return data available
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
            <CardTitle>Risk vs Return Analysis</CardTitle>
            <CardDescription>
              Interactive scatter plot showing risk-return characteristics. Circle size represents Sharpe ratio.
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="quadrants" className="text-sm">Quadrants</Label>
              <Switch 
                id="quadrants"
                checked={showQuadrants}
                onCheckedChange={setShowQuadrants}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="regression" className="text-sm">Regression</Label>
              <Switch 
                id="regression"
                checked={showRegression}
                onCheckedChange={setShowRegression}
              />
            </div>

            <Select value={colorBy} onValueChange={(value: ColorBy) => setColorBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="sharpe">Sharpe Ratio</SelectItem>
                <SelectItem value="return">Return</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Assets' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={resetZoom}>
              <RotateCcw className="h-4 w-4" />
            </Button>
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
          <div className="text-sm text-muted-foreground">
            Drag to pan • Scroll to zoom • Hover for details
          </div>
          
          {colorBy === 'category' && (
            <div className="flex items-center gap-4 text-sm">
              {Array.from(new Set(filteredData().map(d => d.category))).map(category => (
                <div key={category} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: theme === 'dark' ? 
                        ['#3b82f6', '#8b5cf6', '#22c55e', '#ef4444', '#f97316', '#06b6d4'][
                          Array.from(new Set(data.map(d => d.category))).indexOf(category) % 6
                        ] :
                        ['#2563eb', '#7c3aed', '#16a34a', '#dc2626', '#ea580c', '#0891b2'][
                          Array.from(new Set(data.map(d => d.category))).indexOf(category) % 6
                        ]
                    }}
                  ></div>
                  <span className="capitalize">{category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
