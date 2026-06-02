import { readStore, writeStore } from "@/lib/file-store";

export type Holding = {
  name: string;
  symbol: string;
  category: string;
  value: number;
  returnValue: string;
  status: string;
  allocation: number;
};

export type Portfolio = {
  holdings: Holding[];
  updatedAt: string;
  updatedBy: string;
};

const defaultHoldings: Holding[] = [
  { name: "Bitcoin", symbol: "BTC", category: "Crypto", value: 12500, returnValue: "+8.4%", status: "Active", allocation: 20 },
  { name: "Ethereum", symbol: "ETH", category: "Crypto", value: 7200, returnValue: "+5.1%", status: "Active", allocation: 12 },
  { name: "Gold Strategy", symbol: "XAU", category: "Investment", value: 20000, returnValue: "+3.6%", status: "Active", allocation: 31 },
  { name: "US Equity Basket", symbol: "EQ-US", category: "Stocks", value: 15000, returnValue: "+6.2%", status: "Active", allocation: 23 },
  { name: "American Bitcoin Corp", symbol: "$ABTC", category: "Stock", value: 4200, returnValue: "+4.8%", status: "Active", allocation: 6 },
  { name: "Tesla", symbol: "$TESLA", category: "Stock", value: 3600, returnValue: "+2.9%", status: "Active", allocation: 5 },
  { name: "SpaceX IPO Allocation", symbol: "SPACEXIPO", category: "Private Market", value: 1500, returnValue: "Pending", status: "Reserved", allocation: 2 },
  { name: "TRUMP COIN", symbol: "TRUMP", category: "Crypto", value: 850, returnValue: "+1.7%", status: "Active", allocation: 1 },
  { name: "Diversified Crypto Basket", symbol: "CRYPTO-ALL", category: "Crypto", value: 1200, returnValue: "+3.3%", status: "Active", allocation: 2 },
];

const defaultPortfolio: Portfolio = {
  holdings: defaultHoldings,
  updatedAt: "",
  updatedBy: "system",
};

const fileName = "portfolio.json";
const globalPortfolio = globalThis as typeof globalThis & {
  hutridgePortfolio?: Portfolio;
};

export async function getPortfolio() {
  if (globalPortfolio.hutridgePortfolio) return globalPortfolio.hutridgePortfolio;
  const portfolio = await readStore<Portfolio>(fileName, defaultPortfolio);
  globalPortfolio.hutridgePortfolio = portfolio;
  return portfolio;
}

export async function savePortfolio(holdings: Holding[], updatedBy: string) {
  const portfolio = {
    holdings: holdings.map((holding) => ({
      ...holding,
      value: Number(holding.value) || 0,
      allocation: Number(holding.allocation) || 0,
    })),
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
  globalPortfolio.hutridgePortfolio = portfolio;
  return writeStore(fileName, portfolio);
}

export function summarizePortfolio(holdings: Holding[]) {
  const total = holdings.reduce((sum, holding) => sum + holding.value, 0);
  const crypto = holdings.filter((holding) => holding.category.toLowerCase().includes("crypto")).reduce((sum, holding) => sum + holding.value, 0);
  const equities = holdings.filter((holding) => ["stock", "stocks"].includes(holding.category.toLowerCase())).reduce((sum, holding) => sum + holding.value, 0);
  const alternatives = Math.max(total - crypto - equities, 0);

  return { total, crypto, equities, alternatives };
}
