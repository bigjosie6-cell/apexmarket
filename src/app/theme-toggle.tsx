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
      className="fixed bottom-5 right-5 z-[80] inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm font-bold text-navy shadow-2xl shadow-navy/15 backdrop-blur transition hover:-translate-y-0.5 hover:border-gold dark:border-white/15 dark:bg-[#07111f]/90 dark:text-white dark:shadow-black/40"
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      suppressHydrationWarning
    >
      <span className="grid size-9 place-items-center rounded-full bg-navy text-gold shadow-inner dark:bg-gold dark:text-navy">
        {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </span>
      <span className="hidden sm:inline">{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
