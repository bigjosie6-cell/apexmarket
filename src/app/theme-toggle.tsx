"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  const savedTheme = window.localStorage.getItem("apexfx-theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("apexfx-theme", theme);
  }, [theme]);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className="fixed bottom-5 right-5 z-[80] inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1.5 text-sm font-bold text-navy shadow-2xl shadow-navy/20 backdrop-blur transition hover:-translate-y-0.5 hover:border-gold dark:border-white/15 dark:bg-[#07111f] dark:text-white dark:shadow-black/50"
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      suppressHydrationWarning
    >
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 transition ${theme === "light" ? "bg-gold text-navy shadow-sm" : "text-slate-500 dark:text-slate-300"}`}>
        <Sun className="size-4" />
        <span className="hidden sm:inline">Light</span>
      </span>
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 transition ${theme === "dark" ? "bg-gold text-navy shadow-sm" : "text-slate-500 dark:text-slate-300"}`}>
        <Moon className="size-4" />
        <span className="hidden sm:inline">Dark</span>
      </span>
    </button>
  );
}
