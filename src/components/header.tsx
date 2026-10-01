"use client";

import Link from "next/link";
import Image from "next/image";
import { Button, Tooltip } from "@heroui/react";
import { FaGithub, FaRss } from "react-icons/fa6";
import ThemeToggle from "./theme-toggle";
import { getGravatarUrl } from "@/lib/constants";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/60 dark:border-slate-800/60 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Author identity and blog title */}
        <div className="flex items-center gap-3">
          <a
            href="https://amrabed.com"
            className="group flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors"
            title="Return to amrabed.com"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700 group-hover:border-primary transition-colors">
              <Image
                src={getGravatarUrl(64)}
                alt="Amr Abed"
                fill
                sizes="32px"
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
              Amr Abed
            </span>
          </a>

          <span className="text-slate-300 dark:text-slate-700">/</span>

          <Link
            href="/"
            className="text-sm font-bold text-primary hover:opacity-80 transition-opacity"
          >
            Blog
          </Link>
        </div>

        {/* Right: Actions, Links, and Theme Switch */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a href="https://amrabed.com" className="hidden sm:inline-flex">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-primary rounded-full px-3"
            >
              ← amrabed.com
            </Button>
          </a>

          <Tooltip>
            <Tooltip.Trigger>
              <a href={`${basePath}/rss.xml`}>
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  aria-label="RSS Feed"
                  className="text-slate-500 hover:text-amber-500 rounded-full"
                >
                  <FaRss className="size-4" />
                </Button>
              </a>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <Tooltip.Arrow />
              RSS Feed
            </Tooltip.Content>
          </Tooltip>

          <Tooltip>
            <Tooltip.Trigger>
              <a
                href="https://github.com/amrabed/blog"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  aria-label="GitHub Repository"
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-full"
                >
                  <FaGithub className="size-4" />
                </Button>
              </a>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <Tooltip.Arrow />
              GitHub
            </Tooltip.Content>
          </Tooltip>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
