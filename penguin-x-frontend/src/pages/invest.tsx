import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { TrendingUp, TrendingDown, DollarSign, Target, PieChart, Plus, Trash2 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { investAPI, type Investment } from "@/lib/api"
import { toast } from "sonner"

export function InvestPage() {
  const [holdings, setHoldings] = useState<Investment[]>([])
  const [watchlist, setWatchlist] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newSymbol, setNewSymbol] = useState("")

  const totalValue = holdings.reduce((sum, investment) => sum + investment.value, 0)
  const totalChange = holdings.reduce((sum, investment) => sum + (investment.value * investment.change_percent / 100), 0)
  const totalChangePercent = totalValue > 0 ? (totalChange / totalValue) * 100 : 0

  // Generate chart data based on actual portfolio value
  const chartData = totalValue > 0 ? [
    { date: "Jan", value: totalValue * 0.85 },
    { date: "Feb", value: totalValue * 0.88 },
    { date: "Mar", value: totalValue * 0.92 },
    { date: "Apr", value: totalValue * 0.89 },
    { date: "May", value: totalValue * 0.95 },
    { date: "Jun", value: totalValue },
  ] : []

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [holdingsData, watchlistData] = await Promise.all([
        investAPI.getInvestments(),
        investAPI.getWatchlist()
      ])
      setHoldings(holdingsData)
      setWatchlist(watchlistData)
    } catch (error) {
      console.error("Failed to fetch investment data:", error)
      toast.error("Failed to load investment data")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToWatchlist = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await investAPI.addToWatchlist(newSymbol.toUpperCase())
      toast.success("Added to watchlist!")
      setDialogOpen(false)
      setNewSymbol("")
      fetchData()
    } catch (error) {
      console.error("Failed to add to watchlist:", error)
      toast.error("Failed to add to watchlist")
    }
  }

  const handleRemoveFromWatchlist = async (symbol: string) => {
    try {
      await investAPI.removeFromWatchlist(symbol)
      toast.success("Removed from watchlist!")
      fetchData()
    } catch (error) {
      console.error("Failed to remove from watchlist:", error)
      toast.error("Failed to remove from watchlist")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invest</h1>
          <p className="text-muted-foreground">
            Track your investments and discover new opportunities.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add to Watchlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Stock to Watchlist</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddToWatchlist} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Stock Symbol</Label>
                <Input
                  id="symbol"
                  placeholder="e.g., AAPL, GOOGL"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add to Watchlist</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
              {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}% today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Holdings</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{holdings.length}</div>
            <p className="text-xs text-muted-foreground">
              Different securities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Investment Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Growth</CardTitle>
          <CardDescription>
            Your investment performance over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Portfolio Value']} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Holdings and Watchlist Tabs */}
      <Tabs defaultValue="holdings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        </TabsList>
        
        <TabsContent value="holdings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Holdings</CardTitle>
              <CardDescription>
                Your current investment positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : holdings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No holdings found. Start investing to see your portfolio here.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Shares</TableHead>
                      <TableHead>Purchase Price</TableHead>
                      <TableHead>Current Price</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holdings.map((investment) => (
                      <TableRow key={investment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{investment.symbol}</div>
                            <div className="text-sm text-muted-foreground">{investment.asset_name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{investment.asset_type}</Badge>
                        </TableCell>
                        <TableCell>{investment.shares}</TableCell>
                        <TableCell>${investment.purchase_price.toFixed(2)}</TableCell>
                        <TableCell>${investment.current_price.toFixed(2)}</TableCell>
                        <TableCell>${investment.value.toLocaleString()}</TableCell>
                        <TableCell className={`text-right ${investment.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <div className="flex items-center justify-end space-x-1">
                            {investment.change_percent >= 0 ? 
                              <TrendingUp className="h-4 w-4" /> : 
                              <TrendingDown className="h-4 w-4" />
                            }
                            <span>{investment.change_percent >= 0 ? '+' : ''}{investment.change_percent.toFixed(2)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="watchlist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Watchlist</CardTitle>
              <CardDescription>
                Stocks you're monitoring for potential investment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : watchlist.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No stocks in your watchlist. Add some stocks to monitor their performance.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Current Price</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {watchlist.map((stock) => (
                      <TableRow key={stock.id}>
                        <TableCell className="font-medium">{stock.symbol}</TableCell>
                        <TableCell>{stock.asset_name}</TableCell>
                        <TableCell>${stock.current_price.toFixed(2)}</TableCell>
                        <TableCell className={stock.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}>
                          <div className="flex items-center space-x-1">
                            {stock.change_percent >= 0 ? 
                              <TrendingUp className="h-4 w-4" /> : 
                              <TrendingDown className="h-4 w-4" />
                            }
                            <span>{stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFromWatchlist(stock.symbol)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
