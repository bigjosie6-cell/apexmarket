"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, CircleDollarSign, Landmark, LineChart, ShieldCheck, UserPlus, WalletCards } from "lucide-react";

const symbols = [
  ["EUR/USD", "1.08756", "1.08763", "0.7"],
  ["GBP/USD", "1.27436", "1.27445", "0.9"],
  ["USD/JPY", "156.301", "156.309", "0.8"],
  ["XAU/USD", "2358.92", "2359.18", "2.6"],
  ["US100", "18842.7", "18844.1", "1.4"],
  ["BTC/USD", "68,448", "68,472", "24.0"],
];

type ClientApplication = {
  firstName: string;
  lastName: string;
  email: string;
  accountNumber: string;
  status: string;
};

type Holding = {
  value: number;
};

type TradeOrder = {
  orderId: string;
  symbol: string;
  side: "Buy" | "Sell";
  volume: number;
  orderType: string;
  indicativePrice: string;
  status: string;
  createdAt: string;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function TradePage() {
  const [symbol, setSymbol] = useState("EUR/USD");
  const [side, setSide] = useState<"Buy" | "Sell">("Buy");
  const [volume, setVolume] = useState("0.10");
  const [orderType, setOrderType] = useState<"Market" | "Limit" | "Stop">("Market");
  const [status, setStatus] = useState("Log in with a registered account to submit trade requests.");
  const [application, setApplication] = useState<ClientApplication | null>(null);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const selected = symbols.find(([name]) => name === symbol) ?? symbols[0];
  const isLoggedIn = Boolean(application?.accountNumber);
  const indicativePrice = side === "Buy" ? selected[2] : selected[1];

  useEffect(() => {
    const loadPortfolio = async (accountNumber: string) => {
      try {
        const response = await fetch(`/api/portfolio?accountNumber=${encodeURIComponent(accountNumber)}`, { cache: "no-store" });
        const result = await response.json();
        const holdings = (result.portfolio?.holdings ?? []) as Holding[];
        setPortfolioValue(holdings.reduce((total, holding) => total + Number(holding.value || 0), 0));
      } catch {
        setPortfolioValue(0);
      }
    };

    const loadOrders = async (accountNumber: string) => {
      try {
        const response = await fetch(`/api/orders?accountNumber=${encodeURIComponent(accountNumber)}`, { cache: "no-store" });
        const result = await response.json();
        setOrders(result.orders ?? []);
      } catch {
        setOrders([]);
      }
    };

    const connectApplication = (nextApplication: ClientApplication) => {
      setApplication(nextApplication);
      setStatus(`Trading access ready for ${nextApplication.accountNumber}.`);
      loadPortfolio(nextApplication.accountNumber);
      loadOrders(nextApplication.accountNumber);
    };

    const loadClientSession = async () => {
      const saved = window.localStorage.getItem("hutridge-application");
      if (saved) {
        connectApplication(JSON.parse(saved) as ClientApplication);
        return;
      }

      try {
        const response = await fetch("/api/client-session", { cache: "no-store", credentials: "include" });
        const result = await response.json();
        if (response.ok && result.application) {
          window.localStorage.setItem("hutridge-application", JSON.stringify(result.application));
          connectApplication(result.application as ClientApplication);
          return;
        }
      } catch {
        // Keep the login prompt visible if the session cannot be loaded.
      }

      setStatus("Login with a registered account before submitting trade requests.");
    };

    loadClientSession();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!application?.accountNumber) {
      setStatus("Please log in or open an account before submitting trade requests.");
      return;
    }

    setSubmitting(true);
    setStatus("Submitting trade request...");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          accountNumber: application.accountNumber,
          symbol,
          side,
          volume,
          orderType,
          indicativePrice,
        }),
      });
      const result = await response.json();
      setStatus(result.message ?? (response.ok ? "Trade request submitted." : "Trade request could not be submitted."));
      if (response.ok) {
        setOrders((current) => [result.order, ...current].filter(Boolean));
        const refreshed = await fetch(`/api/orders?accountNumber=${encodeURIComponent(application.accountNumber)}`, { cache: "no-store" });
        const refreshedResult = await refreshed.json();
        setOrders(refreshedResult.orders ?? [result.order].filter(Boolean));
      }
    } catch {
      setStatus("Trade request could not be submitted. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#061126_0%,#071832_58%,#050b15_100%)] text-white">
      <header className="border-b border-white/10 bg-[#07111f]/90 px-4 py-4 shadow-xl shadow-black/20 backdrop-blur-xl lg:px-8">
        <nav className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex min-w-0 items-center gap-3 font-semibold">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-white text-gold">HF</span>
            <span className="min-w-0 leading-tight">Hutridge Financial Live Terminal</span>
          </Link>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
            <Link href="/login" className="rounded-md border border-white/15 px-3 py-2 text-sm font-bold sm:px-4">Login</Link>
            <Link href="/cashier" className="rounded-md bg-gold px-3 py-2 text-sm font-bold text-navy sm:px-4">Deposit</Link>
            <Link href="/client-portal" className="rounded-md border border-white/15 px-3 py-2 text-sm font-bold sm:px-4">Client Area</Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
        <aside className="grid gap-5">
          <article className={`rounded-lg border p-5 shadow-2xl shadow-black/10 ${isLoggedIn ? "border-emerald-300/30 bg-emerald-400/10" : "border-gold/40 bg-gold/10"}`}>
            {isLoggedIn ? <ShieldCheck className="size-7 text-emerald-300" /> : <UserPlus className="size-7 text-gold" />}
            <h1 className="mt-3 text-2xl font-bold">{isLoggedIn ? "Trading access active" : "Register before trading"}</h1>
            <p className="mt-2 text-sm leading-6 text-amber-100">
              {isLoggedIn
                ? `${application?.firstName ?? "Client"} ${application?.lastName ?? ""} is connected under ${application?.accountNumber}. Trade requests will be recorded to this account.`
                : "Create an Hutridge Financial account first so your profile, country, contact details, account type, and verification status are ready before terminal access."}
            </p>
            {!isLoggedIn ? (
              <Link href="/open-account" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold px-4 py-3 text-sm font-bold text-navy">
                Open Trading Account <ArrowRight className="size-4" />
              </Link>
            ) : null}
          </article>
          <article className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-5">
            <ShieldCheck className="size-7 text-gold" />
            <h2 className="mt-3 text-xl font-bold">{isLoggedIn ? "Trade request mode" : "Terminal access locked"}</h2>
            <p className="mt-2 text-sm leading-6 text-amber-100">
              {isLoggedIn
                ? "Orders are submitted as account trade requests for desk review. No external broker execution is connected."
                : "Live execution stays locked until a registered account is logged in on this device."}
            </p>
          </article>
          <Metric icon={WalletCards} label="Portfolio Balance" value={formatMoney(portfolioValue)} />
          <Metric icon={CircleDollarSign} label="Available Margin" value={isLoggedIn ? formatMoney(portfolioValue) : "Login required"} />
          <Metric icon={Landmark} label="Account Status" value={isLoggedIn ? application?.status ?? "Verified" : "Not connected"} />
        </aside>

        <div className="grid gap-5">
          <section className="rounded-lg border border-white/10 bg-[#081832]/95 p-5 shadow-2xl shadow-black/20">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="section-kicker">Live terminal</p>
                <h2 className="text-2xl font-bold">{symbol} price board</h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${isLoggedIn ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-300/15 text-amber-200"}`}>
                {isLoggedIn ? "Client connected" : "Login required"}
              </span>
            </div>
            <div className="relative mt-5 h-72 overflow-hidden rounded-md bg-[#061126] p-5">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:38px_38px]" />
              <div className="relative z-10 flex h-full items-end gap-2">
                {[42, 55, 48, 66, 58, 76, 70, 86, 78, 92, 84, 68, 74, 88, 80, 96].map((height, index) => (
                  <span key={index} className={index % 5 === 0 ? "w-full bg-rose-400/80" : "w-full bg-emerald-400/80"} style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-lg border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10">
              <h2 className="flex items-center gap-2 text-xl font-bold"><LineChart className="size-5 text-gold" /> Market watch</h2>
              <div className="mt-4 grid gap-3">
                {symbols.map(([name, bid, ask, spread]) => (
                  <button
                    type="button"
                    key={name}
                    onClick={() => setSymbol(name)}
                    className={`grid grid-cols-2 items-center gap-3 rounded-md border p-3 text-left text-sm transition hover:border-gold/70 sm:grid-cols-4 ${symbol === name ? "border-gold bg-gold/10" : "border-white/10 bg-[#07111f]"}`}
                  >
                    <strong>{name}</strong>
                    <span>Bid {bid}</span>
                    <span>Ask {ask}</span>
                    <span className="text-slate-300">{spread} spread</span>
                  </button>
                ))}
              </div>
            </article>

            <form onSubmit={submit} className="rounded-lg border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10">
              <h2 className="text-xl font-bold">Live order ticket</h2>
              <label className="mt-4 grid gap-2 text-sm font-semibold">
                Symbol
                <select className="form-field" value={symbol} onChange={(event) => setSymbol(event.target.value)}>
                  {symbols.map(([name]) => <option key={name}>{name}</option>)}
                </select>
              </label>
              <label className="mt-4 grid gap-2 text-sm font-semibold">
                Order type
                <select className="form-field" value={orderType} onChange={(event) => setOrderType(event.target.value as "Market" | "Limit" | "Stop")}>
                  {["Market", "Limit", "Stop"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="mt-4 grid gap-2 text-sm font-semibold">
                Volume
                <input className="form-field" type="number" step="0.01" min="0.01" value={volume} onChange={(event) => setVolume(event.target.value)} />
              </label>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setSide("Sell")} className={`rounded-md px-4 py-3 font-bold ${side === "Sell" ? "bg-rose-500" : "bg-white/10"}`}>
                  <ArrowDown className="mr-2 inline size-4" />
                  Sell
                </button>
                <button type="button" onClick={() => setSide("Buy")} className={`rounded-md px-4 py-3 font-bold ${side === "Buy" ? "bg-emerald-500" : "bg-white/10"}`}>
                  <ArrowUp className="mr-2 inline size-4" />
                  Buy
                </button>
              </div>
              <div className="mt-4 rounded-md bg-[#061126] p-4 text-sm text-slate-300">
                Selected {side} {volume} lots of {symbol} at indicative {side === "Buy" ? selected[2] : selected[1]}.
              </div>
              {isLoggedIn ? (
                <button type="submit" disabled={submitting} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold px-5 py-3 font-bold text-navy disabled:cursor-not-allowed disabled:opacity-60">
                  {submitting ? "Submitting Trade Request..." : "Submit Trade Request"} <ArrowRight className="size-4" />
                </button>
              ) : (
            <Link href="/login?next=/trade" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold px-5 py-3 font-bold text-navy">
              Login to Trade <ArrowRight className="size-4" />
            </Link>
              )}
              <p className={`mt-4 rounded-md border p-3 text-sm ${isLoggedIn ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100" : "border-white/10 bg-white/5 text-slate-300"}`}>
                {status}
              </p>
            </form>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-bold">Submitted trade requests</h2>
            <div className="mt-4 overflow-hidden rounded-md border border-white/10">
              {orders.length ? orders.map((order) => (
                <div key={order.orderId} className="grid gap-3 border-b border-white/10 p-4 text-sm last:border-b-0 md:grid-cols-6 md:items-center">
                  <strong>{order.orderId}</strong>
                  <span>{order.side} {order.symbol}</span>
                  <span>{order.volume} lots</span>
                  <span>{order.orderType}</span>
                  <span>{order.indicativePrice}</span>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-center text-xs font-bold text-emerald-200">{order.status}</span>
                </div>
              )) : (
                <p className="p-4 text-sm text-slate-300">No trade requests submitted for this account yet.</p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/5 p-5">
      <Icon className="size-6 text-gold" />
      <p className="mt-4 text-sm text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </article>
  );
}
