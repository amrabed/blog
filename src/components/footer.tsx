import { Button, Tooltip } from "@heroui/react";
import {
  FaGithub,
  FaGoogleScholar,
  FaLinkedinIn,
  FaMedium,
  FaStackOverflow,
  FaXTwitter,
} from "react-icons/fa6";

interface SocialProfile {
  name: string;
  icon: React.ReactNode;
  link: string;
}

const socialProfiles: SocialProfile[] = [
  {
    name: "LinkedIn",
    icon: <FaLinkedinIn className="size-4" aria-hidden="true" />,
    link: "https://www.linkedin.com/in/amrabed",
  },
  {
    name: "GitHub",
    icon: <FaGithub className="size-4" aria-hidden="true" />,
    link: "https://www.github.com/amrabed",
  },
  {
    name: "Google Scholar",
    icon: <FaGoogleScholar className="size-4" aria-hidden="true" />,
    link: "https://scholar.google.com/citations?user=vdrgnAYAAAAJ",
  },
  {
    name: "Medium",
    icon: <FaMedium className="size-4" aria-hidden="true" />,
    link: "https://amrabed.medium.com",
  },
  {
    name: "Stack Overflow",
    icon: <FaStackOverflow className="size-4" aria-hidden="true" />,
    link: "https://stackoverflow.com/users/2070636/amrabed",
  },
  {
    name: "X",
    icon: <FaXTwitter className="size-4" aria-hidden="true" />,
    link: "https://twitter.com/amr_abed",
  },
];

export function Footer() {
  return (
    <footer
      data-pagefind-ignore="all"
      className="w-full bg-background border-t border-divider transition-colors duration-300 py-12 px-6 mt-16"
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left order-2 md:order-1">
          <p className="text-sm font-medium text-heading">
            © {new Date().getFullYear()} Amr Abed
          </p>
        </div>

        <div className="flex flex-row flex-wrap justify-center gap-2 order-1 md:order-2">
          {socialProfiles.map((profile) => (
            <Tooltip key={profile.name}>
              <Tooltip.Trigger>
                <a
                  href={profile.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    aria-label={`${profile.name} (opens in a new tab)`}
                    className="text-muted hover:text-primary rounded-full"
                  >
                    {profile.icon}
                  </Button>
                </a>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <Tooltip.Arrow />
                {profile.name}
              </Tooltip.Content>
            </Tooltip>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
