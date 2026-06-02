"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CircleDollarSign,
  Clock3,
  Download,
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
  firstName: "Demo",
  lastName: "Trader",
  email: "demo@hutridgefinancial.com",
  country: "United States",
  accountType: "Standard",
  baseCurrency: "USD",
  fundingMethod: "Bank Transfer",
  expectedDeposit: "1000",
  accountNumber: "HF-DEMO01",
  status: "Verified",
  submittedAt: new Date().toISOString(),
};

const watchlist = [
  ["EUR/USD", "1.08756", "+0.18%"],
  ["GBP/USD", "1.27436", "-0.07%"],
  ["XAU/USD", "2358.92", "+0.41%"],
  ["BTC/USD", "68,448", "+1.16%"],
];

const holdings = [
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

const totalHoldings = holdings.reduce((total, holding) => total + holding.value, 0);

export default function ClientPortalPage() {
  const [application, setApplication] = useState<Application>(fallback);

  useEffect(() => {
    queueMicrotask(() => {
      const saved = localStorage.getItem("hutridge-application");
      if (saved) setApplication(JSON.parse(saved));
    });
  }, []);

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
                Your Hutridge Financial account application has been created and is queued for compliance review. This client area is now active for status tracking, funding preview, and platform access.
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
                <HoldingStat label="Crypto Exposure" value="$21,750" note="BTC, ETH, TRUMP, basket" />
                <HoldingStat label="Public Equities" value="$22,800" note="$TESLA, $ABTC, US basket" />
                <HoldingStat label="Alternatives" value="$21,500" note="Gold and private market" />
                <HoldingStat label="Weighted Return" value="+5.1%" note="Indicative portfolio return" />
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
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Your selected method is {application.fundingMethod}. Final cashier details unlock after verification approval.</p>
                </div>
                <button className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-4 py-3 text-sm font-bold text-navy">
                  Download Application <Download className="size-4" />
                </button>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <InfoBox icon={Landmark} title="Segregated accounts" body="Client money instructions are shown with unique payment references." />
                <InfoBox icon={Clock3} title="Review window" body="Most complete applications are reviewed within one business day." />
                <InfoBox icon={Headphones} title="Support" body="A relationship team can help with documents, deposits, and platforms." />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Market watch</h2>
                <LineChart className="size-6 text-gold" />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {watchlist.map(([symbol, price, change]) => (
                  <div key={symbol} className="rounded-md border border-slate-200 p-4 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <strong>{symbol}</strong>
                      <span className={change.startsWith("+") ? "text-emerald-500" : "text-rose-500"}>{change}</span>
                    </div>
                    <p className="mt-2 text-3xl font-bold">{price}</p>
                    <div className="mt-4 flex h-10 items-end gap-1" aria-hidden="true">
                      {[35, 52, 43, 70, 61, 82, 74, 92].map((height, index) => (
                        <span key={index} className="w-full bg-gold/70" style={{ height: `${height}%` }} />
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
