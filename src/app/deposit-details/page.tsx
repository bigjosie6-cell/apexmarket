"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, RefreshCw, ShieldCheck, WalletCards } from "lucide-react";

type PaymentDetails = {
  method: string;
  instructions: string;
  updatedAt: string;
  updatedBy: string;
};

export default function DepositDetailsPage() {
  return (
    <Suspense fallback={<DepositDetailsShell />}>
      <DepositDetailsContent />
    </Suspense>
  );
}

function DepositDetailsContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("ref") ?? "DEP-PENDING";
  const method = searchParams.get("method") ?? "Bank Transfer";
  const amount = searchParams.get("amount") ?? "0";
  const currency = searchParams.get("currency") ?? "USD";
  const email = searchParams.get("email") ?? "client@example.com";
  const [details, setDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDetails = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`/api/payments/details?method=${encodeURIComponent(method)}`);
    const result = await response.json();
    setDetails(result.details);
    setLoading(false);
  }, [method]);

  useEffect(() => {
    let active = true;

    const fetchDetails = async () => {
      const response = await fetch(`/api/payments/details?method=${encodeURIComponent(method)}`);
      const result = await response.json();
      if (active) {
        setDetails(result.details);
        setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      active = false;
    };
  }, [method]);

  return (
    <main className="min-h-screen bg-slate-50 text-navy dark:bg-[#07111f] dark:text-white">
      <section className="bg-navy px-4 py-6 text-white lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/cashier" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
            <ArrowLeft className="size-4" />
            Back to Cashier
          </Link>
          <span className="hidden items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold sm:inline-flex">
            <ShieldCheck className="size-4 text-gold" />
            Payment details desk
          </span>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <CheckCircle2 className="size-9 text-emerald-400" />
          <h1 className="mt-4 text-3xl font-bold">Deposit request prepared</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Your selected payment method is ready. Use the details provided by the ApexFX payments desk and keep your reference visible.
          </p>

          <div className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 dark:divide-white/10 dark:border-white/10">
            <Row label="Reference" value={reference} />
            <Row label="Method" value={method} />
            <Row label="Amount" value={`${currency} ${Number(amount).toLocaleString()}`} />
            <Row label="Client email" value={email} />
          </div>
        </aside>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="section-kicker">Payment instructions</p>
              <h2 className="mt-2 text-3xl font-bold">{method}</h2>
            </div>
            <button
              type="button"
              onClick={loadDetails}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-3 text-sm font-bold dark:border-white/10"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="mt-6 rounded-lg border border-gold/30 bg-gold/10 p-5">
            <WalletCards className="size-7 text-gold" />
            <h3 className="mt-3 text-xl font-bold">Details from admin</h3>
            <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-slate-700 dark:text-slate-100">
              {loading ? "Loading payment details..." : details?.instructions}
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-[#07111f]">
            <Clock3 className="size-6 text-gold" />
            <h3 className="mt-3 font-bold">Next step</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              After payment is sent, contact support with your deposit reference. Admin will review and approve the request after confirmation.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}

function DepositDetailsShell() {
  return (
    <main className="min-h-screen bg-slate-50 text-navy dark:bg-[#07111f] dark:text-white">
      <section className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <p className="section-kicker">Payment instructions</p>
          <h1 className="mt-3 text-3xl font-bold">Loading deposit details...</h1>
        </div>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 p-4 sm:grid-cols-[0.42fr_0.58fr] sm:items-center">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <strong className="break-words text-sm">{value}</strong>
    </div>
  );
}
