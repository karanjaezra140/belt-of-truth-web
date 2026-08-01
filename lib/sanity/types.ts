import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url";

export type SanityProgram = {
  _id: string;
  title: string;
  emoji?: string;
  description: string;
};

export type SanityCoreValue = {
  _id: string;
  title: string;
  description: string;
};

export type SanityTestimony = {
  _id: string;
  title: string;
  slug: string;
  authorName: string;
  programTag?: string;
  coverImage?: SanityImageSource;
  excerpt: string;
  body?: PortableTextBlock[];
  publishedAt: string;
};

export type SanityBook = {
  _id: string;
  title: string;
  slug: string;
  cover?: SanityImageSource;
  description: string;
  priceKes: number;
  ebookFile?: { asset?: { url?: string } };
  ebookPageCount?: number;
};

export type SanityEbookAccess = {
  _id: string;
  book: { _id: string; slug?: string };
  buyerEmail: string;
  tokenHash: string;
  reference?: string;
  expiresAt: string;
  revoked: boolean;
  createdAt?: string;
};

export type SanityEbookPage = {
  _id: string;
  pageNumber: number;
  image: SanityImageSource & { asset?: { url?: string } };
};

export type SanitySiteSettings = {
  heroStats?: { number: string; label: string }[];
  founderName?: string;
  founderPhoto?: SanityImageSource;
  founderBio?: PortableTextBlock[];
  contactEmail?: string;
  whatsappNumber?: string;
};
