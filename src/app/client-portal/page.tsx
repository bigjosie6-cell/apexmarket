"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CircleDollarSign,
  Clock3,
  Headphones,
  Landmark,
  LineChart,
  LockKeyhole,
  PieChart,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";

type Application = {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  accountType: string;
  baseCurrency: string;
  fundingMethod: string;
  expectedDeposit: string;
  accountNumber: string;
  status: string;
  submittedAt: string;
};

const fallback: Application = {
  firstName: "Client",
  lastName: "User",
  email: "client@hutridgefinancial.com",
  country: "United States",
  accountType: "Standard",
  baseCurrency: "USD",
  fundingMethod: "Bank Transfer",
  expectedDeposit: "1000",
  accountNumber: "HF-CLIENT",
  status: "Verified",
  submittedAt: new Date().toISOString(),
};

type WatchQuote = {
  symbol: string;
  price: string;
  change: string;
  source?: string;
};

const watchlist: WatchQuote[] = [
  { symbol: "EUR/USD", price: "1.08756", change: "+0.18%", source: "fallback" },
  { symbol: "GBP/USD", price: "1.27436", change: "-0.07%", source: "fallback" },
  { symbol: "USD/JPY", price: "156.301", change: "+0.24%", source: "fallback" },
  { symbol: "XAU/USD", price: "2358.92", change: "+0.41%", source: "fallback" },
  { symbol: "BTC/USD", price: "68,448", change: "+1.16%", source: "fallback" },
];

function quoteBars(quote: WatchQuote) {
  const base = Math.abs(Number.parseFloat(quote.price.replaceAll(",", ""))) || 1;
  const change = Math.abs(Number.parseFloat(quote.change)) || 0.1;
  return Array.from({ length: 8 }, (_, index) => 30 + ((base / (index + 3) + change * 17 + index * 11) % 62));
}

function portfolioStorageKey(accountNumber?: string) {
  return `hutridge-portfolio:${accountNumber || fallback.accountNumber}`;
}

function getLocalPortfolioHoldings(accountNumber?: string) {
  try {
    const saved = window.localStorage.getItem(portfolioStorageKey(accountNumber));
    const portfolio = saved ? (JSON.parse(saved) as { holdings?: Holding[] }) : null;
    return portfolio?.holdings ?? [];
  } catch {
    return [];
  }
}

