"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const ThemeContext = createContext(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    console.log("[ThemeProvider] Mount effect: Determining initial theme...");
    let determinedTheme = "light";
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        determinedTheme = savedTheme;
        console.log(
          "[ThemeProvider] Loaded theme from localStorage:",
          determinedTheme
        );
      } else {
        if (typeof window !== "undefined") {
          const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
          determinedTheme = prefersDark ? "dark" : "light";
          console.log(
            "[ThemeProvider] Determined theme from system preference:",
            determinedTheme
          );
        }
      }
    } catch (error) {
      console.warn(
        "[ThemeProvider] Could not access localStorage to load theme. Using system preference or default.",
        error
      );
      if (typeof window !== "undefined") {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        determinedTheme = prefersDark ? "dark" : "light";
        console.log(
          "[ThemeProvider] Determined theme from system preference (in catch):",
          determinedTheme
        );
      }
    }
    setTheme(determinedTheme);
  }, []);

  useEffect(() => {
    if (theme === null) {
      console.log(
        "[ThemeProvider] Apply effect: Theme is null, waiting for determination."
      );
      return;
    }

    console.log(
      "[ThemeProvider] Apply effect: Applying theme to HTML and localStorage:",
      theme
    );
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.remove("light");
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }

    try {
      localStorage.setItem("theme", theme);
    } catch (error) {
      console.warn(
        "[ThemeProvider] Could not access localStorage to save theme.",
        error
      );
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const current = prevTheme === null ? "light" : prevTheme;
      const newTheme = current === "light" ? "dark" : "light";
      console.log(
        "[ThemeProvider] Toggling theme from",
        current,
        "to",
        newTheme
      );
      return newTheme;
    });
  }, []);

  const value = { theme, toggleTheme, setTheme };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
