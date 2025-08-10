import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AssetAllocation, formatCurrency, formatPercent, getChartDimensions, chartColors, createTooltip } from '@/lib/chart-utils'
import { useEnhancedTheme } from '@/store/app-store'
import { Skeleton } from '@/components/ui/skeleton'
import { Info, Home, ArrowUp } from 'lucide-react'

interface AssetAllocationTreemapProps {
  data: AssetAllocation[]
  loading?: boolean
  error?: string | null
  className?: string
}

interface TreemapNode extends d3.HierarchyRectangularNode<AssetAllocation> {
  data: AssetAllocation
}

export function AssetAllocationTreemap({ 
  data, 
  loading = false, 
  error = null, 
  className = '' 
}: AssetAllocationTreemapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<d3.Selection<HTMLDivElement, unknown, HTMLElement, any> | null>(null)
  const { theme } = useEnhancedTheme()
  
  const [showLabels, setShowLabels] = useState(true)
  const [showPercentages, setShowPercentages] = useState(true)
  const [currentLevel, setCurrentLevel] = useState<AssetAllocation | null>(null)
  const [breadcrumb, setBreadcrumb] = useState<AssetAllocation[]>([])

  // Color scale for different categories
  const getColorForCategory = useCallback((category: string, depth: number = 0) => {
    const colors = chartColors[theme]
    const categoryColors: Record<string, string> = {
      stocks: colors.primary,
      bonds: colors.secondary,
      alternatives: colors.warning,
      cash: colors.success,
      'us-large': theme === 'dark' ? '#4f46e5' : '#3730a3',
      'us-small': theme === 'dark' ? '#6366f1' : '#4338ca',
      international: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
      'govt-bonds': theme === 'dark' ? '#06b6d4' : '#0891b2',
      'corp-bonds': theme === 'dark' ? '#0ea5e9' : '#0284c7',
      'real-estate': theme === 'dark' ? '#f59e0b' : '#d97706',
      commodities: theme === 'dark' ? '#f97316' : '#ea580c',
    }
    
    return categoryColors[category] || (depth === 0 ? colors.muted : d3.color(categoryColors[category] || colors.muted)?.darker(0.3)?.toString() || colors.muted)
  }, [theme])

  // Create hierarchical data structure
  const createHierarchy = useCallback((items: AssetAllocation[], parent?: AssetAllocation) => {
    const root = {
      name: parent?.name || 'Portfolio',
      value: parent?.value || items.reduce((sum, item) => sum + item.value, 0),
      percentage: parent?.percentage || 100,
      category: parent?.category || 'portfolio',
      children: items
    }
    
    return d3.hierarchy(root, d => d.children)
      .sum(d => d.children ? 0 : d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0))
  }, [])

  const drawChart = useCallback(() => {
    if (!svgRef.current || !containerRef.current || !data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const containerRect = containerRef.current.getBoundingClientRect()
    const { width, height, margin } = getChartDimensions(containerRect.width, containerRect.height - 50)
    
    if (width <= 0 || height <= 0) return

    const colors = chartColors[theme]
    
    // Determine what data to show based on current level
    const displayData = currentLevel ? (currentLevel.children || []) : data
    
    if (displayData.length === 0) return

    // Create hierarchy
    const hierarchy = createHierarchy(displayData, currentLevel)
    
    // Create treemap layout
    const treemap = d3.treemap<AssetAllocation>()
      .size([width, height])
      .padding(2)
      .round(true)

    const root = treemap(hierarchy)

    // Create main chart group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create tooltip
    if (!tooltipRef.current) {
      tooltipRef.current = createTooltip('treemap-tooltip')
    }

    // Draw rectangles
    const cell = g.selectAll('.cell')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', d => `translate(${d.x0},${d.y0})`)

    const rect = cell.append('rect')
      .attr('width', d => Math.max(0, d.x1 - d.x0))
      .attr('height', d => Math.max(0, d.y1 - d.y0))
      .attr('fill', d => getColorForCategory(d.data.category, d.depth))
      .attr('stroke', colors.background)
      .attr('stroke-width', 1)
      .attr('rx', 4)
      .attr('ry', 4)
      .style('cursor', d => d.data.children && d.data.children.length > 0 ? 'pointer' : 'default')
      .on('mouseover', (event, d) => {
        // Highlight on hover
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('stroke-width', 2)
          .attr('stroke', colors.primary)

        if (tooltipRef.current) {
          tooltipRef.current
            .style('opacity', 1)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
            .html(`
              <div style="font-weight: bold; margin-bottom: 4px;">
                ${d.data.name}
              </div>
              <div>Value: ${formatCurrency(d.data.value)}</div>
              <div>Allocation: ${formatPercent(d.data.percentage / 100)}</div>
              ${d.data.children ? `<div>Assets: ${d.data.children.length}</div>` : ''}
              <div style="margin-top: 4px; font-size: 11px; opacity: 0.8;">
                ${d.data.children ? 'Click to drill down' : ''}
              </div>
            `)
        }
      })
      .on('mouseout', (event, d) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('stroke-width', 1)
          .attr('stroke', colors.background)

        if (tooltipRef.current) {
          tooltipRef.current.style('opacity', 0)
        }
      })
      .on('click', (event, d) => {
        if (d.data.children && d.data.children.length > 0) {
          // Drill down
          const newBreadcrumb = currentLevel ? [...breadcrumb, currentLevel] : []
          setBreadcrumb(newBreadcrumb)
          setCurrentLevel(d.data)
        }
      })

    // Add labels if enabled
    if (showLabels) {
      cell.append('text')
        .attr('class', 'cell-label')
        .attr('x', d => (d.x1 - d.x0) / 2)
        .attr('y', d => (d.y1 - d.y0) / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('fill', colors.text)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .each(function(d) {
          const text = d3.select(this)
          const cellWidth = d.x1 - d.x0
          const cellHeight = d.y1 - d.y0
          
          // Only show label if cell is large enough
          if (cellWidth > 60 && cellHeight > 30) {
            const words = d.data.name.split(' ')
            let line = ''
            let lineNumber = 0
            const lineHeight = 14
            const maxLines = Math.floor(cellHeight / lineHeight) - (showPercentages ? 1 : 0)
            
            text.text('') // Clear any existing text
            
            for (const word of words) {
              const testLine = line + word + ' '
              const testWidth = testLine.length * 7 // Approximate character width
              
              if (testWidth > cellWidth - 10 && line !== '') {
                if (lineNumber < maxLines - 1) {
                  text.append('tspan')
                    .attr('x', (d.x1 - d.x0) / 2)
                    .attr('dy', lineNumber === 0 ? `-${lineHeight * (maxLines - 1) / 2}px` : `${lineHeight}px`)
                    .text(line.trim())
                  line = word + ' '
                  lineNumber++
                } else {
                  break
                }
              } else {
                line = testLine
              }
            }
            
            if (line.trim() && lineNumber < maxLines) {
              text.append('tspan')
                .attr('x', (d.x1 - d.x0) / 2)
                .attr('dy', lineNumber === 0 ? `-${lineHeight * (maxLines - 1) / 2}px` : `${lineHeight}px`)
                .text(line.trim())
            }
            
            // Add percentage if enabled
            if (showPercentages && cellHeight > 50) {
              text.append('tspan')
                .attr('x', (d.x1 - d.x0) / 2)
                .attr('dy', `${lineHeight}px`)
                .style('font-size', '10px')
                .style('font-weight', 'normal')
                .style('opacity', 0.8)
                .text(formatPercent(d.data.percentage / 100))
            }
          }
        })
    }

    // Add animation
    cell.style('opacity', 0)
      .transition()
      .duration(750)
      .delay((d, i) => i * 50)
      .style('opacity', 1)

  }, [data, currentLevel, breadcrumb, showLabels, showPercentages, theme, createHierarchy, getColorForCategory])

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

  const navigateUp = () => {
    if (breadcrumb.length > 0) {
      const newBreadcrumb = [...breadcrumb]
      const previousLevel = newBreadcrumb.pop()
      setBreadcrumb(newBreadcrumb)
      setCurrentLevel(previousLevel || null)
    } else {
      setCurrentLevel(null)
      setBreadcrumb([])
    }
  }

  const navigateToRoot = () => {
    setCurrentLevel(null)
    setBreadcrumb([])
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
            Failed to load asset allocation data
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <CardDescription>Interactive treemap of portfolio allocation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No asset allocation data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayData = currentLevel ? (currentLevel.children || []) : data
  const totalValue = displayData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Asset Allocation
              {currentLevel && (
                <span className="text-sm font-normal text-muted-foreground">
                  - {currentLevel.name}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Interactive treemap showing portfolio allocation. Total: {formatCurrency(totalValue)}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="labels" className="text-sm">Labels</Label>
              <Switch 
                id="labels"
                checked={showLabels}
                onCheckedChange={setShowLabels}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="percentages" className="text-sm">%</Label>
              <Switch 
                id="percentages"
                checked={showPercentages}
                onCheckedChange={setShowPercentages}
              />
            </div>

            {(currentLevel || breadcrumb.length > 0) && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={navigateUp}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={navigateToRoot}>
                  <Home className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        {(currentLevel || breadcrumb.length > 0) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <button 
              onClick={navigateToRoot}
              className="hover:text-foreground transition-colors"
            >
              Portfolio
            </button>
            {breadcrumb.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                <span>/</span>
                <button 
                  onClick={() => {
                    const newBreadcrumb = breadcrumb.slice(0, index + 1)
                    setBreadcrumb(newBreadcrumb)
                    setCurrentLevel(item)
                  }}
                  className="hover:text-foreground transition-colors"
                >
                  {item.name}
                </button>
              </span>
            ))}
            {currentLevel && (
              <span className="flex items-center gap-2">
                <span>/</span>
                <span className="text-foreground font-medium">{currentLevel.name}</span>
              </span>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div ref={containerRef} className="w-full h-80">
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            style={{ overflow: 'visible' }}
          />
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          Hover for details • Click to drill down into categories
        </div>
      </CardContent>
    </Card>
  )
}
