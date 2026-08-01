"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

type EbookReaderProps = {
  slug: string;
  bookId: string;
  title: string;
  totalPages: number;
  buyerEmail: string;
};

// This reader deters casual downloading/redistribution and makes any leaked
// copy traceable to the buyer via the watermark burned into every page image
// server-side (see lib/ebook-render.ts) — the same model Kindle Cloud Reader
// / Scribd use. The right-click/print blocking below is cosmetic friction,
// not real prevention; it cannot and does not attempt to stop screen
// photography or recording. There is intentionally no download/print/share
// control anywhere in this UI — no downloadable file exists to offer.
export function EbookReader({ slug, bookId, title, totalPages, buyerEmail }: EbookReaderProps) {
  const [page, setPage] = useState(1);
  const [loadedPage, setLoadedPage] = useState<number | null>(null);
  const [maxSeenPage, setMaxSeenPage] = useState(totalPages || Infinity);
  const loaded = loadedPage === page;

  useEffect(() => {
    function blockShortcuts(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (key === "p" || key === "s")) {
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", blockShortcuts);
    return () => window.removeEventListener("keydown", blockShortcuts);
  }, []);

  const canGoNext = page < maxSeenPage;
  const canGoPrev = page > 1;

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-navy-950">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <Link href="/resources" className="text-sm font-medium text-white/70 hover:text-gold-500">
          ← Back to Books
        </Link>
        <h1 className="font-display truncate text-sm font-semibold text-white md:text-base">
          {title}
        </h1>
        <span className="text-sm text-white/50">
          Page {page}
          {Number.isFinite(maxSeenPage) ? ` of ${maxSeenPage}` : ""}
        </span>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-auto p-4 md:p-8">
        {!loaded && (
          <div className="absolute h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-gold-500" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element -- protected, per-request watermarked image; next/image would cache/optimize it in ways that undermine the no-store contract */}
        <img
          key={`${bookId}-${page}`}
          src={`/api/ebooks/${slug}/page/${page}`}
          alt={`${title} — page ${page}`}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onLoad={() => setLoadedPage(page)}
          onError={() => {
            setMaxSeenPage((prev) => Math.min(prev, Math.max(1, page - 1)));
            setPage((prev) => Math.max(1, prev - 1));
          }}
          className="max-h-full max-w-full select-none rounded-sm bg-white shadow-2xl"
        />
      </div>

      <div className="flex items-center justify-center gap-4 border-t border-white/10 px-5 py-3">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!canGoPrev}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-gold-500 hover:text-gold-500 disabled:opacity-30"
          aria-label="Previous page"
        >
          <HiChevronLeft className="text-xl" />
        </button>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(maxSeenPage, p + 1))}
          disabled={!canGoNext}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-gold-500 hover:text-gold-500 disabled:opacity-30"
          aria-label="Next page"
        >
          <HiChevronRight className="text-xl" />
        </button>
      </div>

      <div className="select-none border-t border-white/10 bg-navy-950 px-5 py-2 text-center text-xs text-white/40">
        Licensed to {buyerEmail} — for personal use only, please do not redistribute.
      </div>
    </div>
  );
}
