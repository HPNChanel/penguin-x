import * as d3 from 'd3'
import { format } from 'date-fns'

// Chart data types
export interface PortfolioDataPoint {
  date: Date
  value: number
  change: number
  changePercent: number
  ma7?: number
  ma30?: number
  drawdown?: number
}

export interface RiskReturnPoint {
  name: string
  risk: number
  return: number
  sharpe: number
  category: string
}

export interface AssetAllocation {
  name: string
  value: number
  percentage: number
  children?: AssetAllocation[]
  category: string
  color?: string
}

export interface CashflowPoint {
  period: string
  inflow: number
  outflow: number
  net: number
  cumulative: number
}

export interface DrawdownPoint {
  date: Date
  value: number
  peak: number
  drawdown: number
  drawdownPercent: number
}

export interface BenchmarkPoint {
  date: Date
  portfolio: number
  benchmark1: number
  benchmark2?: number
  excess?: number
}

// Chart color schemes
export const chartColors = {
  light: {
    primary: '#2563eb',
    secondary: '#7c3aed',
    success: '#16a34a',
    danger: '#dc2626',
    warning: '#ea580c',
    info: '#0891b2',
    muted: '#6b7280',
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    text: '#1e293b',
    textMuted: '#64748b',
  },
  dark: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f97316',
    info: '#06b6d4',
    muted: '#9ca3af',
    background: '#0f172a',
    surface: '#1e293b',
    border: '#334155',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
  }
}

