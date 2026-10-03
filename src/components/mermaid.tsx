"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "@/contexts/theme";

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const id = useId().replace(/:/g, "_");
  const { theme } = useTheme();
  const [svg, setSvg] = useState<string>("");
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

        // Nextra's remark-mermaid plugin replaces newlines with literal "\n" strings in the JSX AST.
        // We must unescape them back to real newlines so the Mermaid parser can parse the syntax.
        const unescapedChart = chart.replaceAll("\\n", "\n").trim();
        const uniqueId = `mermaid_${id}_${Date.now()}`;
        const { svg: renderedSvg } = await mermaid.render(
          uniqueId,
          unescapedChart,
          containerRef.current ?? undefined,
        );
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
    const unescapedChart = chart.replaceAll("\\n", "\n").trim();
    return (
      <pre className="overflow-x-auto text-xs p-4 rounded-xl bg-surface border border-divider">
        <code>{unescapedChart}</code>
      </pre>
    );
  }

  if (!svg) {
    return (
      <div
        ref={containerRef}
        className="flex items-center justify-center p-8 text-xs text-muted"
      >
        Loading diagram...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-6 flex justify-center overflow-x-auto [&>svg]:max-w-full [&>svg]:h-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
