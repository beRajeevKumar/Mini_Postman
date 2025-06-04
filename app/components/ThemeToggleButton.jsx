"use client";

import { useTheme } from "./ThemeProvider";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function ThemeToggleButton() {
  const context = useTheme();
  const theme = context?.theme;
  const toggleTheme = context?.toggleTheme;

  console.log(
    "[ThemeToggleButton] Rendering. Context theme:",
    theme,
    "Context toggleTheme exists:",
    !!toggleTheme
  );

  if (theme === null || !toggleTheme) {
    console.log(
      "[ThemeToggleButton] Theme not ready or toggleTheme missing, rendering nothing or placeholder."
    );
    return (
      <button
        type="button"
        className="p-2 rounded-full text-slate-400 dark:text-slate-500 cursor-not-allowed"
        aria-label="Toggle theme (loading)"
        disabled
      >
        <MoonIcon className="h-6 w-6 animate-pulse" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-slate-900 focus:ring-indigo-500 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <MoonIcon className="h-6 w-6" />
      ) : (
        <SunIcon className="h-6 w-6" />
      )}
    </button>
  );
}
