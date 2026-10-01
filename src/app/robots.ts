import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://amrabed.com";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}${basePath}/sitemap.xml`,
  };
}
