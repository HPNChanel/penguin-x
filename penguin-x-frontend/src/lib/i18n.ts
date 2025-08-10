import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        overview: 'Overview',
        finance: 'Finance',
        academy: 'Academy',
        invest: 'Invest',
        charts: 'Charts',
        profile: 'Profile',
        logout: 'Log out',
        skipToMain: 'Skip to main content',
        menu: 'Menu',
        openMenu: 'Open menu',
        closeMenu: 'Close menu'
      },
      
      // Common UI
      common: {
        loading: 'Loading...',
        retry: 'Try again',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        export: 'Export',
        import: 'Import',
        refresh: 'Refresh'
      },
      
      // States
      states: {
        loading: {
          title: 'Loading...',
          description: 'Please wait while we fetch your data.'
        },
        error: {
          title: 'Something went wrong',
          description: 'We encountered an error while loading your data.',
          networkError: 'Network error. Please check your connection.',
          serverError: 'Server error. Please try again later.',
          notFound: 'The requested resource was not found.'
        },
        empty: {
          title: 'No data available',
          description: 'There is no data to display at the moment.',
          noResults: 'No results found for your search.',
          noTransactions: 'No transactions found.',
          noInvestments: 'No investments found.'
        }
      },
      
      // Auth
      auth: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        firstName: 'First Name',
        lastName: 'Last Name',
        confirmPassword: 'Confirm Password',
        forgotPassword: 'Forgot password?',
        rememberMe: 'Remember me',
        signIn: 'Sign in',
        signUp: 'Sign up',
        createAccount: 'Create an account',
        haveAccount: 'Already have an account?',
        noAccount: "Don't have an account?",
        welcomeBack: 'Welcome back',
        getStarted: 'Get started with Penguin X'
      },
      
      // Dashboard
      dashboard: {
        welcome: 'Welcome back, {{name}}',
        totalBalance: 'Total Balance',
        monthlyIncome: 'Monthly Income',
        monthlyExpenses: 'Monthly Expenses',
        netWorth: 'Net Worth',
        recentTransactions: 'Recent Transactions',
        portfolioPerformance: 'Portfolio Performance',
        quickActions: 'Quick Actions'
      },
      
      // Finance
      finance: {
        title: 'Finance',
        transactions: 'Transactions',
        categories: 'Categories',
        budgets: 'Budgets',
        reports: 'Reports',
        addTransaction: 'Add Transaction',
        income: 'Income',
        expense: 'Expense',
        amount: 'Amount',
        category: 'Category',
        date: 'Date',
        description: 'Description',
        balance: 'Balance'
      },
      
      // Investment
      invest: {
        title: 'Investment',
        portfolio: 'Portfolio',
        holdings: 'Holdings',
        performance: 'Performance',
        analysis: 'Analysis',
        addInvestment: 'Add Investment',
        symbol: 'Symbol',
        shares: 'Shares',
        price: 'Price',
        value: 'Value',
        gain: 'Gain',
        loss: 'Loss',
        totalValue: 'Total Value',
        totalGain: 'Total Gain'
      },
      
      // Academy
      academy: {
        title: 'Academy',
        courses: 'Courses',
        lessons: 'Lessons',
        progress: 'Progress',
        certificates: 'Certificates',
        learnMore: 'Learn more',
        inDevelopment: 'Under Development',
        comingSoon: 'Coming Soon'
      },
      
      // Settings
      settings: {
        theme: 'Theme',
        language: 'Language',
        notifications: 'Notifications',
        privacy: 'Privacy',
        security: 'Security',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',
        systemMode: 'System Mode',
        highContrast: 'High Contrast'
      },
      
      // Accessibility
      a11y: {
        loading: 'Content is loading',
        error: 'An error occurred',
        mainContent: 'Main content',
        navigation: 'Navigation',
        search: 'Search',
        userMenu: 'User menu',
        toggleTheme: 'Toggle theme',
        closeDialog: 'Close dialog',
        previousPage: 'Go to previous page',
        nextPage: 'Go to next page',
        sortBy: 'Sort by {{field}}',
        filterBy: 'Filter by {{field}}',
        tableCaption: 'Data table with {{count}} rows'
      }
    }
  },
  vi: {
    translation: {
      // Navigation
      nav: {
        overview: 'Tổng quan',
        finance: 'Tài chính',
        academy: 'Học viện',
        invest: 'Đầu tư',
        charts: 'Biểu đồ',
        profile: 'Hồ sơ',
        logout: 'Đăng xuất',
        skipToMain: 'Bỏ qua đến nội dung chính',
        menu: 'Menu',
        openMenu: 'Mở menu',
        closeMenu: 'Đóng menu'
      },
      
      // Common UI
      common: {
        loading: 'Đang tải...',
        retry: 'Thử lại',
        error: 'Lỗi',
        success: 'Thành công',
        cancel: 'Hủy',
        confirm: 'Xác nhận',
        save: 'Lưu',
        edit: 'Chỉnh sửa',
        delete: 'Xóa',
        close: 'Đóng',
        back: 'Quay lại',
        next: 'Tiếp theo',
        previous: 'Trước đó',
        search: 'Tìm kiếm',
        filter: 'Lọc',
        sort: 'Sắp xếp',
        export: 'Xuất',
        import: 'Nhập',
        refresh: 'Làm mới'
      },
      
      // States
      states: {
        loading: {
          title: 'Đang tải...',
          description: 'Vui lòng đợi trong khi chúng tôi tải dữ liệu của bạn.'
        },
        error: {
          title: 'Có lỗi xảy ra',
          description: 'Chúng tôi gặp lỗi khi tải dữ liệu của bạn.',
          networkError: 'Lỗi mạng. Vui lòng kiểm tra kết nối của bạn.',
          serverError: 'Lỗi máy chủ. Vui lòng thử lại sau.',
          notFound: 'Không tìm thấy tài nguyên được yêu cầu.'
        },
        empty: {
          title: 'Không có dữ liệu',
          description: 'Hiện tại không có dữ liệu để hiển thị.',
          noResults: 'Không tìm thấy kết quả nào.',
          noTransactions: 'Không tìm thấy giao dịch nào.',
          noInvestments: 'Không tìm thấy khoản đầu tư nào.'
        }
      },
      
      // Auth
      auth: {
        login: 'Đăng nhập',
        register: 'Đăng ký',
        logout: 'Đăng xuất',
        email: 'Email',
        password: 'Mật khẩu',
        firstName: 'Tên',
        lastName: 'Họ',
        confirmPassword: 'Xác nhận mật khẩu',
        forgotPassword: 'Quên mật khẩu?',
        rememberMe: 'Ghi nhớ đăng nhập',
        signIn: 'Đăng nhập',
        signUp: 'Đăng ký',
        createAccount: 'Tạo tài khoản',
        haveAccount: 'Đã có tài khoản?',
        noAccount: 'Chưa có tài khoản?',
        welcomeBack: 'Chào mừng trở lại',
        getStarted: 'Bắt đầu với Penguin X'
      },
      
      // Dashboard
      dashboard: {
        welcome: 'Chào mừng trở lại, {{name}}',
        totalBalance: 'Tổng số dư',
        monthlyIncome: 'Thu nhập hàng tháng',
        monthlyExpenses: 'Chi phí hàng tháng',
        netWorth: 'Tài sản ròng',
        recentTransactions: 'Giao dịch gần đây',
        portfolioPerformance: 'Hiệu suất danh mục',
        quickActions: 'Hành động nhanh'
      },
      
      // Finance
      finance: {
        title: 'Tài chính',
        transactions: 'Giao dịch',
        categories: 'Danh mục',
        budgets: 'Ngân sách',
        reports: 'Báo cáo',
        addTransaction: 'Thêm giao dịch',
        income: 'Thu nhập',
        expense: 'Chi phí',
        amount: 'Số tiền',
        category: 'Danh mục',
        date: 'Ngày',
        description: 'Mô tả',
        balance: 'Số dư'
      },
      
      // Investment
      invest: {
        title: 'Đầu tư',
        portfolio: 'Danh mục đầu tư',
        holdings: 'Cổ phiếu sở hữu',
        performance: 'Hiệu suất',
        analysis: 'Phân tích',
        addInvestment: 'Thêm khoản đầu tư',
        symbol: 'Mã cổ phiếu',
        shares: 'Số cổ phiếu',
        price: 'Giá',
        value: 'Giá trị',
        gain: 'Lãi',
        loss: 'Lỗ',
        totalValue: 'Tổng giá trị',
        totalGain: 'Tổng lãi'
      },
      
      // Academy
      academy: {
        title: 'Học viện',
        courses: 'Khóa học',
        lessons: 'Bài học',
        progress: 'Tiến độ',
        certificates: 'Chứng chỉ',
        learnMore: 'Tìm hiểu thêm',
        inDevelopment: 'Đang phát triển',
        comingSoon: 'Sắp ra mắt'
      },
      
      // Settings
      settings: {
        theme: 'Giao diện',
        language: 'Ngôn ngữ',
        notifications: 'Thông báo',
        privacy: 'Quyền riêng tư',
        security: 'Bảo mật',
        lightMode: 'Chế độ sáng',
        darkMode: 'Chế độ tối',
        systemMode: 'Theo hệ thống',
        highContrast: 'Độ tương phản cao'
      },
      
      // Accessibility
      a11y: {
        loading: 'Nội dung đang tải',
        error: 'Đã xảy ra lỗi',
        mainContent: 'Nội dung chính',
        navigation: 'Điều hướng',
        search: 'Tìm kiếm',
        userMenu: 'Menu người dùng',
        toggleTheme: 'Chuyển đổi giao diện',
        closeDialog: 'Đóng hộp thoại',
        previousPage: 'Đi đến trang trước',
        nextPage: 'Đi đến trang tiếp theo',
        sortBy: 'Sắp xếp theo {{field}}',
        filterBy: 'Lọc theo {{field}}',
        tableCaption: 'Bảng dữ liệu với {{count}} hàng'
      }
    }
  }
}

