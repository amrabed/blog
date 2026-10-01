import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface PlatformMetadata {
  published: boolean;
  id?: string | number | null;
  url?: string | null;
}

export interface PostMetadata {
  title: string;
  description: string;
  slug: string;
  date: string;
  canonical_url?: string | null;
  cover_image?: string | null;
  tags: string[];
  platforms?: {
    devto?: PlatformMetadata;
    hashnode?: PlatformMetadata;
    medium?: PlatformMetadata;
  };
}

export interface Post extends PostMetadata {
  content: string;
}

const postsDirectory = path.join(process.cwd(), "posts");

export function getAllSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs
    .readdirSync(postsDirectory, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

export function getPostBySlug(slug: string): Post | null {
  const fullPath = path.join(postsDirectory, slug, "index.md");
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    title: data.title ?? slug,
    description: data.description ?? "",
    slug: data.slug ?? slug,
    date: data.date
      ? new Date(data.date).toISOString()
      : new Date().toISOString(),
    canonical_url: data.canonical_url ?? null,
    cover_image: data.cover_image ?? null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    platforms: data.platforms ?? {},
    content,
  };
}

export function getAllPosts(): Post[] {
  const slugs = getAllSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}
