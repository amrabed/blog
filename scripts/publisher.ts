import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PlatformStatus {
  published: boolean;
  id: string | number | null;
  url: string | null;
}

interface PostFrontmatter {
  title: string;
  description?: string;
  date?: string;
  canonical_url?: string | null;
  cover_image?: string;
  tags?: string[];
  platforms?: {
    devto?: PlatformStatus;
    hashnode?: PlatformStatus;
    medium?: PlatformStatus;
  };
  slug?: string;
  [key: string]: unknown;
}

const DEVTO_API_URL = "https://dev.to/api/articles";
const HASHNODE_API_URL = "https://gql.hashnode.com";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    post: "",
    target: "devto",
    dryRun: false,
    draft: true,
    updateFrontmatter: true,
    repo: "amrabed/blog",
    branch: "main",
    assetBase: "",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--post" && i + 1 < args.length) {
      options.post = args[++i];
    } else if (arg === "--target" && i + 1 < args.length) {
      options.target = args[++i];
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--draft") {
      options.draft = true;
    } else if (arg === "--publish" || arg === "--no-draft") {
      options.draft = false;
    } else if (arg === "--no-update-frontmatter") {
      options.updateFrontmatter = false;
    } else if (arg === "--repo" && i + 1 < args.length) {
      options.repo = args[++i];
    } else if (arg === "--branch" && i + 1 < args.length) {
      options.branch = args[++i];
    } else if (arg === "--asset-base" && i + 1 < args.length) {
      options.assetBase = args[++i];
    }
  }

  return options;
}

function normalizeDevtoTags(tags: string[]): string[] {
  return tags
    .map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter((t) => t.length > 0)
    .slice(0, 4);
}

function resolveImageUrls(
  markdown: string,
  slug: string,
  repo: string,
  branch: string,
  assetBase: string,
  coverImage?: string,
): { resolvedContent: string; coverUrl?: string } {
  const base =
    assetBase ||
    `https://raw.githubusercontent.com/${repo}/${branch}/posts/${slug}`;

  // Replace relative markdown image paths: ![alt](./path) or ![alt](images/...)
  let resolved = markdown.replace(
    /!\[(.*?)\]\((?!https?:\/\/)(?:\.\/)?([^)]+)\)/g,
    (_match, alt, imgPath) =>
      `![${alt}](${base}/${imgPath.replace(/^\.\//, "")})`,
  );

  // Replace HTML img src paths: <img src="./path" ...>
  resolved = resolved.replace(
    /<img\s+([^>]*?)src=["'](?!https?:\/\/)(?:\.\/)?([^"']+)["']([^>]*?)>/g,
    (_match, prefix, imgPath, suffix) =>
      `<img ${prefix}src="${base}/${imgPath.replace(/^\.\//, "")}"${suffix}>`,
  );

  let coverUrl: string | undefined;
  if (coverImage) {
    if (coverImage.startsWith("http://") || coverImage.startsWith("https://")) {
      coverUrl = coverImage;
    } else {
      const cleanPath = coverImage.replace(/^\.\//, "");
      coverUrl = `${base}/${cleanPath}`;
    }
  }

  return { resolvedContent: resolved, coverUrl };
}

