import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Minus, RefreshCw } from "lucide-react";
import { AuthService } from "@/lib/auth";
import { LocalStorageService } from "@/lib/storage";
import TransactionModal from "@/components/transaction-modal";

type TransactionType = 'buy' | 'sell' | 'sip';

export default function Transactions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('buy');
  const [refresh, setRefresh] = useState(0);
  
  const user = AuthService.getCurrentUser();
  const transactions = user ? LocalStorageService.getTransactions(user.id) : [];
  const funds = LocalStorageService.getMutualFunds();

  const handleTransactionSuccess = () => {
    setRefresh(prev => prev + 1);
  };

  const openModal = (type: TransactionType) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'buy':
        return <Badge className="bg-blue-100 text-blue-800">Purchase</Badge>;
      case 'sell':
        return <Badge className="bg-red-100 text-red-800">Redemption</Badge>;
      case 'sip':
        return <Badge className="bg-green-100 text-green-800">SIP</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
        <div className="flex space-x-3">
          <Button 
            onClick={() => openModal('buy')}
            className="bg-success hover:bg-success/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Buy
          </Button>
          <Button 
            onClick={() => openModal('sell')}
            variant="destructive"
          >
            <Minus className="w-4 h-4 mr-2" />
            Sell
          </Button>
          <Button onClick={() => openModal('sip')}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Start SIP
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Last 30 days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="180">Last 6 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="buy">Purchase</SelectItem>
                  <SelectItem value="sell">Redemption</SelectItem>
                  <SelectItem value="sip">SIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fund
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Funds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Funds</SelectItem>
                  {funds.map(fund => (
                    <SelectItem key={fund.id} value={fund.id.toString()}>
                      {fund.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Fund</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>NAV</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.date!).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{transaction.fund.name}</div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(transaction.type)}
                    </TableCell>
                    <TableCell>₹{parseFloat(transaction.amount).toLocaleString()}</TableCell>
                    <TableCell>
                      {transaction.units ? parseFloat(transaction.units).toFixed(2) : '-'}
                    </TableCell>
                    <TableCell>
                      {transaction.nav ? `₹${parseFloat(transaction.nav).toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Yet</h3>
              <p className="text-gray-500 mb-4">
                Start investing to see your transaction history here.
              </p>
              <Button onClick={() => openModal('buy')}>
                <Plus className="w-4 h-4 mr-2" />
                Make Your First Investment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}
