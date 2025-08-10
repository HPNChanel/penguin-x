import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, CreditCard, BookOpen } from "lucide-react"
import { dashboardAPI, type Transaction } from "@/lib/api"
import { useUser } from "@/store/app-store"
import { DashboardSkeleton } from "@/components/ui/skeleton-layouts"

export function DashboardOverview() {
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalTransactions: 0,
    totalInvestments: 0,
    totalCourses: 0
  })
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const { currentUser } = useUser()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboardStats, transactions] = await Promise.all([
        dashboardAPI.getDashboardStats(),
        dashboardAPI.getRecentTransactions(3)
      ])
      setStats(dashboardStats)
      setRecentTransactions(transactions || [])
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      // Set default values on error
      setStats({
        totalBalance: 0,
        totalTransactions: 0,
        totalInvestments: 0,
        totalCourses: 0
      })
      setRecentTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const dashboardStats = [
    {
      title: "Total Balance",
      value: loading ? "Loading..." : `$${stats.totalBalance.toLocaleString()}`,
      description: "Current account balance",
      icon: DollarSign,
    },
    {
      title: "Investments",
      value: loading ? "Loading..." : stats.totalInvestments.toString(),
      description: "Active investment positions",
      icon: TrendingUp,
    },
    {
      title: "Transactions",
      value: loading ? "Loading..." : stats.totalTransactions.toString(),
      description: "Total transactions",
      icon: CreditCard,
    },
    {
      title: "Courses",
      value: loading ? "Loading..." : stats.totalCourses.toString(),
      description: "Available courses",
      icon: BookOpen,
    },
  ]

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {currentUser?.firstName || 'User'}! Here's what's happening with your account.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 mb-2" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>
              Your financial activity summary
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Financial charts will be available once you add transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest financial activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-y-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <div className="ml-4 space-y-1 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                ))
              ) : recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category}
                      </p>
                    </div>
                    <div className={`ml-auto font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Start by adding your first transaction</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