// Number and currency formatting per locale
export const numberFormat = {
  en: {
    currency: 'USD',
    currencyDisplay: 'symbol' as const,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  },
  vi: {
    currency: 'VND',
    currencyDisplay: 'symbol' as const,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }
}

// Date formatting per locale
export const dateFormat = {
  en: {
    short: { year: 'numeric', month: 'short', day: 'numeric' } as const,
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' } as const,
    time: { hour: '2-digit', minute: '2-digit' } as const
  },
  vi: {
    short: { year: 'numeric', month: 'short', day: 'numeric' } as const,
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' } as const,
    time: { hour: '2-digit', minute: '2-digit', hour12: false } as const
  }
}

// Helper functions for formatting
export const formatCurrency = (amount: number, locale: string = 'en') => {
  const config = numberFormat[locale as keyof typeof numberFormat] || numberFormat.en
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: config.currency,
    currencyDisplay: config.currencyDisplay,
    minimumFractionDigits: config.minimumFractionDigits,
    maximumFractionDigits: config.maximumFractionDigits
  }).format(amount)
}

export const formatNumber = (number: number, locale: string = 'en') => {
  return new Intl.NumberFormat(locale).format(number)
}

export const formatDate = (date: Date, locale: string = 'en', format: 'short' | 'long' | 'time' = 'short') => {
  const config = dateFormat[locale as keyof typeof dateFormat] || dateFormat.en
  return new Intl.DateTimeFormat(locale, config[format]).format(date)
}

export const formatPercent = (value: number, locale: string = 'en') => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(value / 100)
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'penguin-x-language'
    },
    
    interpolation: {
      escapeValue: false // React already escapes values
    },
    
    react: {
      useSuspense: false // Avoid suspense for SSR compatibility
    }
  })

export default i18n
