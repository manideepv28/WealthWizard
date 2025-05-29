import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { insertUserSchema, insertTransactionSchema, insertSipPlanSchema, insertAlertSchema } from "@shared/schema";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Login failed" });
    }
  });

  // Mutual funds routes
  app.get("/api/funds", async (req, res) => {
    try {
      const funds = await storage.getMutualFunds();
      res.json(funds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch funds" });
    }
  });

  app.get("/api/funds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const fund = await storage.getMutualFund(id);
      
      if (!fund) {
        return res.status(404).json({ message: "Fund not found" });
      }
      
      res.json(fund);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fund" });
    }
  });

  // Portfolio routes
  app.get("/api/portfolio/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const holdings = await storage.getPortfolioHoldings(userId);
      res.json(holdings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  // Transaction routes
  app.get("/api/transactions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  // SIP routes
  app.get("/api/sips/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sipPlans = await storage.getSipPlans(userId);
      res.json(sipPlans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch SIP plans" });
    }
  });

  app.post("/api/sips", async (req, res) => {
    try {
      const sipData = insertSipPlanSchema.parse(req.body);
      const sipPlan = await storage.createSipPlan(sipData);
      res.json(sipPlan);
    } catch (error) {
      res.status(400).json({ message: "Invalid SIP data" });
    }
  });

  // Alert routes
  app.get("/api/alerts/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const alerts = await storage.getAlerts(userId);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const alertData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(alertData);
      res.json(alert);
    } catch (error) {
      res.status(400).json({ message: "Invalid alert data" });
    }
  });

  app.patch("/api/alerts/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markAlertAsRead(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark alert as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
