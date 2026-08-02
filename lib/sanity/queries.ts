import { groq } from "next-sanity";
import { sanityClient, sanityWriteClient } from "./client";
import type {
  SanityBook,
  SanityContactSubmission,
  SanityCoreValue,
  SanityDonation,
  SanityEbookAccess,
  SanityEbookPage,
  SanityFocusArea,
  SanityFreeResource,
  SanityProgram,
  SanitySiteSettings,
  SanityTestimony,
} from "./types";
import {
  CORE_VALUES,
  FOCUS_AREAS,
  FOUNDER,
  FREE_RESOURCES,
  IMPACT_STATS,
  PROGRAMS,
} from "@/lib/site-config";

// Every getter below falls back to the static content in lib/site-config.ts
// when Sanity isn't configured yet (no NEXT_PUBLIC_SANITY_PROJECT_ID) or the
// dataset is still empty, so pages never render blank while content is
// being migrated into the Studio.

export async function getPrograms(): Promise<SanityProgram[]> {
  if (!sanityClient) return fallbackPrograms();
  const results = await sanityClient.fetch<SanityProgram[]>(
    groq`*[_type == "program"] | order(order asc) { _id, title, emoji, description, image }`
  );
  return results.length ? results : fallbackPrograms();
}

export async function getFocusAreas(): Promise<SanityFocusArea[]> {
  if (!sanityClient) return fallbackFocusAreas();
  const results = await sanityClient.fetch<SanityFocusArea[]>(
    groq`*[_type == "focusArea"] | order(order asc) { _id, title, emoji, image }`
  );
  return results.length ? results : fallbackFocusAreas();
}

export async function getFreeResources(): Promise<SanityFreeResource[]> {
  if (!sanityClient) return fallbackFreeResources();
  const results = await sanityClient.fetch<SanityFreeResource[]>(
    groq`*[_type == "freeResource"] | order(order asc) { _id, title, emoji, description, image }`
  );
  return results.length ? results : fallbackFreeResources();
}

export async function getCoreValues(): Promise<SanityCoreValue[]> {
  if (!sanityClient) return fallbackCoreValues();
  const results = await sanityClient.fetch<SanityCoreValue[]>(
    groq`*[_type == "coreValue"] | order(order asc) { _id, title, description }`
  );
  return results.length ? results : fallbackCoreValues();
}

export async function getTestimonies(): Promise<SanityTestimony[]> {
  if (!sanityClient) return [];
  return sanityClient.fetch<SanityTestimony[]>(
    groq`*[_type == "testimony"] | order(publishedAt desc) {
      _id, title, "slug": slug.current, authorName, programTag,
      coverImage, excerpt, publishedAt
    }`
  );
}

export async function getTestimonyBySlug(
  slug: string
): Promise<SanityTestimony | null> {
  if (!sanityClient) return null;
  return sanityClient.fetch<SanityTestimony | null>(
    groq`*[_type == "testimony" && slug.current == $slug][0] {
      _id, title, "slug": slug.current, authorName, programTag,
      coverImage, excerpt, body, publishedAt
    }`,
    { slug }
  );
}

export async function getBooks(): Promise<SanityBook[]> {
  if (!sanityClient) return [];
  return sanityClient.fetch<SanityBook[]>(
    groq`*[_type == "book"] | order(order asc) {
      _id, title, "slug": slug.current, cover, description, priceKes
    }`
  );
}

export async function getBookBySlug(slug: string): Promise<SanityBook | null> {
  if (!sanityClient) return null;
  return sanityClient.fetch<SanityBook | null>(
    groq`*[_type == "book" && slug.current == $slug][0] {
      _id, title, "slug": slug.current, cover, description, priceKes,
      ebookFile{ asset->{url} }, ebookPageCount
    }`,
    { slug }
  );
}

// The following ebook-access reads use the write client (no CDN, "raw"
// perspective) rather than the cached read client: access-control checks
// (has this token been revoked?) need to see writes immediately, not after
// the CDN's cache window. This means the protected reader only works once
// SANITY_API_TOKEN is configured — the same precondition the webhook already
// has for writing these documents in the first place.

export async function getEbookAccessByTokenHash(
  bookId: string,
  tokenHash: string
): Promise<SanityEbookAccess | null> {
  if (!sanityWriteClient) return null;
  return sanityWriteClient.fetch<SanityEbookAccess | null>(
    groq`*[_type == "ebookAccess" && book._ref == $bookId && tokenHash == $tokenHash][0] {
      _id, "book": book->{_id, "slug": slug.current}, buyerEmail, tokenHash, reference, expiresAt, revoked, createdAt
    }`,
    { bookId, tokenHash }
  );
}

