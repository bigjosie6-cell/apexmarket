"use client";

import Link from "next/link";
import { Headphones, Home } from "lucide-react";

export default function QuickActions() {
  return (
    <nav
      aria-label="Quick navigation"
      className="fixed bottom-5 left-5 z-[80] flex overflow-hidden rounded-full border border-slate-200 bg-white text-sm font-bold text-navy shadow-2xl shadow-navy/15 backdrop-blur dark:border-white/15 dark:bg-[#07111f] dark:text-white dark:shadow-black/50"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-2 border-r border-slate-200 px-4 py-3 transition hover:bg-gold hover:text-navy dark:border-white/10"
      >
        <Home className="size-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>
      <Link
        href="/support"
        className="inline-flex items-center gap-2 px-4 py-3 transition hover:bg-gold hover:text-navy"
      >
        <Headphones className="size-4" />
        <span className="hidden sm:inline">Contact Support</span>
      </Link>
    </nav>
  );
}
