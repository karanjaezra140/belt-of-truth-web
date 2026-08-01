"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { HiChevronLeft, HiChevronRight, HiOutlineCloudDownload, HiOutlineTrash } from "react-icons/hi";

type EbookReaderProps = {
  slug: string;
  bookId: string;
  title: string;
  totalPages: number;
  buyerEmail: string;
};

// Must match CACHE_NAME in public/sw.js — duplicated rather than imported
// since the service worker is a plain static file, not a TS module.
const CACHE_NAME = "ebook-offline-v1";

function pagePrefix(slug: string) {
  return `/api/ebooks/${slug}/page/`;
}

function pageUrl(slug: string, page: number) {
  return `${pagePrefix(slug)}${page}`;
}

// This reader deters casual downloading/redistribution and makes any leaked
// copy traceable to the buyer via the watermark burned into every page image
// server-side (see lib/ebook-render.ts) — the same model Kindle Cloud Reader
// / Scribd use. The right-click/print blocking below is cosmetic friction,
// not real prevention; it cannot and does not attempt to stop screen
// photography or recording. There is intentionally no download/print/share
// control anywhere in this UI — no downloadable file exists to offer.
//
// Offline reading (public/sw.js) caches these exact same watermarked images
// via the browser's Cache Storage — nothing new is exposed offline that
// wasn't already served online. One accepted tradeoff: a page already cached
// stays readable offline even if access is later revoked server-side; the
// service worker is network-first, so revocation is still immediate for
// anyone online, and for any page not already saved.
export function EbookReader({ slug, bookId, title, totalPages, buyerEmail }: EbookReaderProps) {
  const [page, setPage] = useState(1);
  const [loadedPage, setLoadedPage] = useState<number | null>(null);
  const [maxSeenPage, setMaxSeenPage] = useState(totalPages || Infinity);
  const [isOffline, setIsOffline] = useState(
    () => typeof navigator !== "undefined" && !navigator.onLine
  );
  const [unavailableOffline, setUnavailableOffline] = useState(false);
  const [cachedPageCount, setCachedPageCount] = useState(0);
  const [saveProgress, setSaveProgress] = useState<{ current: number; total: number } | null>(null);
  const loaded = loadedPage === page;

  const refreshCachedCount = useCallback(async () => {
    if (typeof caches === "undefined") return;
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    const prefix = pagePrefix(slug);
    setCachedPageCount(keys.filter((req) => req.url.includes(prefix)).length);
  }, [slug]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline support just won't be available — the reader still works online.
      });
    }

    let cancelled = false;
    if (typeof caches !== "undefined") {
      caches
        .open(CACHE_NAME)
        .then((cache) => cache.keys())
        .then((keys) => {
          if (cancelled) return;
          const prefix = pagePrefix(slug);
          setCachedPageCount(keys.filter((req) => req.url.includes(prefix)).length);
        });
    }

    function goOnline() {
      setIsOffline(false);
    }
    function goOffline() {
      setIsOffline(true);
    }
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      cancelled = true;
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [slug]);

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

  async function saveForOffline() {
    if (!Number.isFinite(maxSeenPage)) return;
    const total = maxSeenPage;
    setSaveProgress({ current: 0, total });
    for (let n = 1; n <= total; n++) {
      try {
        await fetch(pageUrl(slug, n));
      } catch {
        // Skip failures (e.g. lost connection mid-save) — whatever succeeded stays cached.
      }
      setSaveProgress({ current: n, total });
    }
    setSaveProgress(null);
    await refreshCachedCount();
  }

  async function removeOfflineCopy() {
    if (typeof caches === "undefined") return;
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    const prefix = pagePrefix(slug);
    await Promise.all(keys.filter((req) => req.url.includes(prefix)).map((req) => cache.delete(req)));
    setCachedPageCount(0);
  }

  const canGoNext = page < maxSeenPage;
  const canGoPrev = page > 1;
  const fullyAvailableOffline = Number.isFinite(maxSeenPage) && cachedPageCount >= maxSeenPage;

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-navy-950">
      {isOffline && (
        <div className="bg-gold-500 px-5 py-1.5 text-center text-xs font-semibold text-navy-950">
          You&apos;re offline — showing pages saved for offline reading.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-5 py-3">
        <Link href="/resources" className="text-sm font-medium text-white/70 hover:text-gold-500">
          ← Back to Books
        </Link>
        <h1 className="font-display truncate text-sm font-semibold text-white md:text-base">
          {title}
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/50">
            Page {page}
            {Number.isFinite(maxSeenPage) ? ` of ${maxSeenPage}` : ""}
          </span>
          {!isOffline &&
            (fullyAvailableOffline ? (
              <button
                type="button"
                onClick={removeOfflineCopy}
                className="flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white/70 transition-colors hover:border-red-400 hover:text-red-400"
              >
                <HiOutlineTrash /> Remove offline copy
              </button>
            ) : saveProgress ? (
              <span className="text-xs text-white/50">
                Saving {saveProgress.current}/{saveProgress.total}…
              </span>
            ) : (
              <button
                type="button"
                onClick={saveForOffline}
                disabled={!Number.isFinite(maxSeenPage)}
                className="flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white/70 transition-colors hover:border-gold-500 hover:text-gold-500 disabled:opacity-30"
              >
                <HiOutlineCloudDownload /> Save for offline
              </button>
            ))}
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-auto p-4 md:p-8">
        {!loaded && !unavailableOffline && (
          <div className="absolute h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-gold-500" />
        )}
        {unavailableOffline ? (
          <p className="max-w-xs text-center text-sm text-white/60">
            This page hasn&apos;t been saved for offline reading yet. Reconnect to view it, or
            use &ldquo;Save for offline&rdquo; next time you&apos;re online.
          </p>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- protected, per-request watermarked image; next/image would cache/optimize it in ways that undermine the no-store contract
          <img
            key={`${bookId}-${page}`}
            src={pageUrl(slug, page)}
            alt={`${title} — page ${page}`}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            onLoad={() => {
              setLoadedPage(page);
              setUnavailableOffline(false);
            }}
            onError={() => {
              if (isOffline) {
                setUnavailableOffline(true);
                return;
              }
              setMaxSeenPage((prev) => Math.min(prev, Math.max(1, page - 1)));
              setPage((prev) => Math.max(1, prev - 1));
            }}
            className="max-h-full max-w-full select-none rounded-sm bg-white shadow-2xl"
          />
        )}
      </div>

      <div className="flex items-center justify-center gap-4 border-t border-white/10 px-5 py-3">
        <button
          type="button"
          onClick={() => {
            setUnavailableOffline(false);
            setPage((p) => Math.max(1, p - 1));
          }}
          disabled={!canGoPrev}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-gold-500 hover:text-gold-500 disabled:opacity-30"
          aria-label="Previous page"
        >
          <HiChevronLeft className="text-xl" />
        </button>
        <button
          type="button"
          onClick={() => {
            setUnavailableOffline(false);
            setPage((p) => Math.min(maxSeenPage, p + 1));
          }}
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