export async function getEbookAccessById(
  accessId: string
): Promise<SanityEbookAccess | null> {
  if (!sanityWriteClient) return null;
  return sanityWriteClient.fetch<SanityEbookAccess | null>(
    groq`*[_type == "ebookAccess" && _id == $accessId][0] {
      _id, "book": book->{_id, "slug": slug.current}, buyerEmail, tokenHash, reference, expiresAt, revoked, createdAt
    }`,
    { accessId }
  );
}

export async function getEbookPageCache(
  bookId: string,
  pageNumber: number
): Promise<SanityEbookPage | null> {
  if (!sanityWriteClient) return null;
  return sanityWriteClient.fetch<SanityEbookPage | null>(
    groq`*[_type == "ebookPage" && book._ref == $bookId && pageNumber == $pageNumber][0] {
      _id, pageNumber, image{ asset->{url} }
    }`,
    { bookId, pageNumber }
  );
}

// The admin dashboard reads use the write client (no CDN) for the same
// freshness reason as the ebook-access checks above — an admin who just
// received a donation or submission expects to see it immediately, not
// after the CDN's cache window. Requires SANITY_API_TOKEN to be set.
//
// Each is wrapped in try/catch: a misconfigured or under-permissioned token
// should degrade the dashboard to "no data yet" for that section, not crash
// the whole page — this is the one place admins actually look when
// something's wrong, so it needs to stay renderable even when Sanity itself
// is unhappy.

export async function getContactSubmissions(): Promise<SanityContactSubmission[]> {
  if (!sanityWriteClient) return [];
  try {
    return await sanityWriteClient.fetch<SanityContactSubmission[]>(
      groq`*[_type == "contactSubmission"] | order(submittedAt desc) {
        _id, name, email, phone, interest, message, submittedAt
      }`
    );
  } catch (err) {
    console.error("Failed to fetch contact submissions:", err);
    return [];
  }
}

export async function getDonations(): Promise<SanityDonation[]> {
  if (!sanityWriteClient) return [];
  try {
    return await sanityWriteClient.fetch<SanityDonation[]>(
      groq`*[_type == "donation"] | order(paidAt desc) {
        _id, reference, donorName, donorEmail, amountKes, kind, bookTitle, paidAt
      }`
    );
  } catch (err) {
    console.error("Failed to fetch donations:", err);
    return [];
  }
}

export async function getAllEbookAccess(): Promise<SanityEbookAccess[]> {
  if (!sanityWriteClient) return [];
  try {
    return await sanityWriteClient.fetch<SanityEbookAccess[]>(
      groq`*[_type == "ebookAccess"] | order(createdAt desc) {
        _id, "book": book->{_id, "slug": slug.current, title}, buyerEmail, tokenHash, reference, expiresAt, revoked, createdAt
      }`
    );
  } catch (err) {
    console.error("Failed to fetch ebook access records:", err);
    return [];
  }
}

export async function getSiteSettings(): Promise<SanitySiteSettings> {
  if (!sanityClient) return fallbackSiteSettings();
  const result = await sanityClient.fetch<SanitySiteSettings | null>(
    groq`*[_type == "siteSettings"][0] {
      heroImages, heroStats, founderName, founderPhoto, founderBio, contactEmail, whatsappNumber,
      missionVisionPhoto, missionVisionVideo{ asset->{url} },
      contactHeroPhoto, contactHeroVideo{ asset->{url} }
    }`
  );
  return result ?? fallbackSiteSettings();
}

function fallbackPrograms(): SanityProgram[] {
  return PROGRAMS.map((p, i) => ({ _id: `fallback-${i}`, ...p }));
}

function fallbackFocusAreas(): SanityFocusArea[] {
  return FOCUS_AREAS.map((f, i) => ({ _id: `fallback-${i}`, ...f }));
}

function fallbackFreeResources(): SanityFreeResource[] {
  return FREE_RESOURCES.map((r, i) => ({ _id: `fallback-${i}`, ...r }));
}

function fallbackCoreValues(): SanityCoreValue[] {
  return CORE_VALUES.map((v, i) => ({ _id: `fallback-${i}`, ...v }));
}

function fallbackSiteSettings(): SanitySiteSettings {
  return {
    heroStats: IMPACT_STATS.map((s) => ({ number: s.number, label: s.label })),
    founderName: FOUNDER.name,
  };
}
