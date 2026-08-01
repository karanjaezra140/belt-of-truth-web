import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import { getTestimonies } from "@/lib/sanity/queries";

const STATIC_ROUTES = [
  "",
  "/about",
  "/programs",
  "/resources",
  "/blog",
  "/donate",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const testimonies = await getTestimonies();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));

  const testimonyEntries: MetadataRoute.Sitemap = testimonies.map((t) => ({
    url: `${SITE_URL}/blog/${t.slug}`,
    lastModified: new Date(t.publishedAt),
  }));

  return [...staticEntries, ...testimonyEntries];
}
