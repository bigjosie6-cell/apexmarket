"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, CreditCard, Landmark, LockKeyhole, MessageCircle, Smartphone, WalletCards } from "lucide-react";

const methods = [
  { name: "Bank Transfer", icon: Landmark, note: "Manual approval with unique payment reference." },
  { name: "Debit/Credit Card", icon: CreditCard, note: "Requires approved card acquiring for regulated financial services." },
  { name: "Mobile Money", icon: Smartphone, note: "Provider support varies by country and license." },
  { name: "Crypto USDT", icon: WalletCards, note: "Only where permitted by compliance policy." },
];

export default function CashierPage() {
  const router = useRouter();
  const [method, setMethod] = useState("Bank Transfer");
  const [amount, setAmount] = useState("1000");
  const [currency, setCurrency] = useState("USD");
  const [email, setEmail] = useState("client@example.com");
  const [status, setStatus] = useState("Create a request and an Hutridge Financial representative will provide payment details directly.");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/payments/create-deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountNumber: "HF-LIVE-PENDING",
        amount,
        currency,
        method,
        email,
      }),
    });
    const result = await response.json();
    setStatus(result.depositReference ? `${result.message} Reference: ${result.depositReference}` : result.message);
    setLoading(false);
    if (response.ok && result.depositReference) {
      const params = new URLSearchParams({
        ref: result.depositReference,
        method,
        amount,
        currency,
        email,
      });
      router.push(`/deposit-details?${params.toString()}`);
    }
  };

  return (
    <main className="page-shell">
      <section className="bg-navy px-4 py-5 text-white shadow-xl shadow-navy/15 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/client-portal" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
            <ArrowLeft className="size-4" />
            Back to Client Area
          </Link>
          <span className="hidden items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold sm:inline-flex">
            <LockKeyhole className="size-4 text-gold" />
            Manual payment desk
          </span>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <aside>
          <p className="section-kicker">Secure cashier</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">Deposit funds to your trading account</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Submit a deposit request and the Hutridge Financial payments desk will provide the correct payment details directly for your selected method.
          </p>
          <div className="premium-card mt-8 p-5 text-slate-700 dark:text-slate-100">
            <MessageCircle className="size-7 text-gold" />
            <h2 className="mt-3 font-bold">Representative-provided payment details</h2>
            <p className="mt-2 text-sm leading-6">
              No payment gateway is required on the website. A representative confirms the request, provides the payment details, and the admin approves the deposit after confirmation.
            </p>
          </div>
        </aside>

        <form onSubmit={submit} className="premium-card p-5 sm:p-6">
          <h2 className="text-2xl font-bold">Create deposit request</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Amount
              <input className="form-field" type="number" min="100" value={amount} onChange={(event) => setAmount(event.target.value)} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Currency
              <select className="form-field" value={currency} onChange={(event) => setCurrency(event.target.value)}>
                {["USD", "EUR", "GBP", "NGN"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold md:col-span-2">
              Client email
              <input className="form-field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold">Payment method</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {methods.map(({ name, icon: Icon, note }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setMethod(name)}
                  className={`rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:border-gold ${method === name ? "border-gold bg-navy text-white shadow-lg shadow-navy/15" : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"}`}
                >
                  <Icon className="size-6 text-gold" />
                  <p className="mt-3 font-bold">{name}</p>
                  <p className="mt-1 text-sm opacity-80">{note}</p>
                </button>
              ))}
            </div>
          </div>

          <button disabled={loading} className="hf-button hf-button-primary mt-6 w-full disabled:opacity-60">
            {loading ? "Creating request..." : "Create Deposit Request"}
          </button>
          <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">{status}</p>
        </form>
      </section>
    </main>
  );
}
