import { NextResponse } from "next/server";

type YahooQuote = {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
};

type YahooResponse = {
  quoteResponse?: {
    result?: YahooQuote[];
  };
};

const quoteMap = [
  { label: "EUR/USD", yahoo: "EURUSD=X", decimals: 5 },
  { label: "GBP/USD", yahoo: "GBPUSD=X", decimals: 5 },
  { label: "USD/JPY", yahoo: "JPY=X", decimals: 3 },
  { label: "XAU/USD", yahoo: "GC=F", decimals: 2 },
  { label: "BTC/USD", yahoo: "BTC-USD", decimals: 0 },
];

const fallbackQuotes = [
  { symbol: "EUR/USD", price: "1.08756", change: "+0.18%", source: "fallback" },
  { symbol: "GBP/USD", price: "1.27436", change: "-0.07%", source: "fallback" },
  { symbol: "USD/JPY", price: "156.301", change: "+0.24%", source: "fallback" },
  { symbol: "XAU/USD", price: "2358.92", change: "+0.41%", source: "fallback" },
  { symbol: "BTC/USD", price: "68,448", change: "+1.16%", source: "fallback" },
];

function formatPrice(price: number, decimals: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price);
}

function formatChange(change: number) {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

export async function GET() {
  try {
    const symbols = quoteMap.map((quote) => encodeURIComponent(quote.yahoo)).join(",");
    const response = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ ok: true, quotes: fallbackQuotes, live: false });
    }

    const data = (await response.json()) as YahooResponse;
    const results = data.quoteResponse?.result ?? [];

    const quotes = quoteMap.map((item) => {
      const quote = results.find((result) => result.symbol === item.yahoo);
      const price = quote?.regularMarketPrice;
      const change = quote?.regularMarketChangePercent;

      if (typeof price !== "number" || typeof change !== "number") {
        return fallbackQuotes.find((fallback) => fallback.symbol === item.label) ?? fallbackQuotes[0];
      }

      return {
        symbol: item.label,
        price: formatPrice(price, item.decimals),
        change: formatChange(change),
        source: "live",
      };
    });

    return NextResponse.json({
      ok: true,
      quotes,
      live: quotes.some((quote) => quote.source === "live"),
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ ok: true, quotes: fallbackQuotes, live: false });
  }
}
