import { 
  PortfolioDataPoint, 
  RiskReturnPoint, 
  AssetAllocation, 
  CashflowPoint, 
  DrawdownPoint, 
  BenchmarkPoint,
  generatePortfolioData,
  generateRiskReturnData,
  generateAssetAllocationData,
  calculateDrawdown
} from './chart-utils'

// Portfolio Performance Mock Data
export const getPortfolioPerformanceData = (): PortfolioDataPoint[] => {
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 2)
  const endDate = new Date()
  
  return generatePortfolioData(startDate, endDate, 500000)
}

// Risk Return Scatter Mock Data
export const getRiskReturnData = (): RiskReturnPoint[] => {
  return generateRiskReturnData()
}

// Asset Allocation Mock Data
export const getAssetAllocationData = (): AssetAllocation[] => {
  return generateAssetAllocationData()
}

// Cashflow Waterfall Mock Data
export const getCashflowData = (): CashflowPoint[] => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  
  let cumulative = 0
  return months.map(month => {
    const inflow = Math.random() * 50000 + 80000
    const outflow = Math.random() * 40000 + 60000
    const net = inflow - outflow
    cumulative += net
    
    return {
      period: month,
      inflow,
      outflow,
      net,
      cumulative
    }
  })
}

// Drawdown Curve Mock Data
export const getDrawdownData = (): DrawdownPoint[] => {
  const portfolioData = getPortfolioPerformanceData()
  const values = portfolioData.map(d => d.value)
  const drawdowns = calculateDrawdown(values)
  
  return portfolioData.map((d, i) => ({
    date: d.date,
    value: d.value,
    peak: Math.max(...values.slice(0, i + 1)),
    drawdown: drawdowns[i] * 100,
    drawdownPercent: drawdowns[i]
  }))
}

// Benchmark Comparison Mock Data
export const getBenchmarkData = (): BenchmarkPoint[] => {
  const portfolioData = getPortfolioPerformanceData()
  const initialValue = portfolioData[0].value
  
  return portfolioData.map(d => {
    const portfolioReturn = (d.value - initialValue) / initialValue
    const sp500Return = portfolioReturn + (Math.random() - 0.5) * 0.1
    const bondReturn = portfolioReturn * 0.6 + (Math.random() - 0.5) * 0.05
    
    return {
      date: d.date,
      portfolio: portfolioReturn * 100,
      benchmark1: sp500Return * 100,
      benchmark2: bondReturn * 100,
      excess: (portfolioReturn - sp500Return) * 100
    }
  })
}

// Market data for financial indicators
export const getMarketIndicators = () => {
  return {
    sp500: {
      value: 4650.25,
      change: 23.45,
      changePercent: 0.51
    },
    nasdaq: {
      value: 14521.30,
      change: -45.67,
      changePercent: -0.31
    },
    dow: {
      value: 35847.25,
      change: 156.89,
      changePercent: 0.44
    },
    vix: {
      value: 18.45,
      change: -1.23,
      changePercent: -6.25
    },
    treasury10y: {
      value: 4.25,
      change: 0.05,
      changePercent: 1.19
    },
    gold: {
      value: 2045.30,
      change: 12.45,
      changePercent: 0.61
    },
    oil: {
      value: 78.45,
      change: -2.34,
      changePercent: -2.89
    },
    bitcoin: {
      value: 42350.25,
      change: 1250.67,
      changePercent: 3.04
    }
  }
}

// Sector performance data
export const getSectorPerformance = () => {
  const sectors = [
    'Technology', 'Healthcare', 'Financial Services', 'Consumer Cyclical',
    'Communication Services', 'Industrials', 'Consumer Defensive',
    'Energy', 'Utilities', 'Real Estate', 'Basic Materials'
  ]
  
  return sectors.map(sector => ({
    name: sector,
    return1d: (Math.random() - 0.5) * 4,
    return1w: (Math.random() - 0.5) * 8,
    return1m: (Math.random() - 0.5) * 15,
    return3m: (Math.random() - 0.5) * 25,
    return1y: (Math.random() - 0.3) * 40
  }))
}

// Top movers data
export const getTopMovers = () => {
  const symbols = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
    'JPM', 'JNJ', 'PG', 'UNH', 'HD', 'BAC', 'DIS', 'ADBE'
  ]
  
  const gainers = symbols.slice(0, 8).map(symbol => ({
    symbol,
    name: `${symbol} Inc.`,
    price: Math.random() * 500 + 50,
    change: Math.random() * 20 + 5,
    changePercent: Math.random() * 15 + 2
  }))
  
  const losers = symbols.slice(8).map(symbol => ({
    symbol,
    name: `${symbol} Inc.`,
    price: Math.random() * 500 + 50,
    change: -(Math.random() * 20 + 5),
    changePercent: -(Math.random() * 15 + 2)
  }))
  
  return { gainers, losers }
}

// Economic calendar events
export const getEconomicEvents = () => {
  const events = [
    { time: '08:30', event: 'CPI m/m', importance: 'high', previous: '0.4%', forecast: '0.3%', actual: null },
    { time: '10:00', event: 'Consumer Confidence', importance: 'medium', previous: '103.1', forecast: '104.0', actual: null },
    { time: '14:00', event: 'FOMC Minutes', importance: 'high', previous: '-', forecast: '-', actual: null },
    { time: '16:00', event: 'Crude Oil Inventories', importance: 'medium', previous: '-2.1M', forecast: '-1.5M', actual: null }
  ]
  
  return events
}

// Portfolio analytics summary
export const getPortfolioAnalytics = () => {
  return {
    totalValue: 1250000,
    dayChange: 15250,
    dayChangePercent: 1.23,
    totalReturn: 185250,
    totalReturnPercent: 17.41,
    sharpeRatio: 1.34,
    volatility: 12.5,
    maxDrawdown: -8.9,
    beta: 0.95,
    alpha: 2.3,
    correlation: 0.87,
    diversificationRatio: 0.72,
    var95: -2.1,
    cvar95: -3.4
  }
}

// Holdings data for detailed view
export const getHoldingsData = () => {
  const holdings = [
    { symbol: 'AAPL', name: 'Apple Inc.', shares: 500, price: 175.25, value: 87625, weight: 7.01, dayChange: 2.45 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 400, price: 340.50, value: 136200, weight: 10.90, dayChange: 1.85 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 200, price: 125.75, value: 25150, weight: 2.01, dayChange: -0.75 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', shares: 300, price: 145.30, value: 43590, weight: 3.49, dayChange: 3.20 },
    { symbol: 'TSLA', name: 'Tesla Inc.', shares: 150, price: 245.80, value: 36870, weight: 2.95, dayChange: -1.95 },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF', shares: 1000, price: 465.25, value: 465250, weight: 37.22, dayChange: 0.85 },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', shares: 500, price: 375.40, value: 187700, weight: 15.02, dayChange: 1.25 },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', shares: 800, price: 225.60, value: 180480, weight: 14.44, dayChange: 0.95 },
    { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', shares: 1200, price: 75.85, value: 91020, weight: 7.28, dayChange: -0.15 }
  ]
  
  return holdings
}
