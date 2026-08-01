import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getBookBySlug, getEbookAccessByTokenHash } from "@/lib/sanity/queries";
import { ebookCookieName, isEbookAccessLive, signSession } from "@/lib/ebook-session";
import { SITE_URL } from "@/lib/site-config";

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24h, renewed on each redemption

// The link emailed after a book purchase points here. Cookies can only be
// set from a Route Handler (or Server Action), not a plain Server Component
// page — that's why redemption is a separate step from app/read/[slug],
// which only ever reads the cookie that this route sets.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const slug = searchParams.get("book");

  if (!slug) {
    return NextResponse.json({ error: "Missing book" }, { status: 400 });
  }

  const book = await getBookBySlug(slug);
  if (!book) {
    return NextResponse.redirect(`${SITE_URL}/resources`);
  }

  if (!token) {
    return NextResponse.redirect(`${SITE_URL}/read/${slug}?error=invalid`);
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const access = await getEbookAccessByTokenHash(book._id, tokenHash);

  if (!access || !isEbookAccessLive(access)) {
    return NextResponse.redirect(`${SITE_URL}/read/${slug}?error=invalid`);
  }

  const session = signSession({
    accessId: access._id,
    bookId: book._id,
    exp: Date.now() + SESSION_TTL_MS,
  });

  const response = NextResponse.redirect(`${SITE_URL}/read/${slug}`, { status: 303 });
  response.cookies.set(ebookCookieName(book._id), session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });

  return response;
}
