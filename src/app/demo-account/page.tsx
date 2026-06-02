"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, Clock3, LineChart, LockKeyhole, MonitorSmartphone, WalletCards } from "lucide-react";

const balances = ["10,000", "25,000", "50,000", "100,000"];
const platforms = ["Hutridge Financial WebTrader", "MetaTrader 5", "Mobile Trading App"];

type DemoForm = {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  platform: string;
  balance: string;
  experience: string;
};

const initialForm: DemoForm = {
  firstName: "",
  lastName: "",
  email: "",
  country: "Nigeria",
  platform: "Hutridge Financial WebTrader",
  balance: "50,000",
  experience: "Beginner",
};

export default function DemoAccountPage() {
  const router = useRouter();
  const [form, setForm] = useState<DemoForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [seed, setSeed] = useState("000001");
  const login = useMemo(() => `D${seed}`, [seed]);

  useEffect(() => {
    queueMicrotask(() => {
      setSeed(Date.now().toString().slice(-6));
    });
  }, []);

  const update = (key: keyof DemoForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Enter a valid email.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    localStorage.setItem(
      "hutridge-demo-account",
      JSON.stringify({
        ...form,
        login,
        password: `Apex-${seed}`,
        server: "Hutridge Financial-Demo",
        equity: Number(form.balance.replaceAll(",", "")),
        createdAt: new Date().toISOString(),
      }),
    );
    router.push("/demo-terminal");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-navy dark:bg-[#07111f] dark:text-white">
      <section className="bg-navy px-4 py-6 text-white lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
            <ArrowLeft className="size-4" />
            Back to Hutridge Financial
          </Link>
          <span className="hidden items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold sm:inline-flex">
            <Clock3 className="size-4 text-gold" />
            Instant demo access
          </span>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <aside>
          <p className="section-kicker">Demo account</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">Practice trading with virtual funds</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Create instant demo credentials, choose your virtual balance, and enter a simulated Hutridge Financial trading terminal.
          </p>
          <div className="mt-8 grid gap-4">
            <Feature icon={WalletCards} title="Virtual balance" body="Trade with up to $100,000 in simulated funds." />
            <Feature icon={LineChart} title="Live-style markets" body="Practice on forex, metals, indices, and crypto CFD watchlists." />
            <Feature icon={MonitorSmartphone} title="Platform preview" body="Experience a dashboard-style WebTrader environment." />
            <Feature icon={LockKeyhole} title="No deposit required" body="Demo access does not require KYC, funding, or live risk." />
          </div>
        </aside>

        <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-5 dark:border-white/10">
            <BadgeCheck className="size-9 text-gold" />
            <div>
              <h2 className="text-2xl font-bold">Create Demo Login</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">Demo login will be generated automatically.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="First name" error={errors.firstName}>
              <input className="form-field" value={form.firstName} onChange={(event) => update("firstName", event.target.value)} placeholder="Nosa" />
            </Field>
            <Field label="Last name" error={errors.lastName}>
              <input className="form-field" value={form.lastName} onChange={(event) => update("lastName", event.target.value)} placeholder="Trader" />
            </Field>
            <Field label="Email address" error={errors.email}>
              <input className="form-field" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="client@example.com" type="email" />
            </Field>
            <Field label="Country">
              <select className="form-field" value={form.country} onChange={(event) => update("country", event.target.value)}>
                {["Nigeria", "Ghana", "South Africa", "Kenya", "United Kingdom", "United Arab Emirates", "Other"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Preferred platform">
              <select className="form-field" value={form.platform} onChange={(event) => update("platform", event.target.value)}>
                {platforms.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Trading experience">
              <select className="form-field" value={form.experience} onChange={(event) => update("experience", event.target.value)}>
                {["Beginner", "Intermediate", "Advanced", "Professional"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold">Virtual balance</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-4">
              {balances.map((balance) => (
                <button
                  key={balance}
                  type="button"
                  onClick={() => update("balance", balance)}
                  className={`rounded-md border px-4 py-3 font-bold ${form.balance === balance ? "border-gold bg-navy text-white" : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"}`}
                >
                  ${balance}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
            Demo trading uses simulated execution and virtual funds. It does not create a live brokerage account or process real deposits.
          </div>

          <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold px-6 py-4 font-bold text-navy">
            Launch Demo Terminal <ArrowRight className="size-4" />
          </button>
        </form>
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
      <Icon className="size-7 text-gold" />
      <h2 className="mt-3 font-bold">{title}</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{body}</p>
    </article>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      {children}
      {error ? <span className="text-xs font-semibold text-rose-500">{error}</span> : null}
    </label>
  );
}
