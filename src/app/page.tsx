"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  Coins,
  Cpu,
  Globe2,
  Headphones,
  HeartHandshake,
  Landmark,
  Laptop,
  LineChart,
  Menu,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
  Users,
  X,
  Zap,
} from "lucide-react";

const navItems = [
  "Home",
  "Trading",
  "Markets",
  "Platforms",
  "Accounts",
  "Partners",
  "Education",
  "About Us",
  "Gives",
  "Contact",
  "Support",
];

const navHref = (item: string) => {
  if (item === "Home") return "#home";
  if (item === "Gives") return "/donate";
  if (item === "Support") return "/support";
  if (item === "Contact") return "/support";
  return `#${item.toLowerCase().replaceAll(" ", "-")}`;
};

const instruments = [
  {
    name: "Forex",
    text: "Major, minor, and exotic pairs with deep liquidity and competitive pricing.",
    icon: CircleDollarSign,
  },
  {
    name: "Commodities",
    text: "Trade gold, silver, oil, and key energy markets from one account.",
    icon: Coins,
  },
  {
    name: "Indices",
    text: "Access US30, NASDAQ, S&P500, DAX, FTSE, and other benchmark markets.",
    icon: BarChart3,
  },
  {
    name: "Crypto CFDs",
    text: "Speculate on leading digital asset CFDs with dynamic margin controls.",
    icon: Cpu,
  },
  {
    name: "Stocks CFDs",
    text: "Trade global equity CFDs across technology, finance, energy, and healthcare.",
    icon: Building2,
  },
];

const platforms = [
  {
    title: "MetaTrader 5",
    icon: MonitorSmartphone,
    features: ["Advanced Charting", "Expert Advisors", "Mobile Trading", "One-Click Trading"],
  },
  {
    title: "WebTrader",
    icon: Laptop,
    features: ["Browser Based", "No Downloads", "Fast Execution"],
  },
  {
    title: "Mobile Trading App",
    icon: Smartphone,
    features: ["iOS and Android", "Real-Time Notifications", "Full Account Management"],
  },
];

const accounts = [
  ["Standard Account", "$100", "Spreads from 1.2 pips", "Leverage up to 1:100"],
  ["Pro Account", "$1,000", "Spreads from 0.6 pips", "Lower commissions"],
  ["VIP Account", "$10,000", "Dedicated account manager", "Institutional pricing"],
];

const marketRows = [
  ["EUR/USD", "1.08742", "1.08756", "+0.18%"],
  ["GBP/USD", "1.27418", "1.27436", "-0.07%"],
  ["USD/JPY", "156.283", "156.301", "+0.24%"],
  ["XAU/USD", "2358.44", "2358.92", "+0.41%"],
  ["BTC/USD", "68,420", "68,448", "+1.16%"],
];

const why = [
  { title: "Secure Funds", body: "Bank-grade security and segregated operating controls.", icon: ShieldCheck },
  { title: "Fast Execution", body: "Low latency infrastructure for volatile market conditions.", icon: Zap },
  { title: "Regulated Environment", body: "Compliance-focused processes and transparent disclosures.", icon: Landmark },
  { title: "Competitive Pricing", body: "Tight spreads across major markets and account tiers.", icon: LineChart },
  { title: "Multi-Asset Trading", body: "Forex, commodities, indices, stocks, and crypto CFDs.", icon: Globe2 },
  { title: "Dedicated Support", body: "24/5 multilingual support for clients and partners.", icon: Headphones },
];

const education = [
  "Beginner Guides",
  "Trading Strategies",
  "Economic Calendar",
  "Market Analysis",
  "Trading Glossary",
  "Webinars",
];

function Sparkline({ up = true }: { up?: boolean }) {
  return (
    <div className="flex h-9 items-end gap-1" aria-hidden="true">
      {[30, 45, 36, 58, 50, 70, 62, 82].map((height, index) => (
        <span
          key={index}
          className={up ? "bg-emerald-400" : "bg-rose-400"}
          style={{ height: `${up ? height : 88 - height}%` }}
        />
      ))}
    </div>
  );
}

