"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole, ShieldCheck, WalletCards } from "lucide-react";

const paymentMethods = ["Bank Transfer", "Debit/Credit Card", "Mobile Money", "Crypto USDT"];

export default function AdminPage() {
  const [adminId, setAdminId] = useState("");
  const [secret, setSecret] = useState("");
  const [depositId, setDepositId] = useState("");
  const [receivingAddress, setReceivingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const [message, setMessage] = useState("Owner login required. This page is not accessible to ordinary users.");
  const [signedIn, setSignedIn] = useState(false);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId, secret }),
    });
    const result = await response.json();
    setMessage(result.message);
    setSignedIn(response.ok);
  };

  const saveDonationAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    }
  };

  const approveDeposit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch(`/api/admin/deposits/${depositId}/approve`, {
      method: "POST",
    });
    const result = await response.json();
    setMessage(result.message ?? `Deposit ${result.depositId} approved.`);
  };

  const savePaymentDetails = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setSignedIn(false);
    setSecret("");
    setMessage("Signed out.");
  };

  return (
    <main className="min-h-screen bg-[#07111f] px-4 py-10 text-white lg:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-lg border border-white/10 bg-[#0A1F44] p-6 shadow-2xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="section-kicker">Private admin</p>
              <h1 className="mt-2 text-4xl font-bold">Hutridge Financial Owner Console</h1>
              <p className="mt-3 max-w-2xl text-slate-300">Only the configured owner ID and secret can access deposit approval tools.</p>
            </div>
            {signedIn ? (
              <button onClick={logout} className="rounded-md border border-white/20 px-4 py-3 font-bold">Sign Out</button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={login} className="rounded-lg border border-white/10 bg-white/5 p-6">
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
            <button className="mt-5 w-full rounded-md bg-gold px-5 py-3 font-bold text-navy">Unlock Admin</button>
          </form>

          <form onSubmit={saveDonationAddress} className={`rounded-lg border border-white/10 bg-white/5 p-6 ${signedIn ? "" : "opacity-50"}`}>
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
            <button disabled={!signedIn} className="mt-5 w-full rounded-md bg-gold px-5 py-3 font-bold text-navy disabled:cursor-not-allowed disabled:opacity-50">
              Save Donation Address
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr]">
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
            <button disabled={!signedIn} className="mt-5 w-full rounded-md bg-gold px-5 py-3 font-bold text-navy disabled:cursor-not-allowed disabled:opacity-50">
              Save Payment Details
            </button>
          </form>

          <form onSubmit={approveDeposit} className={`rounded-lg border border-white/10 bg-white/5 p-6 ${signedIn ? "" : "opacity-50"}`}>
            <WalletCards className="size-8 text-gold" />
            <h2 className="mt-4 text-2xl font-bold">Approve Deposit</h2>
            <p className="mt-2 text-sm text-slate-300">This calls the owner-protected approval API. Database wiring is still required before real approvals work.</p>
            <label className="mt-5 grid gap-2 text-sm font-semibold">
              Deposit ID
              <input className="form-field" value={depositId} onChange={(event) => setDepositId(event.target.value)} placeholder="deposit-id" disabled={!signedIn} />
            </label>
            <button disabled={!signedIn} className="mt-5 w-full rounded-md bg-gold px-5 py-3 font-bold text-navy disabled:cursor-not-allowed disabled:opacity-50">
              Approve Deposit
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
