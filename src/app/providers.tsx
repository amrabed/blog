"use client";

import type { PropsWithChildren } from "react";
import { Providers as SharedProviders } from "@amrabed/ui";

export default function Providers({ children }: PropsWithChildren) {
  return <SharedProviders>{children}</SharedProviders>;
}
