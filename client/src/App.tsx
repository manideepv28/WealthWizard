import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthService } from "@/lib/auth";
import { initializeSampleData } from "@/lib/fund-data";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Portfolio from "@/pages/portfolio";
import Transactions from "@/pages/transactions";
import Analysis from "@/pages/analysis";
import Alerts from "@/pages/alerts";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/analysis" component={Analysis} />
      <Route path="/alerts" component={Alerts} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize sample data
    initializeSampleData();
    
    // Check authentication status
    const authenticated = AuthService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const getPageTitle = () => {
    const path = window.location.pathname;
    switch (path) {
      case '/':
        return 'Dashboard';
      case '/portfolio':
        return 'Portfolio Holdings';
      case '/transactions':
        return 'Transaction History';
      case '/analysis':
        return 'Investment Analysis';
      case '/alerts':
        return 'Alerts & Notifications';
      default:
        return 'Dashboard';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FundTracker...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen bg-gray-50">
          <Sidebar onLogout={handleLogout} />
          <div className="ml-64">
            <Header title={getPageTitle()} />
            <main className="p-8">
              <Router />
            </main>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
