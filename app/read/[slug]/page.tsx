import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EbookReader } from "@/components/EbookReader";
import { getBookBySlug, getEbookAccessById } from "@/lib/sanity/queries";
import { ebookCookieName, isEbookAccessLive, maskEmail, verifySession } from "@/lib/ebook-session";

export const metadata: Metadata = {
  title: "Read Online",
  robots: { index: false },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ReadBookPage({ params }: Props) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book || !book.ebookFile) notFound();

  const cookieStore = await cookies();
  const session = verifySession(cookieStore.get(ebookCookieName(book._id))?.value);

  const access = session ? await getEbookAccessById(session.accessId) : null;

  const isValid =
    session &&
    access &&
    access.book._id === book._id &&
    session.bookId === book._id &&
    isEbookAccessLive(access);

  if (!isValid || !access) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 py-20 text-center">
        <div className="mb-4 text-5xl">🔒</div>
        <h1 className="font-display text-3xl font-bold text-navy-800">
          Access Link Invalid or Expired
        </h1>
        <p className="mt-3 text-gray-600">
          If you purchased &ldquo;{book.title}&rdquo;, check your email for the access
          link we sent you. Can&apos;t find it, or think this is a mistake?
        </p>
        <Button href="/contact" className="mt-8">
          Contact Us
        </Button>
        <Link href="/resources" className="mt-4 text-sm font-medium text-navy-700 underline">
          Back to Books
        </Link>
      </section>
    );
  }

  return (
    <EbookReader
      slug={book.slug}
      bookId={book._id}
      title={book.title}
      totalPages={book.ebookPageCount ?? 0}
      buyerEmail={maskEmail(access.buyerEmail)}
    />
  );
}
