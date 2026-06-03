"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  LockKeyhole,
  ShieldCheck,
  UserRoundPlus,
  WalletCards,
} from "lucide-react";

const accountTypes = [
  { name: "Standard", deposit: "$100", spread: "From 1.2 pips", leverage: "Up to 1:100" },
  { name: "Pro", deposit: "$1,000", spread: "From 0.6 pips", leverage: "Lower commissions" },
  { name: "VIP", deposit: "$10,000", spread: "Raw institutional pricing", leverage: "Dedicated manager" },
];

const fundingMethods = ["Bank Transfer", "Debit/Credit Card", "Crypto USDT", "Local Bank Payment"];
const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "South Africa",
  "United Arab Emirates",
  "Singapore",
  "Other",
];

const phoneExamples: Record<string, string> = {
  "United States": "+1 202 555 0147",
  Canada: "+1 416 555 0198",
  "United Kingdom": "+44 20 7946 0958",
  Australia: "+61 2 8012 3456",
  Germany: "+49 30 123456",
  France: "+33 1 42 68 53 00",
  "South Africa": "+27 11 555 0198",
  "United Arab Emirates": "+971 50 123 4567",
  Singapore: "+65 6123 4567",
  Other: "+ country code phone number",
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  accountType: string;
  experience: string;
  employment: string;
  annualIncome: string;
  netWorth: string;
  tradingGoal: string;
  baseCurrency: string;
  fundingMethod: string;
  expectedDeposit: string;
  idDocument: string;
  addressProof: string;
  acceptRisk: boolean;
  acceptTerms: boolean;
};

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "United States",
  accountType: "Standard",
  experience: "Beginner",
  employment: "Employed",
  annualIncome: "$25,000 - $50,000",
  netWorth: "$10,000 - $50,000",
  tradingGoal: "Capital growth",
  baseCurrency: "USD",
  fundingMethod: "Bank Transfer",
  expectedDeposit: "1000",
  idDocument: "",
  addressProof: "",
  acceptRisk: false,
  acceptTerms: false,
};

const steps = [
  { title: "Profile", icon: UserRoundPlus },
  { title: "Suitability", icon: BriefcaseBusiness },
  { title: "Funding", icon: WalletCards },
  { title: "Review", icon: ShieldCheck },
];

const verificationDelayMs = 50000;
const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const localApplicationListKey = "hutridge-applications";

function saveLocalApplication(application: FormState & { accountNumber: string; status: string; submittedAt: string }) {
  try {
    const saved = window.localStorage.getItem(localApplicationListKey);
    const applications = saved ? (JSON.parse(saved) as Array<typeof application>) : [];
    const next = [application, ...applications.filter((item) => item.accountNumber !== application.accountNumber)];
    window.localStorage.setItem(localApplicationListKey, JSON.stringify(next));
  } catch {
    // The primary current-session profile is still saved separately.
  }
}

