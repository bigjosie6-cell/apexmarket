"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bell,
  CircleDollarSign,
  Clock3,
  Coins,
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
  return Array.from({ length: 14 }, (_, index) => 24 + ((base / (index + 3) + change * 17 + index * 11) % 58));
}

function quoteAsk(price: string) {
  const numeric = Number.parseFloat(price.replaceAll(",", ""));
  if (!Number.isFinite(numeric)) return price;
  const spread = numeric > 1000 ? 0.45 : numeric > 100 ? 0.018 : 0.00014;
  const decimals = price.includes(".") ? price.split(".")[1].length : 0;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numeric + spread);
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("hutridge-notifications-read") === "true";
  });

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
  const notifications = [
    {
      title: "Account verified",
      body: `${application.accountNumber} is active and ready for funding.`,
      time: "Now",
    },
    {
      title: "Funding desk available",
      body: `Selected funding method: ${application.fundingMethod}. Deposit details can be requested from Cashier.`,
      time: "Today",
    },
    {
      title: "Market watch updated",
      body: quotesLive ? "Live quotes are refreshing from the connected market feed." : "Fallback quotes are showing until the market feed responds.",
      time: quotesUpdatedAt ? new Date(quotesUpdatedAt).toLocaleTimeString() : "Pending",
    },
  ];
  const unreadCount = notificationsRead ? 0 : notifications.length;

  const toggleNotifications = () => {
    setNotificationsOpen((open) => !open);
    setNotificationsRead(true);
    window.localStorage.setItem("hutridge-notifications-read", "true");
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef3f8_42%,#f8fafc_100%)] text-navy dark:bg-[linear-gradient(180deg,#07111f_0%,#0a1830_50%,#050b15_100%)] dark:text-white">
      <header className="border-b border-slate-200/80 bg-white/90 px-4 py-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#07111f]/90 lg:px-8">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <span className="grid size-10 place-items-center rounded-md bg-navy text-gold shadow-lg shadow-navy/15 dark:bg-white">HF</span>
            <span>Hutridge Financial Client Area</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={toggleNotifications}
                className="relative rounded-md border border-slate-200 p-2 transition hover:border-gold hover:text-gold dark:border-white/10"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell className="size-5" />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-gold text-[0.65rem] font-bold text-navy">
                    {unreadCount}
                  </span>
                ) : null}
              </button>
              {notificationsOpen ? (
                <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0f1b2c]">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
                    <div>
                      <p className="text-sm font-bold">Notifications</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Latest client account updates</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-500 dark:text-emerald-300">Live</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.title} className="border-b border-slate-100 px-4 py-3 last:border-b-0 dark:border-white/10">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-semibold">{notification.title}</p>
                          <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{notification.time}</span>
                        </div>
                        <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">{notification.body}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 border-t border-slate-200 text-sm font-bold dark:border-white/10">
                    <Link href="/support" className="px-4 py-3 text-center hover:bg-slate-50 dark:hover:bg-white/5">Support</Link>
                    <Link href="/cashier" className="border-l border-slate-200 px-4 py-3 text-center hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5">Cashier</Link>
                  </div>
                </div>
              ) : null}
            </div>
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
        <div className="relative overflow-hidden rounded-lg bg-[linear-gradient(135deg,#071832_0%,#0A1F44_48%,#102d58_100%)] p-6 text-white shadow-2xl shadow-navy/20">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_65%_30%,rgba(212,175,55,0.24),transparent_18rem)] lg:block" />
          <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="section-kicker">Application received</p>
              <h1 className="mt-3 text-4xl font-bold md:text-5xl">Welcome, {application.firstName}</h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                Your Hutridge Financial account is verified and active. Your client area is ready for funding, holdings review, and platform access.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <HeroPill label="Portfolio value" value={`$${totalHoldings.toLocaleString()}`} />
                <HeroPill label="Account tier" value={application.accountType} />
                <HeroPill label="Market status" value={quotesLive ? "Live feed" : "Standby"} />
              </div>
            </div>
            <div className="grid gap-4 rounded-lg border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/10 backdrop-blur">
              <PortfolioVisual value={`$${totalHoldings.toLocaleString()}`} />
              <div className="rounded-md border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-slate-300">Account reference</p>
                <p className="mt-1 text-3xl font-bold">{application.accountNumber}</p>
                <p className="mt-3 inline-flex rounded-full bg-emerald-300/15 px-3 py-1 text-sm font-semibold text-emerald-200">{application.status === "Pending Verification" ? "Verified" : application.status}</p>
              </div>
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
              <Metric icon={WalletCards} label="Expected Deposit" value={`$${application.expectedDeposit}`} tone="gold" />
              <Metric icon={CircleDollarSign} label="Base Currency" value={application.baseCurrency} tone="blue" />
              <Metric icon={LockKeyhole} label="Security" value="2FA Ready" tone="green" />
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/70 dark:border-white/10 dark:bg-white/5 dark:shadow-black/20">
              <div className="grid gap-5 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_60%,#fff8df_100%)] p-5 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] lg:grid-cols-[1fr_18rem]">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold"><PieChart className="size-6 text-gold" /> Holdings</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Assets owned and investments held under this client profile.</p>
                </div>
                <div className="rounded-md bg-navy p-4 text-white shadow-lg dark:bg-gold dark:text-navy">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-md bg-gold/20 dark:bg-navy/10">
                      <Banknote className="size-6 text-gold dark:text-navy" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] opacity-75">Portfolio Value</p>
                      <p className="text-2xl font-bold">${totalHoldings.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5">
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

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-[#07111f] text-white shadow-xl shadow-slate-200/60 dark:border-white/10 dark:shadow-black/20">
              <div className="flex flex-col justify-between gap-4 border-b border-white/10 bg-[linear-gradient(135deg,#061126,#10264a)] p-5 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Market terminal</p>
                  <h2 className="mt-2 text-2xl font-bold">Live market watch</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {quotesUpdatedAt ? `Updated ${new Date(quotesUpdatedAt).toLocaleTimeString()}` : "Waiting for market feed"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${quotesLive ? "bg-emerald-400/10 text-emerald-300" : "bg-gold/10 text-gold"}`}>
                    {quotesLive ? "Yahoo live feed" : "Fallback feed"}
                  </span>
                  <LineChart className="size-6 text-gold" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.7fr_1fr] gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    <span>Symbol</span>
                    <span>Bid</span>
                    <span>Ask</span>
                    <span>Change</span>
                    <span className="text-right">Trend</span>
                  </div>
                  <div>
                    {quotes.map((quote) => (
                      <div key={quote.symbol} className="grid grid-cols-[1fr_0.8fr_0.8fr_0.7fr_1fr] items-center gap-3 border-b border-white/10 px-5 py-4 last:border-b-0">
                        <div>
                          <strong className="text-lg">{quote.symbol}</strong>
                          <p className="mt-1 text-[0.65rem] uppercase tracking-[0.12em] text-slate-500">{quote.source === "live" ? "Live" : "Fallback"}</p>
                        </div>
                        <span className="font-mono text-lg font-bold">{quote.price}</span>
                        <span className="font-mono text-slate-300">{quoteAsk(quote.price)}</span>
                        <span className={`font-bold ${quote.change.startsWith("+") ? "text-emerald-300" : "text-rose-300"}`}>{quote.change}</span>
                        <div className="flex h-10 items-end justify-end gap-1" aria-hidden="true">
                          {quoteBars(quote).map((height, index) => (
                            <span key={index} className={`w-1 rounded-full ${quote.change.startsWith("-") ? "bg-rose-400/70" : "bg-emerald-400/70"}`} style={{ height: `${height}%` }} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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

function HeroPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/15 bg-white/10 p-4 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-300">{label}</p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}

function PortfolioVisual({ value }: { value: string }) {
  return (
    <div className="relative overflow-hidden rounded-md border border-white/10 bg-[#061126] p-5">
      <div className="absolute right-4 top-4 grid size-16 place-items-center rounded-full bg-gold/15">
        <Coins className="size-8 text-gold" />
      </div>
      <div className="relative grid min-h-36 content-end">
        <div className="relative mx-auto mb-2 grid size-28 place-items-center rounded-b-[2rem] rounded-t-lg bg-[linear-gradient(180deg,#f8d75a,#b88912)] shadow-2xl shadow-gold/20">
          <div className="absolute -top-5 h-8 w-16 rounded-t-full border-8 border-gold/80 border-b-0" />
          <span className="text-4xl font-black text-navy">$</span>
        </div>
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current holdings</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone: "gold" | "blue" | "green" }) {
  const toneClass = {
    gold: "from-gold/20 to-white dark:to-white/5",
    blue: "from-sky-100 to-white dark:from-sky-400/10 dark:to-white/5",
    green: "from-emerald-100 to-white dark:from-emerald-400/10 dark:to-white/5",
  }[tone];

  return (
    <article className={`rounded-lg border border-slate-200 bg-gradient-to-br ${toneClass} p-5 shadow-lg shadow-slate-200/60 dark:border-white/10 dark:shadow-black/20`}>
      <span className="grid size-11 place-items-center rounded-md bg-white text-gold shadow-sm dark:bg-white/10">
        <Icon className="size-6" />
      </span>
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
