import { NextResponse } from "next/server";
import { z } from "zod";
import { MPESA_TILL_ENABLED, initiateStkPush, normalizeKenyanPhone } from "@/lib/mpesa";
import { mpesaDonationSchema, mpesaBookPurchaseSchema } from "@/lib/validation/checkout";
import { getBookBySlug } from "@/lib/sanity/queries";
import { sanityWriteClient } from "@/lib/sanity/client";
import { SITE_URL } from "@/lib/site-config";

const requestSchema = z.discriminatedUnion("type", [
  mpesaDonationSchema.extend({ type: z.literal("donation") }),
  mpesaBookPurchaseSchema.extend({ type: z.literal("book") }),
]);

export async function POST(request: Request) {
  if (!MPESA_TILL_ENABLED) {
    return NextResponse.json({ error: "M-Pesa Till is not available yet." }, { status: 503 });
  }
  if (!sanityWriteClient) {
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
  const phone = normalizeKenyanPhone(input.phone);
  if (!phone) {
    return NextResponse.json(
      { error: "Please enter a valid Safaricom number." },
      { status: 400 }
    );
  }

  let amountKes: number;
  let donorName: string;
  let donorEmail: string;
  let bookSlug: string | undefined;

  if (input.type === "donation") {
    amountKes = input.amountKes;
    donorName = input.donorName;
    donorEmail = input.donorEmail;
  } else {
    const book = await getBookBySlug(input.bookSlug);
    if (!book) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }
    amountKes = book.priceKes;
    donorName = input.buyerName;
    donorEmail = input.buyerEmail;
    bookSlug = input.bookSlug;
  }

  try {
    const result = await initiateStkPush({
      phone,
      amountKes,
      accountReference: "BeltOfTruth",
      transactionDesc: input.type === "donation" ? "Donation" : "Book",
      callbackUrl: `${SITE_URL}/api/mpesa/callback`,
    });

    await sanityWriteClient.create({
      _type: "mpesaTransaction",
      checkoutRequestId: result.CheckoutRequestID,
      merchantRequestId: result.MerchantRequestID,
      phone,
      amountKes,
      kind: input.type === "donation" ? "donation" : "book_purchase",
      donorName,
      donorEmail,
      bookSlug,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ checkoutRequestId: result.CheckoutRequestID });
  } catch (err) {
    console.error("Failed to initiate M-Pesa STK push:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not start the M-Pesa payment." },
      { status: 502 }
    );
  }
}
