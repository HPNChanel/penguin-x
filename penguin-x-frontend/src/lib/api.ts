import { secureApi } from './secure-api'
import { useAppStore } from '@/store/app-store'
import { safePromise, safeExecute } from './promise-manager'

// Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface User {
  id: string
  email: string
  full_name: string
  is_active: boolean
  is_superuser: boolean
  role: string
  created_at: string
  avatar_url?: string
}

export interface Transaction {
  id: string
  amount: number
  description: string
  type: 'income' | 'expense'
  category: string
  date: string
  created_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  duration: number
  level: string
  lessons_count: number
  enrolled: boolean
}

export interface Lesson {
  id: string
  title: string
  content: string
  video_url?: string
  duration: number
  order: number
  completed: boolean
}

export interface Investment {
  id: string
  asset_name: string
  asset_type: string
  symbol: string
  shares: number
  purchase_price: number
  current_price: number
  value: number
  change_percent: number
}

// Use secure API client (already configured with interceptors, retry logic, etc.)
const api = secureApi

// Auth API functions
export const authAPI = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return safePromise(async () => {
      const data = await api.post<LoginResponse>('/auth/login', credentials)
      
      // Save token to localStorage
      localStorage.setItem('access_token', data.access_token)
      
      return data
    }, { 
      context: 'auth_login',
      timeout: 15000 
    })
  },

  async register(userData: RegisterRequest): Promise<User> {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me')
    return response.data
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('access_token')
    }
  },
}

// Finance API functions
export const financeAPI = {
  async getTransactions(month?: number, year?: number): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams()
      if (month) params.append('month', month.toString())
      if (year) params.append('year', year.toString())
      
      const response = await api.get(`/finance/transactions?${params}`)
      return response.data || []
    } catch (error) {
      console.warn('Failed to fetch transactions:', error)
      return []
    }
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
    const response = await api.post('/finance/transactions', transaction)
    return response.data
  },

  async getExpensesSummary(month?: number, year?: number): Promise<{ income: number; expenses: number }> {
    const params = new URLSearchParams()
    if (month) params.append('month', month.toString())
    if (year) params.append('year', year.toString())
    
    const response = await api.get(`/finance/summary?${params}`)
    return response.data
  },
}

// Dashboard API functions
export const dashboardAPI = {
  async getDashboardStats(): Promise<{
    totalBalance: number;
    totalTransactions: number;
    totalInvestments: number;
    totalCourses: number;
  }> {
    // For now, return zeros since real data endpoints need implementation
    return {
      totalBalance: 0,
      totalTransactions: 0,
      totalInvestments: 0,
      totalCourses: 0
    }
  },

  async getRecentTransactions(limit: number = 5): Promise<Transaction[]> {
    try {
      const response = await api.get(`/finance/transactions?limit=${limit}`)
      return response.data || []
    } catch (error) {
      console.warn('Failed to fetch recent transactions:', error)
      // Return empty array if endpoint fails
      return []
    }
  },
}

// Academy API functions
export const academyAPI = {
  async getCourses(): Promise<Course[]> {
    const response = await api.get('/academy/courses')
    return response.data
  },

  async getCourse(courseId: string): Promise<Course> {
    const response = await api.get(`/academy/courses/${courseId}`)
    return response.data
  },

  async enrollInCourse(courseId: string): Promise<void> {
    await api.post(`/academy/courses/${courseId}/enroll`)
  },

  async getCourseLessons(courseId: string): Promise<Lesson[]> {
    const response = await api.get(`/academy/courses/${courseId}/lessons`)
    return response.data
  },

  async getLesson(courseId: string, lessonId: string): Promise<Lesson> {
    const response = await api.get(`/academy/courses/${courseId}/lessons/${lessonId}`)
    return response.data
  },

  async markLessonComplete(courseId: string, lessonId: string): Promise<void> {
    await api.post(`/academy/courses/${courseId}/lessons/${lessonId}/complete`)
  },
}

// Investment API functions
export const investAPI = {
  async getInvestments(): Promise<Investment[]> {
    try {
      const response = await api.get('/invest/investments')
      return response.data || []
    } catch (error) {
      console.warn('Failed to fetch investments:', error)
      return []
    }
  },

  async getWatchlist(): Promise<Investment[]> {
    try {
      const response = await api.get('/invest/watchlists')
      return response.data || []
    } catch (error) {
      console.warn('Failed to fetch watchlist:', error)
      return []
    }
  },

  async addToWatchlist(symbol: string): Promise<void> {
    await api.post('/invest/watchlists', { symbol })
  },

  async removeFromWatchlist(id: string): Promise<void> {
    await api.delete(`/invest/watchlists/${id}`)
  },

  async getPortfolioSummary(): Promise<{ totalValue: number; totalChange: number; totalChangePercent: number }> {
    // This endpoint doesn't exist in backend yet, return mock data for now
    return {
      totalValue: 0,
      totalChange: 0,
      totalChangePercent: 0
    }
  },
}

// Charts API functions
export const chartsAPI = {
  async getPortfolioPerformance(timeRange?: string) {
    try {
      const params = new URLSearchParams()
      if (timeRange) params.append('timeRange', timeRange)
      
      const response = await api.get(`/charts/portfolio-performance?${params}`)
      return response.data || []
    } catch (error) {
      console.warn('Failed to fetch portfolio performance data:', error)
      return []
    }
  },

  async getRiskReturnData() {
    try {
      const response = await api.get('/charts/risk-return')
      return response.data || []
    } catch (error) {
      console.warn('Failed to fetch risk return data:', error)
      return []
    }
  },

  async getAssetAllocation() {
    try {
      const response = await api.get('/charts/asset-allocation')
      return response.data || []
    } catch (error) {
      console.warn('Failed to fetch asset allocation data:', error)
      return []
    }
  },

  async getCashflowData(period?: string) {
    try {
      const params = new URLSearchParams()
      if (period) params.append('period', period)
      
      const response = await api.get(`/charts/cashflow?${params}`)
      return response.data || []
    } catch (error) {
      console.warn('Failed to fetch cashflow data:', error)
      return []
    }
  },

  async getDrawdownData(timeRange?: string) {
    try {
      const params = new URLSearchParams()
      if (timeRange) params.append('timeRange', timeRange)
      
      const response = await api.get(`/charts/drawdown?${params}`)
      return response.data || []
    } catch (error) {
      console.warn('Failed to fetch drawdown data:', error)
      return []
    }
  },

  async getBenchmarkData(timeRange?: string, benchmarks?: string[]) {
    try {
      const params = new URLSearchParams()
      if (timeRange) params.append('timeRange', timeRange)
      if (benchmarks) benchmarks.forEach(b => params.append('benchmarks', b))
      
      const response = await api.get(`/charts/benchmark-comparison?${params}`)
      return response.data || []
    } catch (error) {
      console.warn('Failed to fetch benchmark data:', error)
      return []
    }
  },
}

export default api
