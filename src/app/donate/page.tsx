"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, BookOpen, GraduationCap, Headphones, HeartHandshake, Home, Send, ShieldCheck, UserCheck, Users } from "lucide-react";

const campaigns = [
  {
    id: "financial-literacy",
    title: "Donate Down Below",
    location: "New York, USA",
    raised: 68400,
    goal: 100000,
    icon: GraduationCap,
    body: "Support nonprofit workshops that teach budgeting, risk awareness, and responsible investing basics.",
  },
  {
    id: "veteran-careers",
    title: "Veteran Career Transition Fund",
    location: "Texas, USA",
    raised: 42800,
    goal: 75000,
    icon: ShieldCheck,
    body: "Help veterans access career coaching, certification support, and technology training.",
  },
  {
    id: "small-business-recovery",
    title: "Small Business Recovery Grants",
    location: "Florida, USA",
    raised: 91500,
    goal: 150000,
    icon: Home,
    body: "Provide micro-grants for local businesses recovering from severe weather disruptions.",
  },
  {
    id: "youth-stem",
    title: "Youth STEM & Markets Lab",
    location: "California, USA",
    raised: 37600,
    goal: 60000,
    icon: BookOpen,
    body: "Fund after-school programs focused on data, coding, economics, and financial responsibility.",
  },
];

const donationSupportEmail = process.env.NEXT_PUBLIC_DONATION_SUPPORT_EMAIL ?? "donations@apexfxmarkets.com";

type ChatMessage = {
  from: "agent" | "donor";
  text: string;
};

