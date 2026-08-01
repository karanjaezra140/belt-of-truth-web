export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-01-01";

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

// The site works fine without a Sanity project — pages fall back to the
// static content in lib/site-config.ts until this is set.
export const isSanityConfigured = Boolean(projectId);
