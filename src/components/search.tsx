"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  useCallback,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  DocumentTextIcon,
  HashtagIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export interface SearchPostItem {
  title: string;
  description: string;
  slug: string;
  tags: string[];
  date: string;
}

interface SearchProps {
  posts?: SearchPostItem[];
}

interface SearchResultItem {
  title: string;
  url: string;
  excerpt?: string;
  isSubResult?: boolean;
  parentTitle?: string;
  tags?: string[];
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

function cleanUrl(rawUrl: string): string {
  return rawUrl.replace(/\.html$/, "").replace(/\.html#/, "#");
}

const emptySubscribe = () => () => {};

export function Search({ posts = [] }: SearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const isMac = useSyncExternalStore(
    emptySubscribe,
    () =>
      typeof navigator !== "undefined" &&
      /Mac|iPod|iPhone|iPad/.test(navigator.userAgent),
    () => false,
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pagefindRef = useRef<any>(null);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setActiveIndex(0);
  }, []);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Initialize Pagefind dynamically
  const loadPagefind = useCallback(async () => {
    if (pagefindRef.current) return pagefindRef.current;
    try {
      const pf = await import(
        /* webpackIgnore: true */ `${basePath}/_pagefind/pagefind.js`
      );
      await pf.options({
        basePath: `${basePath}/_pagefind/`,
        baseUrl: `${basePath}/`,
      });
      pagefindRef.current = pf;
      return pf;
    } catch {
      return null;
    }
  }, []);

  // Preload Pagefind on mount
  useEffect(() => {
    if (mounted) {
      loadPagefind();
    }
  }, [mounted, loadPagefind]);

  // Global keyboard shortcuts: `/` and `Cmd+K` / `Ctrl+K`
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const isInputActive =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          activeEl.isContentEditable);

      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if (
        (event.metaKey || event.ctrlKey) &&
        (event.key === "k" || event.key === "K")
      ) {
        event.preventDefault();
        setIsOpen((prev) => {
          if (prev) {
            setQuery("");
            setResults([]);
            setActiveIndex(0);
            return false;
          }
          return true;
        });
        return;
      }

