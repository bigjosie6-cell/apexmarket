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
  { name: "TRUMP COIN", symbol: "$TRUMP", category: "Crypto", value: 0, returnValue: "+0.0%", status: "Active", allocation: 0 },
  { name: "Diversified Crypto Basket", symbol: "CRYPTO-ALL", category: "Crypto", value: 0, returnValue: "+0.0%", status: "Active", allocation: 0 },
];

const defaultPortfolio: Portfolio = {
  holdings: defaultHoldings,
  updatedAt: "",
  updatedBy: "system",
};

const fileName = "client-portfolios.json";

function cloneDefaultPortfolio(): Portfolio {
  return {
    ...defaultPortfolio,
    holdings: defaultPortfolio.holdings.map((holding) => ({ ...holding })),
  };
}

function normalizeAccountNumber(accountNumber?: string | null) {
  return accountNumber?.trim().toUpperCase() || "HF-DEMO01";
}

async function readPortfolios() {
  return readStore<Record<string, Portfolio>>(fileName, {});
}

export async function getPortfolio(accountNumber?: string | null) {
  const key = normalizeAccountNumber(accountNumber);
  const portfolios = await readPortfolios();
  if (portfolios[key]) return portfolios[key];
  return cloneDefaultPortfolio();
}

export async function savePortfolio(holdings: Holding[], updatedBy: string, accountNumber?: string | null) {
  const key = normalizeAccountNumber(accountNumber);
  const portfolios = await readPortfolios();
  const portfolio = {
    holdings: holdings.map((holding) => ({
      ...holding,
      value: Number(holding.value) || 0,
      allocation: Number(holding.allocation) || 0,
    })),
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
  const nextPortfolios = {
    ...portfolios,
    [key]: portfolio,
  };
  await writeStore(fileName, nextPortfolios);
  return portfolio;
}

export function summarizePortfolio(holdings: Holding[]) {
  const total = holdings.reduce((sum, holding) => sum + holding.value, 0);
  const crypto = holdings.filter((holding) => holding.category.toLowerCase().includes("crypto")).reduce((sum, holding) => sum + holding.value, 0);
  const equities = holdings.filter((holding) => ["stock", "stocks"].includes(holding.category.toLowerCase())).reduce((sum, holding) => sum + holding.value, 0);
  const alternatives = Math.max(total - crypto - equities, 0);

  return { total, crypto, equities, alternatives };
}
