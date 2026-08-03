import { randomBytes, createHash } from "node:crypto";
import { Resend } from "resend";
import { sanityWriteClient } from "@/lib/sanity/client";
import { getBookBySlug } from "@/lib/sanity/queries";
import { SITE_URL } from "@/lib/site-config";

type FulfillParams = {
  /** Provider transaction/receipt reference (Paystack reference, M-Pesa receipt number, ...). */
  reference: string;
  amountKes: number;
  kind: "donation" | "book_purchase";
  donorName: string;
  donorEmail: string;
  bookSlug?: string;
  paidAt: string;
};

// Shared by every payment provider's webhook/callback once a payment is
// independently confirmed successful: records the donation, and for book
// purchases with an attached ebook file, grants access and emails the
// reader link. Keeping this in one place means Paystack and M-Pesa (and any
// future provider) can't drift apart on what "a successful purchase" does.
export async function fulfillSuccessfulPayment({
  reference,
  amountKes,
  kind,
  donorName,
  donorEmail,
  bookSlug,
  paidAt,
}: FulfillParams) {
  if (!sanityWriteClient) return;

  const book = kind === "book_purchase" && bookSlug ? await getBookBySlug(bookSlug) : null;

  await sanityWriteClient.create({
    _type: "donation",
    reference,
    donorName,
    donorEmail,
    amountKes,
    kind,
    bookTitle: book?.title,
    book: book ? { _type: "reference", _ref: book._id } : undefined,
    paidAt,
  });

  if (!book?.ebookFile) return;

  // Failures past this point must not throw — the payment already
  // succeeded, so we log and let support recover manually rather than risk
  // the caller retrying a charge/confirmation that already went through.
  try {
    const rawToken = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const now = new Date();
    // Effectively permanent access — a purchase shouldn't expire. Using a
    // far-future date instead of an optional/nullable field keeps the
    // existing expiry comparisons (isEbookAccessLive, etc.) unchanged.
    const expiresAt = new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000);

    await sanityWriteClient.create({
      _type: "ebookAccess",
      book: { _type: "reference", _ref: book._id },
      buyerEmail: donorEmail,
      tokenHash,
      reference,
      expiresAt: expiresAt.toISOString(),
      revoked: false,
      createdAt: now.toISOString(),
    });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error(
        "Ebook access granted but RESEND_API_KEY is not set — buyer was not emailed:",
        reference
      );
      return;
    }

    const resend = new Resend(apiKey);
    const readLink = `${SITE_URL}/api/ebooks/redeem?token=${rawToken}&book=${book.slug}`;
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL ?? "Belt of Truth Website <onboarding@resend.dev>",
      to: donorEmail,
      subject: `Your copy of "${book.title}" is ready to read`,
      text: [
        `Thank you for purchasing "${book.title}"!`,
        "",
        `Read it online here: ${readLink}`,
        "",
        "This link is personal to you and doesn't expire. The book can be read on any of your devices but can't be downloaded or printed — this keeps the book protected for the author.",
        "",
        "Having trouble? Just reply to this email.",
      ].join("\n"),
    });
    if (error) {
      console.error("Failed to send ebook access email:", reference, error);
    }
  } catch (err) {
    console.error("Failed to grant ebook access for reference", reference, err);
  }
}
