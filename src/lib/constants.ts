export const GRAVATAR_HASH =
  "535411a635f09d4a27832850ea048316e2d07ebf1c59a646178020e9b190ad28";

export const getGravatarUrl = (size = 200): string =>
  `https://gravatar.com/avatar/${GRAVATAR_HASH}?s=${size}`;
