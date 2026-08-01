import Link from "next/link";
import type { SanityTestimony } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";
import { EffectImage } from "@/components/ui/EffectImage";

export function TestimonyCard({ testimony }: { testimony: SanityTestimony }) {
  const imageUrl = testimony.coverImage
    ? urlFor(testimony.coverImage)?.width(500).height(320).fit("crop").url()
    : null;

  return (
    <Link
      href={`/blog/${testimony.slug}`}
      className="flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_3px_12px_rgba(0,0,0,0.07)] transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="relative aspect-[5/3.2] w-full bg-navy-800">
        {imageUrl && (
          <EffectImage
            src={imageUrl}
            alt={testimony.title}
            fill
            rounded=""
            containerClassName="h-full w-full"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 text-left">
        {testimony.programTag && (
          <span className="mb-2 w-fit rounded-full bg-gold-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold-600">
            {testimony.programTag}
          </span>
        )}
        <h3 className="font-display text-lg font-bold text-navy-800 group-hover:text-navy-700">
          {testimony.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-[14px] leading-relaxed text-gray-600">
          {testimony.excerpt}
        </p>
        <p className="mt-3 text-[13px] font-medium text-gray-500">
          — {testimony.authorName}
        </p>
      </div>
    </Link>
  );
}
