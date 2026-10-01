"use client";

import ThemeProvider from "@/contexts/theme";

const Providers = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => <ThemeProvider>{children}</ThemeProvider>;

export default Providers;
