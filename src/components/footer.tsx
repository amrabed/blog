"use client";

import { Button, Tooltip } from "@heroui/react";
import {
  FaGithub,
  FaGoogleScholar,
  FaLinkedinIn,
  FaMedium,
  FaStackOverflow,
  FaXTwitter,
} from "react-icons/fa6";
import ThemeToggle from "./theme-toggle";

const socialProfiles = [
  {
    name: "LinkedIn",
    icon: <FaLinkedinIn className="size-4" />,
    link: "https://www.linkedin.com/in/amrabed",
  },
  {
    name: "GitHub",
    icon: <FaGithub className="size-4" />,
    link: "https://www.github.com/amrabed",
  },
  {
    name: "Google Scholar",
    icon: <FaGoogleScholar className="size-4" />,
    link: "https://scholar.google.com/citations?user=vdrgnAYAAAAJ",
  },
  {
    name: "Medium",
    icon: <FaMedium className="size-4" />,
    link: "https://amrabed.medium.com",
  },
  {
    name: "Stack Overflow",
    icon: <FaStackOverflow className="size-4" />,
    link: "https://stackoverflow.com/users/2070636/amrabed",
  },
  {
    name: "X",
    icon: <FaXTwitter className="size-4" />,
    link: "https://twitter.com/amr_abed",
  },
];

export const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-800/60 transition-colors duration-500 py-12 px-6 mt-16">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left order-2 md:order-1">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            © {new Date().getFullYear()} Amr Abed
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Built with Next.js 16, Tailwind CSS 4, and HeroUI 3 ·{" "}
            <a
              href="https://amrabed.com"
              className="text-primary hover:underline"
            >
              amrabed.com
            </a>
          </p>
        </div>

        <div className="flex flex-row flex-wrap justify-center gap-2 order-1 md:order-2">
          {socialProfiles.map((profile) => (
            <Tooltip key={profile.name}>
              <Tooltip.Trigger>
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  aria-label={`${profile.name} (opens in a new tab)`}
                  className="text-slate-500 hover:text-primary rounded-full"
                  onPress={() =>
                    window.open(profile.link, "_blank", "noopener,noreferrer")
                  }
                >
                  {profile.icon}
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <Tooltip.Arrow />
                {profile.name}
              </Tooltip.Content>
            </Tooltip>
          ))}
        </div>

        <div className="order-3">
          <ThemeToggle showLabel />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
