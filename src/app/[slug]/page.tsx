import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Button, Card, Chip } from "@heroui/react";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import { getGravatarUrl, getSiteUrl } from "@/lib/constants";
import { MDXContent } from "@/components/mdx-content";
import { Comments } from "@/components/comments";

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

  const siteUrl = getSiteUrl();
  const pageCanonical = post.canonical_url || `${siteUrl}/${slug}`;

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
      ...(post.updated ? { modifiedTime: post.updated } : {}),
      url: `${siteUrl}/${slug}`,
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
            className="text-xs font-semibold text-muted hover:text-primary rounded-lg -ml-2"
          >
            ← Back to all articles
          </Button>
        </Link>
      </div>

      {/* Post Header */}
      <header className="mb-10 pb-8 border-b border-divider">
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag) => (
              <Chip key={tag} size="sm" variant="soft" className="tag-chip">
                #{tag}
              </Chip>
            ))}
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-heading tracking-tight leading-tight mb-4">
          {post.title}
        </h1>

        {post.description && (
          <p className="text-lg text-foreground leading-relaxed font-normal mb-4">
            {post.description}
          </p>
        )}

        <div className="flex items-center flex-wrap gap-2 text-xs text-muted">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.updated &&
            formatDate(post.updated) !== formatDate(post.date) && (
              <>
                <span>•</span>
                <span>
                  Updated{" "}
                  <time dateTime={post.updated}>
                    {formatDate(post.updated)}
                  </time>
                </span>
              </>
            )}
        </div>

        {/* Canonical Attribution Banner */}
        {post.canonical_url && (
          <div className="mt-6 p-3.5 rounded-xl bg-surface border border-divider text-xs text-muted flex items-center justify-between flex-wrap gap-2">
            <span>
              Originally published on{" "}
              <strong className="text-heading">
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
      <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-code:before:content-none prose-code:after:content-none">
        <MDXContent content={post.content} slug={slug} />
      </div>

      {/* Post Footer: Author Card */}
      <footer className="mt-16 pt-8 border-t border-divider">
        <Card className="p-6 rounded-2xl bg-surface border border-divider flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-none">
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
            <h3 className="text-base font-bold text-heading">Amr Abed</h3>
            <p className="text-xs text-muted mt-1 mb-3">
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
              <span className="text-divider">•</span>
              <a
                href="https://twitter.com/amr_abed"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-primary"
              >
                Follow on X
              </a>
            </div>
          </div>
        </Card>
      </footer>

      {/* Discussion & Comments */}
      {post.comments !== false && <Comments slug={slug} />}
    </article>
  );
}
