import Link from "next/link";
import { Card, Chip } from "@heroui/react";
import { SiDevdotto, SiHashnode, SiMedium } from "react-icons/si";
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
        <p className="text-base sm:text-lg text-foreground max-w-2xl">
          Thoughts on Artificial Intelligence, Cloud Architecture, and Smart
          Automation.
        </p>
      </section>

      {/* Posts List */}
      <section className="space-y-8">
        {posts.map((post) => (
          <Card
            key={post.slug}
            className="group p-6 rounded-2xl border border-divider bg-surface hover:border-primary transition-all duration-300 shadow-none hover:shadow-md"
          >
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {post.tags.slice(0, 3).map((tag) => (
                  <Chip key={tag} size="sm" variant="soft" className="tag-chip">
                    #{tag}
                  </Chip>
                ))}
              </div>
            )}

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

            <div className="mt-auto flex items-center justify-between w-full pt-3 text-xs text-muted border-t border-divider">
              <div className="flex items-center flex-wrap gap-2">
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

              {/* Cross-platform indicator links */}
              <div className="flex items-center gap-3">
                {post.platforms?.medium?.url && (
                  <a
                    href={post.platforms.medium.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-foreground transition-colors"
                    aria-label="Read on Medium"
                    title="Read on Medium"
                  >
                    <SiMedium className="w-4 h-4" />
                  </a>
                )}
                {post.platforms?.devto?.url && (
                  <a
                    href={post.platforms.devto.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-foreground transition-colors"
                    aria-label="Read on Dev.to"
                    title="Read on Dev.to"
                  >
                    <SiDevdotto className="w-4 h-4" />
                  </a>
                )}
                {post.platforms?.hashnode?.url && (
                  <a
                    href={post.platforms.hashnode.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-foreground transition-colors"
                    aria-label="Read on Hashnode"
                    title="Read on Hashnode"
                  >
                    <SiHashnode className="w-4 h-4" />
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