// Utility functions
export const formatCurrency = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export const formatPercent = (value: number, decimals = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`
}

export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
}

export const formatDate = (date: Date, formatStr = 'MMM dd, yyyy'): string => {
  return format(date, formatStr)
}

// Moving average calculation
export const calculateMovingAverage = (data: number[], window: number): number[] => {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(NaN)
    } else {
      const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0)
      result.push(sum / window)
    }
  }
  return result
}

// Drawdown calculation
export const calculateDrawdown = (values: number[]): number[] => {
  const drawdowns: number[] = []
  let peak = values[0]
  
  for (const value of values) {
    if (value > peak) {
      peak = value
    }
    const drawdown = (value - peak) / peak
    drawdowns.push(drawdown)
  }
  
  return drawdowns
}

// Sharpe ratio calculation
export const calculateSharpeRatio = (returns: number[], riskFreeRate = 0.02): number => {
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / returns.length
  const standardDeviation = Math.sqrt(variance)
  
  return (meanReturn - riskFreeRate) / standardDeviation
}

// Chart dimension utilities
export const getChartDimensions = (containerWidth: number, containerHeight: number) => {
  const margin = { top: 20, right: 80, bottom: 60, left: 80 }
  const width = containerWidth - margin.left - margin.right
  const height = containerHeight - margin.top - margin.bottom
  
  return { width, height, margin }
}

// Color scale utilities
export const getColorScale = (domain: string[], theme: 'light' | 'dark') => {
  const colors = theme === 'dark' ? 
    ['#3b82f6', '#8b5cf6', '#22c55e', '#ef4444', '#f97316', '#06b6d4'] :
    ['#2563eb', '#7c3aed', '#16a34a', '#dc2626', '#ea580c', '#0891b2']
  
  return d3.scaleOrdinal<string>()
    .domain(domain)
    .range(colors)
}

// Tooltip utilities
export const createTooltip = (className: string) => {
  return d3.select('body')
    .append('div')
    .attr('class', `tooltip ${className}`)
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('pointer-events', 'none')
    .style('background', 'rgba(0, 0, 0, 0.8)')
    .style('color', 'white')
    .style('padding', '8px 12px')
    .style('border-radius', '4px')
    .style('font-size', '12px')
    .style('z-index', '1000')
}

// Brush utilities
export const createBrush = (width: number, height: number, onBrush: (selection: [number, number] | null) => void) => {
  return d3.brushX()
    .extent([[0, 0], [width, height]])
    .on('brush end', (event) => {
      const selection = event.selection
      if (selection) {
        onBrush([selection[0], selection[1]])
      } else {
        onBrush(null)
      }
    })
}

// Zoom utilities
export const createZoom = (onZoom: (transform: d3.ZoomTransform) => void) => {
  return d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 10])
    .on('zoom', (event) => {
      onZoom(event.transform)
    })
}

// Animation utilities
export const animateElement = (element: d3.Selection<any, any, any, any>, duration = 750) => {
  return element
    .transition()
    .duration(duration)
    .ease(d3.easeQuadInOut)
}

// Responsive utilities
export const useChartResize = (ref: React.RefObject<HTMLDivElement>, callback: (width: number, height: number) => void) => {
  React.useEffect(() => {
    if (!ref.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        callback(width, height)
      }
    })

    resizeObserver.observe(ref.current)

    return () => resizeObserver.disconnect()
  }, [ref, callback])
}

// Data generation utilities for mock data
export const generatePortfolioData = (startDate: Date, endDate: Date, initialValue = 100000): PortfolioDataPoint[] => {
  const data: PortfolioDataPoint[] = []
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  
  let currentValue = initialValue
  let peak = initialValue
  
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    const change = (Math.random() - 0.48) * 0.02 // Slight upward bias
    currentValue *= (1 + change)
    
    if (currentValue > peak) {
      peak = currentValue
    }
    
    const drawdown = (currentValue - peak) / peak
    
    data.push({
      date,
      value: currentValue,
      change: change * 100,
      changePercent: change,
      drawdown: drawdown * 100
    })
  }
  
  // Calculate moving averages
  const values = data.map(d => d.value)
  const ma7 = calculateMovingAverage(values, 7)
  const ma30 = calculateMovingAverage(values, 30)
  
  data.forEach((d, i) => {
    d.ma7 = ma7[i]
    d.ma30 = ma30[i]
  })
  
  return data
}

export const generateRiskReturnData = (): RiskReturnPoint[] => {
  const categories = ['Stocks', 'Bonds', 'Commodities', 'Real Estate', 'Crypto']
  const data: RiskReturnPoint[] = []
  
  categories.forEach(category => {
    for (let i = 0; i < 5; i++) {
      const risk = Math.random() * 0.3 + 0.05
      const baseReturn = risk * 3 + (Math.random() - 0.5) * 0.1
      const returns = Array.from({ length: 12 }, () => (Math.random() - 0.5) * risk * 2 + baseReturn / 12)
      const sharpe = calculateSharpeRatio(returns)
      
      data.push({
        name: `${category} ${i + 1}`,
        risk: risk * 100,
        return: baseReturn * 100,
        sharpe,
        category
      })
    }
  })
  
  return data
}

export const generateAssetAllocationData = (): AssetAllocation[] => {
  return [
    {
      name: 'Equities',
      value: 600000,
      percentage: 60,
      category: 'stocks',
      children: [
        { name: 'US Large Cap', value: 300000, percentage: 30, category: 'us-large' },
        { name: 'US Small Cap', value: 150000, percentage: 15, category: 'us-small' },
        { name: 'International', value: 150000, percentage: 15, category: 'international' }
      ]
    },
    {
      name: 'Fixed Income',
      value: 250000,
      percentage: 25,
      category: 'bonds',
      children: [
        { name: 'Government Bonds', value: 150000, percentage: 15, category: 'govt-bonds' },
        { name: 'Corporate Bonds', value: 100000, percentage: 10, category: 'corp-bonds' }
      ]
    },
    {
      name: 'Alternatives',
      value: 100000,
      percentage: 10,
      category: 'alternatives',
      children: [
        { name: 'Real Estate', value: 60000, percentage: 6, category: 'real-estate' },
        { name: 'Commodities', value: 40000, percentage: 4, category: 'commodities' }
      ]
    },
    {
      name: 'Cash',
      value: 50000,
      percentage: 5,
      category: 'cash'
    }
  ]
}