      // Check for `/` shortcut when not typing in an input
      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !isInputActive
      ) {
        event.preventDefault();
        openModal();
        return;
      }

      // Escape key to close modal
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal, openModal]);

  // Handle focus and body overflow when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // Handle query input changes
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      setIsLoading(false);
      setActiveIndex(0);
    }
  };

  // Execute search when query changes
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    let isCancelled = false;
    const timer = setTimeout(() => {
      setIsLoading(true);
    }, 100);

    const performSearch = async () => {
      const pf = await loadPagefind();

      if (pf) {
        try {
          const response = await pf.debouncedSearch(trimmed, {}, 150);
          if (isCancelled || !response) {
            clearTimeout(timer);
            return;
          }

          // Load data for top 10 results
          const dataList = await Promise.all(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response.results.slice(0, 10).map((r: any) => r.data()),
          );

          if (isCancelled) return;

          const formattedResults: SearchResultItem[] = [];

          for (const item of dataList) {
            const rawUrl = cleanUrl(item.url || "");
            formattedResults.push({
              title: item.meta?.title || rawUrl,
              url: rawUrl,
              excerpt: item.excerpt,
            });

            // Add sub-results (sections) if any
            if (Array.isArray(item.sub_results)) {
              for (const sub of item.sub_results.slice(0, 3)) {
                formattedResults.push({
                  title: sub.title,
                  url: cleanUrl(sub.url),
                  excerpt: sub.excerpt,
                  isSubResult: true,
                  parentTitle: item.meta?.title,
                });
              }
            }
          }

          clearTimeout(timer);
          setResults(formattedResults);
          setActiveIndex(0);
          setIsLoading(false);
          return;
        } catch {
          // Fall back to in-memory search below
        }
      }

      // Fallback: search in-memory posts list
      const lower = trimmed.toLowerCase();
      const matched = posts
        .filter(
          (p) =>
            p.title.toLowerCase().includes(lower) ||
            p.description.toLowerCase().includes(lower) ||
            p.tags.some((t) => t.toLowerCase().includes(lower)),
        )
        .map((p) => ({
          title: p.title,
          url: `/${p.slug}`,
          excerpt: p.description,
          tags: p.tags,
        }));

      if (!isCancelled) {
        clearTimeout(timer);
        setResults(matched);
        setActiveIndex(0);
        setIsLoading(false);
      }
    };

    performSearch();

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query, posts, loadPagefind]);

  // Navigate to selected result
  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      closeModal();
      startTransition(() => {
        const [path, hash] = item.url.split("#");
        if (
          typeof window !== "undefined" &&
          window.location.pathname === path &&
          hash
        ) {
          window.location.hash = `#${hash}`;
        } else {
          router.push(item.url);
        }
      });
    },
    [router, closeModal],
  );

  // Keyboard navigation within results list
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) =>
        results.length > 0 ? (prev + 1) % results.length : 0,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) =>
        results.length > 0 ? (prev - 1 + results.length) % results.length : 0,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (results[activeIndex]) {
        handleSelect(results[activeIndex]);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeElement = listRef.current.querySelector<HTMLElement>(
      `[data-result-index="${activeIndex}"]`,
    );
    if (activeElement) {
      activeElement.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  // Extract popular tags for empty query state
  const popularTags = Array.from(
    new Set(posts.flatMap((p) => p.tags || [])),
  ).slice(0, 6);

  return (
    <>
      {/* Header Search Trigger Button */}
      <button
        type="button"
        onClick={openModal}
        className="group relative flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs text-muted hover:text-foreground bg-surface border border-divider hover:border-primary/40 rounded-full sm:rounded-lg transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-label="Search articles (/ or ⌘K)"
      >
        <MagnifyingGlassIcon
          className="size-4 text-muted group-hover:text-primary transition-colors shrink-0"
          aria-hidden="true"
        />
        <span className="hidden sm:inline-block font-medium pr-1">
          Search...
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 ml-auto">
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded border border-divider bg-background text-muted">
            {mounted && isMac ? "⌘K" : "Ctrl K"}
          </kbd>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded border border-divider bg-background text-muted">
            /
          </kbd>
        </span>
      </button>

      {/* Modal Dialog */}
      {isOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 pb-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Search articles"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={closeModal}
              aria-hidden="true"
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-2xl bg-surface border border-divider rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 transition-all animate-in zoom-in-95 duration-200 max-h-[80vh]">
              {/* Search Input Bar */}
              <div className="flex items-center px-4 border-b border-divider gap-3 bg-surface">
                <MagnifyingGlassIcon
                  className="size-5 text-muted shrink-0"
                  aria-hidden="true"
                />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search articles, topics, snippets..."
                  className="w-full py-4 text-base bg-transparent text-heading placeholder:text-muted focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
                  spellCheck={false}
                  autoComplete="off"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      handleQueryChange("");
                      inputRef.current?.focus();
                    }}
                    className="p-1 rounded-md text-muted hover:text-foreground hover:bg-divider/40 transition-colors"
                    aria-label="Clear query"
                  >
                    <XMarkIcon className="size-4" aria-hidden="true" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={closeModal}
                  className="px-2 py-0.5 text-xs font-mono font-medium rounded border border-divider text-muted bg-background hover:bg-surface transition-colors cursor-pointer"
                  aria-label="Close search"
                >
                  ESC
                </button>
              </div>

              {/* Results & Suggestions List */}
              <div
                ref={listRef}
                className="overflow-y-auto flex-1 p-2 divide-y divide-divider/30 min-h-32 max-h-[60vh]"
              >
                {isLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted text-sm">
                    <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Searching articles...</span>
                  </div>
                ) : query.trim() ? (
                  results.length > 0 ? (
                    <div className="space-y-1">
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-muted uppercase tracking-wider">
                        {results.length} result{results.length === 1 ? "" : "s"}{" "}
                        found
                      </div>
                      {results.map((item, index) => {
                        const isSelected = index === activeIndex;
                        return (
                          <div
                            key={`${item.url}-${index}`}
                            data-result-index={index}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? "bg-primary/10 border-l-2 border-primary text-primary"
                                : "hover:bg-divider/30 text-foreground"
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {item.isSubResult ? (
                                <HashtagIcon
                                  className={`size-4 ${
                                    isSelected ? "text-primary" : "text-muted"
                                  }`}
                                  aria-hidden="true"
                                />
                              ) : (
                                <DocumentTextIcon
                                  className={`size-4.5 ${
                                    isSelected ? "text-primary" : "text-muted"
                                  }`}
                                  aria-hidden="true"
                                />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              {item.isSubResult && item.parentTitle && (
                                <div className="text-[11px] font-medium text-muted truncate mb-0.5">
                                  {item.parentTitle}
                                </div>
                              )}
                              <div
                                className={`text-sm font-semibold truncate ${
                                  isSelected ? "text-primary" : "text-heading"
                                }`}
                              >
                                {item.title}
                              </div>

                              {item.excerpt && (
                                <div
                                  className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed [&_mark]:bg-primary/20 [&_mark]:text-primary [&_mark]:font-medium [&_mark]:px-0.5 [&_mark]:rounded-xs"
                                  dangerouslySetInnerHTML={{
                                    __html: item.excerpt,
                                  }}
                                />
                              )}

                              {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {item.tags.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-divider/40 text-muted"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <ArrowRightIcon
                              className={`size-4 mt-1 transition-transform shrink-0 ${
                                isSelected
                                  ? "text-primary translate-x-0.5 opacity-100"
                                  : "opacity-0 group-hover:opacity-100 text-muted"
                              }`}
                              aria-hidden="true"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 px-4 text-center">
                      <p className="text-sm font-medium text-heading">
                        No results found for &ldquo;{query}&rdquo;
                      </p>
                      <p className="text-xs text-muted mt-1.5 max-w-sm mx-auto">
                        Try searching with different keywords, check for typos,
                        or search by topic like &ldquo;aws&rdquo; or
                        &ldquo;ai&rdquo;.
                      </p>
                    </div>
                  )
                ) : (
                  // Default Empty Query State: Suggestions & Recent Posts
                  <div className="p-3 space-y-5">
                    {popularTags.length > 0 && (
                      <div>
                        <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2 px-1">
                          Popular Topics
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {popularTags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                handleQueryChange(tag);
                                inputRef.current?.focus();
                              }}
                              className="px-2.5 py-1 text-xs rounded-lg border border-divider hover:border-primary/50 bg-background hover:bg-surface text-muted hover:text-primary transition-all cursor-pointer"
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {posts.length > 0 && (
                      <div>
                        <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2 px-1">
                          Recent Articles
                        </div>
                        <div className="space-y-1">
                          {posts.slice(0, 4).map((post) => (
                            <Link
                              key={post.slug}
                              href={`/${post.slug}`}
                              onClick={closeModal}
                              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-divider/30 text-foreground group transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <DocumentTextIcon
                                  className="size-4 text-muted group-hover:text-primary shrink-0"
                                  aria-hidden="true"
                                />
                                <span className="text-xs sm:text-sm font-medium text-heading group-hover:text-primary truncate">
                                  {post.title}
                                </span>
                              </div>
                              <span className="text-xs text-muted group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
                                →
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer with keyboard navigation cues */}
              <div className="px-4 py-2.5 border-t border-divider bg-surface/50 text-[11px] text-muted flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <kbd className="px-1 py-0.5 text-[10px] font-mono rounded border border-divider bg-background">
                      ↑
                    </kbd>
                    <kbd className="px-1 py-0.5 text-[10px] font-mono rounded border border-divider bg-background">
                      ↓
                    </kbd>
                    <span>to navigate</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <kbd className="px-1 py-0.5 text-[10px] font-mono rounded border border-divider bg-background">
                      ↵
                    </kbd>
                    <span>to select</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <kbd className="px-1 py-0.5 text-[10px] font-mono rounded border border-divider bg-background">
                      esc
                    </kbd>
                    <span>to close</span>
                  </span>
                </div>

                <span className="hidden sm:inline text-muted/80">
                  Search powered by Pagefind
                </span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export default Search;
