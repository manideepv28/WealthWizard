import { MutualFund } from "@shared/schema";

// Sample mutual fund data - in a real app, this would come from an API
export const sampleFunds: MutualFund[] = [
  {
    id: 1,
    name: "Axis Bluechip Fund - Direct Growth",
    category: "Large Cap",
    amc: "Axis Mutual Fund",
    currentNav: "50.67",
    expenseRatio: "1.15",
    riskLevel: "Moderate",
  },
  {
    id: 2,
    name: "Mirae Asset Large Cap Fund - Direct Growth",
    category: "Large Cap",
    amc: "Mirae Asset",
    currentNav: "87.45",
    expenseRatio: "0.95",
    riskLevel: "Moderate",
  },
  {
    id: 3,
    name: "Parag Parikh Flexi Cap Fund - Direct Growth",
    category: "Flexi Cap",
    amc: "PPFAS Mutual Fund",
    currentNav: "65.23",
    expenseRatio: "0.85",
    riskLevel: "Moderate High",
  },
  {
    id: 4,
    name: "Kotak Small Cap Fund - Direct Growth",
    category: "Small Cap",
    amc: "Kotak Mahindra AMC",
    currentNav: "175.89",
    expenseRatio: "1.85",
    riskLevel: "High",
  },
  {
    id: 5,
    name: "HDFC Mid-Cap Opportunities Fund - Direct Growth",
    category: "Mid Cap",
    amc: "HDFC AMC",
    currentNav: "98.34",
    expenseRatio: "1.45",
    riskLevel: "High",
  },
  {
    id: 6,
    name: "SBI Equity Hybrid Fund - Direct Growth",
    category: "Hybrid",
    amc: "SBI Funds Management",
    currentNav: "156.78",
    expenseRatio: "1.25",
    riskLevel: "Moderate",
  },
  {
    id: 7,
    name: "ICICI Prudential Technology Fund - Direct Growth",
    category: "Sectoral",
    amc: "ICICI Prudential AMC",
    currentNav: "120.45",
    expenseRatio: "2.15",
    riskLevel: "Very High",
  },
  {
    id: 8,
    name: "UTI Nifty 50 Index Fund - Direct Growth",
    category: "Index",
    amc: "UTI AMC",
    currentNav: "78.92",
    expenseRatio: "0.20",
    riskLevel: "Moderate",
  },
];

// Initialize sample data in localStorage if not present
export function initializeSampleData() {
  const existingFunds = localStorage.getItem('fundtracker_mutual_funds');
  if (!existingFunds) {
    localStorage.setItem('fundtracker_mutual_funds', JSON.stringify(sampleFunds));
  }
}

// Mock API functions for fund data
export async function fetchFundNav(fundId: number): Promise<number> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock NAV data with slight random variation
  const fund = sampleFunds.find(f => f.id === fundId);
  if (!fund) throw new Error('Fund not found');
  
  const baseNav = parseFloat(fund.currentNav);
  const variation = (Math.random() - 0.5) * 2; // ±1 variation
  return Math.max(baseNav + variation, 1); // Ensure NAV doesn't go below 1
}

export async function searchFunds(query: string): Promise<MutualFund[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const lowerQuery = query.toLowerCase();
  return sampleFunds.filter(fund => 
    fund.name.toLowerCase().includes(lowerQuery) ||
    fund.category.toLowerCase().includes(lowerQuery) ||
    fund.amc.toLowerCase().includes(lowerQuery)
  );
}
