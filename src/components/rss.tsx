import { Tooltip } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { FaRss } from "react-icons/fa6";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function Rss() {
  return (
    <Tooltip>
      <Tooltip.Trigger>
        <a
          href={`${basePath}/rss.xml`}
          aria-label="RSS Feed"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            isIconOnly: true,
            className: "text-muted rounded-full hover:text-amber-500",
          })}
        >
          <FaRss className="size-4" aria-hidden="true" />
        </a>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <Tooltip.Arrow />
        RSS Feed
      </Tooltip.Content>
    </Tooltip>
  );
}

export default Rss;
