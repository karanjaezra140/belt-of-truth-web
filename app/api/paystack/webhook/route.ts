import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { sanityWriteClient } from "@/lib/sanity/client";
import { getBookBySlug } from "@/lib/sanity/queries";
import { SITE_URL } from "@/lib/site-config";

// Paystack calls this after every transaction event. We verify the
// signature, then re-verify the transaction status directly with Paystack's
// API (never trust the webhook payload's amount/status on its own) before
// recording anything.
export async function POST(request: Request) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  const expectedSignature = createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");

  if (
    !signature ||
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference: string | undefined = event.data?.reference;
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const verification = await verifyPaystackTransaction(reference);
  const tx = verification.data;

  if (!verification.status || !tx || tx.status !== "success") {
    return NextResponse.json({ received: true });
  }

  if (sanityWriteClient) {
    const metadata = tx.metadata ?? {};
    const kind = (metadata.kind as string | undefined) ?? "donation";
    const bookSlug = metadata.bookSlug as string | undefined;

    const book =
      kind === "book_purchase" && bookSlug ? await getBookBySlug(bookSlug) : null;

    await sanityWriteClient.create({
      _type: "donation",
      reference: tx.reference,
      donorName:
        (metadata.donorName as string | undefined) ??
        (metadata.buyerName as string | undefined) ??
        "",
      donorEmail: tx.customer.email,
      amountKes: tx.amount / 100,
      kind,
      bookTitle: metadata.bookTitle as string | undefined,
      book: book ? { _type: "reference", _ref: book._id } : undefined,
      paidAt: tx.paid_at ?? new Date().toISOString(),
    });

    // Grant ebook access if this book has a protected file attached. Failures
    // here must not affect the 200 response below — the payment already
    // succeeded, so we log and let support recover manually rather than
    // risk Paystack retrying a charge that already went through.
    if (book?.ebookFile) {
      try {
        const rawToken = randomBytes(32).toString("base64url");
        const tokenHash = createHash("sha256").update(rawToken).digest("hex");
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

        await sanityWriteClient.create({
          _type: "ebookAccess",
          book: { _type: "reference", _ref: book._id },
          buyerEmail: tx.customer.email,
          tokenHash,
          reference: tx.reference,
          expiresAt: expiresAt.toISOString(),
          revoked: false,
          createdAt: now.toISOString(),
        });

        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey) {
          const resend = new Resend(apiKey);
          const readLink = `${SITE_URL}/api/ebooks/redeem?token=${rawToken}&book=${book.slug}`;
          const { error } = await resend.emails.send({
            from:
              process.env.CONTACT_FROM_EMAIL ??
              "Belt of Truth Website <onboarding@resend.dev>",
            to: tx.customer.email,
            subject: `Your copy of "${book.title}" is ready to read`,
            text: [
              `Thank you for purchasing "${book.title}"!`,
              "",
              `Read it online here: ${readLink}`,
              "",
              "This link is personal to you and doesn't expire for 90 days. The book can be read on any of your devices but can't be downloaded or printed — this keeps the book protected for the author.",
              "",
              "Having trouble? Just reply to this email.",
            ].join("\n"),
          });
          if (error) {
            console.error("Failed to send ebook access email:", tx.reference, error);
          }
        } else {
          console.error(
            "Ebook access granted but RESEND_API_KEY is not set — buyer was not emailed:",
            tx.reference
          );
        }
      } catch (err) {
        console.error("Failed to grant ebook access for reference", tx.reference, err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
