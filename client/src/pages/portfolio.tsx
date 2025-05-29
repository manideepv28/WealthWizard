import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { AuthService } from "@/lib/auth";
import { LocalStorageService } from "@/lib/storage";
import TransactionModal from "@/components/transaction-modal";

export default function Portfolio() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  
  const user = AuthService.getCurrentUser();
  const holdings = user ? LocalStorageService.getPortfolioHoldings(user.id) : [];
  const sipPlans = user ? LocalStorageService.getSipPlans(user.id) : [];

  const handleTransactionSuccess = () => {
    setRefresh(prev => prev + 1);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Portfolio Holdings</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Fund
        </Button>
      </div>

      {/* Portfolio Holdings */}
      <div className="space-y-6">
        {holdings.length > 0 ? (
          holdings.map((holding) => {
            const activeSip = sipPlans.find(
              sip => sip.fundId === holding.fundId && sip.isActive
            );

            return (
              <Card key={holding.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {holding.fund.name}
                      </h3>
                      <p className="text-gray-600">{holding.fund.category}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        AMC: {holding.fund.amc}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{holding.currentValue.toLocaleString()}
                      </p>
                      <p className={`font-medium ${holding.gains >= 0 ? 'text-success' : 'text-danger'}`}>
                        {holding.gains >= 0 ? '+' : ''}₹{holding.gains.toLocaleString()} ({holding.gainsPercentage >= 0 ? '+' : ''}{holding.gainsPercentage.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Units Held</p>
                      <p className="font-semibold">{parseFloat(holding.units).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg. NAV</p>
                      <p className="font-semibold">₹{parseFloat(holding.avgNav).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Current NAV</p>
                      <p className="font-semibold">₹{parseFloat(holding.fund.currentNav).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">SIP Status</p>
                      {activeSip ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          ₹{parseFloat(activeSip.amount).toLocaleString()}/{activeSip.frequency}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-4">
                    <Button variant="outline">
                      View Details
                    </Button>
                    <Button>
                      Invest More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-500">
                <Building className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No Holdings Yet</h3>
                <p className="text-sm mb-4">
                  Start building your portfolio by adding your first mutual fund investment.
                </p>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Fund
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="buy"
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}
