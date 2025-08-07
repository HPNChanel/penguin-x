import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Target, PieChart } from "lucide-react"

export function InvestPage() {
  const portfolio = [
    { symbol: "AAPL", name: "Apple Inc.", shares: 50, price: 150.25, change: 2.4 },
    { symbol: "GOOGL", name: "Alphabet Inc.", shares: 25, price: 2800.50, change: -1.2 },
    { symbol: "TSLA", name: "Tesla Inc.", shares: 30, price: 220.75, change: 5.8 },
    { symbol: "MSFT", name: "Microsoft Corp.", shares: 40, price: 380.90, change: 1.5 },
  ]

  const totalValue = portfolio.reduce((sum, stock) => sum + (stock.shares * stock.price), 0)
  const totalChange = portfolio.reduce((sum, stock) => sum + (stock.shares * stock.price * stock.change / 100), 0)

  const investments = [
    {
      title: "Growth Portfolio",
      description: "High-growth technology stocks",
      value: "$25,000",
      change: "+12.5%",
      risk: "High"
    },
    {
      title: "Dividend Portfolio", 
      description: "Stable dividend-paying stocks",
      value: "$18,500",
      change: "+6.2%",
      risk: "Medium"
    },
    {
      title: "Bond Portfolio",
      description: "Government and corporate bonds",
      value: "$12,000",
      change: "+3.1%",
      risk: "Low"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invest</h1>
          <p className="text-muted-foreground">
            Track your investments and discover new opportunities.
          </p>
        </div>
        <Button>
          <Target className="mr-2 h-4 w-4" />
          Make Investment
        </Button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Your total investment value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Change</CardTitle>
            {totalChange >= 0 ? 
              <TrendingUp className="h-4 w-4 text-green-600" /> : 
              <TrendingDown className="h-4 w-4 text-red-600" />
            }
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Daily change in value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Holdings</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio.length}</div>
            <p className="text-xs text-muted-foreground">
              Different securities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Investment Portfolios */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Investment Portfolios</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {investments.map((investment) => (
            <Card key={investment.title}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{investment.title}</CardTitle>
                  <Badge variant={
                    investment.risk === "Low" ? "secondary" :
                    investment.risk === "Medium" ? "default" : "destructive"
                  }>
                    {investment.risk} Risk
                  </Badge>
                </div>
                <CardDescription>{investment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{investment.value}</div>
                  <div className="text-green-600 font-semibold">{investment.change}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stock Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Holdings</CardTitle>
          <CardDescription>
            Your current stock positions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolio.map((stock) => (
              <div key={stock.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{stock.symbol}</p>
                    <p className="text-sm text-muted-foreground">{stock.name}</p>
                    <p className="text-sm text-muted-foreground">{stock.shares} shares</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${stock.price}</div>
                  <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${(stock.shares * stock.price).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
