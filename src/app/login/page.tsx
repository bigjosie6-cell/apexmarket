"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";

type LocalApplication = {
  email: string;
  accountNumber: string;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
};

const localApplicationListKey = "hutridge-applications";
const localLoginActivityKey = "hutridge-login-activity";

function saveLocalLoginActivity(application: LocalApplication) {
  try {
    const saved = window.localStorage.getItem(localLoginActivityKey);
    const logins = saved ? (JSON.parse(saved) as unknown[]) : [];
    const entry = {
      id: `LOCAL-${Date.now().toString().slice(-8)}`,
      email: application.email,
      accountNumber: application.accountNumber,
      firstName: application.firstName ?? "Client",
      lastName: application.lastName ?? "",
      status: "Successful",
      createdAt: new Date().toISOString(),
    };
    window.localStorage.setItem(localLoginActivityKey, JSON.stringify([entry, ...logins].slice(0, 500)));
  } catch {
    // Server-side login activity remains the primary record.
  }
}

function findLocalApplication(email: string, accountNumber: string) {
  try {
    const current = window.localStorage.getItem("hutridge-application");
    if (current) {
      const application = JSON.parse(current) as LocalApplication;
      if (
        application.email.toLowerCase() === email.trim().toLowerCase()
        && application.accountNumber.toUpperCase() === accountNumber.trim().toUpperCase()
      ) {
        return application;
      }
    }

    const saved = window.localStorage.getItem(localApplicationListKey);
    const applications = saved ? (JSON.parse(saved) as LocalApplication[]) : [];
    return applications.find((application) => (
      application.email.toLowerCase() === email.trim().toLowerCase()
      && application.accountNumber.toUpperCase() === accountNumber.trim().toUpperCase()
    ));
  } catch {
    return undefined;
  }
}

export default function ClientLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [message, setMessage] = useState("Enter your email and HF account reference to continue.");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("Checking login details...");
    const nextPath = new URLSearchParams(window.location.search).get("next") === "/trade" ? "/trade" : "/client-portal";

    try {
      const response = await fetch("/api/client-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, accountNumber }),
      });
      const result = await response.json();

      if (!response.ok) {
        const localApplication = findLocalApplication(email, accountNumber);
        if (localApplication) {
          localStorage.setItem("hutridge-application", JSON.stringify(localApplication));
          saveLocalLoginActivity(localApplication);
          setMessage("Login successful. Opening client area...");
          router.push(nextPath);
          return;
        }
        setMessage(result.message ?? "Login failed.");
        return;
      }

      localStorage.setItem("hutridge-application", JSON.stringify(result.application));
      saveLocalLoginActivity(result.application);
      setMessage("Login successful. Opening client area...");
      router.push(nextPath);
    } catch {
      setMessage("Login could not be completed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-navy dark:bg-[#07111f] dark:text-white">
      <section className="bg-navy px-4 py-6 text-white lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
            <ArrowLeft className="size-4" />
            Back to Hutridge Financial
          </Link>
          <span className="hidden rounded-md bg-white/10 px-3 py-2 text-sm font-semibold sm:inline-flex">Client Login</span>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="section-kicker">Client access</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">Log in to your Hutridge Financial account</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Use the email address from signup and your HF account reference to reopen the client portal anytime.
          </p>
          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <ShieldCheck className="size-7 text-gold" />
            <h2 className="mt-3 text-xl font-bold">Where to find your reference</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Your account reference starts with HF and appears after registration and in your signup email.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <LockKeyhole className="size-8 text-gold" />
          <h2 className="mt-4 text-2xl font-bold">Client Login</h2>
          <label className="mt-6 grid gap-2 text-sm font-semibold">
            Email address
            <input className="form-field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="client@example.com" />
          </label>
          <label className="mt-4 grid gap-2 text-sm font-semibold">
            Account reference
            <input className="form-field uppercase" value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} placeholder="HF-123456" />
          </label>
          <button disabled={loading} className="mt-5 w-full rounded-md bg-gold px-5 py-3 font-bold text-navy disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Checking..." : "Log In"}
          </button>
          <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">{message}</p>
          <Link href="/open-account" className="mt-5 inline-flex text-sm font-bold text-gold">
            Need an account? Open one
          </Link>
        </form>
      </section>
    </main>
  );
}
