import { getAllPosts } from "@/lib/posts";
import { getSiteUrl } from "@/lib/constants";

export const dynamic = "force-static";

function escapeCdata(value: string): string {
  return value.replaceAll("]]>", "]]]]><![CDATA[>");
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const posts = getAllPosts();
  const siteUrl = getSiteUrl();
  const escapedSiteUrl = escapeXml(siteUrl);

  const itemsXml = posts
    .map((post) => {
      const postUrl = escapeXml(`${siteUrl}/${post.slug}/`);
      return `
    <item>
      <title><![CDATA[${escapeCdata(post.title)}]]></title>
      <link>${postUrl}</link>
      <guid>${postUrl}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${escapeCdata(post.description)}]]></description>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Amr Abed's Blog</title>
    <link>${escapedSiteUrl}</link>
    <description>Technical articles and thoughts on AI, Cloud Architecture, and Software Engineering by Amr Abed.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
