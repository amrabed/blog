import Link from "next/link";
import { Button, Card, Chip } from "@heroui/react";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-static";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="pb-8 border-b border-divider">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-base sm:text-lg text-foreground max-w-2xl">
              Thoughts on Artificial Intelligence, Cloud Architecture, and Smart
              Automation.
            </p>
          </div>

          <a href="https://amrabed.com">
            <Button
              variant="secondary"
              size="sm"
              className="text-xs font-semibold rounded-lg"
            >
              About the Author →
            </Button>
          </a>
        </div>
      </section>

      {/* Posts List */}
      <section className="space-y-8">
        {posts.map((post) => (
          <Card
            key={post.slug}
            className="group p-6 rounded-2xl border border-divider bg-surface hover:border-primary transition-all duration-300 shadow-none hover:shadow-md"
          >
            <div className="flex items-center flex-wrap gap-2 text-xs text-muted mb-3">
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
              <span>•</span>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.slice(0, 3).map((tag) => (
                  <Chip key={tag} size="sm" variant="soft" className="tag-chip">
                    #{tag}
                  </Chip>
                ))}
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-heading group-hover:text-primary transition-colors mb-2 leading-snug">
              <Link href={`/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>

            {post.description && (
              <p className="text-sm text-foreground leading-relaxed line-clamp-2 mb-4">
                {post.description}
              </p>
            )}

            <div className="mt-auto flex items-center justify-between w-full pt-2 text-xs text-muted border-t border-divider">
              <Link
                href={`/${post.slug}`}
                className="font-medium text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1"
              >
                Read article <span>→</span>
              </Link>

              {/* Cross-platform indicator links */}
              <div className="flex items-center gap-2">
                {post.platforms?.medium?.url && (
                  <a
                    href={post.platforms.medium.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    Medium
                  </a>
                )}
                {post.platforms?.devto?.url && (
                  <a
                    href={post.platforms.devto.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    Dev.to
                  </a>
                )}
                {post.platforms?.hashnode?.url && (
                  <a
                    href={post.platforms.hashnode.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    Hashnode
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
