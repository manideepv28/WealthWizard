import { 
  users, 
  mutualFunds, 
  portfolioHoldings, 
  transactions, 
  sipPlans, 
  alerts,
  type User, 
  type InsertUser,
  type MutualFund,
  type InsertMutualFund,
  type PortfolioHolding,
  type InsertPortfolioHolding,
  type Transaction,
  type InsertTransaction,
  type SipPlan,
  type InsertSipPlan,
  type Alert,
  type InsertAlert
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Mutual Fund operations
  getMutualFunds(): Promise<MutualFund[]>;
  getMutualFund(id: number): Promise<MutualFund | undefined>;
  createMutualFund(fund: InsertMutualFund): Promise<MutualFund>;

  // Portfolio operations
  getPortfolioHoldings(userId: number): Promise<PortfolioHolding[]>;
  createPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding>;
  updatePortfolioHolding(id: number, updates: Partial<PortfolioHolding>): Promise<PortfolioHolding | undefined>;

  // Transaction operations
  getTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // SIP operations
  getSipPlans(userId: number): Promise<SipPlan[]>;
  createSipPlan(sipPlan: InsertSipPlan): Promise<SipPlan>;
  updateSipPlan(id: number, updates: Partial<SipPlan>): Promise<SipPlan | undefined>;

  // Alert operations
  getAlerts(userId: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private mutualFunds: Map<number, MutualFund>;
  private portfolioHoldings: Map<number, PortfolioHolding>;
  private transactions: Map<number, Transaction>;
  private sipPlans: Map<number, SipPlan>;
  private alerts: Map<number, Alert>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.mutualFunds = new Map();
    this.portfolioHoldings = new Map();
    this.transactions = new Map();
    this.sipPlans = new Map();
    this.alerts = new Map();
    this.currentId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Mutual Fund operations
  async getMutualFunds(): Promise<MutualFund[]> {
    return Array.from(this.mutualFunds.values());
  }

  async getMutualFund(id: number): Promise<MutualFund | undefined> {
    return this.mutualFunds.get(id);
  }

  async createMutualFund(insertFund: InsertMutualFund): Promise<MutualFund> {
    const id = this.currentId++;
    const fund: MutualFund = { ...insertFund, id };
    this.mutualFunds.set(id, fund);
    return fund;
  }

  // Portfolio operations
  async getPortfolioHoldings(userId: number): Promise<PortfolioHolding[]> {
    return Array.from(this.portfolioHoldings.values())
      .filter(holding => holding.userId === userId);
  }

  async createPortfolioHolding(insertHolding: InsertPortfolioHolding): Promise<PortfolioHolding> {
    const id = this.currentId++;
    const holding: PortfolioHolding = { ...insertHolding, id };
    this.portfolioHoldings.set(id, holding);
    return holding;
  }

  async updatePortfolioHolding(id: number, updates: Partial<PortfolioHolding>): Promise<PortfolioHolding | undefined> {
    const holding = this.portfolioHoldings.get(id);
    if (!holding) return undefined;
    
    const updatedHolding = { ...holding, ...updates };
    this.portfolioHoldings.set(id, updatedHolding);
    return updatedHolding;
  }

  // Transaction operations
  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      date: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  // SIP operations
  async getSipPlans(userId: number): Promise<SipPlan[]> {
    return Array.from(this.sipPlans.values())
      .filter(sip => sip.userId === userId);
  }

  async createSipPlan(insertSipPlan: InsertSipPlan): Promise<SipPlan> {
    const id = this.currentId++;
    const sipPlan: SipPlan = { 
      ...insertSipPlan, 
      id,
      createdAt: new Date()
    };
    this.sipPlans.set(id, sipPlan);
    return sipPlan;
  }

  async updateSipPlan(id: number, updates: Partial<SipPlan>): Promise<SipPlan | undefined> {
    const sipPlan = this.sipPlans.get(id);
    if (!sipPlan) return undefined;
    
    const updatedSipPlan = { ...sipPlan, ...updates };
    this.sipPlans.set(id, updatedSipPlan);
    return updatedSipPlan;
  }

  // Alert operations
  async getAlerts(userId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentId++;
    const alert: Alert = { 
      ...insertAlert, 
      id,
      createdAt: new Date()
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async markAlertAsRead(id: number): Promise<void> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.isRead = true;
      this.alerts.set(id, alert);
    }
  }
}

export const storage = new MemStorage();
