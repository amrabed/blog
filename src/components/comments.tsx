"use client";

import Giscus from "@giscus/react";
import { useTheme } from "@/contexts/theme";

interface CommentsProps {
  slug: string;
}

export function Comments({ slug }: CommentsProps) {
  const { theme } = useTheme();

  const repo = (process.env.NEXT_PUBLIC_GISCUS_REPO ||
    "amrabed/blog") as `${string}/${string}`;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID || "R_kgDOL6Wcqw";
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY || "Announcements";
  const categoryId =
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || "DIC_kwDOL6Wcq84DHBEZ";

  if (!repo || !repoId) return null;

  return (
    <section
      className="mt-16 pt-8 border-t border-divider"
      aria-label="Comments"
    >
      <h2 className="text-xl font-bold text-heading mb-6">Comments</h2>
      <Giscus
        id="comments"
        repo={repo}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="specific"
        term={slug}
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme === "dark" ? "transparent_dark" : "light"}
        lang="en"
        loading="lazy"
      />
    </section>
  );
}

export default Comments;
