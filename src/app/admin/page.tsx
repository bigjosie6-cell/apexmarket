"use client";

import { FormEvent, useState } from "react";
import { Inbox, LineChart, LockKeyhole, Mail, Plus, ShieldCheck, TicketCheck, Trash2, UsersRound, WalletCards } from "lucide-react";

const paymentMethods = ["Bank Transfer", "Debit/Credit Card", "Mobile Money", "Crypto USDT"];

type AdminApplication = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  accountType: string;
  baseCurrency: string;
  expectedDeposit: string;
  fundingMethod: string;
  accountNumber: string;
  status: string;
  submittedAt: string;
  emailSent: boolean;
};

type AdminTicket = {
  ticketId: string;
  fullName: string;
  email: string;
  category: string;
  priority: string;
  message: string;
  status: string;
  createdAt: string;
};

type AdminLoginActivity = {
  id: string;
  email: string;
  accountNumber: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
};

type AdminDeposit = {
  depositReference: string;
  accountNumber: string;
  email: string;
  amount: number;
  currency: string;
  method: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
};

type AdminTradeOrder = {
  orderId: string;
  accountNumber: string;
  email: string;
  symbol: string;
  side: "Buy" | "Sell";
  volume: number;
  orderType: string;
  indicativePrice: string;
  status: string;
  createdAt: string;
};

type Holding = {
  name: string;
  symbol: string;
  category: string;
  value: number;
  returnValue: string;
  status: string;
  allocation: number;
};

const localTicketKey = "hutridge-support-tickets";
const localApplicationListKey = "hutridge-applications";
const localLoginActivityKey = "hutridge-login-activity";

function portfolioStorageKey(accountNumber: string) {
  return `hutridge-portfolio:${accountNumber || "unselected"}`;
}

function getLocalSupportTickets(): AdminTicket[] {
  try {
    const saved = window.localStorage.getItem(localTicketKey);
    return saved ? (JSON.parse(saved) as AdminTicket[]) : [];
  } catch {
    return [];
  }
}

function getLocalApplications(): AdminApplication[] {
  try {
    const saved = window.localStorage.getItem(localApplicationListKey);
    const applications = saved ? (JSON.parse(saved) as AdminApplication[]) : [];
    const current = window.localStorage.getItem("hutridge-application");
    if (!current) return applications;

    const currentApplication = JSON.parse(current) as AdminApplication;
    return [currentApplication, ...applications.filter((item) => item.accountNumber !== currentApplication.accountNumber)];
  } catch {
    return [];
  }
}

function getLocalLoginActivity(): AdminLoginActivity[] {
  try {
    const saved = window.localStorage.getItem(localLoginActivityKey);
    return saved ? (JSON.parse(saved) as AdminLoginActivity[]) : [];
  } catch {
    return [];
  }
}

function saveLocalPortfolio(accountNumber: string, holdings: Holding[]) {
  try {
    window.localStorage.setItem(portfolioStorageKey(accountNumber), JSON.stringify({
      holdings,
      updatedAt: new Date().toISOString(),
      updatedBy: "admin-browser",
    }));
  } catch {
    // Server storage remains the primary path.
  }
}

function getLocalPortfolioHoldings(accountNumber: string): Holding[] {
  try {
    const saved = window.localStorage.getItem(portfolioStorageKey(accountNumber));
    const portfolio = saved ? (JSON.parse(saved) as { holdings?: Holding[] }) : null;
    return portfolio?.holdings ?? [];
  } catch {
    return [];
  }
}

const defaultHolding: Holding = {
  name: "New Holding",
  symbol: "SYMBOL",
  category: "Crypto",
  value: 0,
  returnValue: "+0.0%",
  status: "Active",
  allocation: 1,
};

