"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, BadgeCheck, Bot, Clock3, Headphones, Mail, MessageCircle, Send, ShieldCheck, User, WalletCards } from "lucide-react";

const supportCards = [
  ["Trading Desk", "Platform access, demo terminal, charting, and order-ticket questions.", MessageCircle],
  ["Deposits", "Cashier requests, donation pledges, references, and payment status.", WalletCards],
  ["Verification", "KYC, account application, document upload, and approval timelines.", BadgeCheck],
  ["Security", "Account protection, suspicious activity, and privacy.", ShieldCheck],
];

const donationSupportEmail = process.env.NEXT_PUBLIC_DONATION_SUPPORT_EMAIL ?? "donations@hutridgefinancial.com";

type ChatMessage = {
  id: number;
  sender: "agent" | "user";
  text: string;
};

type SavedSupportTicket = {
  ticketId: string;
  fullName: string;
  email: string;
  category: string;
  priority: string;
  message: string;
  status: string;
  createdAt: string;
};

const localTicketKey = "hutridge-support-tickets";

function saveLocalTicket(ticket: SavedSupportTicket) {
  try {
    const saved = window.localStorage.getItem(localTicketKey);
    const tickets = saved ? (JSON.parse(saved) as SavedSupportTicket[]) : [];
    const next = [ticket, ...tickets.filter((item) => item.ticketId !== ticket.ticketId)].slice(0, 100);
    window.localStorage.setItem(localTicketKey, JSON.stringify(next));
  } catch {
    // Server tickets still handle the primary path.
  }
}

export default function SupportPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Trading Desk");
  const [priority, setPriority] = useState("Normal priority");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "agent",
      text: "Welcome to Hutridge Financial live support. Tell me what you need help with today and I will prepare a support request for our desk.",
    },
    {
      id: 2,
      sender: "agent",
      text: "Please include any account reference, deposit reference, pledge reference, or platform issue so we can route it faster.",
    },
  ]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = body.trim();
    if (!trimmedMessage) return;

    if (!fullName.trim() || !email.trim()) {
      setMessages((current) => [
        ...current,
        {
          id: Date.now(),
          sender: "agent",
          text: "Please enter your full name and email address before sending so I can create the support ticket.",
        },
      ]);
      return;
    }

    setMessages((current) => [
      ...current,
      { id: Date.now(), sender: "user", text: trimmedMessage },
      { id: Date.now() + 1, sender: "agent", text: "I am checking your details and preparing a support ticket now." },
    ]);
    setBody("");
    setLoading(true);

    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          category,
          priority,
          message: trimmedMessage,
        }),
      });
      const result = await response.json();

      if (result.ticketId) {
        saveLocalTicket({
          ticketId: result.ticketId,
          fullName: fullName.trim(),
          email: email.trim(),
          category,
          priority,
          message: trimmedMessage,
          status: "Open",
          createdAt: new Date().toISOString(),
        });
      }

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 2,
          sender: "agent",
          text: result.ticketId
            ? `Your request is live with support. Ticket ${result.ticketId} has been created and our team will respond shortly.`
            : result.message,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 3,
          sender: "agent",
          text: "I could not create the ticket just now. Please check your connection and send the message again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-navy dark:bg-[#07111f] dark:text-white">
      <section className="bg-navy px-4 py-6 text-white lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
            <ArrowLeft className="size-4" />
            Back to Hutridge Financial
          </Link>
          <span className="rounded-md bg-emerald-400/15 px-3 py-2 text-sm font-semibold text-emerald-100">Live Support Online</span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="section-kicker">Customer support</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight md:text-6xl">Live help for accounts, deposits, and trading access</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Chat with the Hutridge Financial support desk and create a tracked support request instantly.
            </p>
          </div>
          <div className="rounded-lg bg-navy p-6 text-white shadow-xl">
            <Headphones className="size-10 text-gold" />
            <h2 className="mt-4 text-2xl font-bold">Agent-assisted routing</h2>
            <p className="mt-2 text-slate-300">Your chat creates a support ticket that appears inside the owner admin inbox.</p>
          </div>
        </div>

        <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {supportCards.map(([title, description, Icon]) => (
            <article key={title as string} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <Icon className="size-8 text-gold" />
              <h2 className="mt-4 text-xl font-bold">{title as string}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description as string}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="grid content-start gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <Clock3 className="size-7 text-gold" />
              <h2 className="mt-3 text-xl font-bold">24/5 support desk</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Urgent account and cashier issues are routed first.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <Mail className="size-7 text-gold" />
              <h2 className="mt-3 text-xl font-bold">support@hutridgefinancial.com</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Use your ticket reference when following up.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <Mail className="size-7 text-gold" />
              <h2 className="mt-3 text-xl font-bold">{donationSupportEmail}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Donation representatives use this email for pledge follow-up.</p>
            </div>
          </aside>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0b1728]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-navy px-5 py-4 text-white dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-full bg-gold text-navy">
                  <Bot className="size-5" />
                </div>
                <div>
                  <h2 className="font-bold">Hutridge Support Agent</h2>
                  <p className="text-xs text-emerald-200">Online now</p>
                </div>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{priority}</span>
            </div>

            <div className="grid max-h-[34rem] gap-4 overflow-y-auto bg-slate-100 p-5 dark:bg-[#07111f]">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {message.sender === "agent" ? (
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gold text-navy">
                      <Bot className="size-4" />
                    </div>
                  ) : null}
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${message.sender === "user" ? "rounded-br-md bg-gold text-navy" : "rounded-bl-md bg-white text-slate-700 dark:bg-white/10 dark:text-slate-100"}`}>
                    {message.text}
                  </div>
                  {message.sender === "user" ? (
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-navy text-white dark:bg-white/10">
                      <User className="size-4" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <form onSubmit={submit} className="border-t border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <div className="grid gap-3 md:grid-cols-2">
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
              <div className="mt-3 flex gap-3">
                <textarea className="form-field min-h-16 resize-none" placeholder="Type your message..." aria-label="Message" value={body} onChange={(event) => setBody(event.target.value)} />
                <button disabled={loading} className="grid min-w-16 place-items-center rounded-md bg-gold px-5 font-bold text-navy disabled:opacity-60" aria-label="Send support message">
                  {loading ? <Clock3 className="size-5 animate-spin" /> : <Send className="size-5" />}
                </button>
              </div>
            </form>
          </section>
        </section>
      </section>
    </main>
  );
}
