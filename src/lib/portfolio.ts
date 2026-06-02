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
  { name: "Bitcoin", symbol: "BTC", category: "Crypto", value: 0, returnValue: "+0.0%", status: "Active", allocation: 0 },
  { name: "Ethereum", symbol: "ETH", category: "Crypto", value: 0, returnValue: "+0.0%", status: "Active", allocation: 0 },
  { name: "Gold Strategy", symbol: "XAU", category: "Investment", value: 0, returnValue: "+0.0%", status: "Active", allocation: 0 },
  { name: "US Equity Basket", symbol: "EQ-US", category: "Stocks", value: 0, returnValue: "+0.0%", status: "Active", allocation: 0 },
  { name: "American Bitcoin Corp", symbol: "$ABTC", category: "Stock", value: 0, returnValue: "+0.0%", status: "Active", allocation: 0 },
  { name: "Tesla", symbol: "$TSLA", category: "Stock", value: 0, returnValue: "+0.0%", status: "Active", allocation: 0 },
  { name: "XRP", symbol: "$XRP", category: "Crypto", value: 0, returnValue: "+0.0%", status: "Active", allocation: 0 },
  { name: "S&P 500", symbol: "S&P500", category: "Stocks", value: 0, returnValue: "+0.0%", status: "Active", allocation: 0 },
  { name: "S&P 500 / XRP Basket", symbol: "S&P500/XRP", category: "Investment", value: 0, returnValue: "+0.0%", status: "Active", allocation: 0 },
  { name: "S&P 500 / American Bitcoin Corp Basket", symbol: "S&P500/$ABTC", category: "Investment", value: 0, returnValue: "+0.0%", status: "Active", allocation: 0 },
  { name: "SPCX", symbol: "SPCX", category: "Stock", value: 0, returnValue: "+0.0%", status: "Active", allocation: 0 },
  { name: "SpaceX IPO Allocation", symbol: "SPACEXIPO", category: "Private Market", value: 0, returnValue: "Pending", status: "Reserved", allocation: 0 },
  { name: "TRUMP COIN", symbol: "$TRUMP", category: "Crypto", value: 0, returnValue: "+0.0%", status: "Active", allocation: 0 },
  { name: "Diversified Crypto Basket", symbol: "CRYPTO-ALL", category: "Crypto", value: 0, returnValue: "+0.0%", status: "Active", allocation: 0 },
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
