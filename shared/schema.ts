import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mutualFunds = pgTable("mutual_funds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  amc: text("amc").notNull(),
  currentNav: decimal("current_nav", { precision: 10, scale: 4 }).notNull(),
  expenseRatio: decimal("expense_ratio", { precision: 5, scale: 2 }),
  riskLevel: text("risk_level").notNull(),
});

export const portfolioHoldings = pgTable("portfolio_holdings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fundId: integer("fund_id").notNull(),
  units: decimal("units", { precision: 15, scale: 4 }).notNull(),
  avgNav: decimal("avg_nav", { precision: 10, scale: 4 }).notNull(),
  totalInvested: decimal("total_invested", { precision: 15, scale: 2 }).notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fundId: integer("fund_id").notNull(),
  type: text("type").notNull(), // 'buy', 'sell', 'sip'
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  units: decimal("units", { precision: 15, scale: 4 }),
  nav: decimal("nav", { precision: 10, scale: 4 }),
  status: text("status").notNull().default("completed"),
  date: timestamp("date").defaultNow(),
});

export const sipPlans = pgTable("sip_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fundId: integer("fund_id").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  frequency: text("frequency").notNull(), // 'monthly', 'quarterly', 'weekly'
  isActive: boolean("is_active").default(true),
  nextDate: timestamp("next_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'nav_change', 'sip_due', 'rebalance', 'goal_achieved'
  title: text("title").notNull(),
  description: text("description").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMutualFundSchema = createInsertSchema(mutualFunds).omit({
  id: true,
});

export const insertPortfolioHoldingSchema = createInsertSchema(portfolioHoldings).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  date: true,
});

export const insertSipPlanSchema = createInsertSchema(sipPlans).omit({
  id: true,
  createdAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type MutualFund = typeof mutualFunds.$inferSelect;
export type InsertMutualFund = z.infer<typeof insertMutualFundSchema>;

export type PortfolioHolding = typeof portfolioHoldings.$inferSelect;
export type InsertPortfolioHolding = z.infer<typeof insertPortfolioHoldingSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type SipPlan = typeof sipPlans.$inferSelect;
export type InsertSipPlan = z.infer<typeof insertSipPlanSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

// Extended types for frontend use
export type PortfolioSummary = {
  totalValue: number;
  totalInvested: number;
  totalGains: number;
  totalGainsPercentage: number;
  monthlySip: number;
  activeFunds: number;
};

export type FundHolding = PortfolioHolding & {
  fund: MutualFund;
  currentValue: number;
  gains: number;
  gainsPercentage: number;
};

export type TransactionWithFund = Transaction & {
  fund: MutualFund;
};
