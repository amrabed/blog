"use client";

import type { PropsWithChildren } from "react";
import ThemeProvider from "@/contexts/theme";

export default function Providers({ children }: PropsWithChildren) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
