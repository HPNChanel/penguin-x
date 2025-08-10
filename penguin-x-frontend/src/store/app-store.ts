import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role?: string
}

export interface AppState {
  // User state
  currentUser: User | null
  isAuthenticated: boolean
  
  // Theme state
  theme: "light" | "dark"
  systemTheme: boolean
  highContrast: boolean
  
  // UI state
  isLoading: boolean
  loadingMessage?: string
  sidebarOpen: boolean
  
  // Finance state
  selectedMonth: number
  selectedYear: number
  
  // Actions
  setUser: (user: User) => void
  logout: () => void
  toggleTheme: () => void
  setTheme: (theme: "light" | "dark") => void
  setSystemTheme: (enabled: boolean) => void
  setHighContrast: (enabled: boolean) => void
  setLoading: (loading: boolean, message?: string) => void
  setSidebarOpen: (open: boolean) => void
  setSelectedMonth: (month: number) => void
  setSelectedYear: (year: number) => void
}

// Create the store with persistence
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      theme: "dark",
      systemTheme: false,
      highContrast: false,
      isLoading: false,
      loadingMessage: undefined,
      sidebarOpen: false,
      selectedMonth: new Date().getMonth() + 1,
      selectedYear: new Date().getFullYear(),

      // User actions
      setUser: (user: User) => {
        set({ 
          currentUser: user, 
          isAuthenticated: true 
        })
      },

      logout: () => {
        set({ 
          currentUser: null, 
          isAuthenticated: false 
        })
      },

      // Theme actions
      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme = currentTheme === "light" ? "dark" : "light"
        set({ theme: newTheme })
        
        // Update DOM class for theme
        const root = window.document.documentElement
        root.classList.remove("light", "dark")
        root.classList.add(newTheme)
      },

      setTheme: (theme: "light" | "dark") => {
        set({ theme })
        
        // Update DOM class for theme
        const root = window.document.documentElement
        root.classList.remove("light", "dark")
        root.classList.add(theme)
      },

      setSystemTheme: (enabled: boolean) => {
        set({ systemTheme: enabled })
        if (enabled) {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
            .matches ? "dark" : "light"
          get().setTheme(systemTheme)
        }
      },

      setHighContrast: (enabled: boolean) => {
        set({ highContrast: enabled })
        const root = window.document.documentElement
        if (enabled) {
          root.classList.add("high-contrast")
        } else {
          root.classList.remove("high-contrast")
        }
      },

      // UI actions
      setLoading: (loading: boolean, message?: string) => {
        set({ isLoading: loading, loadingMessage: message })
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open })
      },

      // Finance actions
      setSelectedMonth: (month: number) => {
        set({ selectedMonth: month })
      },

      setSelectedYear: (year: number) => {
        set({ selectedYear: year })
      },
    }),
    {
      name: 'penguin-x-storage', // Storage key
      storage: createJSONStorage(() => localStorage),
      // Only persist certain fields
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        systemTheme: state.systemTheme,
        highContrast: state.highContrast,
        selectedMonth: state.selectedMonth,
        selectedYear: state.selectedYear,
      }),
    }
  )
)

// Helper hooks for specific parts of the store
export const useUser = () => useAppStore((state) => ({
  currentUser: state.currentUser,
  isAuthenticated: state.isAuthenticated,
  setUser: state.setUser,
  logout: state.logout,
}))

export const useTheme = () => useAppStore((state) => ({
  theme: state.theme,
  toggleTheme: state.toggleTheme,
  setTheme: state.setTheme,
}))

export const useFinanceFilters = () => useAppStore((state) => ({
  selectedMonth: state.selectedMonth,
  selectedYear: state.selectedYear,
  setSelectedMonth: state.setSelectedMonth,
  setSelectedYear: state.setSelectedYear,
}))

export const useLoading = () => useAppStore((state) => ({
  isLoading: state.isLoading,
  loadingMessage: state.loadingMessage,
  setLoading: state.setLoading,
}))

export const useUI = () => useAppStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  setSidebarOpen: state.setSidebarOpen,
  isLoading: state.isLoading,
  loadingMessage: state.loadingMessage,
  setLoading: state.setLoading,
}))

export const useEnhancedTheme = () => useAppStore((state) => ({
  theme: state.theme,
  systemTheme: state.systemTheme,
  highContrast: state.highContrast,
  toggleTheme: state.toggleTheme,
  setTheme: state.setTheme,
  setSystemTheme: state.setSystemTheme,
  setHighContrast: state.setHighContrast,
}))

// Initialize theme on store creation
const initializeTheme = () => {
  const { theme } = useAppStore.getState()
  const root = window.document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(theme)
}

// Initialize theme when the module loads
if (typeof window !== 'undefined') {
  initializeTheme()
}
