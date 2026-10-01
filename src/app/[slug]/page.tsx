import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Button, Card, Chip } from "@heroui/react";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import { getGravatarUrl } from "@/lib/constants";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const pageCanonical =
    post.canonical_url || `https://amrabed.com/blog/${slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: pageCanonical,
    },
    openGraph: {
      title: `${post.title} | Amr Abed`,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `https://amrabed.com/blog/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Amr Abed`,
      description: post.description,
    },
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto">
      {/* Back Navigation */}
      <div className="mb-8">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs font-semibold text-slate-500 hover:text-primary rounded-lg -ml-2"
          >
            ← Back to all articles
          </Button>
        </Link>
      </div>

      {/* Post Header */}
      <header className="mb-10 pb-8 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>•</span>
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Chip
                key={tag}
                size="sm"
                variant="soft"
                className="text-[11px] px-1 py-0 h-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none"
              >
                #{tag}
              </Chip>
            ))}
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight mb-4">
          {post.title}
        </h1>

        {post.description && (
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            {post.description}
          </p>
        )}

        {/* Canonical Attribution Banner */}
        {post.canonical_url && (
          <div className="mt-6 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between flex-wrap gap-2">
            <span>
              Originally published on{" "}
              <strong className="text-slate-700 dark:text-slate-300">
                {post.canonical_url.includes("medium.com")
                  ? "Medium"
                  : "the web"}
              </strong>
            </span>
            <a
              href={post.canonical_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              <span>View original post</span>
              <span>↗</span>
            </a>
          </div>
        )}
      </header>

      {/* Markdown Body */}
      <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-xl prose-img:shadow-md prose-pre:border prose-pre:border-slate-800">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            img: ({ src, alt }) => {
              if (!src) return null;
              const srcString = typeof src === "string" ? src : "";
              let resolved = srcString;
              if (
                srcString &&
                !srcString.startsWith("http://") &&
                !srcString.startsWith("https://") &&
                !srcString.startsWith("/")
              ) {
                resolved = `${basePath}/posts/${slug}/${srcString.replace(/^\.\//, "")}`;
              }
              return (
                <img
                  src={resolved}
                  alt={alt || ""}
                  className="rounded-xl my-6 w-full object-cover"
                  loading="lazy"
                />
              );
            },
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* Post Footer: Author Card */}
      <footer className="mt-16 pt-8 border-t border-slate-200/60 dark:border-slate-800/60">
        <Card className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-none">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary shrink-0">
            <Image
              src={getGravatarUrl(160)}
              alt="Amr Abed"
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Amr Abed
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
              Engineering Manager & AI Architect passionate about clean code,
              serverless systems, and home automation.
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-3 text-xs">
              <a
                href="https://amrabed.com"
                className="text-primary font-medium hover:underline"
              >
                Visit amrabed.com →
              </a>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <a
                href="https://twitter.com/amr_abed"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-primary"
              >
                Follow on X
              </a>
            </div>
          </div>
        </Card>
      </footer>
    </article>
  );
}
