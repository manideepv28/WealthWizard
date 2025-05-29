import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthService } from "@/lib/auth";
import { LocalStorageService } from "@/lib/storage";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function Analysis() {
  const user = AuthService.getCurrentUser();
  const holdings = user ? LocalStorageService.getPortfolioHoldings(user.id) : [];
  const summary = user ? LocalStorageService.getPortfolioSummary(user.id) : null;

  // Risk assessment data
  const riskData = useMemo(() => [
    { risk: 'Market Risk', score: 6 },
    { risk: 'Credit Risk', score: 3 },
    { risk: 'Liquidity Risk', score: 2 },
    { risk: 'Concentration Risk', score: 4 },
    { risk: 'Currency Risk', score: 1 },
  ], []);

  // Performance comparison data
  const comparisonData = useMemo(() => [
    { name: 'Your Portfolio', returns: summary?.totalGainsPercentage || 0 },
    { name: 'Benchmark', returns: 12.8 },
    { name: 'Category Average', returns: 11.5 },
  ], [summary]);

  // Calculate risk score
  const riskScore = useMemo(() => {
    const totalScore = riskData.reduce((sum, item) => sum + item.score, 0);
    return Math.round(totalScore / riskData.length);
  }, [riskData]);

  const getRiskLevel = (score: number) => {
    if (score <= 3) return { level: 'Low', color: 'text-success' };
    if (score <= 6) return { level: 'Moderate', color: 'text-warning' };
    return { level: 'High', color: 'text-danger' };
  };

  const riskAssessment = getRiskLevel(riskScore);

  // Diversification score based on number of categories
  const categories = [...new Set(holdings.map(h => h.fund.category))];
  const diversificationScore = categories.length >= 4 ? 'Excellent' : 
                             categories.length >= 3 ? 'Good' : 
                             categories.length >= 2 ? 'Fair' : 'Poor';

  if (!user || !summary) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Investment Analysis</h2>
      
      {/* Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={riskData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="risk" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 10]} 
                    tick={{ fontSize: 10 }}
                  />
                  <Radar 
                    name="Risk Score" 
                    dataKey="score" 
                    stroke="hsl(var(--warning))" 
                    fill="hsl(var(--warning))" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Portfolio Risk Score</span>
                <span className={`font-semibold ${riskAssessment.color}`}>
                  {riskAssessment.level} ({riskScore}/10)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Diversification</span>
                <span className="font-semibold text-success">{diversificationScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Categories</span>
                <span className="font-semibold">{categories.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Returns']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="returns" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {holdings.length < 5 && (
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h4 className="font-medium text-gray-900">Increase Diversification</h4>
                <p className="text-gray-600 text-sm">
                  Consider adding more funds across different categories to improve portfolio diversification and reduce risk.
                </p>
              </div>
            )}
            
            {summary.totalGainsPercentage > 15 && (
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h4 className="font-medium text-gray-900">Strong Performance</h4>
                <p className="text-gray-600 text-sm">
                  Your portfolio is performing well! Consider increasing your SIP amounts to maximize returns.
                </p>
              </div>
            )}
            
            {!holdings.some(h => h.fund.category === 'Mid Cap') && (
              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <h4 className="font-medium text-gray-900">Consider Mid-Cap Exposure</h4>
                <p className="text-gray-600 text-sm">
                  Adding mid-cap funds could improve potential returns while maintaining acceptable risk levels.
                </p>
              </div>
            )}
            
            {summary.monthlySip < 10000 && (
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <h4 className="font-medium text-gray-900">Increase SIP Amount</h4>
                <p className="text-gray-600 text-sm">
                  Consider increasing your monthly SIP amount to build wealth faster through systematic investing.
                </p>
              </div>
            )}
            
            {categories.length >= 3 && (
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h4 className="font-medium text-gray-900">Well Diversified</h4>
                <p className="text-gray-600 text-sm">
                  Your portfolio shows good diversification across multiple fund categories. Maintain this balance.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
