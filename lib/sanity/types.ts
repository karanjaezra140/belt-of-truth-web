import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url";

export type SanityProgram = {
  _id: string;
  title: string;
  emoji?: string;
  description: string;
  image?: SanityImageSource;
};

export type SanityFocusArea = {
  _id: string;
  title: string;
  emoji?: string;
  image?: SanityImageSource;
};

export type SanityFreeResource = {
  _id: string;
  title: string;
  emoji?: string;
  description: string;
  image?: SanityImageSource;
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
  book: { _id: string; slug?: string; title?: string };
  buyerEmail: string;
  tokenHash: string;
  reference?: string;
  expiresAt: string;
  revoked: boolean;
  createdAt?: string;
};

export type SanityContactSubmission = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  interest?: string;
  message: string;
  submittedAt: string;
};

export type SanityDonation = {
  _id: string;
  reference?: string;
  donorName?: string;
  donorEmail?: string;
  amountKes?: number;
  kind?: string;
  bookTitle?: string;
  paidAt?: string;
};

export type SanityEbookPage = {
  _id: string;
  pageNumber: number;
  image: SanityImageSource & { asset?: { url?: string } };
};

export type SanitySiteSettings = {
  heroImages?: SanityImageSource[];
  heroStats?: { number: string; label: string }[];
  founderName?: string;
  founderPhoto?: SanityImageSource;
  founderBio?: PortableTextBlock[];
  contactEmail?: string;
  whatsappNumber?: string;
  missionVisionPhoto?: SanityImageSource;
  missionVisionVideo?: { asset?: { url?: string } };
  contactHeroPhoto?: SanityImageSource;
  contactHeroVideo?: { asset?: { url?: string } };
};
