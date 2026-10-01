export const GRAVATAR_HASH =
  "535411a635f09d4a27832850ea048316e2d07ebf1c59a646178020e9b190ad28";

export const getGravatarUrl = (size = 200): string =>
  `https://gravatar.com/avatar/${GRAVATAR_HASH}?s=${size}`;

export const getSiteUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `https://amrabed.com${basePath}`;
};