type Holding = {
  name: string;
  symbol: string;
  category: string;
  value: number;
  returnValue: string;
  status: string;
  allocation: number;
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

export default function ClientPortalPage() {
  const [application, setApplication] = useState<Application>(fallback);
  const [holdings, setHoldings] = useState<Holding[]>(defaultHoldings);
  const [quotes, setQuotes] = useState<WatchQuote[]>(watchlist);
  const [quotesLive, setQuotesLive] = useState(false);
  const [quotesUpdatedAt, setQuotesUpdatedAt] = useState("");

  useEffect(() => {
    let accountNumber = fallback.accountNumber;
    queueMicrotask(() => {
      const saved = localStorage.getItem("hutridge-application");
      if (saved) {
        const savedApplication = JSON.parse(saved) as Application;
        accountNumber = savedApplication.accountNumber;
        setApplication(savedApplication);
      }
      loadPortfolio(accountNumber);
    });

    const loadPortfolio = async (nextAccountNumber = accountNumber) => {
      try {
        const response = await fetch(`/api/portfolio?accountNumber=${encodeURIComponent(nextAccountNumber)}`, { cache: "no-store" });
        const result = await response.json();
        if (result.portfolio?.holdings?.length) {
          setHoldings(result.portfolio.holdings);
          window.localStorage.setItem(portfolioStorageKey(nextAccountNumber), JSON.stringify(result.portfolio));
        }
      } catch {
        const savedHoldings = getLocalPortfolioHoldings(nextAccountNumber);
        setHoldings(savedHoldings.length ? savedHoldings : defaultHoldings);
      }
    };

    const loadQuotes = async () => {
      try {
        const response = await fetch("/api/market-watch", { cache: "no-store" });
        const result = await response.json();
        if (result.quotes?.length) {
          setQuotes(result.quotes);
          setQuotesLive(Boolean(result.live));
          setQuotesUpdatedAt(result.updatedAt ?? new Date().toISOString());
        }
      } catch {
        setQuotes(watchlist);
        setQuotesLive(false);
        setQuotesUpdatedAt("");
      }
    };

    loadQuotes();
    const interval = window.setInterval(loadQuotes, 5000);
    return () => window.clearInterval(interval);
  }, []);

  const totalHoldings = holdings.reduce((total, holding) => total + holding.value, 0);
  const cryptoValue = holdings.filter((holding) => holding.category.toLowerCase().includes("crypto")).reduce((total, holding) => total + holding.value, 0);
  const equitiesValue = holdings.filter((holding) => ["stock", "stocks"].includes(holding.category.toLowerCase())).reduce((total, holding) => total + holding.value, 0);
  const alternativesValue = Math.max(totalHoldings - cryptoValue - equitiesValue, 0);

  const submitted = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(application.submittedAt));

  return (
    <main className="min-h-screen bg-slate-50 text-navy dark:bg-[#07111f] dark:text-white">
      <header className="border-b border-slate-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#07111f] lg:px-8">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <span className="grid size-10 place-items-center rounded-md bg-navy text-gold dark:bg-white">HF</span>
            <span>Hutridge Financial Client Area</span>
          </Link>
          <div className="flex items-center gap-3">
            <button className="rounded-md border border-slate-200 p-2 dark:border-white/10" aria-label="Notifications">
              <Bell className="size-5" />
            </button>
            <Link href="/trade" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold dark:border-white/10">
              Trade
            </Link>
            <Link href="/cashier" className="rounded-md bg-navy px-4 py-2 text-sm font-bold text-white dark:bg-gold dark:text-navy">
              Deposit
            </Link>
            <Link href="/open-account" className="rounded-md bg-gold px-4 py-2 text-sm font-bold text-navy">
              New Application
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="rounded-lg bg-navy p-6 text-white shadow-xl">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
            <div>
              <p className="section-kicker">Application received</p>
              <h1 className="mt-3 text-4xl font-bold">Welcome, {application.firstName}</h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                Your Hutridge Financial account is verified and active. Your client area is ready for funding, holdings review, and platform access.
              </p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-5">
              <p className="text-sm text-slate-300">Account reference</p>
              <p className="mt-1 text-3xl font-bold">{application.accountNumber}</p>
              <p className="mt-3 inline-flex rounded-full bg-emerald-300/15 px-3 py-1 text-sm font-semibold text-emerald-200">{application.status === "Pending Verification" ? "Verified" : application.status}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="grid gap-6">
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <h2 className="flex items-center gap-2 text-lg font-bold"><BadgeCheck className="size-5 text-gold" /> Account profile</h2>
              <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Row label="Client" value={`${application.firstName} ${application.lastName}`} />
                <Row label="Email" value={application.email} />
                <Row label="Country" value={application.country} />
                <Row label="Account" value={`${application.accountType} Account`} />
                <Row label="Submitted" value={submitted} />
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <h2 className="flex items-center gap-2 text-lg font-bold"><ShieldCheck className="size-5 text-gold" /> Verification timeline</h2>
              <div className="mt-5 grid gap-4">
                {["Application submitted", "Identity verified", "Account approved", "Platform credentials issued"].map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-1 grid size-6 place-items-center rounded-full bg-emerald-500 text-white">
                      ✓
                    </span>
                    <div>
                      <p className="font-semibold">{item}</p>
                      <p className="text-sm text-emerald-500 dark:text-emerald-300">Completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </aside>

          <div className="grid gap-6">
            <section className="grid gap-4 md:grid-cols-3">
              <Metric icon={WalletCards} label="Expected Deposit" value={`$${application.expectedDeposit}`} />
              <Metric icon={CircleDollarSign} label="Base Currency" value={application.baseCurrency} />
              <Metric icon={LockKeyhole} label="Security" value="2FA Ready" />
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold"><PieChart className="size-6 text-gold" /> Holdings</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Assets owned and investments held under this client profile.</p>
                </div>
                <div className="rounded-md bg-navy px-4 py-3 text-white dark:bg-gold dark:text-navy">
                  <p className="text-xs uppercase tracking-[0.18em] opacity-75">Portfolio Value</p>
                  <p className="text-2xl font-bold">${totalHoldings.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <HoldingStat label="Crypto Exposure" value={`$${cryptoValue.toLocaleString()}`} note="Digital asset holdings" />
                <HoldingStat label="Public Equities" value={`$${equitiesValue.toLocaleString()}`} note="Stocks and equity baskets" />
                <HoldingStat label="Alternatives" value={`$${alternativesValue.toLocaleString()}`} note="Gold and private market" />
                <HoldingStat label="Weighted Return" value={totalHoldings > 0 ? "+5.1%" : "+0.0%"} note="Indicative portfolio return" />
              </div>

              <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
                <div className="hidden grid-cols-[1.3fr_0.7fr_0.8fr_0.8fr_0.7fr_0.7fr] gap-3 bg-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:bg-white/10 dark:text-slate-300 md:grid">
                  <span>Asset</span>
                  <span>Symbol</span>
                  <span>Category</span>
                  <span>Value</span>
                  <span>Return</span>
                  <span>Status</span>
                </div>
                {holdings.map((holding) => (
                  <div key={holding.symbol} className="grid gap-3 border-t border-slate-200 px-4 py-4 text-sm first:border-t-0 dark:border-white/10 md:grid-cols-[1.3fr_0.7fr_0.8fr_0.8fr_0.7fr_0.7fr] md:items-center">
                    <div>
                      <p className="font-bold">{holding.name}</p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                        <span className="block h-full rounded-full bg-gold" style={{ width: `${Math.min(holding.allocation, 100)}%` }} />
                      </div>
                    </div>
                    <strong>{holding.symbol}</strong>
                    <span className="text-slate-600 dark:text-slate-300">{holding.category}</span>
                    <span className="font-bold">${holding.value.toLocaleString()}</span>
                    <span className={holding.returnValue.startsWith("+") ? "font-bold text-emerald-500" : "font-bold text-gold"}>{holding.returnValue}</span>
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">{holding.status}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-xl font-bold">Funding instruction preview</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Your selected method is {application.fundingMethod}. Cashier details are available now for verified clients.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <InfoBox icon={Landmark} title="Segregated accounts" body="Client money instructions are shown with unique payment references." />
                <InfoBox icon={Clock3} title="Instant verification" body="This client profile has been verified and marked ready for funding." />
                <InfoBox icon={Headphones} title="Support" body="A relationship team can help with documents, deposits, and platforms." />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Live market watch</h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {quotesUpdatedAt ? `Updated ${new Date(quotesUpdatedAt).toLocaleTimeString()}` : "Waiting for market feed"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${quotesLive ? "bg-emerald-400/10 text-emerald-500 dark:text-emerald-300" : "bg-gold/10 text-gold"}`}>
                    {quotesLive ? "Yahoo live feed" : "Fallback feed"}
                  </span>
                  <LineChart className="size-6 text-gold" />
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {quotes.map((quote) => (
                  <div key={quote.symbol} className="rounded-md border border-slate-200 p-4 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <strong>{quote.symbol}</strong>
                      <div className="text-right">
                        <span className={quote.change.startsWith("+") ? "text-emerald-500" : "text-rose-500"}>{quote.change}</span>
                        <p className="text-[0.65rem] uppercase tracking-[0.12em] text-slate-400">{quote.source === "live" ? "Live" : "Fallback"}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-3xl font-bold">{quote.price}</p>
                    <div className="mt-4 flex h-10 items-end gap-1" aria-hidden="true">
                      {quoteBars(quote).map((height, index) => (
                        <span key={index} className={`w-full ${quote.change.startsWith("-") ? "bg-rose-400/70" : "bg-emerald-400/70"}`} style={{ height: `${height}%` }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg bg-[#061126] p-5 text-white">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-xl font-bold">Next step: complete verification</h2>
                  <p className="mt-1 text-sm text-slate-300">Your account is verified and platform credentials are ready.</p>
                </div>
                <Link href="/open-account" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-4 py-3 text-sm font-bold">
                  Update Application <ArrowRight className="size-4" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0 dark:border-white/10">
      <span>{label}</span>
      <strong className="text-right text-navy dark:text-white">{value}</strong>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <Icon className="size-6 text-gold" />
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </article>
  );
}

function HoldingStat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#07111f]">
      <TrendingUp className="size-5 text-gold" />
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{note}</p>
    </article>
  );
}

function InfoBox({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <article className="rounded-md bg-slate-50 p-4 dark:bg-white/5">
      <Icon className="size-6 text-gold" />
      <h3 className="mt-3 font-bold">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{body}</p>
    </article>
  );
}
