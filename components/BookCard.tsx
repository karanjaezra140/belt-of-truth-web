import type { SanityBook } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";
import { EffectImage } from "@/components/ui/EffectImage";
import { NOTCH } from "@/lib/utils";
import { BuyBookForm } from "./BuyBookForm";

export function BookCard({ book }: { book: SanityBook }) {
  const coverUrl = book.cover
    ? urlFor(book.cover)?.width(400).height(560).fit("crop").url()
    : null;

  return (
    <div className={`flex flex-col overflow-hidden bg-white shadow-[0_3px_12px_rgba(0,0,0,0.07)] ${NOTCH}`}>
      <div className="relative flex aspect-[4/5.6] items-center justify-center bg-navy-800/5">
        {coverUrl ? (
          <EffectImage
            src={coverUrl}
            alt={book.title}
            fill
            rounded=""
            containerClassName="h-full w-full"
          />
        ) : (
          <span className="text-5xl">📘</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-lg font-bold text-navy-800">{book.title}</h3>
        <p className="flex-1 text-sm leading-relaxed text-gray-600">{book.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-bold text-navy-800">
            KSh {book.priceKes.toLocaleString()}
          </span>
        </div>
        <BuyBookForm bookSlug={book.slug} />
      </div>
    </div>
  );
}
