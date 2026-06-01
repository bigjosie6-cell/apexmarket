"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, BarChart3, CircleDollarSign, Download, LineChart, LogOut, Play, WalletCards } from "lucide-react";

type DemoAccount = {
  firstName: string;
  lastName: string;
  email: string;
  platform: string;
  balance: string;
  login: string;
  password: string;
  server: string;
  equity: number;
  createdAt: string;
};

type Position = {
  id: string;
  symbol: string;
  side: "Buy" | "Sell";
  lots: string;
  openPrice: string;
  pnl: number;
};

const fallback: DemoAccount = {
  firstName: "Demo",
  lastName: "Trader",
  email: "demo@apexfxmarkets.com",
  platform: "ApexFX WebTrader",
  balance: "50,000",
  login: "D000001",
  password: "Apex-demo",
  server: "ApexFX-Demo",
  equity: 50000,
  createdAt: new Date().toISOString(),
};

const markets = [
  ["EUR/USD", "1.08756", "+0.18%", "0.6"],
  ["GBP/USD", "1.27436", "-0.07%", "0.8"],
  ["USD/JPY", "156.301", "+0.24%", "0.7"],
  ["XAU/USD", "2358.92", "+0.41%", "1.8"],
  ["US100", "18842.7", "+0.33%", "1.2"],
  ["BTC/USD", "68,448", "+1.16%", "22.0"],
];

