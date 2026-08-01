import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBookBySlug, getEbookAccessById, getEbookPageCache } from "@/lib/sanity/queries";
import { sanityWriteClient } from "@/lib/sanity/client";
import { ebookCookieName, isEbookAccessLive, verifySession } from "@/lib/ebook-session";
import { renderPdfPageToPng, watermarkPng } from "@/lib/ebook-render";

// PDF rasterization uses native bindings (@napi-rs/canvas, sharp) — must run
// on the Node.js runtime, not Edge.
export const runtime = "nodejs";

// NOTE: no rate-limiting here. An in-memory counter would be meaningless
// across stateless serverless invocations, and a real one needs a shared
// store (Vercel KV/Upstash) — deliberately out of scope for v1. If abuse is
// observed in practice, that's the fix to reach for.

type Props = {
  params: Promise<{ slug: string; n: string }>;
};

export async function GET(request: Request, { params }: Props) {
  const { slug, n } = await params;
  const pageNumber = Number.parseInt(n, 10);
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    return NextResponse.json({ error: "Invalid page number" }, { status: 400 });
  }

  const book = await getBookBySlug(slug);
  if (!book || !book.ebookFile?.asset?.url) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (book.ebookPageCount && pageNumber > book.ebookPageCount) {
    return NextResponse.json({ error: "Page out of range" }, { status: 404 });
  }

  const cookieStore = await cookies();
  const session = verifySession(cookieStore.get(ebookCookieName(book._id))?.value);
  if (!session || session.bookId !== book._id) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const access = await getEbookAccessById(session.accessId);
  const isValid = access && access.book._id === book._id && isEbookAccessLive(access);

  if (!isValid || !access) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  let plainPng: Buffer;

  const cached = await getEbookPageCache(book._id, pageNumber);
  if (cached?.image?.asset?.url) {
    const cachedRes = await fetch(cached.image.asset.url);
    plainPng = Buffer.from(await cachedRes.arrayBuffer());
  } else {
    const pdfRes = await fetch(book.ebookFile.asset.url);
    if (!pdfRes.ok) {
      return NextResponse.json({ error: "Could not load book file" }, { status: 502 });
    }
    const pdfBytes = new Uint8Array(await pdfRes.arrayBuffer());

    try {
      plainPng = await renderPdfPageToPng(pdfBytes, pageNumber);
    } catch (err) {
      console.error("Failed to render ebook page", book.slug, pageNumber, err);
      return NextResponse.json({ error: "Page out of range" }, { status: 404 });
    }

    // Self-healing cache: this render happens once, ever, for this page —
    // every subsequent buyer hits the `cached` branch above instead.
    if (sanityWriteClient) {
      try {
        const asset = await sanityWriteClient.assets.upload("image", plainPng, {
          filename: `${book.slug}-page-${pageNumber}.png`,
          contentType: "image/png",
        });
        await sanityWriteClient.create({
          _type: "ebookPage",
          book: { _type: "reference", _ref: book._id },
          pageNumber,
          image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
        });
      } catch (err) {
        console.error("Failed to cache rendered ebook page", book.slug, pageNumber, err);
      }
    }
  }

  const purchaseDate = (access.createdAt ?? new Date().toISOString()).slice(0, 10);
  const watermarked = await watermarkPng(plainPng, `${access.buyerEmail} · ${purchaseDate}`);

  return new NextResponse(new Uint8Array(watermarked), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
      "Content-Disposition": "inline",
    },
  });
}
