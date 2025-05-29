import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, Calculator, Building } from "lucide-react";
import { AuthService } from "@/lib/auth";
import { LocalStorageService } from "@/lib/storage";
import PortfolioChart from "@/components/portfolio-chart";
import AllocationChart from "@/components/allocation-chart";

export default function Dashboard() {
  const user = AuthService.getCurrentUser();
  const holdings = user ? LocalStorageService.getPortfolioHoldings(user.id) : [];
  const summary = user ? LocalStorageService.getPortfolioSummary(user.id) : null;

  // Generate portfolio performance data for chart
  const portfolioData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseValue = summary?.totalInvested || 400000;
    const currentValue = summary?.totalValue || 547320;
    const growth = (currentValue - baseValue) / 5; // Distribute growth over 6 months
    
    return months.map((month, index) => ({
      date: month,
      value: Math.round(baseValue + (growth * index)),
    }));
  }, [summary]);

  // Generate allocation data for pie chart
  const allocationData = useMemo(() => {
    const categoryTotals = holdings.reduce((acc, holding) => {
      const category = holding.fund.category;
      acc[category] = (acc[category] || 0) + holding.currentValue;
      return acc;
    }, {} as Record<string, number>);

    const totalValue = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);

    return Object.entries(categoryTotals).map(([category, value]) => ({
      category,
      value: Math.round(value),
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }));
  }, [holdings]);

  // Top performing funds
  const topFunds = holdings
    .filter(h => h.gainsPercentage > 0)
    .sort((a, b) => b.gainsPercentage - a.gainsPercentage)
    .slice(0, 5);

  if (!user || !summary) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{summary.totalValue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className={`text-sm font-medium ${summary.totalGainsPercentage >= 0 ? 'text-success' : 'text-danger'}`}>
                {summary.totalGainsPercentage >= 0 ? '+' : ''}{summary.totalGainsPercentage.toFixed(1)}%
              </span>
              <span className="text-gray-500 text-sm ml-2">vs invested amount</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gains</p>
                <p className={`text-2xl font-bold mt-1 ${summary.totalGains >= 0 ? 'text-success' : 'text-danger'}`}>
                  {summary.totalGains >= 0 ? '+' : ''}₹{summary.totalGains.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className={`text-sm font-medium ${summary.totalGainsPercentage >= 0 ? 'text-success' : 'text-danger'}`}>
                {summary.totalGainsPercentage >= 0 ? '+' : ''}{summary.totalGainsPercentage.toFixed(1)}%
              </span>
              <span className="text-gray-500 text-sm ml-2">overall return</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly SIP</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{summary.monthlySip.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-blue-600 text-sm font-medium">
                {LocalStorageService.getSipPlans(user.id).filter(sip => sip.isActive).length} active SIPs
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Funds</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.activeFunds}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-gray-600 text-sm">
                Across {allocationData.length} categories
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioChart data={portfolioData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart data={allocationData} />
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Funds */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fund Name</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Invested</TableHead>
                <TableHead>Returns</TableHead>
                <TableHead>% Return</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topFunds.length > 0 ? (
                topFunds.map((holding) => (
                  <TableRow key={holding.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{holding.fund.name}</div>
                        <div className="text-sm text-gray-500">{holding.fund.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>₹{holding.currentValue.toLocaleString()}</TableCell>
                    <TableCell>₹{parseFloat(holding.totalInvested).toLocaleString()}</TableCell>
                    <TableCell className="text-success">
                      +₹{holding.gains.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        +{holding.gainsPercentage.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No funds with positive returns yet. Start investing to see your performance!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
