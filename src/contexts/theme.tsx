"use client";

import { useTheme as useNextTheme } from "next-themes";
import type { PropsWithChildren } from "react";

export type Theme = "light" | "dark";

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export function useTheme(): ThemeContextType {
  const { theme, resolvedTheme, setTheme } = useNextTheme();
  const activeTheme = (resolvedTheme || theme || "dark") as Theme;

  return {
    theme: activeTheme,
    toggleTheme: () => {
      setTheme(activeTheme === "dark" ? "light" : "dark");
    },
  };
}

export function ThemeProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export default ThemeProvider;
