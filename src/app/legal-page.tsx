import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import type { LegalPage } from "@/lib/legal-pages";

export default function LegalPageView({ page }: { page: LegalPage }) {
  return (
    <main className="min-h-screen bg-slate-50 text-navy dark:bg-[#07111f] dark:text-white">
      <header className="border-b border-slate-200 bg-white/95 px-4 py-5 dark:border-white/10 dark:bg-[#07111f]/95 lg:px-8">
        <nav className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-bold">
            <span className="grid size-10 place-items-center rounded-md bg-navy text-gold dark:bg-white">HF</span>
            Hutridge Financial
          </Link>
          <Link href="/support" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold dark:border-white/15">
            Support
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
        <div className="rounded-lg bg-navy p-8 text-white shadow-xl dark:bg-white/5">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-1 size-8 text-gold" />
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-gold">Legal</p>
              <h1 className="mt-3 text-4xl font-bold md:text-5xl">{page.title}</h1>
              <p className="mt-4 max-w-3xl text-slate-200">{page.intro}</p>
              <p className="mt-4 text-sm text-slate-300">Last updated: {page.updated}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900 dark:border-gold/30 dark:bg-gold/10 dark:text-amber-100">
          This page is a website policy template for Hutridge Financial and should be reviewed by qualified legal and compliance counsel before being relied on as formal legal advice.
        </div>

        <div className="mt-8 grid gap-5">
          {page.sections.map((section) => (
            <section key={section.heading} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <h2 className="text-2xl font-bold">{section.heading}</h2>
              <div className="mt-4 grid gap-4 text-slate-700 dark:text-slate-300">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
