import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { fulfillSuccessfulPayment } from "@/lib/fulfill-purchase";

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

  const metadata = tx.metadata ?? {};
  const kind = (metadata.kind as string | undefined) === "book_purchase" ? "book_purchase" : "donation";

  await fulfillSuccessfulPayment({
    reference: tx.reference,
    amountKes: tx.amount / 100,
    kind,
    donorName:
      (metadata.donorName as string | undefined) ??
      (metadata.buyerName as string | undefined) ??
      "",
    donorEmail: tx.customer.email,
    bookSlug: metadata.bookSlug as string | undefined,
    paidAt: tx.paid_at ?? new Date().toISOString(),
  });

  return NextResponse.json({ received: true });
}