export default function AdminPage() {
  const [adminId, setAdminId] = useState("");
  const [secret, setSecret] = useState("");
  const [depositId, setDepositId] = useState("");
  const [receivingAddress, setReceivingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [logins, setLogins] = useState<AdminLoginActivity[]>([]);
  const [orders, setOrders] = useState<AdminTradeOrder[]>([]);
  const [deposits, setDeposits] = useState<AdminDeposit[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [selectedAccountNumber, setSelectedAccountNumber] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [message, setMessage] = useState("Owner login required. This page is not accessible to ordinary users.");
  const [signedIn, setSignedIn] = useState(false);
  const isBusy = Boolean(busyAction);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusyAction("login");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, secret }),
      });
      const result = await response.json();
      setMessage(result.message);
      setSignedIn(response.ok);
      if (response.ok) {
        loadAdminInbox();
        loadDeposits();
      }
    } finally {
      setBusyAction("");
    }
  };

  const adminHeaders = {
    "x-admin-id": adminId,
    "x-admin-role": "SUPER_ADMIN",
    "x-admin-secret": secret,
  };

  const loadAdminInbox = async () => {
    setBusyAction("inbox");
    setMessage("Loading admin inbox...");
    try {
      const [applicationsResponse, ticketsResponse, loginsResponse, ordersResponse] = await Promise.all([
        fetch("/api/admin/applications", { headers: adminHeaders, credentials: "include", cache: "no-store" }),
        fetch("/api/admin/support-tickets", { headers: adminHeaders, credentials: "include", cache: "no-store" }),
        fetch("/api/admin/login-activity", { headers: adminHeaders, credentials: "include", cache: "no-store" }),
        fetch("/api/admin/orders", { headers: adminHeaders, credentials: "include", cache: "no-store" }),
      ]);
      const applicationsResult = await applicationsResponse.json();
      const ticketsResult = await ticketsResponse.json();
      const loginsResult = await loginsResponse.json();
      const ordersResult = await ordersResponse.json();
      const serverApplications = (applicationsResult.applications ?? []) as AdminApplication[];
      const localApplications = getLocalApplications();
      const mergedApplications = [...serverApplications, ...localApplications].filter((application, index, all) => (
        all.findIndex((item) => item.accountNumber === application.accountNumber) === index
      ));
      setApplications(mergedApplications);
      if (mergedApplications.length) {
        const nextAccountNumber = selectedAccountNumber || mergedApplications[0].accountNumber;
        setSelectedAccountNumber(nextAccountNumber);
        loadPortfolio(nextAccountNumber);
      }
      const serverTickets = (ticketsResult.tickets ?? []) as AdminTicket[];
      const localTickets = getLocalSupportTickets();
      const mergedTickets = [...localTickets, ...serverTickets].filter((ticket, index, all) => (
        all.findIndex((item) => item.ticketId === ticket.ticketId) === index
      ));
      setTickets(mergedTickets);
      const serverLogins = (loginsResult.logins ?? []) as AdminLoginActivity[];
      const localLogins = getLocalLoginActivity();
      const mergedLogins = [...localLogins, ...serverLogins].filter((loginRecord, index, all) => (
        all.findIndex((item) => item.id === loginRecord.id) === index
      ));
      setLogins(mergedLogins);
      const serverOrders = (ordersResult.orders ?? []) as AdminTradeOrder[];
      setOrders(serverOrders);
      setMessage(`Admin inbox loaded. Showing ${mergedApplications.length} signups, ${mergedLogins.length} logins, ${mergedTickets.length} support tickets, and ${serverOrders.length} trade requests.`);
    } catch {
      setMessage("Could not load admin inbox. Try refreshing after unlocking admin.");
    } finally {
      setBusyAction("");
    }
  };

  const loadDeposits = async () => {
    setBusyAction("deposits");
    setMessage("Loading deposit requests...");
    try {
      const response = await fetch("/api/admin/deposits", { headers: adminHeaders, credentials: "include", cache: "no-store" });
      const result = await response.json();
      setDeposits(result.deposits ?? []);
      setMessage("Deposit requests loaded.");
    } catch {
      setMessage("Could not load deposit requests.");
    } finally {
      setBusyAction("");
    }
  };

  const loadPortfolio = async (accountNumber = selectedAccountNumber) => {
    if (!accountNumber) {
      setMessage("Select an individual signup before loading holdings.");
      return;
    }

    setBusyAction("portfolio-load");
    setMessage(`Loading portfolio holdings for ${accountNumber}...`);
    try {
      const response = await fetch(`/api/admin/portfolio?accountNumber=${encodeURIComponent(accountNumber)}`, { headers: adminHeaders, credentials: "include", cache: "no-store" });
      const result = await response.json();
      const serverHoldings = result.portfolio?.holdings ?? [];
      const localHoldings = getLocalPortfolioHoldings(accountNumber);
      setHoldings(localHoldings.length ? localHoldings : serverHoldings);
      setMessage(`Portfolio holdings loaded for ${accountNumber}.`);
    } catch {
      setMessage("Could not load portfolio holdings.");
    } finally {
      setBusyAction("");
    }
  };

  const selectClientPortfolio = (accountNumber: string) => {
    setSelectedAccountNumber(accountNumber);
    loadPortfolio(accountNumber);
  };

  const updateHolding = (index: number, key: keyof Holding, value: string) => {
    setHoldings((current) => current.map((holding, holdingIndex) => {
      if (holdingIndex !== index) return holding;
      return {
        ...holding,
        [key]: key === "value" || key === "allocation" ? Number(value) : value,
      };
    }));
  };

  const addHolding = () => {
    setHoldings((current) => [...current, { ...defaultHolding }]);
  };

  const removeHolding = (index: number) => {
    setHoldings((current) => current.filter((_, holdingIndex) => holdingIndex !== index));
  };

  const savePortfolio = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedAccountNumber) {
      setMessage("Select an individual signup before saving holdings.");
      return;
    }

    setBusyAction("portfolio-save");
    setMessage("Saving portfolio holdings...");

    try {
      const response = await fetch("/api/admin/portfolio", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders,
        },
        body: JSON.stringify({ accountNumber: selectedAccountNumber, holdings }),
      });
      const result = await response.json();
      setMessage(result.message ?? (response.ok ? "Portfolio holdings saved." : "Portfolio holdings could not be saved."));
      if (response.ok) {
        const savedHoldings = result.portfolio?.holdings ?? holdings;
        setHoldings(savedHoldings);
        saveLocalPortfolio(selectedAccountNumber, savedHoldings);
      }
    } catch {
      setMessage("Portfolio holdings could not be saved.");
    } finally {
      setBusyAction("");
    }
  };

  const saveDonationAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusyAction("donation");
    setMessage("Saving donation receiving address...");

    try {
      const response = await fetch("/api/admin/donation-address", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminId,
          "x-admin-role": "SUPER_ADMIN",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ receivingAddress }),
      });
      const result = await response.json();
      setMessage(result.message ?? (response.ok ? "Donation receiving address saved." : "Donation address could not be saved."));
    } catch {
      setMessage("Donation address could not be saved. Check your connection and try again.");
    } finally {
      setBusyAction("");
    }
  };

  const sendClientEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusyAction("email");
    setMessage("Sending client email...");

    try {
      const response = await fetch("/api/admin/send-email", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders,
        },
        body: JSON.stringify({
          to: emailTo,
          subject: emailSubject,
          message: emailBody,
        }),
      });
      const result = await response.json();
      setMessage(result.message ?? (response.ok ? "Email sent." : "Email could not be sent."));
      if (response.ok) {
        setEmailSubject("");
        setEmailBody("");
      }
    } catch {
      setMessage("Email could not be sent. Check your connection and try again.");
    } finally {
      setBusyAction("");
    }
  };

  const approveDeposit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusyAction("approve");
    const response = await fetch(`/api/admin/deposits/${depositId}/approve`, {
      method: "POST",
      credentials: "include",
      headers: adminHeaders,
    });
    const result = await response.json();
    setMessage(result.message ?? `Deposit ${depositId} approved.`);
    await loadDeposits();
    setBusyAction("");
  };

  const approveDepositByReference = async (reference: string) => {
    setDepositId(reference);
    setBusyAction(`approve-${reference}`);
    setMessage(`Approving ${reference}...`);
    const response = await fetch(`/api/admin/deposits/${reference}/approve`, {
      method: "POST",
      credentials: "include",
      headers: adminHeaders,
    });
    const result = await response.json();
    setMessage(result.message ?? `Deposit ${reference} approved.`);
    await loadDeposits();
    setBusyAction("");
  };

  const savePaymentDetails = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusyAction("payment");
    setMessage("Saving payment details...");

    try {
      const response = await fetch("/api/admin/payment-details", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminId,
          "x-admin-role": "SUPER_ADMIN",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ method: paymentMethod, instructions: paymentInstructions }),
      });
      const result = await response.json();
      setMessage(result.message ?? (response.ok ? "Payment details saved." : "Payment details could not be saved."));
    } catch {
      setMessage("Payment details could not be saved. Check your connection and try again.");
    } finally {
      setBusyAction("");
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setSignedIn(false);
    setSecret("");
    setMessage("Signed out.");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,.1),transparent_28rem),linear-gradient(180deg,#07111f_0%,#081832_56%,#050b15_100%)] px-4 py-8 text-white lg:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="premium-panel p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="section-kicker">Private admin</p>
              <h1 className="mt-2 text-4xl font-bold">Hutridge Financial Owner Console</h1>
              <p className="mt-3 max-w-2xl text-slate-300">Only the configured owner ID and secret can access deposit approval tools.</p>
            </div>
            {signedIn ? (
              <button onClick={logout} className="hf-button border border-white/20 px-4 py-3 text-sm">Sign Out</button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={login} className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/10 backdrop-blur sm:p-6">
            <LockKeyhole className="size-8 text-gold" />
            <h2 className="mt-4 text-2xl font-bold">Owner Login</h2>
            <label className="mt-5 grid gap-2 text-sm font-semibold">
              Owner admin ID
              <input className="form-field" value={adminId} onChange={(event) => setAdminId(event.target.value)} placeholder="your-admin-id" />
            </label>
            <label className="mt-4 grid gap-2 text-sm font-semibold">
              Admin secret
              <input className="form-field" value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="private secret" type="password" />
            </label>
            <button disabled={busyAction === "login"} className="hf-button hf-button-primary mt-5 w-full disabled:cursor-wait disabled:opacity-60">
              {busyAction === "login" ? "Unlocking..." : "Unlock Admin"}
            </button>
          </form>

          <form onSubmit={saveDonationAddress} className={`rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/10 backdrop-blur sm:p-6 ${signedIn ? "" : "opacity-50"}`}>
            <ShieldCheck className="size-8 text-gold" />
            <h2 className="mt-4 text-2xl font-bold">Donation Receiving Address</h2>
            <p className="mt-2 text-sm text-slate-300">Set the payment address the donation agent can provide after a donor prepares a pledge.</p>
            <label className="mt-5 grid gap-2 text-sm font-semibold">
              Receiving address or instructions
              <textarea
                className="form-field min-h-28"
                value={receivingAddress}
                onChange={(event) => setReceivingAddress(event.target.value)}
                placeholder="Example: PayPal email, bank instructions, wallet address, or representative payment note"
                disabled={!signedIn}
              />
            </label>
            <button disabled={!signedIn || busyAction === "donation"} className="hf-button hf-button-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50">
              {busyAction === "donation" ? "Saving Donation Address..." : "Save Donation Address"}
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr]">
          <form onSubmit={sendClientEmail} className={`rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/10 backdrop-blur sm:p-6 ${signedIn ? "" : "opacity-50"}`}>
            <Mail className="size-8 text-gold" />
            <h2 className="mt-4 text-2xl font-bold">Send Client Email</h2>
            <p className="mt-2 text-sm text-slate-300">Send a direct Hutridge Financial email to any user from the owner console.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Recipient email
                <input className="form-field" type="email" value={emailTo} onChange={(event) => setEmailTo(event.target.value)} placeholder="client@example.com" disabled={!signedIn} />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Subject
                <input className="form-field" value={emailSubject} onChange={(event) => setEmailSubject(event.target.value)} placeholder="Account update from Hutridge Financial" disabled={!signedIn} />
              </label>
            </div>
            <label className="mt-4 grid gap-2 text-sm font-semibold">
              Message
              <textarea
                className="form-field min-h-36"
                value={emailBody}
                onChange={(event) => setEmailBody(event.target.value)}
                placeholder="Write the message you want the client to receive..."
                disabled={!signedIn}
              />
            </label>
            <button disabled={!signedIn || busyAction === "email"} className="hf-button hf-button-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50">
              {busyAction === "email" ? "Sending Email..." : "Send Email"}
            </button>
          </form>

          <section className={`rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/10 backdrop-blur sm:p-6 ${signedIn ? "" : "opacity-50"}`}>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <Inbox className="size-8 text-gold" />
                <h2 className="mt-4 text-2xl font-bold">Admin Inbox</h2>
                <p className="mt-2 text-sm text-slate-300">View recent signups and support tickets submitted through the website.</p>
              </div>
              <button type="button" onClick={loadAdminInbox} disabled={!signedIn || busyAction === "inbox"} className="hf-button hf-button-primary disabled:cursor-not-allowed disabled:opacity-50">
                {busyAction === "inbox" ? "Refreshing Inbox..." : "Refresh Inbox"}
              </button>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-[#07111f] p-5">
                <h3 className="flex items-center gap-2 text-xl font-bold"><UsersRound className="size-5 text-gold" /> Signups ({applications.length})</h3>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Showing all saved account applications</p>
                <div className="mt-4 grid max-h-[40rem] gap-3 overflow-y-auto pr-1">
                  {applications.length ? applications.map((application) => (
                    <article key={application.accountNumber} className="rounded-md border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">{application.firstName} {application.lastName}</p>
                          <p className="text-sm text-slate-300">{application.email}</p>
                        </div>
                        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">{application.emailSent ? "Email sent" : "No email"}</span>
                      </div>
                      <div className="mt-3 grid gap-1 text-sm text-slate-300">
                        <p>Login email: <strong className="text-white">{application.email}</strong></p>
                        <p>Login reference: <strong className="text-white">{application.accountNumber}</strong></p>
                        <p>Phone: <strong className="text-white">{application.phone || "Not provided"}</strong></p>
                        <p>Country: {application.country} · Status: {application.status}</p>
                        <p>Account: {application.accountType} · Deposit: {application.baseCurrency ?? "USD"} {application.expectedDeposit}</p>
                        <p>Funding: {application.fundingMethod}</p>
                        <p>Submitted: {new Date(application.submittedAt).toLocaleString()}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => selectClientPortfolio(application.accountNumber)}
                        disabled={!signedIn || busyAction === "portfolio-load"}
                        className="mt-4 w-full rounded-md border border-gold/40 px-4 py-2 text-sm font-bold text-gold transition hover:bg-gold hover:text-navy active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busyAction === "portfolio-load" && selectedAccountNumber === application.accountNumber ? "Loading Portfolio..." : "Edit This Client Portfolio"}
                      </button>
                    </article>
                  )) : <p className="rounded-md border border-white/10 bg-white/5 p-4 text-sm text-slate-300">No signups saved yet.</p>}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-[#07111f] p-5">
                <h3 className="flex items-center gap-2 text-xl font-bold"><TicketCheck className="size-5 text-gold" /> Support Tickets ({tickets.length})</h3>
                <div className="mt-4 grid max-h-96 gap-3 overflow-y-auto pr-1">
                  {tickets.length ? tickets.map((ticket) => (
                    <article key={ticket.ticketId} className="rounded-md border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">{ticket.fullName}</p>
                          <p className="text-sm text-slate-300">{ticket.email}</p>
                        </div>
                        <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">{ticket.priority}</span>
                      </div>
                      <div className="mt-3 grid gap-1 text-sm text-slate-300">
                        <p>Ticket: <strong className="text-white">{ticket.ticketId}</strong></p>
                        <p>{ticket.category} · {ticket.status}</p>
                        <p className="line-clamp-3">{ticket.message}</p>
                      </div>
                    </article>
                  )) : <p className="rounded-md border border-white/10 bg-white/5 p-4 text-sm text-slate-300">No support tickets saved yet.</p>}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-white/10 bg-[#07111f] p-5">
              <h3 className="flex items-center gap-2 text-xl font-bold"><LockKeyhole className="size-5 text-gold" /> Client Logins ({logins.length})</h3>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Successful client portal access records</p>
              <div className="mt-4 grid max-h-80 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                {logins.length ? logins.map((loginRecord) => (
                  <article key={loginRecord.id} className="rounded-md border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">{loginRecord.firstName} {loginRecord.lastName}</p>
                        <p className="text-sm text-slate-300">{loginRecord.email}</p>
                      </div>
                      <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">{loginRecord.status}</span>
                    </div>
                    <div className="mt-3 grid gap-1 text-sm text-slate-300">
                      <p>Account: <strong className="text-white">{loginRecord.accountNumber}</strong></p>
                      <p>Login ID: <strong className="text-white">{loginRecord.id}</strong></p>
                      <p>Time: {new Date(loginRecord.createdAt).toLocaleString()}</p>
                    </div>
                  </article>
                )) : <p className="rounded-md border border-white/10 bg-white/5 p-4 text-sm text-slate-300 md:col-span-2">No client logins saved yet.</p>}
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-white/10 bg-[#07111f] p-5">
              <h3 className="flex items-center gap-2 text-xl font-bold"><LineChart className="size-5 text-gold" /> Trade Requests ({orders.length})</h3>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Submitted buy and sell requests from logged-in clients</p>
              <div className="mt-4 grid max-h-96 gap-3 overflow-y-auto pr-1">
                {orders.length ? orders.map((order) => (
                  <article key={order.orderId} className="rounded-md border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{order.orderId}</p>
                        <h4 className="mt-2 text-xl font-bold">{order.side} {order.volume} lots of {order.symbol}</h4>
                        <p className="mt-1 text-sm text-slate-300">{order.email} · Account {order.accountNumber}</p>
                      </div>
                      <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">{order.status}</span>
                    </div>
                    <div className="mt-3 grid gap-1 text-sm text-slate-300 md:grid-cols-3">
                      <p>Order type: <strong className="text-white">{order.orderType}</strong></p>
                      <p>Price: <strong className="text-white">{order.indicativePrice}</strong></p>
                      <p>Submitted: <strong className="text-white">{new Date(order.createdAt).toLocaleString()}</strong></p>
                    </div>
                  </article>
                )) : <p className="rounded-md border border-white/10 bg-white/5 p-4 text-sm text-slate-300">No trade requests submitted yet.</p>}
              </div>
            </div>
          </section>

          <form onSubmit={savePortfolio} className={`rounded-lg border border-white/10 bg-white/5 p-6 ${signedIn ? "" : "opacity-50"}`}>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <WalletCards className="size-8 text-gold" />
                <h2 className="mt-4 text-2xl font-bold">Client Holdings Editor</h2>
                <p className="mt-2 text-sm text-slate-300">Select one signup, then update that client&apos;s portfolio value, crypto holdings, stocks, and investment balances.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => loadPortfolio()} disabled={!signedIn || !selectedAccountNumber || busyAction === "portfolio-load"} className="rounded-md border border-white/20 px-5 py-3 font-bold transition hover:border-gold hover:text-gold active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50">
                  {busyAction === "portfolio-load" ? "Loading Holdings..." : "Load Holdings"}
                </button>
                <button type="button" onClick={addHolding} disabled={!signedIn || isBusy} className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-5 py-3 font-bold transition hover:border-gold hover:text-gold active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50">
                  <Plus className="size-4" /> Add Holding
                </button>
              </div>
            </div>

            <label className="mt-6 grid gap-2 text-sm font-semibold">
              Individual signup
              <select
                className="form-field"
                value={selectedAccountNumber}
                onChange={(event) => selectClientPortfolio(event.target.value)}
                disabled={!signedIn || applications.length === 0}
              >
                <option value="">Select a client signup</option>
                {applications.map((application) => (
                  <option key={application.accountNumber} value={application.accountNumber}>
                    {application.accountNumber} - {application.firstName} {application.lastName} - {application.email}
                  </option>
                ))}
              </select>
            </label>
            {selectedAccountNumber ? (
              <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-100">
                Editing holdings for {selectedAccountNumber}. These values will show only in that client&apos;s portal.
              </p>
            ) : (
              <p className="mt-3 rounded-md border border-white/10 bg-[#07111f] p-3 text-sm text-slate-300">
                Load the admin inbox, then choose a signup before saving portfolio values.
              </p>
            )}

            <div className="mt-6 grid gap-4">
              {holdings.length ? holdings.map((holding, index) => (
                <article key={`${holding.symbol}-${index}`} className="rounded-lg border border-white/10 bg-[#07111f] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{holding.name || "Holding"} · {holding.symbol || "Symbol"}</strong>
                    <button type="button" onClick={() => removeHolding(index)} disabled={!signedIn} className="rounded-md border border-rose-300/30 p-2 text-rose-200 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Remove holding">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <label className="grid gap-2 text-sm font-semibold">
                      Asset name
                      <input className="form-field" value={holding.name} onChange={(event) => updateHolding(index, "name", event.target.value)} disabled={!signedIn} />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold">
                      Symbol
                      <input className="form-field" value={holding.symbol} onChange={(event) => updateHolding(index, "symbol", event.target.value)} disabled={!signedIn} />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold">
                      Category
                      <select className="form-field" value={holding.category} onChange={(event) => updateHolding(index, "category", event.target.value)} disabled={!signedIn}>
                        {["Crypto", "Stock", "Stocks", "Investment", "Private Market", "Forex", "Fund"].map((category) => <option key={category}>{category}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-semibold">
                      Balance / value
                      <input className="form-field" type="number" min="0" step="0.01" value={holding.value} onChange={(event) => updateHolding(index, "value", event.target.value)} disabled={!signedIn} />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold">
                      Return
                      <input className="form-field" value={holding.returnValue} onChange={(event) => updateHolding(index, "returnValue", event.target.value)} disabled={!signedIn} />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold">
                      Status
                      <select className="form-field" value={holding.status} onChange={(event) => updateHolding(index, "status", event.target.value)} disabled={!signedIn}>
                        {["Active", "Reserved", "Pending", "Matured", "Closed"].map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-semibold md:col-span-3">
                      Allocation bar %
                      <input className="form-field" type="number" min="0" max="100" value={holding.allocation} onChange={(event) => updateHolding(index, "allocation", event.target.value)} disabled={!signedIn} />
                    </label>
                  </div>
                </article>
              )) : (
                <p className="rounded-md border border-white/10 bg-[#07111f] p-4 text-sm text-slate-300">Unlock admin, then click Load Holdings.</p>
              )}
            </div>

            <button disabled={!signedIn || holdings.length === 0 || busyAction === "portfolio-save"} className="mt-5 w-full rounded-md bg-gold px-5 py-3 font-bold text-navy transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50">
              {busyAction === "portfolio-save" ? "Saving Client Holdings..." : "Save Client Holdings"}
            </button>
          </form>

          <form onSubmit={savePaymentDetails} className={`rounded-lg border border-white/10 bg-white/5 p-6 ${signedIn ? "" : "opacity-50"}`}>
            <WalletCards className="size-8 text-gold" />
            <h2 className="mt-4 text-2xl font-bold">Deposit Payment Details</h2>
            <p className="mt-2 text-sm text-slate-300">Choose a payment method and enter the details users should see after creating a deposit request.</p>
            <label className="mt-5 grid gap-2 text-sm font-semibold">
              Payment method
              <select className="form-field" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} disabled={!signedIn}>
                {paymentMethods.map((method) => <option key={method}>{method}</option>)}
              </select>
            </label>
            <label className="mt-4 grid gap-2 text-sm font-semibold">
              Payment details or instructions
              <textarea
                className="form-field min-h-32"
                value={paymentInstructions}
                onChange={(event) => setPaymentInstructions(event.target.value)}
                placeholder="Example: Pay to this account/wallet, include the deposit reference, then contact support after payment."
                disabled={!signedIn}
              />
            </label>
            <button disabled={!signedIn || busyAction === "payment"} className="mt-5 w-full rounded-md bg-gold px-5 py-3 font-bold text-navy transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50">
              {busyAction === "payment" ? "Saving Payment Details..." : "Save Payment Details"}
            </button>
          </form>

          <section className={`rounded-lg border border-white/10 bg-white/5 p-6 ${signedIn ? "" : "opacity-50"}`}>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <WalletCards className="size-8 text-gold" />
                <h2 className="mt-4 text-2xl font-bold">Deposit Requests</h2>
                <p className="mt-2 text-sm text-slate-300">Review every cashier deposit request and approve it from the owner console.</p>
              </div>
              <button type="button" onClick={loadDeposits} disabled={!signedIn || busyAction === "deposits"} className="rounded-md border border-white/20 px-5 py-3 font-bold transition hover:border-gold hover:text-gold active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50">
                {busyAction === "deposits" ? "Refreshing Deposits..." : "Refresh Deposits"}
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              {deposits.length ? deposits.map((deposit) => (
                <article key={deposit.depositReference} className="rounded-lg border border-white/10 bg-[#07111f] p-4">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{deposit.depositReference}</p>
                      <h3 className="mt-2 text-xl font-bold">{deposit.currency} {deposit.amount.toLocaleString()} via {deposit.method}</h3>
                      <p className="mt-1 text-sm text-slate-300">{deposit.email} · Account {deposit.accountNumber}</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${deposit.status === "Approved" ? "bg-emerald-400/15 text-emerald-200" : "bg-gold/15 text-gold"}`}>
                        {deposit.status}
                      </span>
                      {deposit.status === "Pending" ? (
                        <button
                          type="button"
                          onClick={() => approveDepositByReference(deposit.depositReference)}
                          disabled={!signedIn || busyAction === `approve-${deposit.depositReference}`}
                          className="rounded-md bg-gold px-4 py-2 text-sm font-bold text-navy transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busyAction === `approve-${deposit.depositReference}` ? "Approving..." : "Approve"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {deposit.approvedAt ? (
                    <p className="mt-3 text-xs text-slate-400">Approved by {deposit.approvedBy} on {new Date(deposit.approvedAt).toLocaleString()}</p>
                  ) : (
                    <p className="mt-3 text-xs text-slate-400">Created {new Date(deposit.createdAt).toLocaleString()}</p>
                  )}
                </article>
              )) : (
                <p className="rounded-md border border-white/10 bg-[#07111f] p-4 text-sm text-slate-300">No deposit requests yet. When a user creates one from the cashier page, it will appear here.</p>
              )}
            </div>
          </section>

          <form onSubmit={approveDeposit} className={`rounded-lg border border-white/10 bg-white/5 p-6 ${signedIn ? "" : "opacity-50"}`}>
            <WalletCards className="size-8 text-gold" />
            <h2 className="mt-4 text-2xl font-bold">Manual Deposit Approval</h2>
            <p className="mt-2 text-sm text-slate-300">Paste a deposit reference if you want to approve a request manually.</p>
            <label className="mt-5 grid gap-2 text-sm font-semibold">
              Deposit reference
              <input className="form-field" value={depositId} onChange={(event) => setDepositId(event.target.value)} placeholder="DEP-1780351191132" disabled={!signedIn} />
            </label>
            <button disabled={!signedIn || busyAction === "approve"} className="mt-5 w-full rounded-md bg-gold px-5 py-3 font-bold text-navy transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50">
              {busyAction === "approve" ? "Approving Deposit..." : "Approve Deposit"}
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-5">
          <p className="flex items-start gap-3 text-sm text-slate-200">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold" />
            {message}
          </p>
        </div>
      </section>
    </main>
  );
}
