"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowDown, ArrowUp, CircleDollarSign, Landmark, LineChart, ShieldAlert, WalletCards } from "lucide-react";

const symbols = [
  ["EUR/USD", "1.08756", "1.08763", "0.7"],
  ["GBP/USD", "1.27436", "1.27445", "0.9"],
  ["USD/JPY", "156.301", "156.309", "0.8"],
  ["XAU/USD", "2358.92", "2359.18", "2.6"],
  ["US100", "18842.7", "18844.1", "1.4"],
  ["BTC/USD", "68,448", "68,472", "24.0"],
];

export default function TradePage() {
  const [symbol, setSymbol] = useState("EUR/USD");
  const [side, setSide] = useState<"Buy" | "Sell">("Buy");
  const [volume, setVolume] = useState("0.10");
  const [orderType, setOrderType] = useState<"Market" | "Limit" | "Stop">("Market");
  const [status, setStatus] = useState("Live execution is disabled until a licensed broker API is connected.");
  const [loading, setLoading] = useState(false);
  const selected = symbols.find(([name]) => name === symbol) ?? symbols[0];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountNumber: "AFX-LIVE-PENDING",
        symbol,
        side,
        volume,
        orderType,
      }),
    });
    const result = await response.json();
    setStatus(result.message ?? "Order request received.");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#061126] text-white">
      <header className="border-b border-white/10 bg-[#07111f] px-4 py-4 lg:px-8">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <span className="grid size-10 place-items-center rounded-md bg-white text-gold">AX</span>
            <span>ApexFX Live Terminal</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/cashier" className="rounded-md bg-gold px-4 py-2 text-sm font-bold text-navy">Deposit</Link>
            <Link href="/client-portal" className="rounded-md border border-white/15 px-4 py-2 text-sm font-bold">Client Area</Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
        <aside className="grid gap-5">
          <article className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-5">
            <ShieldAlert className="size-7 text-gold" />
            <h1 className="mt-3 text-2xl font-bold">Broker connection required</h1>
            <p className="mt-2 text-sm leading-6 text-amber-100">
              This terminal is live-ready, but it will not send real orders until ApexFX has a licensed broker execution API, KYC-approved accounts, risk checks, and production credentials.
            </p>
          </article>
          <Metric icon={WalletCards} label="Live Balance" value="$0.00" />
          <Metric icon={CircleDollarSign} label="Available Margin" value="Pending approval" />
          <Metric icon={Landmark} label="Account Status" value="Not connected" />
        </aside>

        <div className="grid gap-5">
          <section className="rounded-lg border border-white/10 bg-[#081832] p-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="section-kicker">Live terminal</p>
                <h2 className="text-2xl font-bold">{symbol} price board</h2>
              </div>
              <span className="rounded-full bg-amber-300/15 px-3 py-1 text-sm font-semibold text-amber-200">Execution locked</span>
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
            <article className="rounded-lg border border-white/10 bg-white/5 p-5">
              <h2 className="flex items-center gap-2 text-xl font-bold"><LineChart className="size-5 text-gold" /> Market watch</h2>
              <div className="mt-4 grid gap-3">
                {symbols.map(([name, bid, ask, spread]) => (
                  <button
                    type="button"
                    key={name}
                    onClick={() => setSymbol(name)}
                    className={`grid grid-cols-4 items-center gap-3 rounded-md border p-3 text-left text-sm ${symbol === name ? "border-gold bg-gold/10" : "border-white/10 bg-[#07111f]"}`}
                  >
                    <strong>{name}</strong>
                    <span>Bid {bid}</span>
                    <span>Ask {ask}</span>
                    <span className="text-slate-300">{spread} spread</span>
                  </button>
                ))}
              </div>
            </article>

            <form onSubmit={submit} className="rounded-lg border border-white/10 bg-white/5 p-5">
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
              <button disabled={loading} className="mt-4 w-full rounded-md bg-gold px-5 py-3 font-bold text-navy disabled:opacity-60">
                {loading ? "Submitting..." : "Submit Order Request"}
              </button>
              <p className="mt-4 rounded-md border border-white/10 bg-white/5 p-3 text-sm text-slate-300">{status}</p>
            </form>
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