export default function DemoTerminalPage() {
  const [account, setAccount] = useState<DemoAccount>(fallback);
  const [symbol, setSymbol] = useState("EUR/USD");
  const [lots, setLots] = useState("0.10");
  const [positions, setPositions] = useState<Position[]>([
    { id: "P-1001", symbol: "XAU/USD", side: "Buy", lots: "0.05", openPrice: "2351.28", pnl: 38.42 },
  ]);

  useEffect(() => {
    queueMicrotask(() => {
      const saved = localStorage.getItem("apexfx-demo-account");
      if (saved) setAccount(JSON.parse(saved));
    });
  }, []);

  const openPnl = useMemo(() => positions.reduce((total, position) => total + position.pnl, 0), [positions]);
  const equity = account.equity + openPnl;
  const margin = positions.length * 124.5;
  const freeMargin = equity - margin;
  const selectedMarket = markets.find(([name]) => name === symbol) ?? markets[0];

  const placeOrder = (side: "Buy" | "Sell") => {
    const price = selectedMarket[1];
    const direction = side === "Buy" ? 1 : -1;
    const pnl = Number((direction * (12 + positions.length * 7.35)).toFixed(2));
    setPositions((current) => [
      {
        id: `P-${Math.floor(1000 + current.length * 137 + Number(lots) * 100)}`,
        symbol,
        side,
        lots,
        openPrice: price,
        pnl,
      },
      ...current,
    ]);
  };

  const closePosition = (id: string) => {
    setPositions((current) => current.filter((position) => position.id !== id));
  };

  return (
    <main className="min-h-screen bg-[#061126] text-white">
      <header className="border-b border-white/10 bg-[#07111f] px-4 py-4 lg:px-8">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <span className="grid size-10 place-items-center rounded-md bg-white text-gold">AX</span>
            <span>ApexFX Demo Terminal</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/demo-account" className="rounded-md border border-white/15 px-4 py-2 text-sm font-bold">New Demo</Link>
            <Link href="/" className="rounded-md bg-gold px-4 py-2 text-sm font-bold text-navy">
              <LogOut className="mr-2 inline size-4" />
              Exit
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
        <aside className="grid gap-5">
          <article className="rounded-lg border border-white/10 bg-white/5 p-5">
            <p className="section-kicker">Demo account active</p>
            <h1 className="mt-2 text-3xl font-bold">Welcome, {account.firstName}</h1>
            <div className="mt-5 grid gap-3 text-sm text-slate-300">
              <Row label="Login" value={account.login} />
              <Row label="Password" value={account.password} />
              <Row label="Server" value={account.server} />
              <Row label="Platform" value={account.platform} />
            </div>
          </article>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Metric icon={WalletCards} label="Balance" value={`$${account.equity.toLocaleString()}`} />
            <Metric icon={CircleDollarSign} label="Equity" value={`$${equity.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
            <Metric icon={BarChart3} label="Open P/L" value={`${openPnl >= 0 ? "+" : "-"}$${Math.abs(openPnl).toFixed(2)}`} positive={openPnl >= 0} />
          </section>

          <article className="rounded-lg border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-bold">Margin overview</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-300">
              <Row label="Used margin" value={`$${margin.toFixed(2)}`} />
              <Row label="Free margin" value={`$${freeMargin.toFixed(2)}`} />
              <Row label="Leverage" value="1:100 demo" />
            </div>
          </article>
        </aside>

        <div className="grid gap-5">
          <section className="rounded-lg border border-white/10 bg-[#081832] p-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="section-kicker">WebTrader</p>
                <h2 className="text-2xl font-bold">{symbol} chart</h2>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-semibold text-emerald-200">Streaming demo prices</span>
            </div>
            <div className="relative mt-5 h-72 overflow-hidden rounded-md bg-[#061126] p-5">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:38px_38px]" />
              <div className="relative z-10 flex h-full items-end gap-2">
                {[38, 46, 34, 62, 56, 72, 66, 88, 74, 92, 68, 84, 76, 94, 86, 98].map((height, index) => (
                  <span key={index} className={index % 4 === 0 ? "w-full bg-rose-400/80" : "w-full bg-emerald-400/80"} style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-lg border border-white/10 bg-white/5 p-5">
              <h2 className="flex items-center gap-2 text-xl font-bold"><LineChart className="size-5 text-gold" /> Market watch</h2>
              <div className="mt-4 grid gap-3">
                {markets.map(([name, price, change, spread]) => (
                  <button
                    type="button"
                    key={name}
                    onClick={() => setSymbol(name)}
                    className={`grid grid-cols-4 items-center gap-3 rounded-md border p-3 text-left text-sm ${symbol === name ? "border-gold bg-gold/10" : "border-white/10 bg-[#07111f]"}`}
                  >
                    <strong>{name}</strong>
                    <span>{price}</span>
                    <span className={change.startsWith("+") ? "text-emerald-300" : "text-rose-300"}>{change}</span>
                    <span className="text-slate-300">{spread} spread</span>
                  </button>
                ))}
              </div>
            </article>

            <form
              className="rounded-lg border border-white/10 bg-white/5 p-5"
              onSubmit={(event) => {
                event.preventDefault();
                placeOrder("Buy");
              }}
            >
              <h2 className="text-xl font-bold">Order ticket</h2>
              <label className="mt-4 grid gap-2 text-sm font-semibold">
                Symbol
                <select className="form-field" value={symbol} onChange={(event) => setSymbol(event.target.value)}>
                  {markets.map(([name]) => <option key={name}>{name}</option>)}
                </select>
              </label>
              <label className="mt-4 grid gap-2 text-sm font-semibold">
                Volume
                <input className="form-field" type="number" step="0.01" min="0.01" value={lots} onChange={(event) => setLots(event.target.value)} />
              </label>
              <div className="mt-4 rounded-md bg-[#061126] p-4">
                <p className="text-sm text-slate-300">Indicative price</p>
                <p className="text-3xl font-bold">{selectedMarket[1]}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => placeOrder("Sell")} className="rounded-md bg-rose-500 px-4 py-3 font-bold">
                  <ArrowDown className="mr-2 inline size-4" />
                  Sell
                </button>
                <button className="rounded-md bg-emerald-500 px-4 py-3 font-bold">
                  <ArrowUp className="mr-2 inline size-4" />
                  Buy
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/5 p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <h2 className="text-xl font-bold">Open demo positions</h2>
              <button className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm font-bold">
                <Download className="size-4" />
                Export Statement
              </button>
            </div>
            <div className="mt-4 overflow-hidden rounded-md border border-white/10">
              {positions.map((position) => (
                <div key={position.id} className="grid gap-3 border-b border-white/10 p-4 text-sm last:border-b-0 md:grid-cols-7 md:items-center">
                  <strong>{position.symbol}</strong>
                  <span>{position.side}</span>
                  <span>{position.lots} lots</span>
                  <span>{position.openPrice}</span>
                  <span className={position.pnl >= 0 ? "text-emerald-300" : "text-rose-300"}>{position.pnl >= 0 ? "+" : "-"}${Math.abs(position.pnl).toFixed(2)}</span>
                  <span>{position.id}</span>
                  <button onClick={() => closePosition(position.id)} className="rounded-md border border-white/15 px-3 py-2 font-bold">Close</button>
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-slate-300">
              <Play className="size-4 text-gold" />
              Simulated demo execution only. No real orders are sent.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/10 pb-2 last:border-b-0">
      <span>{label}</span>
      <strong className="text-right text-white">{value}</strong>
    </div>
  );
}

function Metric({ icon: Icon, label, value, positive = true }: { icon: React.ElementType; label: string; value: string; positive?: boolean }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/5 p-5">
      <Icon className="size-6 text-gold" />
      <p className="mt-4 text-sm text-slate-300">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${label === "Open P/L" ? (positive ? "text-emerald-300" : "text-rose-300") : "text-white"}`}>{value}</p>
    </article>
  );
}