function stripLeadingTitle(markdown: string, title?: string): string {
  let cleaned = markdown.trimStart();
  // Strip leading HTML comments if any
  cleaned = cleaned.replace(/^<!--[\s\S]*?-->\s*/, "");
  // Strip leading H1 that matches post title
  if (title) {
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned.replace(
      new RegExp(`^#\\s+${escapedTitle}\\s*\\n*`, "i"),
      "",
    );
  }
  // Generic fallback: if first line is still an H1 heading, remove it
  cleaned = cleaned.replace(/^#\s+[^\n]+\n*/, "");
  return cleaned.trimStart();
}

async function publishToDevto(
  post: matter.GrayMatterFile<string>,
  slug: string,
  bodyMarkdown: string,
  coverUrl: string | undefined,
  apiKey: string,
  draft: boolean,
  dryRun: boolean,
  maxRetries: number = 3,
) {
  const data = post.data as PostFrontmatter;
  const devtoState = data.platforms?.devto;
  interface DevtoPayload {
    article: {
      title: string;
      body_markdown: string;
      published: boolean;
      tags: string[];
      canonical_url: string;
      description: string;
      main_image?: string;
    };
  }

  const isUpdate = Boolean(devtoState?.id);
  const articleId = devtoState?.id;

  const payload: DevtoPayload = {
    article: {
      title: data.title,
      body_markdown: bodyMarkdown,
      published: !draft,
      tags: normalizeDevtoTags(data.tags || []),
      canonical_url: data.canonical_url || `https://amrabed.com/blog/${slug}`,
      description: data.description || "",
      ...(coverUrl ? { main_image: coverUrl } : {}),
    },
  };

  if (dryRun) {
    console.log(
      `  [Dev.to DRY RUN] ${isUpdate ? `Update article #${articleId}` : "Create new article"}: "${data.title}" (${draft ? "DRAFT" : "PUBLIC"})`,
    );
    console.log(`    Tags: ${payload.article.tags.join(", ")}`);
    console.log(`    Canonical URL: ${payload.article.canonical_url}`);
    if (coverUrl) console.log(`    Main Image: ${coverUrl}`);
    return {
      id: articleId || 123456,
      url: `https://dev.to/amrabed/${slug}-dry-run`,
    };
  }

  const endpoint = isUpdate ? `${DEVTO_API_URL}/${articleId}` : DEVTO_API_URL;
  const method = isUpdate ? "PUT" : "POST";

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        const retryAfterHeader = res.headers.get("retry-after");
        const waitSeconds = retryAfterHeader
          ? parseInt(retryAfterHeader, 10)
          : 30 * attempt;
        console.warn(
          `  [Dev.to RATE LIMIT] Hit 429 Too Many Requests. Waiting ${waitSeconds}s before retry (attempt ${attempt}/${maxRetries})...`,
        );
        await sleep(waitSeconds * 1000);
        continue;
      }

      if (res.ok) {
        const json = (await res.json()) as { id: string | number; url: string };
        console.log(
          `  [Dev.to SUCCESS] ID: ${json.id} | Status: ${draft ? "DRAFT" : "PUBLIC"} | URL: ${json.url}`,
        );
        return { id: json.id, url: json.url };
      } else {
        const errorText = await res.text();
        console.error(`  [Dev.to ERROR] Status ${res.status}: ${errorText}`);
        return null;
      }
    } catch (err) {
      console.error(`  [Dev.to EXCEPTION]`, err);
      return null;
    }
  }

  return null;
}

async function publishToHashnode(
  post: matter.GrayMatterFile<string>,
  slug: string,
  bodyMarkdown: string,
  coverUrl: string | undefined,
  token: string,
  publicationId: string,
  _draft: boolean,
  dryRun: boolean,
) {
  const data = post.data as PostFrontmatter;
  const hashnodeState = data.platforms?.hashnode;

  if (hashnodeState?.published && hashnodeState?.id) {
    console.log(
      `  [Hashnode SKIP] Already published (ID: ${hashnodeState.id})`,
    );
    return hashnodeState;
  }

  const tags = (data.tags || []).map((t) => ({
    name: t.replace(/-/g, " "),
    slug: t.toLowerCase().replace(/[^a-z0-9]/g, "-"),
  }));

  const input: Record<string, unknown> = {
    title: data.title,
    subtitle: data.description || "",
    publicationId,
    contentMarkdown: bodyMarkdown,
    tags,
    slug,
    originalArticleURL:
      data.canonical_url || `https://amrabed.com/blog/${slug}`,
  };

  if (coverUrl) {
    input.coverImageOptions = { coverImageURL: coverUrl };
  }

  const query = `
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post {
          id
          url
          slug
        }
      }
    }
  `;

  if (dryRun) {
    console.log(`  [Hashnode DRY RUN] Publish post: "${data.title}"`);
    console.log(`    Slug: ${slug}`);
    console.log(`    Canonical URL: ${input.originalArticleURL}`);
    console.log(`    Publication ID: ${publicationId}`);
    return {
      id: "dry-run-hashnode-id",
      url: `https://hashnode.com/@amrabed/${slug}`,
    };
  }

  try {
    const res = await fetch(HASHNODE_API_URL, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { input } }),
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      if (res.status === 301 || text.includes("Moved Permanently")) {
        console.warn(
          "  [Hashnode NOTICE] Hashnode API requires Hashnode Pro. Free API access has been retired.",
        );
      } else {
        console.error(
          `  [Hashnode ERROR] Non-JSON response (status ${res.status}): ${text.slice(0, 200)}`,
        );
      }
      return null;
    }

    const json = (await res.json()) as {
      errors?: unknown[];
      data?: { publishPost?: { post?: { id: string; url: string } } };
    };
    if (json.errors && json.errors.length > 0) {
      console.error(`  [Hashnode ERROR] ${JSON.stringify(json.errors)}`);
      return null;
    }

    const postData = json.data?.publishPost?.post;
    if (postData) {
      console.log(
        `  [Hashnode SUCCESS] ID: ${postData.id} | URL: ${postData.url}`,
      );
      return { id: postData.id, url: postData.url };
    }
  } catch (err) {
    console.error(`  [Hashnode EXCEPTION]`, err);
  }

  return null;
}

