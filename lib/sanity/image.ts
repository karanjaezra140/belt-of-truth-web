import createImageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { dataset, projectId } from "@/sanity/env";

const builder =
  projectId && createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: SanityImageSource) {
  if (!builder) return null;
  return builder.image(source);
}
