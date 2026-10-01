import fs from "node:fs";
import path from "node:path";

// Sync posts directory to public/posts so assets are served without symlinks
// (Vercel build containers fail with ENOTDIR when public/ contains symlinks)
const postsDir = path.resolve(process.cwd(), "posts");
const publicPostsDir = path.resolve(process.cwd(), "public/posts");

if (fs.existsSync(postsDir)) {
  fs.cpSync(postsDir, publicPostsDir, { recursive: true });
}

/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
