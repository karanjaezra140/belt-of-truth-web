import { NextResponse } from "next/server";
import { sanityWriteClient } from "@/lib/sanity/client";
import { fulfillSuccessfulPayment } from "@/lib/fulfill-purchase";

type StkCallbackItem = { Name: string; Value?: string | number };

// Safaricom calls this after every STK push attempt. Unlike Paystack's
// webhook, Daraja callbacks aren't signed, so we don't trust the body on its
// own — we look up the pending mpesaTransaction we created ourselves when
// initiating the push (app/api/mpesa/stkpush/route.ts), keyed by
// CheckoutRequestID, and cross-check the amount before fulfilling anything.
// Always return { ResultCode: 0 } — a non-zero/non-200 response makes
// Safaricom retry the callback, which we never want once we've handled it.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const stkCallback = body?.Body?.stkCallback;
  const checkoutRequestId: string | undefined = stkCallback?.CheckoutRequestID;

  if (!checkoutRequestId || !sanityWriteClient) {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Ignored" });
  }

  const pending = await sanityWriteClient.fetch<{
    _id: string;
    status: string;
    amountKes: number;
    kind: "donation" | "book_purchase";
    donorName: string;
    donorEmail: string;
    bookSlug?: string;
  } | null>(`*[_type == "mpesaTransaction" && checkoutRequestId == $id][0]`, {
    id: checkoutRequestId,
  });

  if (!pending || pending.status !== "pending") {
    // Already processed, or a callback for a push we never recorded.
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const resultCode: number = stkCallback.ResultCode;
  const resultDesc: string = stkCallback.ResultDesc ?? "";

  if (resultCode !== 0) {
    await sanityWriteClient
      .patch(pending._id)
      .set({ status: "failed", resultDescription: resultDesc })
      .commit();
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const items: StkCallbackItem[] = stkCallback.CallbackMetadata?.Item ?? [];
  const getItem = (name: string) => items.find((item) => item.Name === name)?.Value;

  const amountPaid = Number(getItem("Amount"));
  const mpesaReceiptNumber = String(getItem("MpesaReceiptNumber") ?? "");
  const transactionDate = String(getItem("TransactionDate") ?? "");

  if (!Number.isFinite(amountPaid) || Math.round(amountPaid) !== Math.round(pending.amountKes)) {
    await sanityWriteClient
      .patch(pending._id)
      .set({ status: "failed", resultDescription: "Amount mismatch" })
      .commit();
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  await sanityWriteClient
    .patch(pending._id)
    .set({ status: "success", mpesaReceiptNumber })
    .commit();

  await fulfillSuccessfulPayment({
    reference: mpesaReceiptNumber,
    amountKes: pending.amountKes,
    kind: pending.kind,
    donorName: pending.donorName,
    donorEmail: pending.donorEmail,
    bookSlug: pending.bookSlug,
    paidAt: parseMpesaTimestamp(transactionDate) ?? new Date().toISOString(),
  });

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}

/** Daraja's TransactionDate is YYYYMMDDHHmmss (e.g. 20260803154230). */
function parseMpesaTimestamp(value: string): string | null {
  const match = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, mo, d, h, mi, s] = match;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}`).toISOString();
}