export default function OpenAccountPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifyingStep, setVerifyingStep] = useState(false);

  const [accountNumber, setAccountNumber] = useState("HF-PENDING");

  useEffect(() => {
    queueMicrotask(() => {
      setAccountNumber(`HF-${Date.now().toString().slice(-6)}`);
    });
  }, []);

  const update = (key: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const validateStep = () => {
    const nextErrors: Record<string, string> = {};

    if (step === 0) {
      if (!form.firstName.trim()) nextErrors.firstName = "First name is required.";
      if (!form.lastName.trim()) nextErrors.lastName = "Last name is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Enter a valid email.";
      if (form.phone.replace(/\D/g, "").length < 7) nextErrors.phone = "Enter a valid phone number.";
    }

    if (step === 2) {
      if (!form.expectedDeposit || Number(form.expectedDeposit) < 100) {
        nextErrors.expectedDeposit = "Minimum expected deposit is $100.";
      }
    }

    if (step === 3) {
      if (!form.acceptRisk) nextErrors.acceptRisk = "Risk warning acknowledgement is required.";
      if (!form.acceptTerms) nextErrors.acceptTerms = "Terms acknowledgement is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const next = async () => {
    if (!validateStep()) return;
    setVerifyingStep(true);
    setSubmitStatus(`${steps[step].title} review in progress. Please wait 50 seconds while Hutridge Financial verifies this section.`);
    await wait(verificationDelayMs);
    setStep((current) => Math.min(current + 1, steps.length - 1));
    setSubmitStatus("");
    setVerifyingStep(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    if (verifyingStep || submitting) return;
    setStep((current) => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateStep()) return;
    setSubmitting(true);
    setSubmitStatus("Final compliance verification in progress. Please wait 50 seconds while the account is reviewed.");
    await wait(verificationDelayMs);
    setSubmitStatus("Creating account application and sending confirmation email...");

    const application = {
      ...form,
      accountNumber,
      status: "Verified",
      submittedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/account-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(application),
      });
      const result = await response.json();
      const savedApplication = { ...application, accountNumber: result.accountNumber ?? accountNumber };
      localStorage.setItem("hutridge-application", JSON.stringify(savedApplication));
      saveLocalApplication(savedApplication);
      setSubmitStatus(result.message ?? "Application created.");
      router.push("/client-portal");
    } catch {
      localStorage.setItem("hutridge-application", JSON.stringify(application));
      saveLocalApplication(application);
      setSubmitStatus("Application created, but the confirmation email could not be sent. Please contact support.");
      router.push("/client-portal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-navy dark:bg-[#07111f] dark:text-white">
      <section className="bg-navy px-4 py-6 text-white lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
            <ArrowLeft className="size-4" />
            Back to Hutridge Financial
          </Link>
          <div className="hidden items-center gap-3 text-sm font-semibold sm:flex">
            <LockKeyhole className="size-4 text-gold" />
            256-bit encrypted application
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
        <aside>
          <p className="section-kicker">Account onboarding</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">Open a live trading account</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Complete a secure application, choose your account tier, upload verification details, and enter the Hutridge Financial client area.
          </p>

          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <BadgeCheck className="size-8 text-gold" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-300">Application reference</p>
                <p className="text-xl font-bold">{accountNumber}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {steps.map(({ title, icon: Icon }, index) => (
                <div key={title} className={`flex items-center gap-3 rounded-md p-3 ${index === step ? "bg-navy text-white" : "bg-slate-50 dark:bg-white/5"}`}>
                  <span className={`grid size-8 place-items-center rounded-md ${index <= step ? "bg-gold text-navy" : "bg-white/10 text-slate-400"}`}>
                    {index < step ? <Check className="size-4" /> : <Icon className="size-4" />}
                  </span>
                  <span className="font-semibold">{title}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-white/5 md:p-7">
          <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div className="h-full bg-gold transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>

          {step === 0 && (
            <section>
              <h2 className="text-2xl font-bold">Personal profile</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Use realistic details to create a believable brokerage account application.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="First name" error={errors.firstName}>
                  <input className="form-field" value={form.firstName} onChange={(event) => update("firstName", event.target.value)} placeholder="Michael" />
                </Field>
                <Field label="Last name" error={errors.lastName}>
                  <input className="form-field" value={form.lastName} onChange={(event) => update("lastName", event.target.value)} placeholder="Johnson" />
                </Field>
                <Field label="Email address" error={errors.email}>
                  <input className="form-field" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="michael.johnson@example.com" type="email" />
                </Field>
                <Field label="Phone number" error={errors.phone}>
                  <input className="form-field" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder={phoneExamples[form.country]} />
                </Field>
                <Field label="Country of residence">
                  <select className="form-field" value={form.country} onChange={(event) => update("country", event.target.value)}>
                    {countries.map((country) => <option key={country}>{country}</option>)}
                  </select>
                </Field>
                <Field label="Trading experience">
                  <select className="form-field" value={form.experience} onChange={(event) => update("experience", event.target.value)}>
                    {["Beginner", "Intermediate", "Advanced", "Professional"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>
              </div>
            </section>
          )}

          {step === 1 && (
            <section>
              <h2 className="text-2xl font-bold">Account and suitability</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Select your account and provide the information a brokerage would normally review.</p>
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {accountTypes.map((account) => (
                  <button
                    key={account.name}
                    type="button"
                    onClick={() => update("accountType", account.name)}
                    className={`rounded-lg border p-4 text-left transition ${form.accountType === account.name ? "border-gold bg-navy text-white shadow-lg" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"}`}
                  >
                    <p className="text-lg font-bold">{account.name}</p>
                    <p className="mt-3 text-sm opacity-80">Minimum deposit</p>
                    <p className="text-2xl font-bold">{account.deposit}</p>
                    <p className="mt-3 text-sm">{account.spread}</p>
                    <p className="text-sm">{account.leverage}</p>
                  </button>
                ))}
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="Employment status">
                  <select className="form-field" value={form.employment} onChange={(event) => update("employment", event.target.value)}>
                    {["Employed", "Self-employed", "Business owner", "Investor", "Student", "Retired"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>
                <Field label="Annual income">
                  <select className="form-field" value={form.annualIncome} onChange={(event) => update("annualIncome", event.target.value)}>
                    {["Below $25,000", "$25,000 - $50,000", "$50,000 - $100,000", "Above $100,000"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>
                <Field label="Estimated net worth">
                  <select className="form-field" value={form.netWorth} onChange={(event) => update("netWorth", event.target.value)}>
                    {["Below $10,000", "$10,000 - $50,000", "$50,000 - $250,000", "Above $250,000"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>
                <Field label="Trading objective">
                  <select className="form-field" value={form.tradingGoal} onChange={(event) => update("tradingGoal", event.target.value)}>
                    {["Capital growth", "Speculation", "Hedging", "Portfolio diversification"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>
                <Field label="Base currency">
                  <select className="form-field" value={form.baseCurrency} onChange={(event) => update("baseCurrency", event.target.value)}>
                    {["USD", "EUR", "GBP", "NGN"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h2 className="text-2xl font-bold">Funding method</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Choose how you want to fund the account. Payment instructions are shown after the account is created.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="Funding method">
                  <select className="form-field" value={form.fundingMethod} onChange={(event) => update("fundingMethod", event.target.value)}>
                    {fundingMethods.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>
                <Field label="Expected first deposit" error={errors.expectedDeposit}>
                  <input className="form-field" value={form.expectedDeposit} onChange={(event) => update("expectedDeposit", event.target.value)} type="number" min="100" />
                </Field>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                  <WalletCards className="size-7 text-gold" />
                  <p className="mt-3 font-bold">Funding instruction preview</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">After submission, Hutridge Financial will show a secure cashier with transaction references, limits, and funding details for {form.fundingMethod}.</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                  <ShieldCheck className="size-7 text-gold" />
                  <p className="mt-3 font-bold">Account review</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Your funding preference is reviewed before the client area opens.</p>
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <h2 className="text-2xl font-bold">Review and submit</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Confirm your details. Submitting creates a local demo client profile and opens the client area.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <ReviewCard title="Applicant" rows={[`${form.firstName} ${form.lastName}`, form.email, form.phone, form.country]} />
                <ReviewCard title="Account" rows={[`${form.accountType} Account`, `Base currency: ${form.baseCurrency}`, `Expected deposit: $${form.expectedDeposit}`, form.fundingMethod]} />
                <ReviewCard title="Suitability" rows={[form.experience, form.employment, form.annualIncome, form.tradingGoal]} />
                <ReviewCard title="Funding" rows={[`Method: ${form.fundingMethod}`, `Amount: ${form.baseCurrency} ${form.expectedDeposit}`, "Funding details shown after approval"]} />
              </div>
              <div className="mt-6 grid gap-3">
                <CheckBox checked={form.acceptRisk} onChange={(value) => update("acceptRisk", value)} error={errors.acceptRisk}>
                  I understand that forex and CFD trading involves significant risk and I may lose more than my initial investment.
                </CheckBox>
                <CheckBox checked={form.acceptTerms} onChange={(value) => update("acceptTerms", value)} error={errors.acceptTerms}>
                  I accept the Hutridge Financial client agreement, privacy policy, AML policy, and risk disclosure.
                </CheckBox>
              </div>
            </section>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-white/10 sm:flex-row sm:justify-between">
            <button type="button" onClick={back} disabled={step === 0 || verifyingStep || submitting} className="rounded-md border border-slate-300 px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/20">
              Back
            </button>
            {step < steps.length - 1 ? (
              <button type="button" onClick={next} disabled={verifyingStep} className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 font-bold text-navy disabled:cursor-not-allowed disabled:opacity-60">
                {verifyingStep ? "Verifying - 50 seconds..." : "Continue"} <ArrowRight className="size-4" />
              </button>
            ) : (
              <button disabled={submitting} type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 font-bold text-navy disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? "Final Verification..." : "Submit Application"} <ShieldCheck className="size-4" />
              </button>
            )}
          </div>
          {submitStatus ? (
            <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">{submitStatus}</p>
          ) : null}
        </form>
      </section>
    </main>
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

function ReviewCard({ title, rows }: { title: string; rows: string[] }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
      <h3 className="font-bold">{title}</h3>
      <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
        {rows.map((row) => <p key={row}>{row}</p>)}
      </div>
    </article>
  );
}

function CheckBox({ checked, onChange, error, children }: { checked: boolean; onChange: (value: boolean) => void; error?: string; children: React.ReactNode }) {
  return (
    <label className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5">
      <span className="flex items-start gap-3">
        <input className="mt-1 size-4 accent-[#d4af37]" checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
        <span>{children}</span>
      </span>
      {error ? <span className="mt-2 block text-xs font-semibold text-rose-500">{error}</span> : null}
    </label>
  );
}