export default function DonatePage() {
  const [campaignId, setCampaignId] = useState(campaigns[0].id);
  const [amount, setAmount] = useState("50");
  const [donorName, setDonorName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("Choose a campaign and submit a donation pledge.");
  const [pledgeReference, setPledgeReference] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      from: "agent",
      text: "Hello, welcome to ApexFX Gives. How much would you like to donate today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const selected = campaigns.find((campaign) => campaign.id === campaignId) ?? campaigns[0];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/donations/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId,
        donorName,
        email,
        amount,
        currency: "USD",
      }),
    });
    const result = await response.json();
    setMessage(result.donationReference ? `${result.message} Reference: ${result.donationReference}` : result.message);
    setLoading(false);
  };

  const sendChat = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const amountMatch = trimmed.match(/\d+(\.\d+)?/);
    const parsedAmount = amountMatch ? amountMatch[0] : "";
    const nextMessages: ChatMessage[] = [
      ...chatMessages,
      { from: "donor", text: trimmed },
    ];

    if (parsedAmount && Number(parsedAmount) >= 5) {
      const reference = `PLG-${Date.now().toString().slice(-6)}`;
      const addressResponse = await fetch("/api/donations/receiving-address");
      const addressResult = await addressResponse.json();
      const paymentLine = addressResult.configured
        ? `Donation receiving details: ${addressResult.receivingAddress}`
        : "Donation receiving details are not configured yet. A representative will provide them directly.";

      setAmount(parsedAmount);
      setPledgeReference(reference);
      setMessage(`Pledge ${reference} is prepared for $${Number(parsedAmount).toLocaleString()}. Complete donor details below for follow-up.`);
      nextMessages.push({
        from: "agent",
        text: `Your pledge is prepared now. Reference ${reference}: $${Number(parsedAmount).toLocaleString()} for ${selected.title}. ${paymentLine} You may also contact ${donationSupportEmail}.`,
      });
    } else {
      nextMessages.push({
        from: "agent",
        text: "Please enter a donation amount of at least $5. For example: I want to donate $50.",
      });
    }

    setChatMessages(nextMessages);
    setChatInput("");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-navy dark:bg-[#07111f] dark:text-white">
      <section className="bg-navy px-4 py-6 text-white lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
            <ArrowLeft className="size-4" />
            Back to ApexFX Markets
          </Link>
          <span className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold">ApexFX Gives</span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="section-kicker">Community giving</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight md:text-6xl">Support U.S. community campaigns</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              ApexFX works with trusted community representatives who help route donations to designated people and verified local initiatives. This is not political fundraising.
            </p>
          </div>
          <div className="rounded-lg bg-navy p-6 text-white shadow-xl">
            <HeartHandshake className="size-10 text-gold" />
            <h2 className="mt-4 text-2xl font-bold">Two-in-one experience</h2>
            <p className="mt-2 text-slate-300">Clients can explore markets and support community causes from one trusted fintech brand environment.</p>
            <Link href="/support" className="mt-5 inline-flex rounded-md border border-white/20 px-4 py-3 text-sm font-bold">
              Contact Support
            </Link>
          </div>
        </div>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ["Trusted representatives", "Community representatives review pledges and help donors choose designated recipients."],
            ["Designated people", "Support can be directed toward approved individuals, families, training cohorts, or recovery groups."],
            ["Donation support", "Our support desk helps with pledge references, campaign questions, and follow-up status."],
          ].map(([title, body], index) => (
            <article key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              {index === 0 ? <UserCheck className="size-8 text-gold" /> : index === 1 ? <HeartHandshake className="size-8 text-gold" /> : <Headphones className="size-8 text-gold" />}
              <h2 className="mt-4 text-xl font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg bg-navy p-6 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-md bg-gold text-lg font-bold text-navy">AG</span>
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-gold">Donation support agent</p>
                <h2 className="text-2xl font-bold">ApexFX Giving Desk</h2>
              </div>
            </div>
            <div className="mt-6 h-[360px] overflow-y-auto rounded-lg border border-white/10 bg-[#07111f] p-4">
              <div className="grid gap-4">
                {chatMessages.map((chat, index) => (
                  <div
                    key={`${chat.from}-${index}`}
                    className={`max-w-[85%] rounded-lg p-4 text-sm leading-6 ${
                      chat.from === "agent"
                        ? "mr-auto bg-white/10 text-slate-100"
                        : "ml-auto bg-gold font-semibold text-navy"
                    }`}
                  >
                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] opacity-70">
                      {chat.from === "agent" ? "ApexFX Agent" : "Donor"}
                    </p>
                    {chat.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-2xl font-bold">Chat with donation support</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Type your amount and the agent will prepare the pledge. A representative will provide payment details directly.</p>
            <form onSubmit={sendChat} className="mt-5 flex flex-col gap-3">
              <textarea
                className="form-field min-h-32"
                placeholder="Example: I would like to donate $50 today."
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
              />
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 font-bold text-navy">
                Send Message <Send className="size-4" />
              </button>
            </form>
            <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
              Agent payment note: payment details are provided directly by a donation representative after the pledge is prepared. Support email: <strong>{donationSupportEmail}</strong>
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="grid gap-5 md:grid-cols-2">
            {campaigns.map(({ id, title, location, raised, goal, icon: Icon, body }) => {
              const progress = Math.round((raised / goal) * 100);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCampaignId(id)}
                  className={`rounded-lg border p-5 text-left shadow-sm transition hover:-translate-y-1 ${campaignId === id ? "border-gold bg-navy text-white" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"}`}
                >
                  <Icon className="size-8 text-gold" />
                  <h2 className="mt-4 text-xl font-bold">{title}</h2>
                  <p className="mt-1 text-sm opacity-75">{location}</p>
                  <p className="mt-4 text-sm leading-6 opacity-85">{body}</p>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                    <div className="h-full bg-gold" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-3 text-sm font-semibold">${raised.toLocaleString()} raised of ${goal.toLocaleString()}</p>
                </button>
              );
            })}
          </section>

          <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
            <Users className="size-8 text-gold" />
            <h2 className="mt-4 text-2xl font-bold">Donate through a trusted representative</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Selected campaign: <strong>{selected.title}</strong></p>
            <p className="mt-2 rounded-md bg-slate-50 p-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
              Donation support email: <strong>{donationSupportEmail}</strong>
            </p>
            {pledgeReference ? (
              <div className="mt-5 rounded-md border border-gold/40 bg-gold/10 p-4 text-sm">
                <p className="font-bold text-gold">Pledge prepared immediately</p>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  Reference {pledgeReference} for ${Number(amount).toLocaleString()} is ready. Add donor details so support can follow up.
                </p>
              </div>
            ) : null}
            <label className="mt-5 grid gap-2 text-sm font-semibold">
              Campaign
              <select className="form-field" value={campaignId} onChange={(event) => setCampaignId(event.target.value)}>
                {campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.title}</option>)}
              </select>
            </label>
            <label className="mt-4 grid gap-2 text-sm font-semibold">
              Designated recipient
              <select className="form-field">
                <option>Representative-selected recipient</option>
                <option>Education beneficiary group</option>
                <option>Emergency support recipient</option>
                <option>Small business grant recipient</option>
                <option>Veteran support recipient</option>
              </select>
            </label>
            <label className="mt-4 grid gap-2 text-sm font-semibold">
              Donation amount
              <input className="form-field" type="number" min="5" value={amount} onChange={(event) => setAmount(event.target.value)} />
            </label>
            <label className="mt-4 grid gap-2 text-sm font-semibold">
              Donor name
              <input className="form-field" value={donorName} onChange={(event) => setDonorName(event.target.value)} placeholder="Your name" />
            </label>
            <label className="mt-4 grid gap-2 text-sm font-semibold">
              Email
              <input className="form-field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            </label>
            <button disabled={loading} className="mt-6 w-full rounded-md bg-gold px-6 py-4 font-bold text-navy disabled:opacity-60">
              {loading ? "Saving donor details..." : pledgeReference ? "Save Donor Details" : "Submit Donation Pledge"}
            </button>
            <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">{message}</p>
          </form>
        </div>
      </section>
    </main>
  );
}
