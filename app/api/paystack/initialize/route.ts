import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { initializePaystackTransaction, isPaystackConfigured } from "@/lib/paystack";
import { donationSchema, bookPurchaseSchema } from "@/lib/validation/checkout";
import { getBookBySlug } from "@/lib/sanity/queries";
import { SITE_URL } from "@/lib/site-config";

const requestSchema = z.discriminatedUnion("type", [
  donationSchema.extend({ type: z.literal("donation") }),
  bookPurchaseSchema.extend({ type: z.literal("book") }),
]);

export async function POST(request: Request) {
  if (!isPaystackConfigured) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Please contact us directly." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const reference = `bot_${Date.now()}_${randomUUID().slice(0, 8)}`;
  const callbackUrl = `${SITE_URL}/thank-you?reference=${reference}`;

  if (input.type === "donation") {
    const result = await initializePaystackTransaction({
      email: input.donorEmail,
      amountKes: input.amountKes,
      reference,
      callbackUrl,
      metadata: {
        kind: "donation",
        donorName: input.donorName,
      },
    });

    if (!result.status || !result.data) {
      return NextResponse.json(
        { error: result.message || "Could not start the transaction." },
        { status: 502 }
      );
    }

    return NextResponse.json({ authorizationUrl: result.data.authorization_url });
  }

  const book = await getBookBySlug(input.bookSlug);
  if (!book) {
    return NextResponse.json({ error: "Book not found." }, { status: 404 });
  }

  const result = await initializePaystackTransaction({
    email: input.buyerEmail,
    amountKes: book.priceKes,
    reference,
    callbackUrl,
    metadata: {
      kind: "book_purchase",
      buyerName: input.buyerName,
      bookTitle: book.title,
      bookSlug: book.slug,
    },
  });

  if (!result.status || !result.data) {
    return NextResponse.json(
      { error: result.message || "Could not start the transaction." },
      { status: 502 }
    );
  }

  return NextResponse.json({ authorizationUrl: result.data.authorization_url });
}
