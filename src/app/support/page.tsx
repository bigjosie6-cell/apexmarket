"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, BadgeCheck, Clock3, Headphones, LifeBuoy, Mail, MessageCircle, ShieldCheck, WalletCards } from "lucide-react";

const supportCards = [
  ["Trading Desk", "Platform access, demo terminal, charting, and order-ticket questions.", MessageCircle],
  ["Deposits", "Cashier requests, donation pledges, references, and payment status.", WalletCards],
  ["Verification", "KYC, account application, document upload, and approval timelines.", BadgeCheck],
  ["Security", "Admin access, account protection, suspicious activity, and privacy.", ShieldCheck],
];

const donationSupportEmail = process.env.NEXT_PUBLIC_DONATION_SUPPORT_EMAIL ?? "donations@apexfxmarkets.com";

export default function SupportPage() {
  const [status, setStatus] = useState("Tell us what you need and our support desk will prepare a ticket.");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Trading Desk");
  const [priority, setPriority] = useState("Normal priority");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        email,
        category,
        priority,
        message: body,
      }),
    });
    const result = await response.json();
    setStatus(result.ticketId ? `${result.message} Ticket: ${result.ticketId}` : result.message);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-navy dark:bg-[#07111f] dark:text-white">
      <section className="bg-navy px-4 py-6 text-white lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
            <ArrowLeft className="size-4" />
            Back to ApexFX Markets
          </Link>
          <span className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold">24/5 Support Desk</span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="section-kicker">Customer support</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight md:text-6xl">Beautiful support for trading, giving, and account help</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Get help from ApexFX support for brokerage onboarding, demo accounts, deposits, donation pledges, and trusted representative routing.
            </p>
          </div>
          <div className="rounded-lg bg-navy p-6 text-white shadow-xl">
            <Headphones className="size-10 text-gold" />
            <h2 className="mt-4 text-2xl font-bold">Priority assistance</h2>
            <p className="mt-2 text-slate-300">Support requests are categorized and routed to the right operations team.</p>
          </div>
        </div>

        <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {supportCards.map(([title, body, Icon]) => (
            <article key={title as string} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <Icon className="size-8 text-gold" />
              <h2 className="mt-4 text-xl font-bold">{title as string}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{body as string}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="grid gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <LifeBuoy className="size-7 text-gold" />
              <h2 className="mt-3 text-xl font-bold">Live chat</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Available for onboarding and pledge questions.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <Mail className="size-7 text-gold" />
              <h2 className="mt-3 text-xl font-bold">support@apexfxmarkets.com</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Use your ticket reference when following up.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <Mail className="size-7 text-gold" />
              <h2 className="mt-3 text-xl font-bold">{donationSupportEmail}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Donation representatives use this email to provide payment details and pledge follow-up.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <Clock3 className="size-7 text-gold" />
              <h2 className="mt-3 text-xl font-bold">24/5 response window</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Priority cases receive the fastest routing.</p>
            </div>
          </aside>

          <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
            <h2 className="text-2xl font-bold">Create a support ticket</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input className="form-field" placeholder="Full name" aria-label="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
              <input className="form-field" placeholder="Email address" aria-label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              <select className="form-field" aria-label="Support category" value={category} onChange={(event) => setCategory(event.target.value)}>
                <option>Trading Desk</option>
                <option>Account Opening</option>
                <option>Deposit / Cashier</option>
                <option>Donation Representative</option>
                <option>Technical Issue</option>
              </select>
              <select className="form-field" aria-label="Priority" value={priority} onChange={(event) => setPriority(event.target.value)}>
                <option>Normal priority</option>
                <option>High priority</option>
                <option>Urgent security issue</option>
              </select>
            </div>
            <textarea className="form-field mt-4 min-h-36" placeholder="How can we help?" aria-label="Message" value={body} onChange={(event) => setBody(event.target.value)} />
            <button disabled={loading} className="mt-5 w-full rounded-md bg-gold px-6 py-4 font-bold text-navy disabled:opacity-60">
              {loading ? "Submitting Ticket..." : "Submit Ticket"}
            </button>
            <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">{status}</p>
          </form>
        </section>
      </section>
    </main>
  );
}
