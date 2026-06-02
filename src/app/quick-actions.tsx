"use client";

import { Headphones, Home } from "lucide-react";

export default function QuickActions() {
  const navigate = (path: string) => {
    window.location.assign(path);
  };

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed bottom-5 left-5 z-[120] flex overflow-hidden rounded-full border border-slate-200 bg-white text-sm font-bold text-navy shadow-2xl shadow-navy/15 backdrop-blur dark:border-white/15 dark:bg-[#07111f] dark:text-white dark:shadow-black/50"
    >
      <button
        type="button"
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-2 border-r border-slate-200 px-4 py-3 transition hover:bg-gold hover:text-navy dark:border-white/10"
      >
        <Home className="size-4" />
        <span>Home</span>
      </button>
      <button
        type="button"
        onClick={() => navigate("/support")}
        className="inline-flex items-center gap-2 px-4 py-3 transition hover:bg-gold hover:text-navy"
      >
        <Headphones className="size-4" />
        <span>Support</span>
      </button>
    </nav>
  );
}
