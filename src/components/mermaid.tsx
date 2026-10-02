"use client";

import { useEffect, useId, useState } from "react";
import { useTheme } from "@/contexts/theme";

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const id = useId().replace(/:/g, "_");
  const { theme } = useTheme();
  const [svg, setSvg] = useState<string>("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function renderMermaid() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === "dark" ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "inherit",
        });

        const uniqueId = `mermaid_${id}_${Date.now()}`;
        const { svg: renderedSvg } = await mermaid.render(uniqueId, chart);
        if (isMounted) {
          setSvg(renderedSvg);
          setHasError(false);
        }
      } catch (err) {
        console.error("Mermaid rendering failed:", err);
        if (isMounted) {
          setHasError(true);
        }
      }
    }

    renderMermaid();

    return () => {
      isMounted = false;
    };
  }, [chart, theme, id]);

  if (hasError) {
    return (
      <pre className="overflow-x-auto text-xs p-4 rounded-xl bg-surface border border-divider">
        <code>{chart}</code>
      </pre>
    );
  }

  if (!svg) {
    return (
      <div className="flex items-center justify-center p-8 text-xs text-muted">
        Loading diagram...
      </div>
    );
  }

  return (
    <div
      className="my-6 flex justify-center overflow-x-auto [&>svg]:max-w-full [&>svg]:h-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