async function processPost(
  postDir: string,
  options: ReturnType<typeof parseArgs>,
) {
  const indexFile = path.join(postDir, "index.md");
  const slug = path.basename(postDir);

  if (!fs.existsSync(indexFile)) {
    console.log(`[SKIP] No index.md found in ${postDir}`);
    return;
  }

  const rawFile = fs.readFileSync(indexFile, "utf-8");
  const post = matter(rawFile);
  const data = post.data as PostFrontmatter;

  console.log("\n=======================================================");
  console.log(`Post: ${data.title || slug} (${slug})`);
  console.log("=======================================================");

  if (!data.platforms) data.platforms = {};
  if (!data.platforms.devto) {
    data.platforms.devto = { published: false, id: null, url: null };
  }
  if (!data.platforms.hashnode) {
    data.platforms.hashnode = { published: false, id: null, url: null };
  }
  if (!data.platforms.medium) {
    data.platforms.medium = { published: false, id: null, url: null };
  }

  const { resolvedContent, coverUrl } = resolveImageUrls(
    post.content,
    slug,
    options.repo,
    options.branch,
    options.assetBase,
    data.cover_image,
  );

  const bodyMarkdown = stripLeadingTitle(resolvedContent, data.title);

  let metadataModified = false;

  // 1. Dev.to
  if (options.target === "devto" || options.target === "all") {
    const devtoKey = process.env.DEVTO_API_KEY;
    if (!devtoKey && !options.dryRun) {
      console.log(
        "  [Dev.to SKIP] DEVTO_API_KEY environment variable not set.",
      );
    } else {
      const res = await publishToDevto(
        post,
        slug,
        bodyMarkdown,
        coverUrl,
        devtoKey || "DRY_RUN_KEY",
        options.draft,
        options.dryRun,
      );
      if (res && !options.dryRun) {
        data.platforms.devto.id = res.id;
        data.platforms.devto.url = res.url;
        if (!options.draft) data.platforms.devto.published = true;
        metadataModified = true;
      }
    }
  }

  // 2. Hashnode
  if (options.target === "hashnode" || options.target === "all") {
    const hashnodeToken = process.env.HASHNODE_TOKEN;
    const hashnodePubId = process.env.HASHNODE_PUBLICATION_ID;
    if ((!hashnodeToken || !hashnodePubId) && !options.dryRun) {
      console.log(
        "  [Hashnode SKIP] HASHNODE_TOKEN and/or HASHNODE_PUBLICATION_ID environment variables not set.",
      );
    } else {
      const res = await publishToHashnode(
        post,
        slug,
        bodyMarkdown,
        coverUrl,
        hashnodeToken || "DRY_RUN_TOKEN",
        hashnodePubId || "DRY_RUN_PUB_ID",
        options.draft,
        options.dryRun,
      );
      if (res && !options.dryRun) {
        data.platforms.hashnode.id = res.id;
        data.platforms.hashnode.url = res.url;
        if (!options.draft) data.platforms.hashnode.published = true;
        metadataModified = true;
      }
    }
  }

  if (metadataModified && options.updateFrontmatter) {
    const updated = matter.stringify(post.content, data);
    fs.writeFileSync(indexFile, updated, "utf-8");
    console.log(`  [FRONTMATTER UPDATED] ${indexFile}`);
  }
}

async function main() {
  const options = parseArgs();
  const postsDir = path.resolve(__dirname, "..", "posts");

  let postDirs: string[] = [];
  if (options.post) {
    const targetDir = path.join(postsDir, options.post);
    if (!fs.existsSync(targetDir)) {
      console.error(`Error: Post folder ${targetDir} not found.`);
      process.exit(1);
    }
    postDirs = [targetDir];
  } else {
    postDirs = fs
      .readdirSync(postsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => path.join(postsDir, dirent.name))
      .sort();
  }

  console.log(
    `Running publisher: target='${options.target}', dry_run=${options.dryRun}, draft=${options.draft}`,
  );

  for (let i = 0; i < postDirs.length; i++) {
    const dir = postDirs[i];
    await processPost(dir, options);
    // If making live network requests, pace calls to stay well within Dev.to rate limits (10 req / 30s)
    if (!options.dryRun && i < postDirs.length - 1) {
      await sleep(3500);
    }
  }
}

main().catch((err) => {
  console.error("Fatal publisher error:", err);
  process.exit(1);
});
