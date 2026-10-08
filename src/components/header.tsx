import { Button, Tooltip } from "@heroui/react";
import { FaRss } from "react-icons/fa6";
import { NavBar } from "@amrabed/ui";
import Search, { SearchPostItem } from "./search";
import { getGravatarUrl } from "@/lib/constants";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface HeaderProps {
  posts?: SearchPostItem[];
}

export function Header({ posts = [] }: HeaderProps) {
  return (
    <NavBar
      currentSite="blog"
      repo="amrabed/blog"
      avatarUrl={getGravatarUrl(64)}
      actions={
        <>
          <Search posts={posts} />
          <Tooltip>
            <Tooltip.Trigger>
              <a href={`${basePath}/rss.xml`}>
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  aria-label="RSS Feed"
                  className="text-muted rounded-full hover:text-amber-500"
                >
                  <FaRss className="size-4" aria-hidden="true" />
                </Button>
              </a>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <Tooltip.Arrow />
              RSS Feed
            </Tooltip.Content>
          </Tooltip>
        </>
      }
    />
  );
}

export default Header;
