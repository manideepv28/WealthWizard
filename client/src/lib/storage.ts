import { 
  MutualFund, 
  PortfolioHolding, 
  Transaction, 
  SipPlan, 
  Alert,
  FundHolding,
  PortfolioSummary,
  TransactionWithFund,
  InsertTransaction,
  InsertPortfolioHolding,
  InsertSipPlan,
  InsertAlert
} from "@shared/schema";

export class LocalStorageService {
  // Portfolio operations
  static getPortfolioHoldings(userId: number): FundHolding[] {
    const holdings = this.getStoredData<PortfolioHolding>('portfolio_holdings');
    const funds = this.getStoredData<MutualFund>('mutual_funds');
    
    return holdings
      .filter(h => h.userId === userId)
      .map(holding => {
        const fund = funds.find(f => f.id === holding.fundId)!;
        const currentValue = parseFloat(holding.units) * parseFloat(fund.currentNav);
        const totalInvested = parseFloat(holding.totalInvested);
        const gains = currentValue - totalInvested;
        const gainsPercentage = (gains / totalInvested) * 100;

        return {
          ...holding,
          fund,
          currentValue,
          gains,
          gainsPercentage,
        };
      });
  }

  static getPortfolioSummary(userId: number): PortfolioSummary {
    const holdings = this.getPortfolioHoldings(userId);
    const sipPlans = this.getSipPlans(userId);
    
    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalInvested = holdings.reduce((sum, h) => sum + parseFloat(h.totalInvested), 0);
    const totalGains = totalValue - totalInvested;
    const totalGainsPercentage = totalInvested > 0 ? (totalGains / totalInvested) * 100 : 0;
    const monthlySip = sipPlans
      .filter(sip => sip.isActive && sip.frequency === 'monthly')
      .reduce((sum, sip) => sum + parseFloat(sip.amount), 0);
    const activeFunds = holdings.length;

    return {
      totalValue,
      totalInvested,
      totalGains,
      totalGainsPercentage,
      monthlySip,
      activeFunds,
    };
  }

  // Transaction operations
  static getTransactions(userId: number): TransactionWithFund[] {
    const transactions = this.getStoredData<Transaction>('transactions');
    const funds = this.getStoredData<MutualFund>('mutual_funds');
    
    return transactions
      .filter(t => t.userId === userId)
      .map(transaction => ({
        ...transaction,
        fund: funds.find(f => f.id === transaction.fundId)!,
      }))
      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
  }

  static addTransaction(transaction: InsertTransaction): Transaction {
    const transactions = this.getStoredData<Transaction>('transactions');
    const newTransaction: Transaction = {
      id: Date.now(),
      ...transaction,
      date: new Date(),
    };

    transactions.push(newTransaction);
    this.setStoredData('transactions', transactions);

    // Update portfolio holding if it's a buy transaction
    if (transaction.type === 'buy' || transaction.type === 'sip') {
      this.updatePortfolioHolding(transaction);
    }

    return newTransaction;
  }

  // SIP operations
  static getSipPlans(userId: number): SipPlan[] {
    const sipPlans = this.getStoredData<SipPlan>('sip_plans');
    return sipPlans.filter(sip => sip.userId === userId);
  }

  static addSipPlan(sipPlan: InsertSipPlan): SipPlan {
    const sipPlans = this.getStoredData<SipPlan>('sip_plans');
    const newSipPlan: SipPlan = {
      id: Date.now(),
      ...sipPlan,
      createdAt: new Date(),
    };

    sipPlans.push(newSipPlan);
    this.setStoredData('sip_plans', sipPlans);
    return newSipPlan;
  }

  // Alert operations
  static getAlerts(userId: number): Alert[] {
    const alerts = this.getStoredData<Alert>('alerts');
    return alerts
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  static addAlert(alert: InsertAlert): Alert {
    const alerts = this.getStoredData<Alert>('alerts');
    const newAlert: Alert = {
      id: Date.now(),
      ...alert,
      createdAt: new Date(),
    };

    alerts.push(newAlert);
    this.setStoredData('alerts', alerts);
    return newAlert;
  }

  static markAlertAsRead(alertId: number): void {
    const alerts = this.getStoredData<Alert>('alerts');
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      this.setStoredData('alerts', alerts);
    }
  }

  // Fund operations
  static getMutualFunds(): MutualFund[] {
    return this.getStoredData<MutualFund>('mutual_funds');
  }

  static getFundById(id: number): MutualFund | undefined {
    const funds = this.getMutualFunds();
    return funds.find(f => f.id === id);
  }

  // Private helper methods
  private static getStoredData<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(`fundtracker_${key}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static setStoredData<T>(key: string, data: T[]): void {
    localStorage.setItem(`fundtracker_${key}`, JSON.stringify(data));
  }

  private static updatePortfolioHolding(transaction: InsertTransaction): void {
    const holdings = this.getStoredData<PortfolioHolding>('portfolio_holdings');
    const existingHolding = holdings.find(
      h => h.userId === transaction.userId && h.fundId === transaction.fundId
    );

    if (existingHolding) {
      // Update existing holding
      const currentUnits = parseFloat(existingHolding.units);
      const currentInvested = parseFloat(existingHolding.totalInvested);
      const newUnits = parseFloat(transaction.units || "0");
      const newInvested = parseFloat(transaction.amount);

      const totalUnits = currentUnits + newUnits;
      const totalInvested = currentInvested + newInvested;
      const avgNav = totalInvested / totalUnits;

      existingHolding.units = totalUnits.toFixed(4);
      existingHolding.totalInvested = totalInvested.toFixed(2);
      existingHolding.avgNav = avgNav.toFixed(4);
    } else {
      // Create new holding
      const nav = parseFloat(transaction.nav || "0");
      const amount = parseFloat(transaction.amount);
      const units = amount / nav;

      const newHolding: PortfolioHolding = {
        id: Date.now(),
        userId: transaction.userId,
        fundId: transaction.fundId,
        units: units.toFixed(4),
        avgNav: nav.toFixed(4),
        totalInvested: amount.toFixed(2),
      };

      holdings.push(newHolding);
    }

    this.setStoredData('portfolio_holdings', holdings);
  }
}
