import Link from "next/link";
import Image from "next/image";
import { Button, Tooltip } from "@heroui/react";
import { FaGithub, FaRss } from "react-icons/fa6";
import ThemeToggle from "./theme-toggle";
import Search, { SearchPostItem } from "./search";
import { getGravatarUrl } from "@/lib/constants";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface NavAction {
  name: string;
  href: string;
  icon: React.ReactNode;
  className: string;
  target?: string;
  rel?: string;
}

const navActions: NavAction[] = [
  {
    name: "RSS Feed",
    href: `${basePath}/rss.xml`,
    icon: <FaRss className="size-4" aria-hidden="true" />,
    className: "hover:text-amber-500",
  },
  {
    name: "GitHub",
    href: "https://github.com/amrabed/blog",
    icon: <FaGithub className="size-4" aria-hidden="true" />,
    className: "hover:text-heading",
    target: "_blank",
    rel: "noopener noreferrer",
  },
];

interface HeaderProps {
  posts?: SearchPostItem[];
}

export function Header({ posts = [] }: HeaderProps) {
  return (
    <header
      data-pagefind-ignore="all"
      className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/80 border-b border-divider transition-colors duration-300"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Author identity and blog title */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://amrabed.com"
            className="group flex items-center gap-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
            title="Return to amrabed.com"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-divider group-hover:border-primary transition-colors">
              <Image
                src={getGravatarUrl(64)}
                alt="Amr Abed"
                fill
                sizes="32px"
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="font-semibold text-heading group-hover:text-primary transition-colors">
              Amr Abed
            </span>
          </a>

          <span className="text-divider">/</span>

          <Link
            href="/"
            className="text-sm font-bold text-primary hover:opacity-80 transition-opacity"
          >
            Blog
          </Link>
        </div>

        {/* Right: Actions, Links, Search, and Theme Switch */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Search posts={posts} />

          {navActions.map(({ name, href, icon, className, target, rel }) => (
            <Tooltip key={name}>
              <Tooltip.Trigger>
                <a href={href} target={target} rel={rel}>
                  <Button
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    aria-label={name}
                    className={`text-muted rounded-full ${className}`}
                  >
                    {icon}
                  </Button>
                </a>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <Tooltip.Arrow />
                {name}
              </Tooltip.Content>
            </Tooltip>
          ))}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default Header;
