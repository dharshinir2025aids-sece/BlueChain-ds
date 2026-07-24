import { APP_NAME, APP_TAGLINE } from "@bluechain/shared";

/**
 * Thin client helpers for API URLs.
 * Business clients arrive in later phases.
 */
export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

export const aiBaseUrl =
  process.env.NEXT_PUBLIC_AI_URL ?? "http://localhost:8000";

export const appMeta = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? APP_NAME,
  tagline: APP_TAGLINE,
} as const;