function PlatformTerminal() {
  return (
    <div className="rounded-lg border border-white/15 bg-[#081832]/90 p-4 shadow-2xl shadow-black/40">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">ApexFX Terminal</p>
          <h3 className="text-lg font-semibold text-white">Institutional liquidity view</h3>
        </div>
        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200">Live</span>
      </div>
      <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
        <div className="relative h-64 overflow-hidden rounded-md bg-[#061126] p-4">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <motion.div
            className="absolute left-0 right-0 top-24 h-1 bg-gold shadow-[0_0_30px_rgba(212,175,55,.65)]"
            animate={{ y: [0, -34, 20, -16, 30, -6] }}
            transition={{ duration: 7, repeat: Infinity, repeatType: "mirror" }}
          />
          <div className="relative z-10 flex h-full items-end gap-2">
            {Array.from({ length: 24 }).map((_, index) => (
              <motion.span
                key={index}
                className={index % 3 === 0 ? "w-full bg-emerald-400/80" : "w-full bg-white/30"}
                animate={{ height: [`${22 + ((index * 13) % 48)}%`, `${38 + ((index * 17) % 44)}%`] }}
                transition={{ duration: 2.5 + (index % 4), repeat: Infinity, repeatType: "mirror" }}
              />
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          {marketRows.slice(0, 4).map(([pair, bid, , change], index) => (
            <div key={pair} className="rounded-md border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-white">{pair}</span>
                <span className={change.startsWith("+") ? "text-emerald-300" : "text-rose-300"}>{change}</span>
              </div>
              <p className="mt-1 text-2xl font-semibold text-white">{bid}</p>
              <Sparkline up={index !== 1} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LiveChart() {
  const [points, setPoints] = useState([1.1652, 1.1658, 1.1651, 1.1664, 1.1661, 1.1672, 1.1666, 1.1681, 1.1674, 1.1687, 1.1682, 1.1691]);
  const latest = points[points.length - 1];
  const previous = points[points.length - 2];
  const change = latest - points[0];
  const min = Math.min(...points) - 0.0004;
  const max = Math.max(...points) + 0.0004;
  const path = useMemo(() => {
    return points
      .map((point, index) => {
        const x = (index / (points.length - 1)) * 1000;
        const y = 300 - ((point - min) / (max - min)) * 260;
        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }, [max, min, points]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPoints((current) => {
        const last = current[current.length - 1];
        const wave = Math.sin(Date.now() / 3000) * 0.00025;
        const drift = (Math.random() - 0.48) * 0.00055;
        const next = Number((last + wave + drift).toFixed(5));
        return [...current.slice(1), next];
      });
    }, 1200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="overflow-hidden rounded-lg border border-white/15 bg-[#061126] shadow-2xl shadow-black/30">
      <div className="flex flex-col justify-between gap-3 border-b border-white/10 bg-[#081832] p-4 text-white md:flex-row md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">Live chart</p>
          <h3 className="mt-1 text-xl font-semibold">EUR/USD Advanced Chart</h3>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {["15m", "1h", "1D", "FX:EURUSD"].map((item) => (
            <span key={item} className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="relative h-[560px] w-full overflow-hidden bg-[#061126] p-4">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:56px_42px]" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-slate-400">Euro / U.S. Dollar</p>
            <p className="mt-1 text-4xl font-bold text-white">{latest.toFixed(5)}</p>
            <p className={change >= 0 ? "mt-1 text-sm font-semibold text-emerald-300" : "mt-1 text-sm font-semibold text-rose-300"}>
              {change >= 0 ? "+" : ""}
              {change.toFixed(5)} ({((change / points[0]) * 100).toFixed(2)}%)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <Stat label="Bid" value={(latest - 0.00004).toFixed(5)} />
            <Stat label="Ask" value={(latest + 0.00004).toFixed(5)} />
            <Stat label="Spread" value="0.8" />
            <Stat label="Tick" value={latest >= previous ? "Up" : "Down"} />
          </div>
        </div>
        <svg className="relative z-10 mt-8 h-[360px] w-full" viewBox="0 0 1000 320" role="img" aria-label="Animated EUR/USD price chart">
          <defs>
            <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </linearGradient>
            <filter id="chartGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path d={`${path} L 1000 320 L 0 320 Z`} fill="url(#chartFill)" />
          <path d={path} fill="none" stroke="#D4AF37" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" filter="url(#chartGlow)" />
          {points.map((point, index) => {
            const x = (index / (points.length - 1)) * 1000;
            const y = 300 - ((point - min) / (max - min)) * 260;
            return <circle key={`${point}-${index}`} cx={x} cy={y} r={index === points.length - 1 ? 7 : 3} fill={index === points.length - 1 ? "#34d399" : "#D4AF37"} />;
          })}
        </svg>
        <div className="relative z-10 grid gap-3 md:grid-cols-4">
          {["EUR/USD", "GBP/USD", "XAU/USD", "BTC/USD"].map((item, index) => (
            <div key={item} className="rounded-md border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-white">{item}</span>
                <span className={index === 1 ? "text-rose-300" : "text-emerald-300"}>{index === 1 ? "-0.07%" : "+0.18%"}</span>
              </div>
              <div className="mt-3 flex h-8 items-end gap-1">
                {[35, 52, 44, 68, 61, 78, 70, 88].map((height, barIndex) => (
                  <span key={barIndex} className="w-full bg-gold/70" style={{ height: `${index === 1 ? 92 - height : height}%` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white text-navy dark:bg-[#07111f] dark:text-white">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#07111f]/90">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8" aria-label="Main navigation">
          <a href="#home" className="flex items-center gap-3 font-semibold" onClick={() => setMobileMenuOpen(false)}>
            <span className="grid size-10 place-items-center rounded-md bg-navy text-gold dark:bg-white">AX</span>
            <span className="text-xl">ApexFX Markets</span>
          </a>
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 lg:flex">
            {navItems.map((item) => (
              <a key={item} href={navHref(item)} className="hover:text-gold">
                {item}
              </a>
            ))}
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <a href="/trade" className="px-3 py-2 text-sm font-semibold">Trade</a>
            <a href="/open-account" className="rounded-md bg-gold px-4 py-2 text-sm font-bold text-navy shadow-lg shadow-gold/20">Open Account</a>
          </div>
          <button
            className="rounded-md border border-slate-300 p-2 lg:hidden dark:border-white/30"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>
        {mobileMenuOpen ? (
          <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-2 shadow-xl dark:border-white/10 dark:bg-[#07111f] lg:hidden">
            <div className="mx-auto grid max-w-7xl gap-2">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={navHref(item)}
                  className="rounded-md px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-gold dark:text-slate-200 dark:hover:bg-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-3">
                <a
                  href="/trade"
                  className="rounded-md border border-slate-200 px-4 py-3 text-center text-sm font-bold text-navy dark:border-white/15 dark:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Trade
                </a>
                <a
                  href="/admin"
                  className="rounded-md border border-slate-200 px-4 py-3 text-center text-sm font-bold text-navy dark:border-white/15 dark:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </a>
                <a
                  href="/demo-account"
                  className="rounded-md border border-slate-200 px-4 py-3 text-center text-sm font-bold text-navy dark:border-white/15 dark:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Demo
                </a>
                <a
                  href="/open-account"
                  className="rounded-md bg-gold px-4 py-3 text-center text-sm font-bold text-navy"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Open Account
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <section id="home" className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0">
          <Image
            className="h-full w-full object-cover opacity-30"
            src="https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1800&q=80"
            alt="Professional trading desk with financial market screens"
            fill
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,175,55,.24),transparent_34%),linear-gradient(90deg,#0A1F44_0%,rgba(10,31,68,.9)_46%,rgba(10,31,68,.7)_100%)]" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-28">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.32em] text-gold">Institutional forex and CFD trading</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight md:text-6xl">Trade Global Markets with Confidence</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Access forex, commodities, indices, and CFDs through institutional-grade technology and competitive spreads.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="/open-account" className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-4 font-bold text-navy">
                Open Live Account <ArrowRight className="size-4" />
              </a>
              <a href="/trade" className="inline-flex items-center justify-center rounded-md border border-gold/70 px-6 py-4 font-bold text-gold">
                View Live Terminal
              </a>
              <a href="#live-chart" className="inline-flex items-center justify-center rounded-md border border-white/30 px-6 py-4 font-bold text-white">
                Live Chart
              </a>
              <a href="/demo-account" className="inline-flex items-center justify-center rounded-md border border-white/30 px-6 py-4 font-bold text-white">
                Try Demo Account
              </a>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {["100+ Trading Instruments", "Ultra-Low Spreads", "Fast Execution", "24/5 Support"].map((stat) => (
                <div key={stat} className="rounded-md border border-white/15 bg-white/8 p-4 backdrop-blur">
                  <Check className="mb-3 size-5 text-gold" />
                  <p className="text-sm font-semibold">{stat}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1 }}>
            <PlatformTerminal />
          </motion.div>
        </div>
      </section>

      <section id="live-chart" className="bg-[#07111f] py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="section-kicker">Real-time market chart</p>
              <h2 className="section-title text-white">Track EUR/USD with a live advanced chart</h2>
            </div>
            <p className="max-w-xl text-slate-300">
              Powered by a TradingView market widget for charting and analysis. Trade execution still requires an approved broker connection.
            </p>
          </div>
          <LiveChart />
        </div>
      </section>

      <section id="trading" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="section-kicker">Trading instruments</p>
            <h2 className="section-title">Global opportunities from one account</h2>
          </div>
          <p className="max-w-xl text-slate-600 dark:text-slate-300">Trade across liquid global markets with transparent pricing, integrated risk tools, and multi-asset account access.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {instruments.map(({ name, text, icon: Icon }) => (
            <article key={name} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
              <Icon className="size-8 text-gold" />
              <h3 className="mt-5 text-xl font-semibold">{name}</h3>
              <p className="mt-3 min-h-24 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
              <a href="#markets" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-gold">Learn More <ChevronRight className="size-4" /></a>
            </article>
          ))}
        </div>
      </section>

      <section id="platforms" className="bg-slate-50 py-20 dark:bg-white/5">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <p className="section-kicker">Trading platforms</p>
          <h2 className="section-title">Desktop, browser, and mobile execution</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {platforms.map(({ title, icon: Icon, features }) => (
              <article key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#07111f]">
                <div className="mb-6 flex h-44 items-center justify-center rounded-md bg-navy p-4 text-white">
                  <div className="w-full rounded-md border border-white/15 bg-white/10 p-4">
                    <div className="mb-3 flex items-center gap-2"><Icon className="size-6 text-gold" /><span className="font-semibold">{title}</span></div>
                    <Sparkline up />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold">{title}</h3>
                <ul className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2"><Check className="size-4 text-gold" />{feature}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="accounts" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <p className="section-kicker">Account types</p>
        <h2 className="section-title">Choose the account that matches your trading style</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {accounts.map(([name, deposit, line1, line2], index) => (
            <article key={name} className={`rounded-lg border p-7 shadow-sm ${index === 1 ? "border-gold bg-navy text-white shadow-xl" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"}`}>
              <h3 className="text-2xl font-semibold">{name}</h3>
              <p className="mt-6 text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Minimum Deposit</p>
              <p className="mt-2 text-4xl font-semibold">{deposit}</p>
              <ul className="mt-7 space-y-4">
                {[line1, line2].map((item) => <li key={item} className="flex gap-2"><Check className="size-5 text-gold" />{item}</li>)}
              </ul>
              <a href={index === 0 ? "/demo-account" : "/open-account"} className={`mt-8 inline-flex w-full items-center justify-center rounded-md px-5 py-3 font-bold ${index === 1 ? "bg-gold text-navy" : "bg-navy text-white dark:bg-gold dark:text-navy"}`}>{index === 0 ? "Try Demo" : "Open Account"}</a>
            </article>
          ))}
        </div>
      </section>

      <section id="markets" className="bg-navy py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="section-kicker">Market data</p>
              <h2 className="section-title text-white">Simulated live pricing widgets</h2>
            </div>
            <p className="max-w-xl text-slate-300">Indicative prices for interface demonstration. Production deployments can connect these widgets to broker-approved feeds or TradingView embeds.</p>
          </div>
          <div className="overflow-hidden rounded-lg border border-white/15">
            {marketRows.map(([pair, bid, ask, change], index) => (
              <div key={pair} className="grid grid-cols-2 items-center gap-4 border-b border-white/10 bg-white/[0.04] p-4 last:border-b-0 md:grid-cols-5">
                <strong>{pair}</strong>
                <span>Bid {bid}</span>
                <span>Ask {ask}</span>
                <span className={change.startsWith("+") ? "text-emerald-300" : "text-rose-300"}>{change}</span>
                <Sparkline up={index !== 1} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <p className="section-kicker">Why choose ApexFX</p>
        <h2 className="section-title">Built for trust, speed, and scale</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {why.map(({ title, body, icon: Icon }) => (
            <article key={title} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
              <Icon className="size-8 text-gold" />
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-slate-600 dark:text-slate-300">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="education" className="bg-slate-50 py-20 dark:bg-white/5">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <p className="section-kicker">Education center</p>
          <h2 className="section-title">A learning hub for every stage of trading</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {education.map((item, index) => (
              <article key={item} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#07111f]">
                <BookOpen className="size-7 text-gold" />
                <h3 className="mt-4 text-xl font-semibold">{item}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{index % 2 === 0 ? "Featured article, video lesson, and downloadable checklist." : "Updated weekly with practical insights and market context."}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="partners" className="mx-auto grid max-w-7xl gap-8 px-4 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="section-kicker">Introducing broker program</p>
          <h2 className="section-title">Grow Your Business with ApexFX Partners</h2>
          <a href="#contact" className="mt-8 inline-flex rounded-md bg-gold px-6 py-4 font-bold text-navy">Become a Partner</a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {["Revenue Share", "CPA Commissions", "Dedicated Partner Manager", "Real-Time Reporting"].map((item) => (
            <div key={item} className="rounded-lg border border-slate-200 p-6 dark:border-white/10"><Users className="mb-4 size-7 text-gold" /><strong>{item}</strong></div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-20 dark:bg-white/5">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="section-kicker">ApexFX Gives</p>
            <h2 className="section-title">Trade markets and support community campaigns</h2>
            <p className="mt-5 max-w-xl text-slate-600 dark:text-slate-300">
              Explore a dedicated giving hub for U.S. charitable initiatives across financial literacy, veteran support, youth STEM, and small business recovery.
            </p>
            <a href="/donate" className="mt-8 inline-flex rounded-md bg-gold px-6 py-4 font-bold text-navy">View Campaigns</a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {["Donate Down Below", "Veteran Careers", "Small Business Grants", "Youth STEM"].map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#07111f]">
                <HeartHandshake className="size-7 text-gold" />
                <h3 className="mt-4 text-xl font-semibold">{item}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Community giving campaign with donation pledge support.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about-us" className="bg-navy py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <p className="section-kicker">About us</p>
          <h2 className="section-title text-white">A global brokerage built around disciplined execution</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {["Company Story", "Mission & Vision", "Global Presence"].map((item) => (
              <div key={item} className="rounded-lg border border-white/15 bg-white/5 p-6">
                <h3 className="text-xl font-semibold">{item}</h3>
                <p className="mt-3 text-slate-300">ApexFX Markets combines modern fintech infrastructure, client education, and relationship-led service for retail, professional, partner, and institutional clients.</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {["100+ Instruments", "24/5 Support", "Global Client Base"].map((stat) => <div key={stat} className="rounded-md bg-white/10 p-5 text-center font-semibold">{stat}</div>)}
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto grid max-w-7xl gap-8 px-4 py-20 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div>
          <p className="section-kicker">Contact</p>
          <h2 className="section-title">Speak with our trading support team</h2>
          <form className="mt-8 grid gap-4">
            {["Name", "Email", "Phone", "Country"].map((field) => <input key={field} className="form-field" placeholder={field} aria-label={field} />)}
            <textarea className="form-field min-h-32" placeholder="Message" aria-label="Message" />
            <button className="rounded-md bg-navy px-6 py-4 font-bold text-white dark:bg-gold dark:text-navy">Submit Message</button>
          </form>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5">
          <div className="grid gap-4 text-sm">
            <p><strong>Live Chat:</strong> Available 24/5</p>
            <p><strong>Support Email:</strong> support@apexfxmarkets.com</p>
            <p><strong>Office Address:</strong> 25 Finance Avenue, Victoria Island, Lagos</p>
            <p><strong>Business Hours:</strong> Monday to Friday, 24 hours</p>
          </div>
          <div className="mt-8 grid h-72 place-items-center rounded-md bg-[linear-gradient(135deg,#e2e8f0,#ffffff)] text-slate-500 dark:bg-[linear-gradient(135deg,#0A1F44,#111827)] dark:text-slate-300">
            <Globe2 className="size-16 text-gold" />
            <span className="sr-only">Interactive map placeholder</span>
          </div>
        </div>
      </section>

      <footer className="bg-[#051124] px-4 py-12 text-white lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            <h2 className="text-2xl font-semibold">ApexFX Markets</h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">Trading foreign exchange and CFDs involves significant risk and may not be suitable for all investors. You may lose more than your initial investment.</p>
          </div>
          {["Company", "Trading", "Legal", "Support"].map((group) => (
            <div key={group}>
              <h3 className="font-semibold text-gold">{group}</h3>
              <div className="mt-4 grid gap-2 text-sm text-slate-300">
                {["Privacy Policy", "Terms & Conditions", "AML Policy", "KYC Policy", "Risk Disclosure"].slice(0, group === "Legal" ? 5 : 3).map((item) => <a key={item} href="#">{item}</a>)}
                {group === "Company" ? <a href="/donate">ApexFX Gives</a> : null}
                {group === "Support" ? <a href="/support">Support Center</a> : null}
              </div>
            </div>
          ))}
        </div>
      </footer>
    </main>
  );
}
